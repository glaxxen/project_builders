import { db } from "../index";
import { assessments, questions, options, scores, type Assessment, type Score, type Question, type Option } from "../schema";
import { eq, and, asc, desc } from "drizzle-orm";
import {
  shouldUseRest,
  restGet,
  restInsert,
  restUpdate,
} from "../rest-fallback";

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
 * Fetch all assessments configured in the system.
 */
export async function getAllAssessments(): Promise<Assessment[]> {
  if (shouldUseRest()) {
    const list = await restGet<Assessment[]>("assessment", "order=createdAt.asc");
    return list || [];
  }

  try {
    return await db.select().from(assessments);
  } catch (error) {
    console.warn("Direct DB assessment list failed, falling back to REST:", error);
    const list = await restGet<Assessment[]>("assessment", "order=createdAt.asc");
    return list || [];
  }
}

/**
 * Fetch the assessment configured for a specific week.
 */
export async function getAssessmentForWeek(weekId: string): Promise<Assessment | null> {
  if (shouldUseRest()) {
    const list = await restGet<Assessment[]>("assessment", `weekId=eq.${weekId}&limit=1`);
    return list?.[0] || null;
  }

  try {
    const result = await db
      .select()
      .from(assessments)
      .where(eq(assessments.weekId, weekId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.warn("Direct DB getAssessmentForWeek failed, falling back to REST:", error);
    const list = await restGet<Assessment[]>("assessment", `weekId=eq.${weekId}&limit=1`);
    return list?.[0] || null;
  }
}

/**
 * Fetch assessment by ID.
 */
export async function getAssessmentById(assessmentId: string): Promise<Assessment | null> {
  if (shouldUseRest()) {
    const list = await restGet<Assessment[]>("assessment", `id=eq.${assessmentId}&limit=1`);
    return list?.[0] || null;
  }

  try {
    const result = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.warn("Direct DB getAssessmentById failed, falling back to REST:", error);
    const list = await restGet<Assessment[]>("assessment", `id=eq.${assessmentId}&limit=1`);
    return list?.[0] || null;
  }
}

/**
 * Fetch student-safe assessment questions and options.
 * CRITICAL SECURITY: Does NOT expose `correctOptionId` or `explanation` to the client.
 */
export async function getStudentAssessmentData(
  assessmentId: string
): Promise<AssessmentWithQuestions | null> {
  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) return null;

  if (shouldUseRest()) {
    const questionList =
      (await restGet<Question[]>(
        "question",
        `assessmentId=eq.${assessmentId}&select=id,orderNumber,prompt,points&order=orderNumber.asc`
      )) || [];

    if (questionList.length === 0) {
      return { ...assessment, questions: [] };
    }

    // Fetch options for all questions
    const qIds = questionList.map((q) => `"${q.id}"`).join(",");
    const allOptions =
      (await restGet<Option[]>(
        "option",
        `questionId=in.(${qIds})&select=id,questionId,text&order=id.asc`
      )) || [];

    const questionsWithOptions: QuestionWithOptions[] = questionList.map((q) => ({
      id: q.id,
      orderNumber: q.orderNumber,
      prompt: q.prompt,
      points: q.points,
      options: allOptions
        .filter((opt) => opt.questionId === q.id)
        .map((opt) => ({ id: opt.id, text: opt.text })),
    }));

    return {
      ...assessment,
      questions: questionsWithOptions,
    };
  }

  try {
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
    console.warn("Direct DB getStudentAssessmentData failed, falling back to REST:", error);
    const questionList =
      (await restGet<Question[]>(
        "question",
        `assessmentId=eq.${assessmentId}&select=id,orderNumber,prompt,points&order=orderNumber.asc`
      )) || [];

    const qIds = questionList.map((q) => `"${q.id}"`).join(",");
    const allOptions =
      (await restGet<Option[]>(
        "option",
        `questionId=in.(${qIds})&select=id,questionId,text&order=id.asc`
      )) || [];

    const questionsWithOptions: QuestionWithOptions[] = questionList.map((q) => ({
      id: q.id,
      orderNumber: q.orderNumber,
      prompt: q.prompt,
      points: q.points,
      options: allOptions
        .filter((opt) => opt.questionId === q.id)
        .map((opt) => ({ id: opt.id, text: opt.text })),
    }));

    return {
      ...assessment,
      questions: questionsWithOptions,
    };
  }
}

/**
 * Server-only: Fetch full questions with correctOptionId for deterministic auto-grading.
 */
export async function getGradingKey(assessmentId: string) {
  if (shouldUseRest()) {
    const questionList =
      (await restGet<Question[]>(
        "question",
        `assessmentId=eq.${assessmentId}&order=orderNumber.asc`
      )) || [];

    if (questionList.length === 0) return [];

    const qIds = questionList.map((q) => `"${q.id}"`).join(",");
    const allOptions =
      (await restGet<Option[]>(
        "option",
        `questionId=in.(${qIds})&order=id.asc`
      )) || [];

    return questionList.map((q) => ({
      id: q.id,
      orderNumber: q.orderNumber,
      prompt: q.prompt,
      correctOptionId: q.correctOptionId,
      points: q.points,
      options: allOptions
        .filter((opt) => opt.questionId === q.id)
        .map((opt) => ({
          id: opt.id,
          text: opt.text,
          explanation: opt.explanation,
        })),
    }));
  }

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
    console.warn("Direct DB getGradingKey failed, falling back to REST:", error);
    const questionList =
      (await restGet<Question[]>(
        "question",
        `assessmentId=eq.${assessmentId}&order=orderNumber.asc`
      )) || [];

    const qIds = questionList.map((q) => `"${q.id}"`).join(",");
    const allOptions =
      (await restGet<Option[]>(
        "option",
        `questionId=in.(${qIds})&order=id.asc`
      )) || [];

    return questionList.map((q) => ({
      id: q.id,
      orderNumber: q.orderNumber,
      prompt: q.prompt,
      correctOptionId: q.correctOptionId,
      points: q.points,
      options: allOptions
        .filter((opt) => opt.questionId === q.id)
        .map((opt) => ({
          id: opt.id,
          text: opt.text,
          explanation: opt.explanation,
        })),
    }));
  }
}

/**
 * Get student's recorded score for an assessment.
 */
export async function getStudentScore(
  studentId: string,
  assessmentId: string
): Promise<Score | null> {
  if (shouldUseRest()) {
    const list = await restGet<Score[]>(
      "score",
      `studentId=eq.${studentId}&assessmentId=eq.${assessmentId}&limit=1`
    );
    return list?.[0] || null;
  }

  try {
    const result = await db
      .select()
      .from(scores)
      .where(and(eq(scores.studentId, studentId), eq(scores.assessmentId, assessmentId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.warn("Direct DB getStudentScore failed, falling back to REST:", error);
    const list = await restGet<Score[]>(
      "score",
      `studentId=eq.${studentId}&assessmentId=eq.${assessmentId}&limit=1`
    );
    return list?.[0] || null;
  }
}

/**
 * Get all scores for a student.
 */
export async function getAllScoresForStudent(studentId: string): Promise<Score[]> {
  if (shouldUseRest()) {
    const list = await restGet<Score[]>(
      "score",
      `studentId=eq.${studentId}&order=completedAt.desc`
    );
    return list || [];
  }

  try {
    return await db
      .select()
      .from(scores)
      .where(eq(scores.studentId, studentId))
      .orderBy(desc(scores.completedAt));
  } catch (error) {
    console.warn("Direct DB getAllScoresForStudent failed, falling back to REST:", error);
    const list = await restGet<Score[]>(
      "score",
      `studentId=eq.${studentId}&order=completedAt.desc`
    );
    return list || [];
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
  const existing = await getStudentScore(data.studentId, data.assessmentId);

  if (shouldUseRest()) {
    if (existing) {
      const updated = await restUpdate<Score[]>(
        "score",
        `id=eq.${existing.id}`,
        {
          scorePercentage: data.scorePercentage,
          answers: data.answersJson,
          completedAt: new Date().toISOString(),
        }
      );
      return updated?.[0] || null;
    } else {
      const id = `scr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const created = await restInsert<Score[]>("score", {
        id,
        studentId: data.studentId,
        assessmentId: data.assessmentId,
        scorePercentage: data.scorePercentage,
        answers: data.answersJson,
        completedAt: new Date().toISOString(),
      });
      return created?.[0] || null;
    }
  }

  try {
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
    console.warn("Direct DB recordStudentScore failed, falling back to REST:", error);
    if (existing) {
      const updated = await restUpdate<Score[]>(
        "score",
        `id=eq.${existing.id}`,
        {
          scorePercentage: data.scorePercentage,
          answers: data.answersJson,
          completedAt: new Date().toISOString(),
        }
      );
      return updated?.[0] || null;
    } else {
      const id = `scr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const created = await restInsert<Score[]>("score", {
        id,
        studentId: data.studentId,
        assessmentId: data.assessmentId,
        scorePercentage: data.scorePercentage,
        answers: data.answersJson,
        completedAt: new Date().toISOString(),
      });
      return created?.[0] || null;
    }
  }
}
