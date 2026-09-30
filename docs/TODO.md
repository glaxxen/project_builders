# Project Builders — Build TODO

Work through phases in order. Each phase should be independently deployable/reviewable
on a Vercel preview before moving to the next.

## Phase 0 — Setup
- [x] Init Next.js + TypeScript + Tailwind + shadcn
- [x] Add brand tokens (colors, fonts) to `globals.css` / `tailwind.config` per
      `DESIGN_SYSTEM.md`
- [x] Add the logo asset, export a favicon set
- [ ] Connect Vercel project + confirm preview deployments work
- [x] Set up Postgres (Neon/Supabase) + a skeleton Drizzle schema

## Phase 1 — Public landing page (Minimalist Gateway)
- [x] Build minimal single-viewport landing page (logo, one-sentence mission, Login button)
- [x] Apply DESIGN_SYSTEM.md tokens (Navy/Mint/Gold/Cream, Fraunces + Public Sans) without scrolling
- [x] Remove heavy course-specific bloat (dashboard mockup, weekly timeline, curriculum, FAQ) from public page

## Phase 2 — Auth & roles
- [x] Set up auth (NextAuth / Auth.js v5 with Resend magic links)
- [x] Define roles: student (default), admin (matched against ADMIN_EMAILS)
- [x] Protect `/dashboard/*` routes by role (students -> /dashboard/student, admins -> /dashboard/admin, bidirectional redirection)

## Phase 3 — Cohort / week data model & publishing gate
- [x] Schema: `Cohort`, `Week` (with `published: boolean`, default `false`), `Rubric`, `Submission`, `Assessment`, `Question`, `Answer`, `Score`
- [x] Enforce student query filtering: strictly query `published = true` (unpublished weeks never appear, no placeholders)
- [x] Admin UI: create/publish cohort and weeks (title, brief, resource links, deadline, published toggle)
- [x] Seed the current Data Analysis cohort (4 weeks; Week 1 = AfriMart dataset)

## Phase 4 — Student submission flow
- [x] Student dashboard: list of weeks with status (not started / submitted / graded)
- [x] Submission form: GitHub URL + reflection text; validate the URL is reachable and
      well-formed
- [x] Allow resubmission until the deadline; show submission history

## Phase 5 — Checkpoint & Final Assessments (auto-marked)
- [x] Admin assessment builder: multiple-choice questions per week, correct answer
      stored per question
- [x] Student-facing quiz UI
- [x] On submit: score computed instantly by comparing answers to stored correct
      answers (plain logic — no manual step, no AI)
- [x] Student sees their score + which questions they got right/wrong immediately
- [x] Final Assessment uses the same mechanism, gated until all 4 checkpoints are done

## Phase 6 — Admin dashboard (the most important screen)
- [x] One table: every student × every week, showing submission status and checkpoint
      score, plus their final exam score and an overall average (Tanstack Table)
- [x] Sort/filter by score, by missing submissions, by week
- [x] Click into a student to see their full history (all submissions, all scores)
- [x] CSV export of the full table

## Phase 7 — Polish & launch
- [x] Full design QA against the `DESIGN_SYSTEM.md` anti-pattern checklist
- [x] Accessibility pass (contrast, keyboard nav, `prefers-reduced-motion`)
- [x] Basic load check on the submission flow for concurrent access
- [x] Go live
