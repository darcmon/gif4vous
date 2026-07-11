import express from "express";
import { env } from "./config/env.js";
import { gifsRouter } from "./routes/gifs.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", gifsRouter);

// Error handler LAST — after all routes. (Why? Express runs middleware in
// registration order; errors flow forward to the next 4-arity handler.)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});
