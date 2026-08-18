import { createSign } from "crypto";

/* ═══ Google Search Console API ═══
 * Haalt de zoekprestaties per kalendermaand op.
 *
 * Auth loopt via een service-account, niet via een API-sleutel: de Search
 * Console API accepteert alleen OAuth2. Het service-account moet in Search
 * Console als gebruiker aan de property zijn toegevoegd — zie README.
 *
 * De JWT wordt hier met node:crypto ondertekend in plaats van met googleapis.
 * Dat scheelt een zware dependency voor wat neerkomt op één RS256-handtekening.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API_BASE = "https://searchconsole.googleapis.com/webmasters/v3/sites";

/** Search Console levert maximaal 25.000 rijen per verzoek. */
const ROW_LIMIT = 25000;

export type GscDimensie = "query" | "page";

export interface GscRow {
  sleutel: string;
  klikken: number;
  vertoningen: number;
  positie: number;
}

export class GscConfigError extends Error {}

interface GscConfig {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
}

function readConfig(): GscConfig {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const rawKey = process.env.GSC_PRIVATE_KEY;
  const siteUrl = process.env.GSC_SITE_URL;

  const ontbreekt = [
    !clientEmail && "GSC_CLIENT_EMAIL",
    !rawKey && "GSC_PRIVATE_KEY",
    !siteUrl && "GSC_SITE_URL",
  ].filter(Boolean);

  if (ontbreekt.length > 0) {
    throw new GscConfigError(`Search Console niet geconfigureerd: ${ontbreekt.join(", ")} ontbreekt.`);
  }

  return {
    clientEmail: clientEmail!,
    // In omgevingsvariabelen staan de regeleindes van de sleutel als \n.
    privateKey: rawKey!.replace(/\\n/g, "\n"),
    siteUrl: siteUrl!,
  };
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Wisselt een zelf ondertekende JWT om voor een access token (OAuth2 JWT-bearer flow). */
async function fetchAccessToken(config: GscConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(JSON.stringify({
    iss: config.clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = base64url(signer.sign(config.privateKey));
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Token ophalen mislukt (${res.status}): ${data.error_description ?? data.error ?? "onbekende fout"}`);
  }
  return data.access_token as string;
}

interface ApiRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  position?: number;
}

/** Haalt één dimensie op voor één periode. Pagineert tot alles binnen is. */
async function queryDimensie(
  token: string, siteUrl: string, dimensie: GscDimensie, start: string, eind: string,
): Promise<GscRow[]> {
  const endpoint = `${API_BASE}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const rijen: GscRow[] = [];

  for (let startRow = 0; ; startRow += ROW_LIMIT) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: start,
        endDate: eind,
        dimensions: [dimensie],
        rowLimit: ROW_LIMIT,
        startRow,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Search Console API gaf ${res.status}: ${data?.error?.message ?? "onbekende fout"}`);
    }

    const batch: ApiRow[] = data.rows ?? [];
    for (const r of batch) {
      const sleutel = r.keys?.[0];
      if (!sleutel) continue;
      rijen.push({
        sleutel,
        klikken: r.clicks ?? 0,
        vertoningen: r.impressions ?? 0,
        // De API geeft de positie als kommagetal; op twee decimalen bewaren.
        positie: Math.round((r.position ?? 0) * 100) / 100,
      });
    }

    if (batch.length < ROW_LIMIT) break;
  }

  return rijen;
}

/** Eerste en laatste dag van de maand waarin `datum` valt, als YYYY-MM-DD. */
export function maandGrenzen(datum: Date): { start: string; eind: string; maand: string } {
  const jaar = datum.getUTCFullYear();
  const maand = datum.getUTCMonth();
  const eersteDag = new Date(Date.UTC(jaar, maand, 1));
  const laatsteDag = new Date(Date.UTC(jaar, maand + 1, 0));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(eersteDag), eind: iso(laatsteDag), maand: iso(eersteDag) };
}

/** De maand vóór `peil` — standaard de vorige volledige kalendermaand. */
export function vorigeMaand(peil: Date = new Date()): Date {
  return new Date(Date.UTC(peil.getUTCFullYear(), peil.getUTCMonth() - 1, 1));
}

export interface MaandResultaat {
  maand: string;
  queries: GscRow[];
  pages: GscRow[];
}

/** Haalt zoekopdrachten en pagina's op voor één volledige kalendermaand. */
export async function haalMaandOp(datumInMaand: Date): Promise<MaandResultaat> {
  const config = readConfig();
  const token = await fetchAccessToken(config);
  const { start, eind, maand } = maandGrenzen(datumInMaand);

  const [queries, pages] = await Promise.all([
    queryDimensie(token, config.siteUrl, "query", start, eind),
    queryDimensie(token, config.siteUrl, "page", start, eind),
  ]);

  return { maand, queries, pages };
}
