# Travelling with Manisha

A production-grade travel booking platform — browse curated trips, view
itineraries on an interactive map, and book/pay in INR (Razorpay) or
international currencies (Stripe).

> **Status:** Project foundation only. No feature UI has been built yet.
> See `ARCHITECTURE.md` for the full folder structure and rationale.

## Tech stack

| Layer          | Choice                                      |
|----------------|----------------------------------------------|
| Framework      | Next.js 15 (App Router, Server Components)   |
| Language       | TypeScript (strict mode)                     |
| Styling        | Tailwind CSS + shadcn/ui                     |
| Motion         | Framer Motion                                |
| Auth           | Supabase Auth (`@supabase/ssr`)              |
| Database       | PostgreSQL (Supabase-hosted)                 |
| ORM            | Prisma                                       |
| Payments       | Stripe (international) + Razorpay (India)    |
| Maps           | Google Maps (`@vis.gl/react-google-maps`)    |
| Media          | Cloudinary                                   |
| Deployment     | Vercel                                       |

## Prerequisites

- Node.js ≥ 20
- A Supabase project (Postgres + Auth)
- Stripe account (test mode keys)
- Razorpay account (test mode keys)
- Cloudinary account
- Google Cloud project with **Maps JavaScript API**, **Geocoding API**, and
  **Places API** enabled

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# then fill in every value in .env.local

# 3. Push the Prisma schema to your database (first run)
npm run db:push
# or, once you have real migrations:
npm run db:migrate

# 4. Generate the Prisma client
npm run db:generate

# 5. (optional) seed local data
npm run db:seed

# 6. Run the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Available scripts

| Script                  | Purpose                                       |
|--------------------------|-----------------------------------------------|
| `npm run dev`             | Start dev server (Turbopack)                 |
| `npm run build`           | `prisma generate` + production build          |
| `npm run start`           | Start production server                       |
| `npm run lint` / `lint:fix` | ESLint                                      |
| `npm run typecheck`       | `tsc --noEmit`                                 |
| `npm run format`          | Prettier write                                 |
| `npm run db:push`         | Push Prisma schema without a migration        |
| `npm run db:migrate`      | Create + apply a dev migration                 |
| `npm run db:migrate:deploy` | Apply migrations in production (CI/CD)      |
| `npm run db:studio`       | Open Prisma Studio                             |
| `npm run db:seed`         | Run `prisma/seed.ts`                           |
| `npm run test` / `test:watch` | Vitest unit tests                          |
| `npm run test:e2e`        | Playwright end-to-end tests                    |

## Project structure

Full explanation lives in [`ARCHITECTURE.md`](./ARCHITECTURE.md). Summary:

```
src/
  app/            App Router routes, grouped by (marketing) / (auth) / (dashboard) / (admin) / api
  components/     ui (shadcn primitives) + domain component folders
  lib/            Prisma client, Supabase clients, Stripe/Razorpay/Cloudinary/Maps wrappers, Zod validators
  services/       Business logic layer between API routes and Prisma
  hooks/          Shared React hooks
  stores/         Zustand client state
  types/          Shared TypeScript types
  config/         Site metadata, nav definitions
prisma/           schema.prisma, seed script, migrations
tests/            unit (Vitest) and e2e (Playwright)
```

## Payments

- **Stripe** handles international card payments.
- **Razorpay** handles INR payments (UPI, cards, netbanking) for Indian
  travellers.
- Both providers are wrapped behind a common interface in
  `src/services/payment.service.ts` so the booking flow doesn't care which
  gateway is active — selection happens by currency/locale.
- Webhooks are verified separately per provider at
  `src/app/api/webhooks/stripe` and `src/app/api/webhooks/razorpay`.

## Deployment (Vercel)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel.
3. Add every variable from `.env.example` in **Project Settings →
   Environment Variables** (separate values for Production/Preview/
   Development as needed).
4. Set the build command to `npm run build` (already the default via
   `package.json`) — this runs `prisma generate` before `next build`.
5. Add your production domain to:
   - Supabase Auth → **Redirect URLs**
   - Google Cloud → Maps API key **HTTP referrer restrictions**
   - Stripe & Razorpay → webhook endpoint URLs
6. Deploy.

## Contributing / conventions

- Route handlers stay thin — parse + validate input (Zod), call a
  `services/*` function, return a response. No direct Prisma calls in
  `app/api/**/route.ts`.
- Every third-party SDK is only ever imported through its `lib/*.ts`
  wrapper.
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
  `RAZORPAY_KEY_SECRET`, `CLOUDINARY_API_SECRET`) must never be referenced
  from a `"use client"` file.
