import { db } from "../index";
import { submissions, type Submission } from "../schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Fetch all submissions for a given student across all weeks.
 */
export async function getSubmissionsForStudent(studentId: string): Promise<Submission[]> {
  try {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.studentId, studentId))
      .orderBy(desc(submissions.submittedAt));
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    return [];
  }
}

/**
 * Fetch a specific submission for a student and week.
 */
export async function getSubmissionForStudentAndWeek(
  studentId: string,
  weekId: string
): Promise<Submission | null> {
  try {
    const result = await db
      .select()
      .from(submissions)
      .where(and(eq(submissions.studentId, studentId), eq(submissions.weekId, weekId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching submission for student and week:", error);
    return null;
  }
}

/**
 * Create or update a submission (resubmission).
 */
export async function upsertStudentSubmission(data: {
  studentId: string;
  weekId: string;
  githubUrl: string;
  reflectionFindings: string;
  isReachable: boolean;
}): Promise<Submission | null> {
  try {
    const existing = await getSubmissionForStudentAndWeek(data.studentId, data.weekId);

    if (existing) {
      const updated = await db
        .update(submissions)
        .set({
          githubUrl: data.githubUrl,
          reflectionFindings: data.reflectionFindings,
          isReachable: data.isReachable,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, existing.id))
        .returning();

      return updated[0] || null;
    } else {
      const id = `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const created = await db
        .insert(submissions)
        .values({
          id,
          studentId: data.studentId,
          weekId: data.weekId,
          githubUrl: data.githubUrl,
          reflectionFindings: data.reflectionFindings,
          isReachable: data.isReachable,
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return created[0] || null;
    }
  } catch (error) {
    console.error("Error upserting submission:", error);
    return null;
  }
}
