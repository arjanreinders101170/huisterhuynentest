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
  email: z.string().email(),
  name: z.string().max(100).optional(),
  persons: z.number().int().min(1).max(20).optional(),
  message: z.string().max(500).optional(),
  voorkeursLodge: z.enum(["lodge_1", "lodge_2"]).optional(),
  voorkeursLodgeNaam: z.string().max(60).optional(),
  wasFallback: z.boolean().optional(),
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
});
