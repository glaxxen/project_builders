import { db } from "../index";
import { weeks, rubricItems, type Week, type NewWeek, type RubricItem } from "../schema";
import { eq, and, asc } from "drizzle-orm";
import {
  shouldUseRest,
  restGet,
  restInsert,
  restUpdate,
} from "../rest-fallback";

/**
 * CRITICAL PUBLISHING RULE (PRD Section 9 & TODO Phase 3):
 *
 * Any query returning weeks to a student MUST strictly filter to published weeks only.
 * An unpublished week must NEVER appear anywhere in the student-facing app —
 * not even as a "coming soon" or disabled placeholder.
 */
export async function getWeeksForStudent(cohortId: string): Promise<Week[]> {
  if (shouldUseRest()) {
    const data = await restGet<Week[]>(
      "week",
      `cohortId=eq.${cohortId}&published=eq.true&order=weekNumber.asc`
    );
    return data || [];
  }

  try {
    return await db
      .select()
      .from(weeks)
      .where(and(eq(weeks.cohortId, cohortId), eq(weeks.published, true)))
      .orderBy(asc(weeks.weekNumber));
  } catch (error) {
    console.warn("Direct DB query failed, falling back to Supabase HTTPS REST API...");
    const restData = await restGet<Week[]>(
      "week",
      `cohortId=eq.${cohortId}&published=eq.true&order=weekNumber.asc`
    );
    return restData || [];
  }
}

/**
 * Fetch a single week for student view.
 * If the week exists but is unpublished, returns null so the student
 * route receives a 404 rather than displaying an unpublished brief.
 */
export async function getPublishedWeekById(weekId: string): Promise<Week | null> {
  if (shouldUseRest()) {
    const data = await restGet<Week[]>(
      "week",
      `id=eq.${weekId}&published=eq.true&limit=1`
    );
    return data?.[0] || null;
  }

  try {
    const result = await db
      .select()
      .from(weeks)
      .where(and(eq(weeks.id, weekId), eq(weeks.published, true)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.warn("Direct DB query failed for week ID, falling back to HTTPS REST API...");
    const restData = await restGet<Week[]>(
      "week",
      `id=eq.${weekId}&published=eq.true&limit=1`
    );
    return restData?.[0] || null;
  }
}

/**
 * Admin query: Returns all weeks for a cohort, including publication status.
 * Intended exclusively for admin and instructor management routes.
 */
export async function getAllWeeksForAdmin(cohortId: string): Promise<Week[]> {
  if (shouldUseRest()) {
    const data = await restGet<Week[]>(
      "week",
      `cohortId=eq.${cohortId}&order=weekNumber.asc`
    );
    return data || [];
  }

  try {
    return await db
      .select()
      .from(weeks)
      .where(eq(weeks.cohortId, cohortId))
      .orderBy(asc(weeks.weekNumber));
  } catch (error) {
    console.warn("Direct DB query failed for admin weeks, falling back to HTTPS REST API...");
    const restData = await restGet<Week[]>(
      "week",
      `cohortId=eq.${cohortId}&order=weekNumber.asc`
    );
    return restData || [];
  }
}

/**
 * Admin mutation: Toggle week published state.
 */
export async function setWeekPublishedStatus(
  weekId: string,
  published: boolean
): Promise<Week | null> {
  if (shouldUseRest()) {
    const updated = await restUpdate<Week[]>(
      "week",
      `id=eq.${weekId}`,
      { published, updatedAt: new Date().toISOString() }
    );
    return updated?.[0] || null;
  }

  try {
    const updated = await db
      .update(weeks)
      .set({ published, updatedAt: new Date() })
      .where(eq(weeks.id, weekId))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.warn("Direct DB update failed, falling back to REST:", error);
    const updated = await restUpdate<Week[]>(
      "week",
      `id=eq.${weekId}`,
      { published, updatedAt: new Date().toISOString() }
    );
    return updated?.[0] || null;
  }
}

/**
 * Admin mutation: Create a new week in a cohort.
 */
export async function createWeek(data: Omit<NewWeek, "id" | "createdAt" | "updatedAt">): Promise<Week | null> {
  const id = `week-${String(data.weekNumber).padStart(2, "0")}-${Date.now().toString(36)}`;
  const record = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (shouldUseRest()) {
    const created = await restInsert<Week[]>("week", record);
    return created?.[0] || null;
  }

  try {
    const created = await db
      .insert(weeks)
      .values({
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created[0] || null;
  } catch (error) {
    console.warn("Direct DB create failed, falling back to REST:", error);
    const created = await restInsert<Week[]>("week", record);
    return created?.[0] || null;
  }
}

/**
 * Fetch rubric items for a given week.
 */
export async function getRubricForWeek(weekId: string): Promise<RubricItem[]> {
  if (shouldUseRest()) {
    const data = await restGet<RubricItem[]>("rubricItem", `weekId=eq.${weekId}`);
    return data || [];
  }

  try {
    return await db
      .select()
      .from(rubricItems)
      .where(eq(rubricItems.weekId, weekId));
  } catch (error) {
    console.warn("Direct DB rubric query failed, falling back to REST:", error);
    const data = await restGet<RubricItem[]>("rubricItem", `weekId=eq.${weekId}`);
    return data || [];
  }
}
