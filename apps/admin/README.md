# gif4vous — debugging gym

A working-except-where-it-isn't admin frontend for your API, with 8 planted
bugs. TICKETS.md is the bug tracker (symptoms only). HINTS.md when stuck.
SOLUTIONS.md is sealed until a ticket is closed.

## Install
Drop this `admin/` folder into your repo at `apps/admin/` (the root
workspaces config already includes `apps/*`), then from the repo root:

```bash
npm install
cp apps/admin/.env.example apps/admin/.env   # set VITE_ADMIN_TOKEN = your API's ADMIN_TOKEN
```

## Run (three terminals, or use &)
```bash
docker compose up -d        # LocalStack + Postgres
npm run dev:api             # API on :3000
npm run dev:admin           # Vite on :5173
```
Make sure your library has at least a couple of GIFs siphoned via curl —
some tickets need data to reproduce.

Open http://localhost:5173, open devtools (Console + Network tabs), and
start at TICKET-1.

## The one file with no bugs
`src/components/HealthBadge.tsx` is the annotated, certified-correct
reference for the fetch pattern. Diff the broken pages against it.
