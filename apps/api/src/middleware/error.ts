import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function asyncHandler(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
/**
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
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
