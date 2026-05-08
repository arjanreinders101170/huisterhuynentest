import { z } from "zod";
import { LodgeSchema } from "@/lib/lodge";

export const bookingSchema = z.object({
  product: z.string().min(1).max(100),
  prijs: z.string().max(20).optional(),
  gastNaam: z.string().min(1).max(100),
  gastEmail: z.string().email(),
  datum: z.string().max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  lodge: LodgeSchema.optional(),
});

export const terugkomenSchema = z.object({
  from: z.string().min(1).max(50),
  to: z.string().min(1).max(50),
  email: z.string().email(),
  name: z.string().max(100).optional(),
  persons: z.number().int().min(1).max(20).optional(),
  message: z.string().max(500).optional(),
  lodge: LodgeSchema.optional(),
});

export const reviewSchema = z.object({
  naam: z.string().min(1).max(50),
  sterren: z.number().int().min(1).max(5),
  tekst: z.string().min(1).max(500),
  email: z.string().email().optional(),
  lodge: LodgeSchema.optional(),
  stayToken: z.string().min(1).max(128).optional(),
});

export const checkoutSchema = z.object({
  productId: z.string().min(1).max(50),
  gastNaam: z.string().min(1).max(100),
  gastEmail: z.string().email(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  lodge: LodgeSchema.optional(),
});

// ── Schemas for previously unvalidated routes ─────────────────────

export const offerteSchema = z.object({
  id: z.string().min(1).max(64),
  prijsVerblijf: z.number().nonnegative().max(100000),
  toeristenbelasting: z.number().nonnegative().max(10000),
  schoonmaak: z.number().nonnegative().max(10000),
  persoonlijkeBoodschap: z.string().max(2000).optional(),
  lodge: LodgeSchema,
  adminSecret: z.string().min(1).max(256),
});

export const bevestigSchema = z.object({
  token: z.string().min(1).max(128),
  akkoord: z.boolean().optional(),
});

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

export const chatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
});

// ── Admin actions ─────────────────────────────────────────────────
// Discriminated union mirroring src/app/api/admin/data/route.ts cases.

const productBaseFields = {
  id: z.string().min(1).max(50),
  naam: z.string().min(1).max(100).optional(),
  omschrijving: z.string().max(1000).nullish(),
  prijs: z.union([z.string(), z.number()]).optional(),
  categorie: z.string().max(50).optional(),
  volgorde: z.number().int().optional(),
  btw_percentage: z.number().min(0).max(100).optional(),
  grootboek_code: z.string().max(20).optional(),
};

export const adminActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("toggle_review"),
    id: z.string().min(1).max(64),
    visible: z.boolean(),
  }),
  z.object({
    action: z.literal("create_product"),
    ...productBaseFields,
    naam: z.string().min(1).max(100),
    prijs: z.union([z.string(), z.number()]),
  }),
  z.object({
    action: z.literal("update_product"),
    ...productBaseFields,
  }),
  z.object({
    action: z.literal("toggle_product"),
    id: z.string().min(1).max(50),
    actief: z.boolean(),
  }),
  z.object({
    action: z.literal("delete_product"),
    id: z.string().min(1).max(50),
  }),
  z.object({
    action: z.literal("create_stay"),
    naam: z.string().min(1).max(100),
    email: z.string().email(),
    lodge: LodgeSchema,
    check_in: z.string().min(1).max(40),
    check_out: z.string().min(1).max(40),
  }),
  z.object({
    action: z.literal("send_welcome"),
    id: z.string().min(1).max(64),
  }),
  z.object({
    action: z.literal("send_thankyou"),
    id: z.string().min(1).max(64),
  }),
]);

export type AdminAction = z.infer<typeof adminActionSchema>;
