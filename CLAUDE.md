@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkinStack v2 — a multi-user skincare product tracker. Built with Next.js 14 (App Router), Supabase (auth + PostgreSQL + Storage), and Tailwind CSS. Deployed on Vercel.

This is a migration of the original single-file `index.html` app (in the sibling `skincare tracker/` repo) to a full-stack web app.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run test     # run tests in watch mode (vitest)
npm run test:run # run tests once
```

## Architecture

**Framework:** Next.js 14 App Router. Server components are used for auth guards and initial data fetching. Client components (marked `'use client'`) handle all interactivity.

**Auth flow:** Supabase handles auth. `middleware.ts` refreshes the session on every request. `app/dashboard/layout.tsx` is the auth guard — it redirects unauthenticated users to `/login`. Two Supabase clients exist: `lib/supabase-browser.ts` (for client components) and `lib/supabase-server.ts` (for server components and middleware).

**Data flow:** All Supabase queries go through `lib/data.ts`. Components never call Supabase directly. Photos are stored in Supabase Storage (`product-photos` bucket) via `lib/storage.ts` — never as base64.

**Pure logic:** `lib/logic.ts` contains `calcProgress`, `getStatus`, `estimateDuration` — pure functions with no React or Supabase dependencies. These are the same functions from v1, typed with TypeScript. Unit tests are in `__tests__/logic.test.ts`.

**Styling:** CSS custom properties (defined in `app/globals.css`) combined with Tailwind. The color palette and design tokens are the same as v1.

## Key Data Model

```ts
Product {
  id, user_id, name, category,
  routine: 'Morning' | 'Evening' | 'Both',
  photo_url,          // Supabase Storage URL, never base64
  start_date,         // ISO date — "date opened" (used for duration learning)
  created_at,         // ISO timestamp — when added to app (used for progress calc)
  duration,           // full-bottle lifespan in days
  initial_remaining,  // % when added (0–100)
  has_backup
}
```

Progress tracking uses `created_at`, not `start_date`. `start_date` is only used when finishing a product to compute actual duration for the learning algorithm.

## Supabase Project

- Project ID: `axrwcljbapemapbwyuwc`
- URL: `https://axrwcljbapemapbwyuwc.supabase.co`
- Credentials: stored in `.env.local` (never committed)

## Implementation Status

Migration complete (Tasks 1–23). Task 24 (Vercel deploy) is manual — push to GitHub, create Vercel project, add env vars, update Supabase redirect URLs.

Full plan: `../skincare tracker/docs/superpowers/plans/2026-03-30-nextjs-supabase-migration.md`
