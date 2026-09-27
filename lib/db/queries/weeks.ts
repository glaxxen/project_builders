import type { Week } from "../schema";

/**
 * In-memory / initial database store for weeks.
 * Initialized with default Data Analysis cohort data.
 * Week 1 is published; Weeks 2, 3, and 4 default to published: false.
 */
let WEEKS_STORE: Week[] = [
  {
    id: "week-01",
    cohortId: "cohort-data-analysis-fall-2026",
    weekNumber: 1,
    title: "Retail E-Commerce Intelligence (AfriMart)",
    brief: "Clean, model, and analyze 50,000+ transaction rows across 6 African markets. Build 4 standard KPI cards and 5 pivot charts following the Metric by Dimension rule.",
    datasetUrl: "/assets/AfriMart_Sales_Dataset.xlsx",
    slidesUrl: "/assets/02_Dashboard_Build_and_Submission_Guide.docx",
    deadline: new Date("2026-10-02T23:59:59.000Z"),
    published: true, // Week 1 is published for active students
    createdAt: new Date("2026-09-25T00:00:00.000Z"),
    updatedAt: new Date("2026-09-25T00:00:00.000Z"),
  },
  {
    id: "week-02",
    cohortId: "cohort-data-analysis-fall-2026",
    weekNumber: 2,
    title: "FinTech Customer Churn & Retention Analytics",
    brief: "Construct monthly cohort retention matrices and churn risk scores using transaction activity logs.",
    datasetUrl: null,
    slidesUrl: null,
    deadline: new Date("2026-10-09T23:59:59.000Z"),
    published: false, // Default: false (unpublished)
    createdAt: new Date("2026-09-25T00:00:00.000Z"),
    updatedAt: new Date("2026-09-25T00:00:00.000Z"),
  },
  {
    id: "week-03",
    cohortId: "cohort-data-analysis-fall-2026",
    weekNumber: 3,
    title: "Cross-Border Logistics SLAs & Throughput",
    brief: "Diagnose shipment transit variances and carrier SLA violations across regional border corridors.",
    datasetUrl: null,
    slidesUrl: null,
    deadline: new Date("2026-10-16T23:59:59.000Z"),
    published: false, // Default: false (unpublished)
    createdAt: new Date("2026-09-25T00:00:00.000Z"),
    updatedAt: new Date("2026-09-25T00:00:00.000Z"),
  },
  {
    id: "week-04",
    cohortId: "cohort-data-analysis-fall-2026",
    weekNumber: 4,
    title: "Executive Capstone & Final Assessment",
    brief: "End-to-end executive data story synthesis, repository documentation, and gated Final Assessment.",
    datasetUrl: null,
    slidesUrl: null,
    deadline: new Date("2026-10-23T23:59:59.000Z"),
    published: false, // Default: false (unpublished)
    createdAt: new Date("2026-09-25T00:00:00.000Z"),
    updatedAt: new Date("2026-09-25T00:00:00.000Z"),
  },
];

/**
 * CRITICAL PUBLISHING RULE (PRD Section 9 & TODO Phase 3):
 *
 * Any query returning weeks to a student MUST strictly filter to published weeks only.
 * An unpublished week must NEVER appear anywhere in the student-facing app —
 * not even as a "coming soon" or disabled placeholder.
 */
export async function getWeeksForStudent(cohortId: string): Promise<Week[]> {
  // Query-level filtering: ONLY published weeks
  return WEEKS_STORE.filter(
    (w) => w.cohortId === cohortId && w.published === true
  ).sort((a, b) => a.weekNumber - b.weekNumber);
}

/**
 * Fetch a single week for student view.
 * If the week exists but is unpublished, returns null so the student
 * route receives a 404 rather than displaying an unpublished brief.
 */
export async function getPublishedWeekById(weekId: string): Promise<Week | null> {
  const week = WEEKS_STORE.find((w) => w.id === weekId);
  if (!week || !week.published) {
    return null;
  }
  return week;
}

/**
 * Admin query: Returns all weeks for a cohort, including publication status.
 * Intended exclusively for admin and instructor management routes.
 */
export async function getAllWeeksForAdmin(cohortId: string): Promise<Week[]> {
  return WEEKS_STORE.filter((w) => w.cohortId === cohortId).sort(
    (a, b) => a.weekNumber - b.weekNumber
  );
}

/**
 * Admin mutation: Toggle week published state.
 */
export async function setWeekPublishedStatus(
  weekId: string,
  published: boolean
): Promise<Week | null> {
  const index = WEEKS_STORE.findIndex((w) => w.id === weekId);
  if (index === -1) return null;

  const current = WEEKS_STORE[index];
  if (!current) return null;

  const updated: Week = {
    ...current,
    published,
    updatedAt: new Date(),
  };

  WEEKS_STORE[index] = updated;
  return updated;
}
