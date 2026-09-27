# Project Builders — Tech Stack & Architecture

Every service below is chosen specifically because it has a free tier that comfortably
covers a 400-student cohort. See `SETUP.md` for the exact accounts to create.

## Framework
- **Next.js 15** (App Router), TypeScript in strict mode
- Deploy on **Vercel** (Hobby/free plan) — serverless by default, handles a 400+
  student cohort's traffic, including bursts around the weekly live class and
  submission deadlines, without any special scaling work or cost

## Styling / UI
- **Tailwind CSS v4**
- **shadcn/ui** (Radix primitives) — re-themed per `DESIGN_SYSTEM.md`, not used with
  default tokens
- **GSAP** (+ ScrollTrigger) for motion
- Google Fonts via `next/font`: Fraunces (display), Public Sans (body)
- **Phosphor Icons** (`@phosphor-icons/react`) as the icon set

## Data / backend
- **Database:** Postgres via **Neon** or **Supabase** free tier (serverless-friendly,
  pairs cleanly with Vercel; ~0.5GB free storage is far more than 400 students × 4
  weeks of submissions and scores needs)
- **ORM:** Drizzle ORM (lightweight, type-safe) — Prisma is a fine alternative if the
  team already knows it better
- **Auth:** **NextAuth.js (Auth.js)** — fully free with no user cap, so there's nothing
  to outgrow at this scale. Email magic-link sign-in is the simplest option to build
  (no password reset flow needed). Google sign-in can be added too, also free.
- **File/link storage:** submissions are a GitHub URL, stored directly as text in the
  database — no file storage service needed at all in v1.

## Validation / forms
- **Zod** for all form and quiz-answer validation
- **react-hook-form** + the Zod resolver

## Auto-marked assessments — how scoring works (no AI, fully deterministic)
- Each assessment question is multiple-choice with a pre-defined correct option stored
  in the database.
- On submit, a server action compares the student's selected answers to the stored
  correct answers and computes the score instantly — this is plain logic, not a model.
- The student is shown their score immediately; the admin dashboard reflects it in
  real time with no manual step in between.
- Short-answer/free-text questions are intentionally out of v1 scope, since they'd need
  a human (or a model) to mark them — keeping v1 to multiple-choice keeps the entire
  pipeline free and instant.

## Admin dashboard
- **Tanstack Table** for the main students × scores table: submission status per week,
  each checkpoint score, final exam score, sortable/filterable (e.g. "everyone under
  50% on Week 2", "everyone missing a submission")
- Next.js **Server Actions** for any admin mutations, avoiding a separate API layer

## Suggested folder structure
```
app/
  (marketing)/          → landing page, about, FAQ
  (auth)/                → sign in / sign up
  dashboard/student/      → student's cohort/week view, submission form, own results
  dashboard/admin/        → cohort/week management, full student × scores table
  api/                    → auth callback routes, webhooks
components/
  ui/                     → shadcn components, re-themed
  brand/                  → logo, animated lightbulb, etc.
lib/
  db/                     → Drizzle schema + queries
  auth/
  scoring/                → the deterministic MCQ-scoring logic
styles/
  globals.css             → design tokens (brand colors, fonts as CSS variables)
```

## Environment variables
`DATABASE_URL`, NextAuth secrets (`AUTH_SECRET`, email provider or Google OAuth
credentials). No paid API keys required anywhere in v1.

## Deployment flow
- Every PR gets a free Vercel preview deployment for review before merging to `main`
- `main` auto-deploys to production, still on the free plan
