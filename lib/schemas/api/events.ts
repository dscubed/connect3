import { z } from "zod";

const eventCategorySchema = z.enum([
  "networking",
  "study",
  "fun",
  "workshop",
  "competition",
  "panel",
  "miscellaneous",
]);

const eventPricingSchema = z.enum(["free", "paid"]);
const eventLocationTypeSchema = z.enum(["virtual", "physical"]);
const eventCitySchema = z.enum([
  "melbourne",
  "sydney",
  "perth",
  "canberra",
  "adelaide",
  "gold-coast",
  "newcaste",
  "hobart",
  "brisbane",
  "darwin",
  "geelong",
]);

export const createEventBodySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  description: z.string(),
  type: z.array(eventCategorySchema),
  thumbnailUrl: z.string().url().optional(),
  creator_profile_id: z.string().uuid(),
  collaborators: z.array(z.string().uuid()).optional(),
  booking_link: z.array(z.string().url()),
  pricing: eventPricingSchema,
  city: z.array(eventCitySchema),
  location_type: eventLocationTypeSchema,
  university: z.array(z.string()).optional(),
});
