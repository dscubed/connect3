import { z } from "zod";

// KEEP THIS UP TO DATE WITH THE EVENT SCHEMA IN THE EDGE FUNCTION

const locationSchema = z.object({
  venue: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string(),
  country: z.string(),
});

const categorySchema = z.object({
  type: z.string(),
  category: z.string(),
  subcategory: z.string(),
});

const pricingSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  })
  .refine((data: { min: number; max: number }) => data.max >= data.min, {
    message: "Max must be greater than min",
    path: ["max"],
  });

const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  creatorProfileId: z.string().uuid(),
  description: z.string().optional(),
  bookingUrl: z.string().url(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  publishedAt: z.string().datetime(),
  capacity: z.number().int().positive(),
  thumbnail: z.string().url().optional(),
  currency: z
    .string()
    .length(3)
    .transform((s) => s.toUpperCase()),
  category: categorySchema,
  isOnline: z.boolean(),
  location: locationSchema,
  pricing: pricingSchema,
  openaiFileId: z.string().optional(), // id in vector database
});

export { eventSchema, locationSchema, categorySchema };
export type Event = z.infer<typeof eventSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Pricing = z.infer<typeof pricingSchema>;
