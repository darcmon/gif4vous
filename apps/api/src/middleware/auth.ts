import type { RequestHandler } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

export const requireAdmin: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;

  function safeEqual(a: string, b: string): boolean {
    const ha = createHash('sha256').update(a).digest();
    const hb = createHash('sha256').update(b).digest();
    return timingSafeEqual(ha, hb);
  }

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.slice('Bearer '.length);

  if (!safeEqual(token, env.ADMIN_TOKEN)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
};
