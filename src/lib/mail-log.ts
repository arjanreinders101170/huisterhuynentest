import { getSupabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════════════
   Logregels van verstuurde mails
   ───────────────────────────────────────────────────────────────
   Na het versturen van een follow-up- of late-checkout-mail leggen
   we een rij vast in `bookings`. Dat is geen boeking maar puur een
   logregel: de mailers ontdubbelen erop, zodat een gast dezelfde
   mail niet twee keer krijgt.

   Die rij moet er dus echt komen. Supabase geeft een mislukte
   insert terug als waarde, niet als exception, dus een try/catch
   eromheen vangt hem niet — zonder expliciete controle verdwijnt
   een geweigerde logregel geruisloos en stuurt de volgende run de
   mail opnieuw. Precies dat gebeurde toen de statuswaarde nog niet
   in de check-constraint stond; zie
   migrations/2026_08_19_followup_mail_status.sql.
   ═══════════════════════════════════════════════════════════════ */

export type MailLogProduct = "follow-up-email" | "late-checkout-email";

/**
 * Legt vast dat een mail verstuurd is.
 *
 * Gooit bewust geen fout: op dit punt is de mail al de deur uit, dus de
 * afhandeling eromheen moet gewoon doorlopen. De aanroeper krijgt het
 * resultaat terug en kan het meetellen.
 *
 * @returns true als de logregel is weggeschreven, false als dat mislukte.
 */
export async function logSentEmail(
  product: MailLogProduct,
  guestId: string,
  metadata: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await getSupabase().from("bookings").insert({
    guest_id: guestId,
    product,
    prijs: 0,
    status: "verstuurd",
    metadata,
  });

  if (!error) return true;

  console.error(
    `MAILLOG MISLUKT: ${product} is verstuurd naar gast ${guestId}, maar de ` +
    `logregel kon niet worden opgeslagen. Zonder die regel stuurt de volgende ` +
    `run dezelfde mail nog een keer. Oorzaak: ${error.message}`,
    error,
  );
  return false;
}
