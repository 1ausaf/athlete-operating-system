# Athlete Operating System (AOS)

Production-grade web platform for a semi-private coaching facility. Unified athlete profiles, membership-aware session booking, CAP notes, compliance dashboards, Safe-Sport (Rule-of-Two) messaging, and role-based access for athletes, coaches, admins, and owners.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Row Level Security)
- Deployed on Vercel

## Getting started

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# fill in Supabase URL + anon key and any server-only secrets you need locally

# Start the dev server
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm run start` - run the production build
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript no-emit type check

## Adding shadcn/ui components

This repo is preconfigured for the shadcn CLI (`components.json`). Add components with:

```bash
npx shadcn@latest add <component>
```

They land in `components/ui/` and use the `cn()` helper from `lib/utils.ts`.

## Project layout

```
app/
  (marketing)/        public landing and info pages
  (athlete)/          authenticated athlete portal
  (staff)/            coach / admin / owner workspace
  api/                route handlers
components/
  ui/                 shadcn primitives
  nav/                role-aware navs
  shell/              app shell (sidebar + header)
lib/
  env.ts              deployment / NODE_ENV helpers
  log.ts              tagged logging for API routes and webhooks
  rbac.ts             role + capability helpers (UX gating)
  supabase/           browser + server Supabase clients
  utils.ts            shadcn cn() helper
types/
  user.ts             UserRole + AppUser
  db.ts               Supabase generated types (stub)
```

## Security model

`lib/rbac.ts` only gates the UI. Every privileged read or write is independently enforced by Postgres Row Level Security policies in Supabase. Never trust the client.

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` for local development. For production on Vercel, set the same keys under **Project → Settings → Environment Variables** (Production / Preview as needed).

**Public (browser-safe):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`.

**Server-only (never prefix with `NEXT_PUBLIC_`):** `SUPABASE_SERVICE_ROLE_KEY` (required for payment webhooks to write membership rows without a user session), `SQUARE_WEBHOOK_SIGNATURE_KEY` or `SQUARE_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SIGNING_SECRET` or `STRIPE_WEBHOOK_SECRET`, and optionally `SQUARE_APP_ID` for future Square integration.

Webhook routes live at `POST /api/webhooks/square` and `POST /api/webhooks/stripe`. Signature verification is stubbed with TODOs until the full Square/Stripe SDK wiring is added.

## Design tokens and Figma

Semantic colors, type scale, spacing, and component names are summarized in [`docs/design-system.md`](docs/design-system.md). Use that file when building or updating a Figma library to stay aligned with the codebase.

## Deployment (Vercel)

1. Push this repository to GitHub (or another Git provider Vercel supports).
2. In [Vercel](https://vercel.com), **Add New Project** → import the repo.
3. Set the **Production Branch** to `main` (or your default release branch). Vercel will create **Preview** deployments automatically for pull requests and non-production branches.
4. Under **Project → Settings → Environment Variables**, add the keys from [`.env.example`](.env.example). Use **Production** for live secrets, **Preview** for PR previews (often a separate Supabase project or the same with caution), and duplicate any keys required for **Development** if you use `vercel dev`.
5. **Required for the app:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` (set to the deployment URL for each environment, e.g. `https://your-app.vercel.app` for production and the preview URL pattern for previews).
6. **Server-only (never expose to the browser):** `SUPABASE_SERVICE_ROLE_KEY`; webhook secrets `SQUARE_WEBHOOK_SIGNATURE_KEY` / `SQUARE_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SIGNING_SECRET` / `STRIPE_WEBHOOK_SECRET`. Do not prefix these with `NEXT_PUBLIC_`.
7. After deploy, run Supabase migrations against the database tied to that environment.

**Environment separation:** Local development uses `.env.local`. Vercel Preview uses Preview-scoped variables (ideal for staging Supabase or staging webhooks). Production uses Production-scoped variables only. Runtime helpers live in [`lib/env.ts`](lib/env.ts) (`VERCEL_ENV`, `NODE_ENV`).

## Logging and debugging on Vercel

API routes and webhooks log through [`lib/log.ts`](lib/log.ts) (`createLogger`), which prefixes lines with environment and namespace (for example `[production] [api/bookings]`).

To inspect logs: Vercel Dashboard → your project → **Logs** → filter by **Functions** (or open a specific deployment and view function logs for a request). Replace `createLogger` later with a hosted provider without changing message shape at call sites.
