import { z } from "zod";

/* /api/booking registreert een upsell voor een gast die al in de lodge zit.
 *
 * Eerder nam dit schema product, prijs, gastNaam en gastEmail als vrije tekst
 * aan. Daarmee was het endpoint een e-mailrelay: een aanvaller koos zelf de
 * ontvanger en de tekst, en kreeg een mail met geldige SPF- en DKIM-
 * handtekeningen vanaf lodge@huisterhuynen.nl. De enige echte aanroeper
 * (concierge/page.tsx) stuurde bovendien nooit gastNaam/gastEmail mee, dus
 * die werd altijd geweigerd — het misbruikpad was het enige dat werkte.
 *
 * Nu identificeert het stay-token de gast, en komen naam, e-mailadres, product
 * en prijs allemaal uit de database. De client kiest alleen nog wélk product. */
export const bookingSchema = z.object({
  stayToken: z.string().min(16).max(128),
  productId: z.string().min(1).max(50),
  datum: z.string().max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const terugkomenSchema = z.object({
  from: z.string().min(1).max(50),
  to: z.string().min(1).max(50),
  fromIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  email: z.string().email(),
  name: z.string().max(100).optional(),
  persons: z.number().int().min(1).max(4).optional(),
  message: z.string().max(500).optional(),
  voorkeursLodge: z.enum(["lodge_1", "lodge_2"]).optional(),
  voorkeursLodgeNaam: z.string().max(60).optional(),
  wasFallback: z.boolean().optional(),
  bron: z.enum(["terugkomer", "app"]).optional(),
});

export const reviewSchema = z.object({
  naam: z.string().min(1).max(50),
  sterren: z.number().int().min(1).max(5),
  tekst: z.string().min(1).max(500),
  email: z.string().email().optional(),
});

/* Fietsverhuur is het enige product met een dynamische prijs, en die wordt
 * berekend uit velden die de browser meestuurt. Zonder dit schema kwamen ze
 * ongecontroleerd binnen via `metadata` (z.record(…, z.unknown())): een
 * `dagen` van 0.01 leverde dan een Mollie-betaallink van een paar cent op.
 * De cast `as number` in de route hielp daar niet tegen — die bestaat alleen
 * tijdens het compileren. */
export const fietsMetadataSchema = z.object({
  fietsen: z.record(z.string().max(50), z.number().int().min(0).max(10)),
  dagen: z.number().int().min(1).max(30),
});

export const checkoutSchema = z.object({
  productId: z.string().min(1).max(50),
  gastNaam: z.string().min(1).max(100),
  gastEmail: z.string().email(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  _meta: z.object({
    event_id: z.string().min(8).max(80),
    anonymous_id: z.string().max(80).optional(),
  }).optional(),
});

/* Herkomst van het bezoek. Alles optioneel: de bezoeker kan storage hebben
 * geblokkeerd, en een aanvraag mag daar nooit op stuklopen. */
const attributieTouchSchema = z.object({
  utm_source:   z.string().max(200).optional(),
  utm_medium:   z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  utm_term:     z.string().max(200).optional(),
  utm_content:  z.string().max(200).optional(),
  gclid:        z.string().max(200).optional(),
  fbclid:       z.string().max(200).optional(),
  referrer:     z.string().max(200).optional(),
  landing_page: z.string().max(200).optional(),
  op:           z.string().max(40).optional(),
}).partial();

export const attributieSchema = z.object({
  eerste:  attributieTouchSchema.optional(),
  laatste: attributieTouchSchema.optional(),
});

export const reserveringSchema = z.object({
  naam: z.string().min(1).max(100),
  email: z.string().email(),
  lodge: z.enum(["lodge_1", "lodge_2"]),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nights: z.string().max(10),
  totalPrice: z.string().max(20),
  priceLabel: z.string().max(200).optional(),
  bericht: z.string().max(500).optional(),
  aantalPersonen: z.string().max(5).optional(),
  huisdieren: z.enum(["ja", "nee"]).optional(),
  promoCode: z.string().max(50).optional(),
  /** Taal van het formulier — bepaalt in welke taal foutmeldingen terugkomen. */
  locale: z.enum(["nl", "de"]).optional(),
  _meta: z.object({
    event_id: z.string().min(8).max(80),
    anonymous_id: z.string().max(80).optional(),
  }).optional(),
  _attr: attributieSchema.optional(),
});
