import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requireAdmin } from './middleware/auth.js';
import { publicRouter, adminRouter } from './routes/gifs.js';
import { errorHandler } from './middleware/error.js';

const app = express();

app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use('/api', publicRouter);
app.use('/api/admin', requireAdmin, adminRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(
    `API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`,
  );
});
