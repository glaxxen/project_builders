# Project Builders — Build TODO

Work through phases in order. Each phase should be independently deployable/reviewable
on a Vercel preview before moving to the next.

## Phase 0 — Setup
- [x] Init Next.js + TypeScript + Tailwind + shadcn
- [x] Add brand tokens (colors, fonts) to `globals.css` / `tailwind.config` per
      `DESIGN_SYSTEM.md`
- [x] Add the logo asset, export a favicon set
- [ ] Connect Vercel project + confirm preview deployments work
- [ ] Set up Postgres (Neon/Supabase) + a skeleton Drizzle schema

## Phase 1 — Marketing / landing page
- [ ] Build the landing page (hero, program overview, "how it works," FAQ) following
      `DESIGN_SYSTEM.md` — explicitly avoid the templated SaaS structure it warns about
- [ ] Add GSAP entrance/scroll animations (lightbulb glow, stat count-up)
- [ ] Full responsive pass (mobile-first — many students will visit from phones)

## Phase 2 — Auth & roles
- [ ] Set up auth (Clerk or NextAuth)
- [ ] Define roles: student, admin
- [ ] Protect `/dashboard/*` routes by role

## Phase 3 — Cohort / week data model
- [ ] Schema: `Cohort`, `Week`, `Rubric`, `Submission`, `Assessment`, `Question`,
      `Answer`, `Score`
- [ ] Admin UI: create a cohort, create a week (title, brief, resource links, deadline)
- [ ] Seed the current Data Analysis cohort (4 weeks; Week 1 = AfriMart dataset)

## Phase 4 — Student submission flow
- [ ] Student dashboard: list of weeks with status (not started / submitted / graded)
- [ ] Submission form: GitHub URL + reflection text; validate the URL is reachable and
      well-formed
- [ ] Allow resubmission until the deadline; show submission history

## Phase 5 — Checkpoint & Final Assessments (auto-marked)
- [ ] Admin assessment builder: multiple-choice questions per week, correct answer
      stored per question
- [ ] Student-facing quiz UI
- [ ] On submit: score computed instantly by comparing answers to stored correct
      answers (plain logic — no manual step, no AI)
- [ ] Student sees their score + which questions they got right/wrong immediately
- [ ] Final Assessment uses the same mechanism, gated until all 4 checkpoints are done

## Phase 6 — Admin dashboard (the most important screen)
- [ ] One table: every student × every week, showing submission status and checkpoint
      score, plus their final exam score and an overall average (Tanstack Table)
- [ ] Sort/filter by score, by missing submissions, by week
- [ ] Click into a student to see their full history (all submissions, all scores)
- [ ] CSV export of the full table

## Phase 7 — Polish & launch
- [ ] Full design QA against the `DESIGN_SYSTEM.md` anti-pattern checklist
- [ ] Accessibility pass (contrast, keyboard nav, `prefers-reduced-motion`)
- [ ] Basic load check on the submission flow for concurrent access
- [ ] Go live
