import { z } from "zod";

// KEEP THIS UP TO DATE WITH THE EVENT SCHEMA IN THE SUPABASE EDGE FUNCTION

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

const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  creatorProfileId: z.string().uuid(),
  description: z.string().optional(),
  bookingUrl: z.string().url(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  publishedAt: z.string().datetime(),
  isOnline: z.boolean(),
  capacity: z.number().int().positive(),
  currency: z.string().length(3).transform(s => s.toUpperCase()),
  thumbnail: z.string().url().optional(),
  category: categorySchema,
  location: locationSchema,
  openaiFileId: z.string().optional(), // id in vector database
});

export { eventSchema, locationSchema, categorySchema };
export type Event = z.infer<typeof eventSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Category = z.infer<typeof categorySchema>;
