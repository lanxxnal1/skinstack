# SkinStack

A multi-user skincare product tracker. Track what you're using, how fast you're going through it, and when to restock.

## Features

- Track active products with progress bars and restock alerts
- Morning / Evening / Both routine grouping
- Duration learning — estimates how long a product will last based on your history
- Photo support (active and finished products)
- Finished product archive with ratings
- Brand autocomplete
- First-launch onboarding flow
- Import data from the original single-file app

## Tech stack

Next.js 14 (App Router) · Supabase (Auth + PostgreSQL + Storage) · TypeScript · Tailwind CSS · Vercel

## Local development

```bash
npm install
npm run dev       # http://localhost:3000
npm run test:run  # run tests once
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Migrating from the old app

Export a backup from the original `index.html` app, then go to `/import` after signing in and upload the JSON file. Photos are automatically migrated to Supabase Storage.
