# Project Builders — Design System & Visual Foundations

## 1. Design Philosophy: "Build Real Experience"

Project Builders is a practical, cohort-driven learning platform designed for real-world execution (e.g. data analysis with enterprise datasets like AfriMart). It represents real craftsmanship, mentorship, and tangible portfolio outcomes.

The platform must feel **editorial, warm, authoritative, and senior-crafted**. It must never look like a generic AI-generated SaaS template.

### Core Visual Principles
1. **Editorial Authority**: High-character serif headings (`Fraunces`) paired with a razor-sharp, accessible workhorse sans-serif (`Public Sans`).
2. **Warmth & Grounding**: Warm canvas foundations (`#FAF8F3`) avoiding stark sterile white, anchored by deep nautical navy (`#102038`, `#233B5F`).
3. **Intentional Accents**: 
   - **Mint** (`#5BBFA4`, `#77CBB3`): Growth, progress, completion, active student state.
   - **Warm Gold** (`#BA9C60`, `#C8A55B`): Achievement, lightbulb spark of understanding, rubrics, stars, and key metrics.
4. **Senior Craft & Human Touch**: Thoughtful details, clear information hierarchy, dense data views for dashboards without visual clutter.

---

## 2. Brand Color Tokens

Directly sampled and harmonized from the Project Builders master insignia ([assets/image/project_buillders_logo.PNG](file:///c:/Users/BraveMgmt/Desktop/1/Project_Builders/assets/image/project_buillders_logo.PNG)):

```
+-----------------------------------------------------------------------------------------------+
|                                  BRAND PALETTE TOKENS                                         |
+-------------------+------------+---------------------+----------------------------------------+
| Token             | Hex Value  | HSL Equivalent      | Intended Usage                         |
+-------------------+------------+---------------------+----------------------------------------+
| --brand-navy      | #233B5F    | 216deg 36% 25%      | Primary brand tone, prominent text     |
| --brand-navy-dark | #102038    | 216deg 56% 14%      | Deep background, headers, dark mode bg |
| --brand-navy-deep | #0A1424    | 218deg 57% 9%       | Dark mode root surface                 |
| --brand-navy-soft | #335384    | 216deg 44% 36%      | Interactive hover, borders, subheaders |
+-------------------+------------+---------------------+----------------------------------------+
| --brand-mint      | #5BBFA4    | 164deg 45% 55%      | Success, highlights, progress accents  |
| --brand-mint-light| #77CBB3    | 164deg 44% 63%      | Secondary badge fill, lighter accents  |
| --brand-mint-soft | #EBF7F4    | 164deg 42% 94%      | Subtle badge backgrounds, card tint    |
+-------------------+------------+---------------------+----------------------------------------+
| --brand-gold      | #C8A55B    | 40deg 50% 57%       | Star ratings, lightbulb glow, metrics  |
| --brand-gold-deep | #BA9C60    | 40deg 41% 54%       | Gold borders, rubric badges            |
| --brand-gold-soft | #FDF8ED    | 42deg 75% 96%       | Light gold callout background          |
+-------------------+------------+---------------------+----------------------------------------+
| --canvas-cream    | #FAF8F3    | 43deg 33% 97%       | Light mode body background             |
| --canvas-surface  | #FFFFFF    | 0deg 0% 100%        | Elevated cards, inputs, dialogs        |
| --canvas-muted    | #F3EFE6    | 42deg 27% 93%       | Card borders, subtle secondary strips  |
+-------------------+------------+---------------------+----------------------------------------+
| --text-primary    | #102038    | 216deg 56% 14%      | High contrast body & heading text      |
| --text-secondary  | #4A5568    | 218deg 17% 35%      | Explanatory copy, captions, timestamps |
| --text-muted      | #7E8B9B    | 214deg 12% 55%      | Disabled states, metadata tags         |
+-------------------+------------+---------------------+----------------------------------------+
```

### shadcn/ui Theme Mapping (Re-themed CSS Variables)

```css
:root {
  /* Canvas & Base */
  --background: 43 33% 97%;          /* #FAF8F3 Warm Cream */
  --foreground: 216 56% 14%;         /* #102038 Deep Navy */

  --card: 0 0% 100%;                 /* #FFFFFF Pure White */
  --card-foreground: 216 56% 14%;

  --popover: 0 0% 100%;
  --popover-foreground: 216 56% 14%;

  /* Brand Primary: Deep Navy */
  --primary: 216 56% 14%;            /* #102038 */
  --primary-foreground: 43 33% 97%;  /* #FAF8F3 */

  /* Brand Secondary: Mint Tint */
  --secondary: 164 42% 94%;          /* #EBF7F4 */
  --secondary-foreground: 164 45% 25%;

  /* Muted / Neutral */
  --muted: 42 27% 93%;               /* #F3EFE6 */
  --muted-foreground: 218 17% 35%;   /* #4A5568 */

  /* Accent: Mint Brand Highlight */
  --accent: 164 45% 55%;             /* #5BBFA4 */
  --accent-foreground: 216 56% 14%;

  /* Destructive */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;

  /* Borders & Focus Rings */
  --border: 42 20% 88%;
  --input: 42 20% 88%;
  --ring: 164 45% 55%;               /* Mint focus ring */

  --radius: 0.625rem;
}

.dark {
  --background: 218 57% 9%;          /* #0A1424 Root Dark Navy */
  --foreground: 43 33% 97%;          /* #FAF8F3 Warm Cream text */

  --card: 216 56% 14%;               /* #102038 Deep Navy card */
  --card-foreground: 43 33% 97%;

  --popover: 216 56% 14%;
  --popover-foreground: 43 33% 97%;

  --primary: 164 45% 55%;            /* Mint as primary action in dark mode */
  --primary-foreground: 218 57% 9%;

  --secondary: 216 36% 25%;          /* #233B5F */
  --secondary-foreground: 43 33% 97%;

  --muted: 216 36% 20%;
  --muted-foreground: 214 12% 70%;

  --accent: 40 50% 57%;              /* Gold accent in dark mode */
  --accent-foreground: 218 57% 9%;

  --destructive: 0 62% 30%;
  --destructive-foreground: 0 0% 98%;

  --border: 216 36% 22%;
  --input: 216 36% 22%;
  --ring: 164 45% 55%;
}
```

---

## 3. Typography Hierarchy

As defined in `TECH_STACK.md`:
- **Display / Headings**: `Fraunces` via `next/font/google` (serif, soft optical sizes, high editorial warmth).
- **Body & Interface**: `Public Sans` via `next/font/google` (sans-serif, robust, neutral, ultra-legible at small sizes).
- **Code & Numeric Data**: `JetBrains Mono` or `Public Sans` with `font-variant-numeric: tabular-nums` for student scoring tables and checkpoint statistics.

```css
--font-display: 'Fraunces', Georgia, serif;
--font-sans: 'Public Sans', system-ui, -apple-system, sans-serif;
```

---

## 4. Iconography & Motion

- **Icons**: Phosphor Icons (`@phosphor-icons/react`), using `duotone` or `regular` weight with brand colors (`#233B5F`, `#5BBFA4`, `#C8A55B`).
- **Motion**: GSAP 3 with ScrollTrigger.
  - Animated lightbulb glow on hero
  - Metric counter stat count-ups
  - Respect `prefers-reduced-motion` at all times.

---

## 5. Anti-Pattern Checklist (What NOT to do)

- ❌ **Do NOT use default shadcn/ui black & white grayscale**: Everything must use the curated Navy, Warm Cream, Mint, and Gold tokens.
- ❌ **Do NOT build generic 3-card AI SaaS landing pages**: The structure must be cohort-focused (syllabus, project brief preview, real dataset showcase, submission flow preview).
- ❌ **Do NOT use low-contrast gray text on white**: Body text must maintain WCAG AAA compliance (`#102038` on `#FAF8F3`).
- ❌ **Do NOT use floating purple/indigo gradient meshes**: Brand identity is grounded in naval blue, mint growth, and warm golden achievements.
- ❌ **Do NOT use generic stock photos**: Use authentic student artifacts, real dashboard screenshots (AfriMart), and the official logo.
