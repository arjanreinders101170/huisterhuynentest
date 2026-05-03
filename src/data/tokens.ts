/* ═══ DESIGN TOKENS ═══ */
export const T = {
  bg: "#EAE3D2",
  card: "#FDFBF6",
  green: "#2F4F3E",
  green2: "#3A6350",
  gold: "#B49A5E",
  text: "#2A2418",
  muted: "#8A7D6A",
  border: "#E0D8C8",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
} as const;

/* ═══ SHARED STYLES ═══ */
export const cardStyle: React.CSSProperties = {
  background: T.card,
  borderRadius: 16,
  border: `1px solid ${T.border}`,
  boxShadow: "0 2px 12px rgba(47,79,62,.06)",
};

export const iconBox: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "rgba(47,79,62,.06)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

/* ═══ TYPES ═══ */
export type Route =
  | "home"
  | "verblijf"
  | "chat"
  | "reserveren"
  | "info"
  | `detail:${string}`;

export type ChatMsg = {
  role: "user" | "assistant";
  text: string;
};

export type DoorStatus = "locked" | "opening" | "open" | "error";

export type GuestProfile = "stel" | "gezin" | "actief" | "rust" | null;

export type CategoryItem = {
  id: string;
  naam: string;
  afstand: string;
  lengte?: string;
  duur?: string;
  prijs?: string;
  moeilijkheid?: string;
  coords: string;
  beschrijving: string;
  tags: string[];
  website?: string;
  tel?: string;
  upsell?: string;
};

export type Category = {
  title: string;
  sub: string;
  filters: string[];
  items: CategoryItem[];
};
