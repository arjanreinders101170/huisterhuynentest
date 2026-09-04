/* Wie krijgt de follow-upmail ("Hoe was je verblijf?").
 *
 * Die selectie liep over de guests-tabel: iedereen wiens `laatste_bezoek`
 * meer dan veertien dagen geleden lag, kreeg de mail. Dat klopt niet, want in
 * guests staat niet alleen wie hier geslapen heeft. Elke aanvraag via de site,
 * elke terugkeerwens en elke review zet er een rij in — ook van mensen die
 * nooit zijn gekomen, bijvoorbeeld omdat hun datums bezet waren of ze nooit
 * geantwoord hebben op de offerte. Er werd nergens gecontroleerd of er een
 * verblijf tegenover stond; het enige dat met `stays` gebeurde was het
 * opzoeken van de juiste lodgefoto, met lodge_1 als terugval als die er niet
 * was. Zo kreeg een aanvrager die hier nooit geweest is de vraag hoe zijn
 * verblijf was.
 *
 * Nu is een afgerond verblijf het uitgangspunt: alleen wie is uitgecheckt komt
 * in aanmerking, veertien dagen na vertrek. Blijft een verblijf een keer
 * liggen — de mail kan maar één keer per gast — dan halen we dat binnen het
 * inhaalvenster nog in; daarna niet meer, want dan is de vraag niet actueel.
 */
import { getSupabase } from "@/lib/supabase";
import { addDaysISO, todayISO } from "@/lib/offer-expiry";

/** Dagen tussen vertrek en de follow-upmail. */
export const FOLLOWUP_DAGEN_NA_VERTREK = 14;

/** Hoe ver we daarna nog inhalen als een run is overgeslagen. */
export const FOLLOWUP_INHAALVENSTER_DAGEN = 30;

export type FollowupKandidaat = {
  guestId: string;
  naam: string;
  email: string;
  /** Lodge van het laatste verblijf — bepaalt welke foto in de mail komt. */
  lodge: string | null;
  vertrokkenOp: string;
};

/**
 * Gasten die hun follow-upmail nog moeten krijgen, nieuwste vertrek eerst.
 *
 * Ontdubbelt op gast (één mail per persoon, ook na meerdere verblijven) en
 * slaat over wie hem al gehad heeft — die logregel staat in `bookings`.
 */
export async function haalFollowupKandidaten(max = 20): Promise<FollowupKandidaat[]> {
  const sb = getSupabase();
  const vandaag = todayISO();
  const jongsteVertrek = addDaysISO(vandaag, -FOLLOWUP_DAGEN_NA_VERTREK);
  const oudsteVertrek = addDaysISO(jongsteVertrek, -FOLLOWUP_INHAALVENSTER_DAGEN);

  const { data: verblijven, error } = await sb
    .from("stays")
    .select("guest_id, lodge, check_out, status")
    .not("guest_id", "is", null)
    .gte("check_out", oudsteVertrek)
    .lte("check_out", jongsteVertrek)
    .order("check_out", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Follow-up: verblijven ophalen mislukt:", error.message);
    return [];
  }

  const kandidaten: FollowupKandidaat[] = [];
  const gezien = new Set<string>();

  for (const verblijf of verblijven ?? []) {
    if (kandidaten.length >= max) break;
    if (verblijf.status === "geannuleerd") continue;
    if (gezien.has(verblijf.guest_id)) continue;
    gezien.add(verblijf.guest_id);

    const { data: gast } = await sb
      .from("guests").select("naam, email").eq("id", verblijf.guest_id).maybeSingle();
    /* Een verblijf uit de Booking.com-export heeft geen e-mailadres; die gast
     * is alleen via het extranet te bereiken. */
    if (!gast?.email) continue;

    const { data: alGehad } = await sb
      .from("bookings").select("id")
      .eq("guest_id", verblijf.guest_id).eq("product", "follow-up-email").limit(1);
    if (alGehad && alGehad.length > 0) continue;

    kandidaten.push({
      guestId: verblijf.guest_id,
      naam: gast.naam || "",
      email: gast.email,
      lodge: verblijf.lodge || null,
      vertrokkenOp: verblijf.check_out,
    });
  }

  return kandidaten;
}
