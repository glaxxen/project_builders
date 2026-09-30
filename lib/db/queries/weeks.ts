import { db } from "../index";
import { weeks, rubricItems, type Week, type NewWeek, type RubricItem } from "../schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * CRITICAL PUBLISHING RULE (PRD Section 9 & TODO Phase 3):
 *
 * Any query returning weeks to a student MUST strictly filter to published weeks only.
 * An unpublished week must NEVER appear anywhere in the student-facing app —
 * not even as a "coming soon" or disabled placeholder.
 */
export async function getWeeksForStudent(cohortId: string): Promise<Week[]> {
  try {
    return await db
      .select()
      .from(weeks)
      .where(and(eq(weeks.cohortId, cohortId), eq(weeks.published, true)))
      .orderBy(asc(weeks.weekNumber));
  } catch (error) {
    console.error("Error fetching published weeks for student:", error);
    return [];
  }
}

/**
 * Fetch a single week for student view.
 * If the week exists but is unpublished, returns null so the student
 * route receives a 404 rather than displaying an unpublished brief.
 */
export async function getPublishedWeekById(weekId: string): Promise<Week | null> {
  try {
    const result = await db
      .select()
      .from(weeks)
      .where(and(eq(weeks.id, weekId), eq(weeks.published, true)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching published week by id:", error);
    return null;
  }
}

/**
 * Admin query: Returns all weeks for a cohort, including publication status.
 * Intended exclusively for admin and instructor management routes.
 */
export async function getAllWeeksForAdmin(cohortId: string): Promise<Week[]> {
  try {
    return await db
      .select()
      .from(weeks)
      .where(eq(weeks.cohortId, cohortId))
      .orderBy(asc(weeks.weekNumber));
  } catch (error) {
    console.error("Error fetching all weeks for admin:", error);
    return [];
  }
}

/**
 * Admin mutation: Toggle week published state.
 */
export async function setWeekPublishedStatus(
  weekId: string,
  published: boolean
): Promise<Week | null> {
  try {
    const updated = await db
      .update(weeks)
      .set({ published, updatedAt: new Date() })
      .where(eq(weeks.id, weekId))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error("Error updating week published status:", error);
    return null;
  }
}

/**
 * Admin mutation: Create a new week in a cohort.
 */
export async function createWeek(data: Omit<NewWeek, "id" | "createdAt" | "updatedAt">): Promise<Week | null> {
  try {
    const id = `week-${String(data.weekNumber).padStart(2, "0")}-${Date.now().toString(36)}`;
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
    console.error("Error creating week:", error);
    return null;
  }
}

/**
 * Fetch rubric items for a given week.
 */
export async function getRubricForWeek(weekId: string): Promise<RubricItem[]> {
  try {
    return await db
      .select()
      .from(rubricItems)
      .where(eq(rubricItems.weekId, weekId));
  } catch (error) {
    console.error("Error fetching rubric for week:", error);
    return [];
  }
}
