/* Eén gast, één rij.
 *
 * De guests-tabel wordt op e-mailadres bijgehouden (upsert_guest zoekt erop).
 * Die vergelijking is hoofdlettergevoelig, terwijl e-mail dat niet is: wie de
 * ene keer "Jan@example.com" invult en de andere keer "jan@example.com" kreeg
 * twee gastrijen. Dat is niet cosmetisch — de follow-upmail ontdubbelt per
 * guest_id, dus dezelfde persoon kreeg "Hoe was je verblijf?" twee keer, en
 * zijn verblijven en boekingen raakten over twee gasten verdeeld.
 *
 * Daarom gaat elk adres in dezelfde vorm de database in: getrimd en in kleine
 * letters. Alleen het lokale deel is formeel hoofdlettergevoelig; geen enkele
 * mailprovider die hier voorkomt maakt daar gebruik van.
 */
export function normaliseerEmail(waarde: unknown): string {
  return typeof waarde === "string" ? waarde.trim().toLowerCase() : "";
}
