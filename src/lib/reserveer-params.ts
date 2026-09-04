import type { LodgeParam } from "@/lib/site";

/* Leest ?van= en ?lodge= uit de URL van de browser.
 *
 * Bewust via window.location en niet via useSearchParams: de homepage is één
 * groot client-component en useSearchParams dwingt in Next 15 een
 * Suspense-grens af rond alles wat eronder hangt, inclusief het formulier.
 * Deze context is een verrijking, geen voorwaarde — hij mag pas na hydratie
 * verschijnen en hoort de rendering van de pagina niet op te houden.
 */
export function leesReserveerParams(): { van: string | null; lodge: LodgeParam | null } {
  if (typeof window === "undefined") return { van: null, lodge: null };
  const q = new URLSearchParams(window.location.search);
  const lodge = q.get("lodge");
  return {
    van: q.get("van"),
    lodge: lodge === "heide" || lodge === "eik" ? lodge : null,
  };
}

/* Op de homepage staat het formulier al op de pagina: daar is ?lodge= geen
 * bruikbare weg, want de query lezen kan alleen bij het laden en een link naar
 * /?lodge=heide#reserveren zou de eigen pagina opnieuw laten laden om één
 * keuzeknop te verzetten. De lodgekaarten zeggen het daarom rechtstreeks tegen
 * het formulier, en de anker-link blijft een anker-link. */
export const KIES_LODGE_EVENT = "hth:kies-lodge";

export function kiesLodge(lodge: LodgeParam): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LodgeParam>(KIES_LODGE_EVENT, { detail: lodge }));
}
