import { db } from "../index";
import { assessments, questions, options, scores, type Assessment, type Score } from "../schema";
import { eq, and, asc, desc } from "drizzle-orm";

export interface QuestionWithOptions {
  id: string;
  orderNumber: number;
  prompt: string;
  points: number;
  options: {
    id: string;
    text: string;
  }[];
}

export interface AssessmentWithQuestions extends Assessment {
  questions: QuestionWithOptions[];
}

/**
 * Fetch the assessment configured for a specific week.
 */
export async function getAssessmentForWeek(weekId: string): Promise<Assessment | null> {
  try {
    const result = await db
      .select()
      .from(assessments)
      .where(eq(assessments.weekId, weekId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching assessment for week:", error);
    return null;
  }
}

/**
 * Fetch assessment by ID.
 */
export async function getAssessmentById(assessmentId: string): Promise<Assessment | null> {
  try {
    const result = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching assessment by ID:", error);
    return null;
  }
}

/**
 * Fetch student-safe assessment questions and options.
 * CRITICAL SECURITY: Does NOT expose `correctOptionId` or `explanation` to the client.
 */
export async function getStudentAssessmentData(
  assessmentId: string
): Promise<AssessmentWithQuestions | null> {
  try {
    const assessment = await getAssessmentById(assessmentId);
    if (!assessment) return null;

    const questionList = await db
      .select({
        id: questions.id,
        orderNumber: questions.orderNumber,
        prompt: questions.prompt,
        points: questions.points,
      })
      .from(questions)
      .where(eq(questions.assessmentId, assessmentId))
      .orderBy(asc(questions.orderNumber));

    const questionsWithOptions: QuestionWithOptions[] = [];

    for (const q of questionList) {
      const optionList = await db
        .select({
          id: options.id,
          text: options.text,
        })
        .from(options)
        .where(eq(options.questionId, q.id));

      questionsWithOptions.push({
        ...q,
        options: optionList,
      });
    }

    return {
      ...assessment,
      questions: questionsWithOptions,
    };
  } catch (error) {
    console.error("Error fetching student assessment data:", error);
    return null;
  }
}

/**
 * Server-only: Fetch full questions with correctOptionId for deterministic auto-grading.
 */
export async function getGradingKey(assessmentId: string) {
  try {
    const questionList = await db
      .select({
        id: questions.id,
        orderNumber: questions.orderNumber,
        prompt: questions.prompt,
        correctOptionId: questions.correctOptionId,
        points: questions.points,
      })
      .from(questions)
      .where(eq(questions.assessmentId, assessmentId))
      .orderBy(asc(questions.orderNumber));

    const fullQuestions = [];
    for (const q of questionList) {
      const optionList = await db
        .select({
          id: options.id,
          text: options.text,
          explanation: options.explanation,
        })
        .from(options)
        .where(eq(options.questionId, q.id));

      fullQuestions.push({
        ...q,
        options: optionList,
      });
    }

    return fullQuestions;
  } catch (error) {
    console.error("Error fetching grading key:", error);
    return [];
  }
}

/**
 * Get student's recorded score for an assessment.
 */
export async function getStudentScore(
  studentId: string,
  assessmentId: string
): Promise<Score | null> {
  try {
    const result = await db
      .select()
      .from(scores)
      .where(and(eq(scores.studentId, studentId), eq(scores.assessmentId, assessmentId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching student score:", error);
    return null;
  }
}

/**
 * Get all scores for a student.
 */
export async function getAllScoresForStudent(studentId: string): Promise<Score[]> {
  try {
    return await db
      .select()
      .from(scores)
      .where(eq(scores.studentId, studentId))
      .orderBy(desc(scores.completedAt));
  } catch (error) {
    console.error("Error fetching all scores for student:", error);
    return [];
  }
}

/**
 * Record a student's score in the database.
 */
export async function recordStudentScore(data: {
  studentId: string;
  assessmentId: string;
  scorePercentage: number;
  answersJson: string;
}): Promise<Score | null> {
  try {
    const existing = await getStudentScore(data.studentId, data.assessmentId);

    if (existing) {
      const [updated] = await db
        .update(scores)
        .set({
          scorePercentage: data.scorePercentage,
          answers: data.answersJson,
          completedAt: new Date(),
        })
        .where(eq(scores.id, existing.id))
        .returning();

      return updated || null;
    } else {
      const id = `scr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const [created] = await db
        .insert(scores)
        .values({
          id,
          studentId: data.studentId,
          assessmentId: data.assessmentId,
          scorePercentage: data.scorePercentage,
          answers: data.answersJson,
          completedAt: new Date(),
        })
        .returning();

      return created || null;
    }
  } catch (error) {
    console.error("Error recording student score:", error);
    return null;
  }
}
