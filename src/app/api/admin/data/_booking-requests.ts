import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc, buildOfferteHtmlV2, lodgeEmail, lodgePhoto, infoBlock, calloutBlock, checklist, ctaButton, type OfferteRegel } from "@/lib/email";
import { APP_URL_FALLBACK, lodgeName } from "@/data/lodge";
import { computeStayPrice } from "@/lib/pricing";

const DEPOSIT_PCT = 0.30;

export async function handleBookingRequestsGet(table: string): Promise<NextResponse | null> {
  if (table !== "booking_requests") return null;
  const { data: raw, error } = await getSupabase()
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ data: [], error: error.message });
  const list = raw || [];
  const guestIds = [...new Set(list.map((r: { guest_id: string | null }) => r.guest_id).filter(Boolean))] as string[];
  let guestLookup: Record<string, { naam: string; email: string }> = {};
  if (guestIds.length > 0) {
    const { data: gd } = await getSupabase().from("guests").select("id, naam, email").in("id", guestIds);
    if (gd) guestLookup = Object.fromEntries(gd.map((g: { id: string; naam: string; email: string }) => [g.id, { naam: g.naam, email: g.email }]));
  }
  const enriched = list.map((r: { guest_id: string | null }) => ({ ...r, guest: r.guest_id ? guestLookup[r.guest_id] || null : null }));
  return NextResponse.json({ data: enriched });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleBookingRequestsPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  switch (action) {
    case "prefill_offerte": {
      const { requestId } = body;
      if (!requestId) return NextResponse.json({ error: "requestId verplicht" }, { status: 400 });

      const sb = getSupabase();
      const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", requestId).single();
      if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });

      const personen = req.personen || 2;
      const nachten = req.nachten || (req.check_in && req.check_out
        ? Math.max(0, Math.round((new Date(req.check_out).getTime() - new Date(req.check_in).getTime()) / 86400000))
        : 0);

      let verblijf = Number(req.voorgestelde_prijs) || 0;
      if (req.lodge && req.check_in && req.check_out && nachten > 0) {
        try {
          const calc = await computeStayPrice({
            lodge: req.lodge,
            checkIn: req.check_in,
            checkOut: req.check_out,
            personen,
            huisdier: req.huisdieren || false,
          });
          verblijf = calc.verblijf;
        } catch (e) { console.error("computeStayPrice failed:", e); }
      }

      const { data: feesData } = await sb.from("fee_templates").select("*").eq("actief", true).order("volgorde", { ascending: true });
      const fees = (feesData || []) as Array<{ id: string; label: string; soort: string; bedrag: number | null; basis: string }>;

      const feeAmount = (basis: string, bedrag: number) => {
        switch (basis) {
          case "eenmalig": return bedrag;
          case "per_nacht": return bedrag * nachten;
          case "per_persoon": return bedrag * personen;
          case "per_persoon_per_nacht": return bedrag * personen * nachten;
          default: return 0;
        }
      };

      let schoonmaak = 0;
      let toeristenbelasting = 0;
      const extraRegels: Array<{ label: string; bedrag: number; soort: string; fee_template_id: string }> = [];

      for (const f of fees) {
        const base = f.bedrag ?? 0;
        if (base === 0) continue;
        const amt = Math.round(feeAmount(f.basis, base) * 100) / 100;
        if (amt === 0) continue;
        if (/huisdier/i.test(f.label) && !req.huisdieren) continue;
        if (/schoonmaak/i.test(f.label) && f.soort === "toeslag") {
          schoonmaak = amt;
        } else if (/toeristenbelasting/i.test(f.label) && f.soort === "belasting") {
          toeristenbelasting = amt;
        } else {
          extraRegels.push({ label: f.label, bedrag: amt, soort: f.soort, fee_template_id: f.id });
        }
      }

      return NextResponse.json({
        success: true,
        prefill: {
          verblijf, schoonmaak, toeristenbelasting, extraRegels, nachten, personen,
          gast_naam: req.gast_naam, gast_email: req.gast_email,
          check_in: req.check_in, check_out: req.check_out,
          periode_tekst: req.periode_tekst, lodge: req.lodge,
          huisdieren: req.huisdieren, bron: req.bron, bericht: req.bericht,
        },
      });
    }
    case "send_offerte_v2": {
      const { requestId, prijsVerblijf, schoonmaak, toeristenbelasting, extraRegels, bericht } = body;
      if (!requestId) return NextResponse.json({ error: "requestId verplicht" }, { status: 400 });

      const verblijf = parseFloat(prijsVerblijf as string) || 0;
      const cleaning = parseFloat(schoonmaak as string) || 0;
      const tax = parseFloat(toeristenbelasting as string) || 0;
      const extras = Array.isArray(extraRegels) ? extraRegels : [];

      if (verblijf <= 0) return NextResponse.json({ error: "Verblijfprijs is verplicht" }, { status: 400 });

      const cleanRegels = (extras as Array<{ label?: string; bedrag?: number | string; soort?: string }>)
        .map((r) => ({
          label: String(r.label || "").slice(0, 80),
          bedrag: parseFloat(String(r.bedrag ?? "0")) || 0,
          soort: ["toeslag", "korting", "belasting"].includes(String(r.soort || "")) ? String(r.soort) : "toeslag",
        }))
        .filter((r) => r.label && r.bedrag !== 0);

      const sb = getSupabase();
      const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", requestId).single();
      if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
      if (!req.gast_email) return NextResponse.json({ error: "Aanvraag heeft geen e-mailadres" }, { status: 400 });

      const extraSum = cleanRegels.reduce((s, r) => s + (r.soort === "korting" ? -Math.abs(r.bedrag) : Math.abs(r.bedrag)), 0);
      const totaal = Math.max(0, Math.round((verblijf + cleaning + tax + extraSum) * 100) / 100);

      const { randomBytes } = await import("crypto");
      const confirmToken = randomBytes(32).toString("hex");

      const { error: updErr } = await sb.from("booking_requests").update({
        status: "offerte_verstuurd",
        prijs_verblijf: verblijf,
        schoonmaak: cleaning,
        toeristenbelasting: tax,
        extra_regels: cleanRegels,
        totaal,
        confirm_token: confirmToken,
      }).eq("id", requestId);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        return NextResponse.json({ success: true, totaal, emailSent: false, warning: "Resend niet geconfigureerd, offerte is wel opgeslagen" });
      }

      const fmt = (iso: string | null) => iso
        ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
        : "";
      const van = req.check_in ? fmt(req.check_in) : (req.periode_tekst?.split("—")[0]?.trim() || "");
      const tot = req.check_out ? fmt(req.check_out) : (req.periode_tekst?.split("—")[1]?.trim() || "");

      const emailRegels: OfferteRegel[] = [{ label: "Verblijf", bedrag: verblijf, soort: "verblijf" }];
      if (cleaning > 0) emailRegels.push({ label: "Eindschoonmaak", bedrag: cleaning, soort: "toeslag" });
      if (tax > 0) emailRegels.push({ label: "Toeristenbelasting", bedrag: tax, soort: "belasting" });
      for (const r of cleanRegels) {
        emailRegels.push({ label: r.label, bedrag: Math.abs(r.bedrag), soort: r.soort as OfferteRegel["soort"] });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const bevestigBase = new URL(appUrl).origin;

      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      try {
        await resend.emails.send({
          from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
          to: [req.gast_email],
          subject: "Persoonlijk aanbod — Huis ter Huynen",
          html: buildOfferteHtmlV2(
            esc(req.gast_naam || ""), esc(van), esc(tot),
            req.personen || 2, emailRegels, totaal, (bericht as string) || "",
            requestId as string, bevestigBase, confirmToken,
          ),
          replyTo: "lodge@huisterhuynen.nl",
        });
      } catch (e) {
        console.error("Offerte v2 email failed:", e);
        return NextResponse.json({ success: true, totaal, emailSent: false, warning: "Offerte opgeslagen, maar e-mail versturen faalde" });
      }

      return NextResponse.json({ success: true, totaal, emailSent: true });
    }
    case "send_payment_link": {
      const { requestId, fase } = body;
      if (!requestId) return NextResponse.json({ error: "requestId verplicht" }, { status: 400 });
      const phase: "aanbetaling" | "restbetaling" = fase === "restbetaling" ? "restbetaling" : "aanbetaling";

      const sb = getSupabase();
      const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", requestId).single();
      if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
      if (!req.gast_email) return NextResponse.json({ error: "Aanvraag heeft geen e-mailadres" }, { status: 400 });

      const totaal = Number(req.totaal) || 0;
      if (totaal <= 0) return NextResponse.json({ error: "Stuur eerst een offerte — totaalbedrag ontbreekt" }, { status: 400 });

      const deposit = Math.round(totaal * DEPOSIT_PCT * 100) / 100;
      const rest = Math.round((totaal - deposit) * 100) / 100;
      const amount = phase === "aanbetaling" ? deposit : rest;
      const pctLabel = phase === "aanbetaling" ? "30%" : "70%";
      if (amount <= 0) return NextResponse.json({ error: "Bedrag is nul" }, { status: 400 });

      const mollieKey = process.env.MOLLIE_API_KEY;
      if (!mollieKey) return NextResponse.json({ error: "Mollie niet geconfigureerd" }, { status: 500 });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const origin = new URL(appUrl).origin;
      const lodgeNaam = lodgeName(req.lodge || "lodge_1");
      const fmtNl = (iso: string | null) => iso
        ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
        : "";
      const van = req.check_in ? fmtNl(req.check_in) : (req.periode_tekst?.split("—")[0]?.trim() || "");
      const tot = req.check_out ? fmtNl(req.check_out) : (req.periode_tekst?.split("—")[1]?.trim() || "");
      const periodeLabel = van && tot ? `${van} t/m ${tot}` : (req.periode_tekst || "");
      const faseLabel = phase === "aanbetaling" ? "Aanbetaling" : "Restbetaling";
      const productLabel = `${faseLabel} (${pctLabel}) — Lodge ${lodgeNaam}${periodeLabel ? ` · ${periodeLabel}` : ""}`;

      // Maak een bookings-rij: dit is de bron-van-waarheid voor de Mollie-webhook
      const { data: booking } = await sb.from("bookings").insert({
        guest_id: req.guest_id,
        product: productLabel,
        prijs: amount,
        status: "nieuw",
        metadata: { bookingRequestId: requestId, betaalfase: phase, gastNaam: req.gast_naam, gastEmail: req.gast_email },
      }).select("id").single();
      const bookingId = booking?.id;

      // Mollie-betaling aanmaken
      let checkoutUrl: string | null = null;
      try {
        const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
          method: "POST",
          headers: { Authorization: `Bearer ${mollieKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: { currency: "EUR", value: amount.toFixed(2) },
            description: `Huis ter Huynen — ${productLabel}`,
            redirectUrl: `${origin}/betaald?booking=${bookingId || ""}`,
            webhookUrl: `${origin}/api/mollie/webhook`,
            metadata: {
              bookingId: bookingId || "",
              betaalfase: phase,
              bookingRequestId: requestId,
              gastNaam: req.gast_naam,
              gastEmail: req.gast_email,
            },
          }),
        });
        if (!mollieRes.ok) {
          const err = await mollieRes.json().catch(() => ({}));
          console.error("Mollie payment-link error:", err);
          return NextResponse.json({ error: "Mollie-betaling kon niet worden aangemaakt" }, { status: 500 });
        }
        const payment = await mollieRes.json();
        checkoutUrl = payment._links?.checkout?.href || null;
        if (bookingId && payment.id) {
          await sb.from("bookings").update({ mollie_payment_id: payment.id }).eq("id", bookingId);
        }
      } catch (e) {
        console.error("Mollie payment-link request failed:", e);
        return NextResponse.json({ error: "Mollie niet bereikbaar" }, { status: 500 });
      }

      // Betaalmail naar de gast
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey && checkoutUrl) {
        const { url: photoUrl } = lodgePhoto(origin, req.lodge);
        const firstName = esc((req.gast_naam || "").split(" ")[0] || "");
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [req.gast_email],
            subject: `${faseLabel} voor je verblijf — Huis ter Huynen`,
            html: lodgeEmail({
              photoUrl, photoAlt: `Lodge ${esc(lodgeNaam)}`,
              title: phase === "aanbetaling"
                ? `Bevestig je verblijf${firstName ? `, ${firstName}` : ""}`
                : `Laatste stap${firstName ? `, ${firstName}` : ""}`,
              intro: phase === "aanbetaling"
                ? `Je reservering voor Lodge ${esc(lodgeNaam)} staat klaar. Met de aanbetaling van 30% leg je je data definitief vast.`
                : `Bijna klaar! Voldoe de restbetaling en je verblijf in Lodge ${esc(lodgeNaam)} is volledig geregeld.`,
              blocks: [
                infoBlock("Je verblijf", esc(periodeLabel || "—"), `Lodge ${esc(lodgeNaam)}`),
                calloutBlock(
                  `${faseLabel} (${pctLabel})`,
                  `Te voldoen: <strong>&euro; ${amount.toFixed(2)}</strong> van het totaalbedrag van &euro; ${totaal.toFixed(2)}.`,
                ),
                ctaButton(checkoutUrl, `Betaal &euro; ${amount.toFixed(2)} via iDEAL`, { prominent: true }),
                checklist(
                  phase === "aanbetaling"
                    ? [
                        "Veilig betalen via iDEAL",
                        "Je data zijn vastgelegd zodra de aanbetaling binnen is",
                        "De restbetaling volgt later, ruim voor aankomst",
                      ]
                    : [
                        "Veilig betalen via iDEAL",
                        "Hierna is je verblijf volledig betaald",
                        "Je gast-app volgt enkele dagen voor aankomst",
                      ],
                ),
              ],
            }),
          });
        } catch (e) {
          console.error("Payment-link email failed:", e);
        }
      }

      await sb.from("booking_requests").update({
        status: phase === "aanbetaling" ? "aanbetaling_verstuurd" : "restbetaling_verstuurd",
      }).eq("id", requestId);

      return NextResponse.json({ success: true, checkoutUrl, amount, totaal, fase: phase });
    }
    case "add_manual_booking": {
      const { naam, platform, lodge, checkIn, checkOut } = body;
      if (!naam || !lodge || !checkIn || !checkOut) {
        return NextResponse.json({ error: "naam, lodge, checkIn en checkOut zijn verplicht" }, { status: 400 });
      }
      const nachten = Math.round((new Date(checkOut as string).getTime() - new Date(checkIn as string).getTime()) / 86400000);
      if (nachten <= 0) return NextResponse.json({ error: "Uitcheckdatum moet na inchechdatum liggen" }, { status: 400 });

      const { data, error } = await getSupabase().from("booking_requests").insert({
        bron: "handmatig",
        gast_naam: naam,
        gast_email: "",
        lodge,
        check_in: checkIn,
        check_out: checkOut,
        nachten,
        bericht: platform || null,
        status: "bevestigd",
        extra_regels: [],
      }).select("id").single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, id: data?.id });
    }
    case "delete_manual_booking": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const { error } = await getSupabase()
        .from("booking_requests")
        .delete()
        .eq("id", body.id)
        .eq("bron", "handmatig");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "reject_booking_request": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("booking_requests").update({ status: "afgewezen" }).eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    case "mark_booking_in_behandeling": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("booking_requests").update({ status: "in_behandeling" }).eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    default:
      return null;
  }
}
