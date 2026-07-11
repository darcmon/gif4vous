import { Router } from "express";
import { siphonRequestSchema } from "@gif-library/shared";

/**
 * Build order (matches the README task list):
 *
 * POST /api/admin/siphon        [requireAdmin]
 *   1. siphonRequestSchema.safeParse(req.body) — 400 with flattened errors
 *      on failure. (Zod does the validation; you just wire it.)
 *   2. await assertSafeUrl(sourceUrl) — 400 on { ok: false }.
 *   3. axios GET with responseType: "arraybuffer",
 *      maxContentLength: 15 * 1024 * 1024, timeout: 10_000.
 *   4. detectImageType(buffer) — reject "unknown" with 415.
 *   5. storageKey: hash the CONTENT — crypto.createHash("sha256")
 *      .update(buffer).digest("hex") — so the same GIF siphoned twice maps
 *      to the same key. Key it as `gifs/${hash}.${detected.kind}`.
 *   6. uploadBuffer(...) — 502 on { ok: false }.
 *   7. prisma.gif.create in try/catch; if the DB write fails AFTER a
 *      successful upload, call removeObject(storageKey) in the catch so you
 *      never pay for orphans. (Bonus: upsert on storageKey = free dedupe.)
 *   8. 201 with the new row.
 *
 * GET /api/gifs/random          [public — the mobile app hits this]
 *   The $queryRaw from the original plan is fine to start. Type it honestly:
 *   Pick<Gif, "id" | "url">[] — you only SELECT id, url. 404 when empty.
 *
 * GET /api/admin/gifs           [requireAdmin]
 *   Cursor pagination for the admin library view (feeds useInfiniteQuery
 *   later): ?cursor=<id>&limit=20, orderBy createdAt desc,
 *   return { items, nextCursor }. Prisma's `cursor` + `skip: 1` +
 *   `take: limit + 1` trick: fetch one extra row to know if there's a next
 *   page. Look this pattern up and implement it — it's everywhere.
 *
 * DELETE /api/admin/gifs/:id    [requireAdmin]
 *   Soft delete: set isActive = false. DB is the source of truth; actual
 *   object cleanup becomes a batch job later (or a hard-delete route that
 *   does DB first, then removeObject, logging storage failures).
 */
export const gifsRouter = Router();

// TODO(you): the routes. Reference the schema import above so the shared
// workspace wiring is proven the moment this file compiles.
void siphonRequestSchema;
