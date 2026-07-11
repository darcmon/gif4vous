# GIF Library — build checklist

Monorepo: `apps/api` (Express + TS), `apps/admin` (React, you scaffold it),
`packages/shared` (Zod schemas = the API contract).

Files marked `TODO(you)` are yours to implement — each one contains its spec.
Worked examples to study first: `src/config/env.ts` (Zod env validation) and
the client wiring in `src/lib/storage.ts`.

## Setup (once)

```bash
npm install                          # installs all workspaces
docker compose up -d                 # LocalStack (S3) + Postgres
cp apps/api/.env.example apps/api/.env   # then edit ADMIN_TOKEN
npm run prisma:migrate -w apps/api   # creates the Gif table
npm run dev:api                      # http://localhost:3000/health
```

Verify LocalStack: `docker logs gif-localstack` should show "Bucket gif-library ready."
Persistence is ON — uploaded test objects survive restarts.

## Backend tasks (in order)

1. `lib/storage.ts` — `getPublicUrl`, `uploadBuffer`, `removeObject` (Result pattern)
2. `lib/detect-image-type.ts` — magic bytes, discriminated union
3. `lib/url-guard.ts` — SSRF guard (spec + test cases in the file)
4. `middleware/auth.ts` — bearer token
5. `middleware/error.ts` — AppError + handler + asyncHandler helper
6. `routes/gifs.ts` — siphon → random → list (cursor pagination) → delete
7. `packages/shared` TODOs #1–3 — response schemas
8. Test the whole pipeline with Bruno/Postman: siphon a real GIF URL, check
   it landed (`docker exec gif-localstack awslocal s3 ls s3://gif-library/gifs/`),
   fetch /api/gifs/random, open the returned URL in a browser.

## Frontend tasks (after, or ping-pong once backend task 6 is partly done)

Scaffold it yourself — that's part of the reps:

```bash
cd apps && npm create vite@latest admin -- --template react-ts
```

Then, in order:
1. Turn on the same strict tsconfig flags as the API
2. Add `"@gif-library/shared": "*"` to its dependencies, re-run npm install
   at the root — import a schema to prove the wiring
3. Quick-paste form → POST /api/admin/siphon (raw fetch first, feel the pain)
4. Introduce TanStack Query: mutation for siphon, query for the library list
5. Library grid with useInfiniteQuery + IntersectionObserver
6. Giphy search gallery (their API, free key) with a hand-written useDebounce
7. Optimistic "Siphon" button state + rollback on error
8. Tag chip editor, built from scratch

## Rules of engagement (for the learning goal)

- When a strict-mode error confuses you, read it twice before weakening types.
  `any` is banned; `unknown` + narrowing is the way.
- Run `npm run typecheck -w apps/api` before every commit.
- Each finished TODO: delete the comment block. Empty of TODOs = done.
