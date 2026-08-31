/* Reserveringen die via een boekingsplatform binnenkomen.
 *
 * Booking.com en Airbnb regelen zelf de communicatie en het geld: de gast
 * heeft daar al een prijs geaccepteerd en betaalt daar ook. Zo'n reservering
 * staat hier alleen in de agenda zodat de datums dicht zijn — het is geen
 * aanvraag die nog een offerte of een betaallink nodig heeft.
 *
 * Toch stonden die regels in het aanvragenoverzicht met "aanbetaling
 * versturen" als volgende stap, precies zoals een eigen boeking. Eén klik te
 * ver en een Booking.com-gast krijgt een tweede rekening voor een verblijf dat
 * hij al betaald heeft. Daarom wordt dat onderscheid hier op één plek
 * vastgelegd, zodat de interface én de server dezelfde grens trekken.
 *
 * Handmatige boekingen met platform "Direct" of "Anders" vallen hier bewust
 * buiten: dat zijn gasten die rechtstreeks bij ons boeken, en die mogen wél
 * een offerte en een betaallink krijgen. */

/** Platforms die de betaling en de gastcommunicatie zelf afhandelen. */
export const EXTERNE_PLATFORMS = ["Booking.com", "Airbnb"] as const;

/* Het platform van een handmatige boeking staat in `bericht` — de waarde die
 * het keuzemenu bij "Handmatige boeking" heeft opgeslagen. Herkenning gaat op
 * een losse match, zodat oudere regels als "booking" of "Booking.com — via
 * telefoon" niet alsnog door de mazen glippen. */
const PATRONEN: Array<{ platform: string; test: RegExp }> = [
  { platform: "Booking.com", test: /booking/i },
  { platform: "Airbnb", test: /airbnb/i },
];

type PlatformBron = {
  bron?: string | null;
  bericht?: string | null;
};

/**
 * Het boekingsplatform dat deze reservering afhandelt, of null wanneer het
 * onze eigen reservering is. De naam is bedoeld om te tonen: "Booking.com".
 */
export function externPlatform(r: PlatformBron): string | null {
  if (r.bron !== "handmatig") return null;
  const tekst = (r.bericht || "").trim();
  if (!tekst) return null;
  return PATRONEN.find(p => p.test.test(tekst))?.platform ?? null;
}

/** Regelt een extern platform deze reservering? Dan sturen wij niets. */
export function viaExternPlatform(r: PlatformBron): boolean {
  return externPlatform(r) !== null;
}

/** Uitleg voor in de interface en in serverfouten — één formulering. */
export function externPlatformUitleg(platform: string): string {
  return `Deze reservering loopt via ${platform}. Prijs, offerte en betaling worden daar geregeld — wij sturen geen offerte en geen betaallink.`;
}
