# Project Builders — Manual Setup (accounts you need, all free)

This is everything you personally need to click "create account" on before or while
the coding agent builds the app. None of these require a card on file for this scale.

## 1. GitHub
- Create an account if you don't have one: https://github.com
- Create a new **private** repository for this project (e.g. `project-builders-app`)
- This is where your code lives and where Vercel deploys from

## 2. Vercel (hosting)
- Sign up at https://vercel.com — **sign up with your GitHub account**, it's the
  smoothest path and links the two automatically
- Free "Hobby" plan is enough for this whole cohort
- Once you push code to your GitHub repo, you'll "Import Project" on Vercel and point
  it at that repo — Vercel then auto-deploys on every push
- No credit card required for the Hobby plan

## 3. Database — Neon or Supabase (pick one)
- **Neon** (https://neon.tech) or **Supabase** (https://supabase.com) — both have a
  genuinely free Postgres tier
- Sign up, create a new project/database
- Copy the connection string it gives you (looks like
  `postgresql://user:pass@host/dbname`) — this becomes your `DATABASE_URL`

## 4. Auth — NextAuth email sign-in
- No separate account needed for NextAuth itself (it's a code library, not a service)
- **But** email magic-link sign-in needs an email-sending service to actually deliver
  the login links. Free options:
  - **Resend** (https://resend.com) — free tier covers a few thousand emails/month,
    plenty for 400 students logging in occasionally
  - Sign up, verify a sending domain (or use their test domain while developing)
- If you'd rather skip email entirely: Google sign-in via NextAuth is also free and
  needs a free Google Cloud OAuth credential (Google Cloud Console → create OAuth
  client ID) — slightly more setup up front, but no email service needed at all

## 5. Domain (optional)
- You can launch entirely on the free `your-project.vercel.app` address — this is
  completely fine to send to 400 students
- A custom domain (e.g. `projectbuilders.com`) is optional and costs roughly $10–15/yr
  from a registrar like Namecheap or Cloudflare — not needed to launch

## What you do NOT need
- No paid database tier
- No paid auth vendor
- No AI API key (scoring is deterministic, not AI-based)
- No file storage service (submissions are just a URL + text, stored in your database)
- No custom domain to go live

## Order of operations
1. GitHub account + repo
2. Vercel account, linked to GitHub
3. Neon/Supabase account, get the `DATABASE_URL`
4. Resend account (or Google OAuth credential) for auth
5. Hand the coding agent: this repo, `DATABASE_URL`, and the auth credentials as
   environment variables — it can take it from there per `TECH_STACK.md`
