import axios from 'axios';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { Router } from 'express';
import { asyncHandler, AppError } from '../middleware/error.js';
import { siphonRequestSchema, Gif } from '@gif-library/shared';
import { assertSafeUrl } from '../lib/url-guard.js';
import { detectImageType } from '../lib/detect-image-type.js';
import { createHash } from 'crypto';
import { removeObject, uploadBuffer } from '../lib/storage.js';

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

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get(
  '/gifs/random',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.$queryRaw<Array<Pick<Gif, 'id' | 'url'>>>`
  SELECT id, url FROM "Gif" WHERE "isActive" = true ORDER BY RANDOM() LIMIT 1
`;
    const gif = rows[0];

    if (!gif) throw new AppError('No GIFs in library', 404);
    res.json({ url: gif.url });
  }),
);

adminRouter.get('/ping', (_req, res) => res.json({ ok: true }));

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

adminRouter.get(
  '/gifs',
  asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { cursor, limit } = parsed.data;

    const gifs = await prisma.gif.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const hasMore = gifs.length > limit;
    if (hasMore) gifs.pop();

    const nextCursor = hasMore ? (gifs[gifs.length - 1]?.id ?? null) : null;
    res.json({ items: gifs, nextCursor });
  }),
);

adminRouter.post(
  '/siphon',
  asyncHandler(async (req, res) => {
    const parsed = siphonRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const { sourceUrl, tags } = parsed.data;
    const safe = await assertSafeUrl(sourceUrl);
    if (!safe.ok) throw new AppError(safe.error, 400);
    // throw new AppError('Something went wrong', 400);

    // Download
    let buffer: Buffer;
    try {
      const response = await axios.get(safe.value.toString(), {
        responseType: 'arraybuffer',
        maxContentLength: 15 * 1024 * 1024,
        timeout: 10_000,
        maxRedirects: 0,
      });
      buffer = Buffer.from(response.data);
    } catch {
      throw new AppError('Could not fetch source', 502);
    }

    // Sniff
    const detected = detectImageType(buffer);
    if (detected.kind === 'unknown') {
      throw new AppError('Unsupported image type', 415);
    }

    // Key by content hash
    const hash = createHash('sha256').update(buffer).digest('hex');
    const storageKey = `gifs/${hash}.${detected.kind}`;

    // Upload
    const uploaded = await uploadBuffer({
      buffer,
      storageKey,
      contentType: detected.contentType,
    });
    if (!uploaded.ok) {
      throw new AppError(uploaded.error, 502);
    }

    // Persist
    let gif;
    try {
      gif = await prisma.gif.upsert({
        where: { storageKey },
        update: {},
        create: { storageKey, url: uploaded.value.url, tags },
      });
    } catch (err) {
      await removeObject(storageKey);
      throw new AppError('Failed to save gif record', 500);
    }

    res.status(201).json({ gif });
  }),
);

adminRouter.delete(
  '/gifs/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      throw new AppError('Missing id', 400);
    }

    try {
      await prisma.gif.update({
        where: { id },
        data: { isActive: false },
      });
    } catch {
      throw new AppError('Gif not found', 404);
    }
    res.status(204).send();
  }),
);

void siphonRequestSchema;
