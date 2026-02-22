import { z } from "zod";
import { EVENT_CATEGORIES } from "@/types/events/event";

const eventCategorySchema = z.enum(EVENT_CATEGORIES);

const eventPricingSchema = z.enum(["free", "paid"]);
const eventLocationTypeSchema = z.enum(["virtual", "physical"]);
const eventCitySchema = z.string();

export const createEventBodySchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  description: z.string().optional().nullable(),
  type: z.array(eventCategorySchema).optional().default([]),
  thumbnailUrl: z.string().url().optional().nullable(),
  creator_profile_id: z.string().uuid(),
  collaborators: z.array(z.string().uuid()).optional(),
  booking_link: z.array(z.string().url()).optional().default([]),
  pricing: eventPricingSchema,
  pricing_min: z.coerce.number().nonnegative().optional().default(0),
  pricing_max: z.coerce.number().nonnegative().optional().default(0),
  currency: z
    .string()
    .length(3)
    .optional()
    .nullable()
    .transform((value) => (value ? value.toUpperCase() : value)),
  city: z.array(eventCitySchema).optional().default([]),
  location_type: eventLocationTypeSchema.optional().default("physical"),
  location: z
    .object({
      venue: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  source: z.string().optional().nullable(),
  university: z.array(z.string()).optional(),
});

export type CreateEventBody = z.infer<typeof createEventBodySchema>;
