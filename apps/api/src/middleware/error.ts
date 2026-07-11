import type { ErrorRequestHandler } from "express";

/**
 * EXERCISE: centralized error handling.
 *
 * TODO(you) #1: an AppError class extending Error with a `statusCode` field
 * and a constructor(message: string, statusCode = 500). Routes throw
 * `new AppError("No GIFs in library", 404)` instead of juggling res.status
 * everywhere.
 *
 * TODO(you) #2: implement the handler below.
 *   - If err instanceof AppError -> use its statusCode + message.
 *   - Otherwise -> log the full error server-side, respond 500 with a
 *     GENERIC message. Never leak internal error strings to clients.
 *
 * Gotchas worth learning the hard way (but here's a shortcut):
 *   - ErrorRequestHandler must keep all 4 params, even unused ones —
 *     Express identifies error middleware by arity. Prefix unused with _.
 *   - Express 4 does NOT catch errors thrown in async handlers. Either
 *     wrap handlers in a small asyncHandler(fn) helper (write one — nice
 *     higher-order-function exercise) or call next(err) manually.
 */

export class AppError extends Error {
  // TODO(you)
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // TODO(you)
  res.status(500).json({ error: "Internal server error" });
};
