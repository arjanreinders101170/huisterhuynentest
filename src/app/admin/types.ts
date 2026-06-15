export type Booking = { id: string; product: string; prijs: number; status: string; created_at: string; guest_id: string; metadata: Record<string, unknown> };
export type Guest = { id: string; naam: string; email: string; profiel: string; laatste_bezoek: string };
export type Review = { id: string; naam: string; sterren: number; tekst: string; zichtbaar: boolean; created_at: string };
export type Product = { id: string; naam: string; omschrijving: string | null; prijs: number; categorie: string; actief: boolean; volgorde: number; btw_percentage: number; grootboek_code: string };
export type Stay = { id: string; guest_id: string; lodge: string; check_in: string; check_out: string; token: string; door_code: string; wifi_code: string; status: string; welcome_sent: boolean; guests?: { naam: string; email: string } };
export type DiscountCode = { id: string; code: string; omschrijving: string | null; type: "percentage" | "fixed"; waarde: number; geldig_van: string | null; geldig_tot: string | null; max_gebruik: number | null; gebruik_count: number; min_nachten: number | null; actief: boolean; created_at: string };
export type BlogPost = { id: string; slug: string; titel: string; intro: string; inhoud: string; categorie: string; leestijd: string; auteur: string; og_image: string | null; gepubliceerd: boolean; gepubliceerd_op: string | null; geplande_publicatie: string | null; created_at: string };
export type LandingSection = { eyebrow?: string; heading: string; body: string[]; bullets?: string[] };
export type LandingPageRow = {
  id: string; slug: string; breadcrumb: string; eyebrow: string; h1: string;
  hero_sub: string; hero_image: string; hero_image_alt: string; price_from: string;
  intro: string; sections: LandingSection[]; faq: string; related: string;
  cta_title: string; cta_body: string; meta_title: string; meta_description: string;
  og_image: string; gepubliceerd: boolean; sort_order: number;
};
export type BookingRequest = {
  id: string; created_at: string; updated_at: string;
  bron: "homepage" | "app" | "terugkomer";
  guest_id: string | null;
  gast_naam: string; gast_email: string;
  lodge: string | null;
  check_in: string | null; check_out: string | null;
  nachten: number | null; personen: number | null; huisdieren: boolean;
  bericht: string | null; periode_tekst: string | null;
  voorgestelde_prijs: number | null; voorgestelde_prijs_label: string | null;
  promo_code: string | null;
  prijs_verblijf: number | null; schoonmaak: number | null; toeristenbelasting: number | null;
  extra_regels: { label: string; bedrag: number; soort: string }[];
  totaal: number | null;
  status: "nieuw" | "in_behandeling" | "offerte_verstuurd" | "bevestigd" | "afgewezen"
    | "aanbetaling_verstuurd" | "aanbetaling_betaald" | "restbetaling_verstuurd" | "volledig_betaald";
  legacy_terugkeer_id: string | null;
  guest?: { naam: string; email: string } | null;
};
export type FeeTemplate = {
  id: string; label: string;
  soort: "toeslag" | "korting" | "belasting";
  bedrag: number | null; percentage: number | null;
  basis: "eenmalig" | "per_nacht" | "per_persoon" | "per_persoon_per_nacht";
  actief: boolean; volgorde: number; created_at: string;
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  nieuw: { bg: "#FFF3E0", text: "#E67E22" },
  bevestigd: { bg: "#E8F5E9", text: "#2E7D32" },
  betaald: { bg: "#E8F5E9", text: "#2E7D32" },
  afgewezen: { bg: "#FFEBEE", text: "#C62828" },
  offerte_verstuurd: { bg: "#E3F2FD", text: "#1565C0" },
  geboekt: { bg: "#E8F5E9", text: "#2E7D32" },
  verlopen: { bg: "#F5F5F5", text: "#9E9E9E" },
  aanbetaling_verstuurd: { bg: "#FFF8E1", text: "#F9A825" },
  aanbetaling_betaald: { bg: "#E8F5E9", text: "#2E7D32" },
  restbetaling_verstuurd: { bg: "#FFF8E1", text: "#F9A825" },
  volledig_betaald: { bg: "#E8F5E9", text: "#1B5E20" },
};
