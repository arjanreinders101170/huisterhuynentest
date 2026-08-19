/* ═══ WIFI-WACHTWOORD — SERVER ONLY ═══
 *
 * Dit wachtwoord gaf ooit toegang tot het gastnetwerk vanaf de publieke
 * site: het stond als NEXT_PUBLIC_WIFI_PASSWORD in @/data/lodge, en die
 * prefix bakt een waarde tijdens de build in de JavaScript die naar élke
 * bezoeker gaat — ook naar wie nooit een verblijf heeft geboekt.
 *
 * Daarom staat het nu hier, achter een gewone (niet-NEXT_PUBLIC) env-var:
 *  - de gast-app krijgt het via /api/stay, ná validatie van het stay-token;
 *  - de chatbot krijgt het alleen in de prompt bij een geldig stay-token.
 *
 * Importeer dit bestand nooit vanuit een "use client"-component. De guard
 * hieronder maakt zo'n vergissing luidruchtig in plaats van stil: zonder
 * die guard zou Next de env-var vervangen door undefined en zou de wifi-
 * kaart simpelweg leeg blijven, zonder dat iemand doorheeft waarom.
 */

export function wifiPassword(): string {
  if (typeof window !== "undefined") {
    throw new Error(
      "wifiPassword() is server-only — haal het wachtwoord op via /api/stay."
    );
  }
  return process.env.WIFI_PASSWORD ?? "";
}
