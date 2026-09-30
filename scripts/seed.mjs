import postgres from 'postgres';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/DATABASE_URL="([^"]+)"/);
const url = urlMatch ? urlMatch[1] : '';

if (!url) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase to seed Data Analysis cohort data...');
const sql = postgres(url, { ssl: 'require', prepare: false });

async function seed() {
  try {
    // 1. Seed Cohort
    console.log('Seeding cohort...');
    await sql`
      INSERT INTO "cohort" ("id", "name", "slug", "description", "startDate", "endDate", "createdAt")
      VALUES (
        'cohort-data-analysis-fall-2026',
        'Data Analysis — Fall 2026',
        'data-analysis-fall-2026',
        '4-week intensive project cadence. Master real-world enterprise datasets, metric definitions, and verifiable executive reporting.',
        '2026-09-25T00:00:00.000Z',
        '2026-10-23T23:59:59.000Z',
        NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "startDate" = EXCLUDED."startDate",
        "endDate" = EXCLUDED."endDate";
    `;

    // 2. Seed 4 Weeks (Week 1 published = true, Weeks 2-4 published = false)
    console.log('Seeding weeks...');
    const weeksData = [
      {
        id: 'week-01',
        cohortId: 'cohort-data-analysis-fall-2026',
        weekNumber: 1,
        title: 'Retail E-Commerce Intelligence (AfriMart)',
        brief: 'Clean, model, and analyze 50,000+ transaction rows across 6 African markets. Build 4 standard KPI cards and 5 pivot charts following the Metric by Dimension rule.',
        datasetUrl: '/assets/AfriMart_Sales_Dataset.xlsx',
        slidesUrl: '/assets/02_Dashboard_Build_and_Submission_Guide.docx',
        deadline: '2026-10-02T23:59:59.000Z',
        published: true,
      },
      {
        id: 'week-02',
        cohortId: 'cohort-data-analysis-fall-2026',
        weekNumber: 2,
        title: 'FinTech Customer Churn & Retention Analytics',
        brief: 'Construct monthly cohort retention matrices and churn risk scores using transaction activity logs.',
        datasetUrl: null,
        slidesUrl: null,
        deadline: '2026-10-09T23:59:59.000Z',
        published: false,
      },
      {
        id: 'week-03',
        cohortId: 'cohort-data-analysis-fall-2026',
        weekNumber: 3,
        title: 'Cross-Border Logistics SLAs & Throughput',
        brief: 'Diagnose shipment transit variances and carrier SLA violations across regional border corridors.',
        datasetUrl: null,
        slidesUrl: null,
        deadline: '2026-10-16T23:59:59.000Z',
        published: false,
      },
      {
        id: 'week-04',
        cohortId: 'cohort-data-analysis-fall-2026',
        weekNumber: 4,
        title: 'Executive Capstone & Final Assessment',
        brief: 'End-to-end executive data story synthesis, repository documentation, and gated Final Assessment.',
        datasetUrl: null,
        slidesUrl: null,
        deadline: '2026-10-23T23:59:59.000Z',
        published: false,
      },
    ];

    for (const w of weeksData) {
      await sql`
        INSERT INTO "week" (
          "id", "cohortId", "weekNumber", "title", "brief",
          "datasetUrl", "slidesUrl", "deadline", "published", "createdAt", "updatedAt"
        )
        VALUES (
          ${w.id}, ${w.cohortId}, ${w.weekNumber}, ${w.title}, ${w.brief},
          ${w.datasetUrl}, ${w.slidesUrl}, ${w.deadline}, ${w.published}, NOW(), NOW()
        )
        ON CONFLICT ("id") DO UPDATE SET
          "cohortId" = EXCLUDED."cohortId",
          "weekNumber" = EXCLUDED."weekNumber",
          "title" = EXCLUDED."title",
          "brief" = EXCLUDED."brief",
          "datasetUrl" = EXCLUDED."datasetUrl",
          "slidesUrl" = EXCLUDED."slidesUrl",
          "deadline" = EXCLUDED."deadline",
          "published" = EXCLUDED."published",
          "updatedAt" = NOW();
      `;
    }

    // 3. Seed Rubric Items for Week 1
    console.log('Seeding rubric items for Week 1...');
    const rubrics = [
      {
        id: 'rubric-w1-1',
        weekId: 'week-01',
        criterion: 'Data Cleaning & Validation',
        weight: 25,
        requirement: 'Clean 50k+ rows, resolve accented characters, format currency consistently, handle nulls.',
      },
      {
        id: 'rubric-w1-2',
        weekId: 'week-01',
        criterion: 'Core KPI Modeling',
        weight: 25,
        requirement: 'Build 4 standard KPI cards: Total Revenue, Gross Margin %, Average Order Value, and Return Rate.',
      },
      {
        id: 'rubric-w1-3',
        weekId: 'week-01',
        criterion: 'Metric-by-Dimension Visuals',
        weight: 25,
        requirement: 'Construct 5 pivot charts following the strict Metric by Dimension rule across regional markets.',
      },
      {
        id: 'rubric-w1-4',
        weekId: 'week-01',
        criterion: 'Documentation & Insights',
        weight: 25,
        requirement: 'Public GitHub repo with comprehensive README and 3 distinct business findings.',
      },
    ];

    for (const r of rubrics) {
      await sql`
        INSERT INTO "rubricItem" ("id", "weekId", "criterion", "weight", "requirement")
        VALUES (${r.id}, ${r.weekId}, ${r.criterion}, ${r.weight}, ${r.requirement})
        ON CONFLICT ("id") DO UPDATE SET
          "criterion" = EXCLUDED."criterion",
          "weight" = EXCLUDED."weight",
          "requirement" = EXCLUDED."requirement";
      `;
    }

    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    await sql.end();
    process.exit(1);
  }
}

seed();
