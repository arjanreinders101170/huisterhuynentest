/* De sleutels die elk nieuw verblijf nodig heeft: het token voor de gast-app,
 * de deurcode voor het keypad, en de kolom wifi_code.
 *
 * Aanleiding: de Booking.com-import liep stuk op
 *   null value in column "wifi_code" of relation "stays" violates not-null constraint
 *
 * Die kolom stamt uit de tijd dat elk verblijf zijn eigen wifi-code kreeg. Het
 * gastnetwerk heeft allang één vast wachtwoord — dat leest src/lib/wifi.ts
 * server-side uit de omgeving — dus niemand leest wifi_code nog. In de database
 * staat hij echter nog als NOT NULL zonder standaardwaarde, en dus faalde elke
 * insert die hem oversloeg: de import, 'nieuw verblijf' in de admin, en de
 * automatische aanmaak bij het bevestigen van een aanvraag (die de fout ook nog
 * eens stilletjes wegslikte). Eén plek waar deze sleutels ontstaan voorkomt dat
 * de volgende insert dezelfde val in loopt.
 *
 * migrations/2026_09_10_wifi_code_niet_meer_verplicht.sql haalt die NOT NULL
 * eraf. We vullen de kolom hier tóch, zodat het aanmaken van een verblijf ook
 * werkt op een database waar die migratie nog niet gedraaid is. Het echte
 * wachtwoord komt hier bewust niet in: dat hoort in de omgeving, niet in een
 * kolom die per verblijf wordt gekopieerd.
 */

export type StaySleutels = { token: string; door_code: string; wifi_code: string };

export async function nieuweStaySleutels(): Promise<StaySleutels> {
  const { randomBytes, randomInt } = await import("crypto");
  return {
    token: randomBytes(24).toString("hex"),
    /* Zes cijfers in plaats van vier: randomInt(1000, 9999) gaf 8.999
     * mogelijkheden (de bovengrens is exclusief, en codes met een voorloopnul
     * kwamen nooit voor). Dit is de code voor het fysieke keypad, dus de
     * zoekruimte gaat van 9.000 naar een miljoen. */
    door_code: String(randomInt(0, 1_000_000)).padStart(6, "0"),
    wifi_code: "",
  };
}
