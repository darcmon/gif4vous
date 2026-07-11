import type { RequestHandler } from "express";
import { env } from "../config/env.js";

/**
 * TODO(you): bearer-token auth middleware.
 *   - Read the Authorization header. With noUncheckedIndexedAccess on,
 *     req.headers.authorization is `string | undefined` — handle it.
 *   - Expect exactly `Bearer ${env.ADMIN_TOKEN}`.
 *   - On mismatch: res.status(401).json({ error: "Unauthorized" }); return;
 *   - On success: next().
 *
 * Typing note: annotate as RequestHandler and let TS infer req/res/next.
 * Once done, mount it on the admin router ONLY — the mobile app's
 * GET /api/gifs/random stays public.
 */
export const requireAdmin: RequestHandler = (req, res, next) => {
  // TODO(you)
  res.status(501).json({ error: "auth not implemented" });
};
