/* Serverkant van de Booking.com-import.
 *
 * Twee acties, bewust gescheiden:
 *   booking_import_preview — lees het bestand, vergelijk met de database,
 *                            geef terug wát er zou gebeuren. Schrijft niets.
 *   booking_import_apply   — doe het, maar alleen voor de reserveringsnummers
 *                            die de admin heeft goedgekeurd.
 *
 * Apply leest het bestand opnieuw en berekent het verschil opnieuw. Het
 * voorstel dat de browser terugstuurt is dus nooit leidend — anders zou een
 * verouderd of gemanipuleerd voorstel bepalen wat er in de database komt.
 */

import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { BLOCKING_STATUSES } from "@/lib/availability";
import {
  leesReserveringen, maakVoorstellen, telVoorstellen,
  type BestaandVerblijf, type BezettePeriode, type Voorstel,
} from "@/lib/booking-import";

/* Ruim boven een jaar aan reserveringen, ruim onder wat een JSON-body aankan.
 * De export van acht maanden in dit huis is zo'n 6 kB. */
const MAX_BESTAND_BYTES = 4 * 1024 * 1024;

function vandaagIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function decodeerUpload(bestand: unknown): { buf: Buffer } | { fout: string } {
  if (typeof bestand !== "string" || bestand.length === 0) {
    return { fout: "Geen bestand ontvangen" };
  }
  // Base64 is ~4/3 van de bytes; zo weigeren we te grote uploads vóór het decoderen.
  if (bestand.length > MAX_BESTAND_BYTES * 1.4) {
    return { fout: "Bestand is te groot (maximaal 4 MB)" };
  }
  const buf = Buffer.from(bestand, "base64");
  if (buf.length === 0) return { fout: "Bestand is leeg of onleesbaar" };
  if (buf.length > MAX_BESTAND_BYTES) return { fout: "Bestand is te groot (maximaal 4 MB)" };
  return { buf };
}

/** Alles wat al in het overzicht staat en met een import kan botsen. */
async function haalContext(): Promise<{ bestaand: BestaandVerblijf[]; bezet: BezettePeriode[] }> {
  const sb = getSupabase();

  const { data: stays } = await sb
    .from("stays")
    .select("id, lodge, check_in, check_out, status, extern_id, gast_naam, extern_bedrag, extern_commissie, guest_id")
    .order("check_in", { ascending: false });

  const staysLijst = (stays || []) as (BestaandVerblijf & { guest_id: string | null })[];

  /* Namen erbij voor de conflictmelding: "botst met Jansen (12–15 mei)" is
   * bruikbaar, "botst met een verblijf" niet. */
  const guestIds = [...new Set(staysLijst.map(s => s.guest_id).filter(Boolean))] as string[];
  let namen: Record<string, string> = {};
  if (guestIds.length > 0) {
    const { data: guests } = await sb.from("guests").select("id, naam").in("id", guestIds);
    namen = Object.fromEntries((guests || []).map((g: { id: string; naam: string }) => [g.id, g.naam]));
  }

  const { data: requests } = await sb
    .from("booking_requests")
    .select("lodge, check_in, check_out, gast_naam, status")
    .in("status", BLOCKING_STATUSES as unknown as string[])
    .not("check_in", "is", null)
    .not("check_out", "is", null);

  const bezet: BezettePeriode[] = [
    ...staysLijst
      .filter(s => s.status !== "geannuleerd" && s.check_in && s.check_out)
      .map(s => ({
        lodge: s.lodge,
        check_in: s.check_in.slice(0, 10),
        check_out: s.check_out.slice(0, 10),
        wie: s.gast_naam || (s.guest_id ? namen[s.guest_id] : "") || "verblijf",
        externId: s.extern_id,
      })),
    ...((requests || []) as { lodge: string; check_in: string; check_out: string; gast_naam: string | null }[])
      .map(r => ({
        lodge: r.lodge,
        check_in: r.check_in.slice(0, 10),
        check_out: r.check_out.slice(0, 10),
        wie: r.gast_naam ? `aanvraag ${r.gast_naam}` : "eigen reservering",
        externId: null,
      })),
  ];

  return { bestaand: staysLijst, bezet };
}

async function bouwVoorstel(buf: Buffer) {
  const gelezen = leesReserveringen(buf);
  if (gelezen.bestandsfout) return { fout: gelezen.bestandsfout };

  const { bestaand, bezet } = await haalContext();
  const voorstellen = maakVoorstellen(gelezen.regels, bestaand, bezet);
  return { voorstellen, formaat: gelezen.formaat };
}

export async function handleImportPost(
  action: string,
  body: Record<string, unknown>,
): Promise<NextResponse | null> {
  if (action !== "booking_import_preview" && action !== "booking_import_apply") return null;

  const upload = decodeerUpload(body.bestand);
  if ("fout" in upload) return NextResponse.json({ error: upload.fout }, { status: 400 });

  let opgebouwd: Awaited<ReturnType<typeof bouwVoorstel>>;
  try {
    opgebouwd = await bouwVoorstel(upload.buf);
  } catch (e) {
    console.error("[import] voorstel bouwen mislukt:", e);
    return NextResponse.json({ error: "Kon het bestand niet verwerken" }, { status: 500 });
  }
  if ("fout" in opgebouwd) return NextResponse.json({ error: opgebouwd.fout }, { status: 400 });

  const { voorstellen, formaat } = opgebouwd;

  if (action === "booking_import_preview") {
    return NextResponse.json({
      voorstellen,
      telling: telVoorstellen(voorstellen),
      formaat,
    });
  }

  /* Apply: alleen wat de admin heeft aangevinkt. Een leeg lijstje betekent
   * niets doen — nooit "dan maar alles". */
  const goedgekeurd = Array.isArray(body.goedgekeurd)
    ? new Set((body.goedgekeurd as unknown[]).filter((v): v is string => typeof v === "string"))
    : new Set<string>();

  const teDoen = voorstellen.filter(v =>
    goedgekeurd.has(v.regel.externId) &&
    (v.soort === "nieuw" || v.soort === "gewijzigd" || v.soort === "geannuleerd"));

  if (teDoen.length === 0) {
    return NextResponse.json({ error: "Niets geselecteerd om te verwerken" }, { status: 400 });
  }

  return verwerk(teDoen);
}

async function verwerk(voorstellen: Voorstel[]): Promise<NextResponse> {
  const sb = getSupabase();
  const { randomBytes, randomInt } = await import("crypto");
  const nu = new Date().toISOString();
  const vandaag = vandaagIso();

  let toegevoegd = 0;
  let bijgewerkt = 0;
  let geannuleerd = 0;
  const mislukt: { reservering: string; reden: string }[] = [];

  for (const v of voorstellen) {
    const r = v.regel;
    try {
      if (v.soort === "geannuleerd" && v.bestaandId) {
        const { error } = await sb.from("stays")
          .update({ status: "geannuleerd", geimporteerd_op: nu })
          .eq("id", v.bestaandId);
        if (error) throw new Error(error.message);
        geannuleerd++;
        continue;
      }

      const velden = {
        lodge: r.lodge,
        check_in: r.checkIn,
        check_out: r.checkOut,
        gast_naam: r.gastNaam || null,
        extern_bedrag: r.bedrag,
        extern_commissie: r.commissie,
        extern_valuta: r.valuta,
        geboekt_op: r.geboektOp,
        geimporteerd_op: nu,
      };

      if (v.soort === "gewijzigd" && v.bestaandId) {
        /* Status, token en deurcode blijven met rust: die horen bij ons
         * proces, niet bij de export. Een verblijf dat de admin op vertrokken
         * heeft gezet moet dat blijven. */
        const { error } = await sb.from("stays").update(velden).eq("id", v.bestaandId);
        if (error) throw new Error(error.message);
        bijgewerkt++;
        continue;
      }

      const { error } = await sb.from("stays").insert({
        ...velden,
        guest_id: null,
        bron: "booking_com",
        extern_id: r.externId,
        token: randomBytes(24).toString("hex"),
        door_code: String(randomInt(0, 1_000_000)).padStart(6, "0"),
        /* Een verblijf dat al voorbij is hoeft niet meer als 'gepland' in het
         * overzicht te staan; de bedankmailcron zou hem anders eeuwig blijven
         * langslopen zonder ooit iets te doen (geen e-mailadres). */
        status: r.checkOut && r.checkOut < vandaag ? "vertrokken" : "gepland",
        welcome_sent: false,
      });
      if (error) throw new Error(error.message);
      toegevoegd++;
    } catch (e) {
      const reden = e instanceof Error ? e.message : "onbekende fout";
      console.error("[import] regel mislukt", r.externId, reden);
      mislukt.push({ reservering: r.externId, reden });
    }
  }

  return NextResponse.json({
    success: mislukt.length === 0,
    toegevoegd, bijgewerkt, geannuleerd, mislukt,
  });
}
