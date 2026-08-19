import { z } from "zod";

export const bookingSchema = z.object({
  product: z.string().min(1).max(100),
  prijs: z.string().max(20).optional(),
  gastNaam: z.string().min(1).max(100),
  gastEmail: z.string().email(),
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
