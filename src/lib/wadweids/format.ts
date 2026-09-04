/* Opmaak-helpers. Alle bedragen en datums in de mock-up lopen hierlangs,
   zodat prijzen en datums overal identiek staan. */

export const euro = (n: number, cents = false) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);

export const dayMonth = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

export const longDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export const iso = (d: Date) => d.toISOString().slice(0, 10);

export const addDays = (isoDate: string, days: number) => {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return iso(d);
};

export const nightsBetween = (arrival: string, departure: string) =>
  Math.max(0, Math.round((+new Date(departure) - +new Date(arrival)) / 86_400_000));

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
