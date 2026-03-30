import { z } from "zod";

// Kept in sync with connect3-ticketing schema.
// Legacy fields (booking_url, capacity, currency, city, country) removed.

const locationSchema = z.object({
  venue: z.string(),
  address: z.string().optional().default(""),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
});

const pricingSchema = z
  .object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  })
  .refine((data: { min: number; max: number }) => data.max >= data.min, {
    message: "Max must be greater or equal to min",
    path: ["max"],
  });

const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  creatorProfileId: z.string().uuid(),
  description: z.string().optional(),
  start: z.string().datetime(),
  end: z.string().datetime().optional(),
  publishedAt: z.string().datetime(),
  thumbnail: z.string().url().optional(),
  category: z.string().optional(),
  isOnline: z.boolean(),
  location: locationSchema,
  pricing: pricingSchema,
  source: z.string().optional(), // e.g. "instagram"
});

export { eventSchema, locationSchema };
export type Event = z.infer<typeof eventSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Pricing = z.infer<typeof pricingSchema>;
