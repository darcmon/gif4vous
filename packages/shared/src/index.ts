import { z } from 'zod';

/**
 * =========================================================================
 * SHARED API CONTRACT
 * Both the Express backend and the React admin import from this package.
 * One source of truth: if you change a schema here, BOTH sides get the
 * compile error. This is the payoff of full-stack TypeScript.
 * =========================================================================
 */

// ---- Worked example: the siphon request body ----------------------------
// Pattern to internalize: define the schema, then DERIVE the type from it
// with z.infer. Never hand-write an interface that duplicates a schema.
export const siphonRequestSchema = z.object({
  sourceUrl: z.string().url().startsWith('https://', {
    message: 'Only https sources are allowed',
  }),
  tags: z.array(z.string().min(1).max(32)).max(10).default([]),
});

export type SiphonRequest = z.infer<typeof siphonRequestSchema>;

export const gifSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
});

export type Gif = z.infer<typeof gifSchema>;

export const listGifsResponseSchema = z.object({
  items: z.array(gifSchema),
  nextCursor: z.string().nullable(),
});

export type ListGifsResponse = z.infer<typeof listGifsResponseSchema>;

//
// TODO(you) #3: Define `randomGifResponseSchema` — { url: string }.
//   Trivial on purpose: the frontend will call .parse() on fetch results,
//   which turns "the API changed shape" from a silent bug into a loud one.
