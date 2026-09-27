# Project Builders — Learning Platform PRD

## 1. Overview
Project Builders ("Build Real Experience") runs cohort-based, project-driven practical
courses — starting with a Data Analysis cohort (400+ students, one live class per week,
4 weeks, working with real datasets like AfriMart). This platform replaces the current
manual flow (PDF briefs + spreadsheet submissions) with a reusable web app that any
future cohort/course can be spun up on without rebuilding anything.

## 2. Goals
- Reusable across cohorts and course topics, not a one-off for this single course
- Students submit a project (GitHub repo link + short reflection) each week
- Students take a **Checkpoint Assessment** after each week's project
- Students take a **Final Assessment** after all weeks are complete
- Admin/instructor gets a single dashboard to see submission + grading status across
  the whole cohort, instead of a spreadsheet
- Visually distinctive and senior-crafted — see DESIGN_SYSTEM.md. This should not look
  like a generic AI-generated SaaS template.

## 3. Non-goals for v1
- Video hosting (link out to external video is fine)
- Payments / enrollment billing
- Native mobile app

## 4. Users & Roles
- **Student** — views their cohort's weeks, reads the brief/resources, submits a
  project, takes that week's checkpoint assessment, sees their own results.
- **Admin / Instructor** — creates cohorts and weeks, uploads briefs/rubrics, views all
  submissions, grades/reviews, publishes assessment results, posts announcements.
- **Grader / TA** *(future)* — same as admin but scoped to grading only.

## 5. Core features (v1)

**5.1 Public landing page** — what Project Builders is, current/past cohorts, FAQ.

**5.2 Auth** — student sign-in (email magic link or Google); admin role gate.

**5.3 Cohort / Week structure** — Admin creates a Cohort (e.g. "Data Analysis — Sept
2026"). Each cohort has Weeks/Projects, each with: brief, resource links (dataset,
slides/PDF), rubric, a submission form, and a checkpoint assessment.

**5.4 Submission flow** — student pastes a GitHub repo URL + a short written reflection
(their 3 findings). System validates the URL is reachable and well-formed, timestamps
it, and allows resubmission up until the deadline.

**5.5 Checkpoint Assessment (auto-marked)** — multiple-choice quiz tied to that week's
project. Fully auto-graded on submit — correct answers are pre-defined, the score is
computed instantly, no manual review needed. Student sees their score and which
questions they got right/wrong immediately.

**5.6 Final Assessment** — same auto-marking mechanism, broader scope, gated until all
4 weekly checkpoints are complete.

**5.7 Student results view** — a student can always see their own scores per week and
their final exam score, in one place.

**5.8 Admin dashboard** — the most important screen. One table of **all students**,
showing per student: submission status per week (submitted / missing), each checkpoint
score, the final exam score, and an overall completion/average. Sortable and filterable
(e.g. "show everyone who scored under 50% on Week 2" or "show everyone missing a
submission"). This is a reporting/overview tool — it does not require manually grading
anything, since scoring is automatic.

**5.9 Announcements / FAQ** — a simple admin-editable page for course-wide updates and
recurring questions (accented country names, Profit mismatches, GitHub upload errors —
see the existing course FAQ).

## 6. Nice-to-have / v2+
- CSV export of the full students × scores table
- Progress badges / completion certificate (PDF)
- Slack/Discord/WhatsApp webhook notification on new submission
- Short-answer questions in the assessment (would require manual review — out of v1
  scope since v1 is multiple-choice only, to keep marking fully automatic)

## 7. Success metrics
- % of cohort completing all 4 weekly submissions
- Admin time spent grading, versus the old spreadsheet process
- Platform reused for a second cohort/course without a rebuild

## 8. Constraints
- Must handle 400+ students, including bursts around deadlines and the weekly live
  class — serverless hosting (Vercel) makes this a non-issue by default
- Must follow DESIGN_SYSTEM.md — specifically its list of things *not* to do
- Brand: Project Builders logo (navy / mint / gold), tagline "Build Real Experience"
- **Zero budget** — every service used must have a free tier that comfortably covers
  this cohort size. See `SETUP.md` for the exact free-tier stack and account list.
- No AI grading — all scoring is deterministic (multiple-choice, pre-defined correct
  answers), not model-based.
