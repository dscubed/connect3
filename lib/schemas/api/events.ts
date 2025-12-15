import { z } from "zod";

const eventCategorySchema = z.enum([
  'networking',
  'study',
  'fun',
  'workshop',
  'competition',
  'panel',
  'miscellaneous',
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
});