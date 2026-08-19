/* ═══ IndexNow — nieuwe of gewijzigde pagina's direct aanmelden ═══
 *
 * Waarom: Google crawlt op eigen tempo, maar Bing, Yandex, Seznam en Naver
 * accepteren een directe melding. Voor een site met wekelijks nieuwe artikelen
 * scheelt dat dagen tot weken indexering — gratis, en met één HTTP-call.
 *
 * Werking: één sleutel, gepubliceerd op https://www.huisterhuynen.nl/<sleutel>.txt
 * met de sleutel als enige inhoud. Dat bestand bewijst dat wij over dit domein
 * gaan; het staat in public/ en wordt met de site meegedeployed.
 */

const SITE_URL = "https://www.huisterhuynen.nl";
const HOST = "www.huisterhuynen.nl";
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** IndexNow accepteert maximaal 10.000 URL's per melding; wij komen daar nooit bij in de buurt. */
const MAX_URLS = 100;

/* De sleutel is publiek van opzet: hij bewijst domeincontrole doordat hij op
 * ons eigen domein staat, en er valt niets mee te doen behalve onze eigen
 * URL's aanmelden. Daarom staat hij in de repo — dat scheelt een handmatige
 * stap bij elke deploy. Wie hem wil vervangen zet INDEXNOW_KEY in Vercel en
 * plaatst het bijbehorende bestand in public/. */
const STANDAARD_SLEUTEL = "0e999b63703103fcf44d31b86ab11d4f";

export interface IndexNowResultaat {
  verzonden: number;
  status?: number;
  overgeslagen?: "geen-urls";
  fout?: string;
}

export function indexNowSleutel(): string {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && key.length >= 8 ? key : STANDAARD_SLEUTEL;
}

/**
 * Meld URL's aan bij IndexNow.
 *
 * Faalt bewust stil: een publicatie mag nooit stuklopen omdat een zoekmachine
 * even niet bereikbaar is. Het resultaat wordt teruggegeven zodat de aanroeper
 * het kan loggen.
 */
export async function meldAan(paden: string[]): Promise<IndexNowResultaat> {
  const key = indexNowSleutel();

  const urls = [...new Set(paden)]
    .map((pad) => (pad.startsWith("http") ? pad : `${SITE_URL}${pad.startsWith("/") ? pad : `/${pad}`}`))
    .filter((url) => url.startsWith(`${SITE_URL}/`))
    .slice(0, MAX_URLS);

  if (urls.length === 0) return { verzonden: 0, overgeslagen: "geen-urls" };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList: urls,
      }),
    });
    return { verzonden: urls.length, status: res.status };
  } catch (e) {
    return { verzonden: 0, fout: e instanceof Error ? e.message : String(e) };
  }
}
