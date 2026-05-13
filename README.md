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
# fill in Supabase URL + anon key

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
  rbac.ts             role + capability helpers (UX gating)
  supabase/           browser + server Supabase clients
  utils.ts            shadcn cn() helper
types/
  user.ts             UserRole + AppUser
  db.ts               Supabase generated types (stub)
```

## Security model

`lib/rbac.ts` only gates the UI. Every privileged read or write is independently enforced by Postgres Row Level Security policies in Supabase. Never trust the client.
