"use server";

import { auth } from "@/auth";
import {
  getAssessmentById,
  getGradingKey,
  recordStudentScore,
} from "@/lib/db/queries/assessments";
import { ensureUserExists } from "@/lib/db/queries/users";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { shouldUseRest, restGet, restInsert } from "@/lib/db/rest-fallback";
import { revalidatePath } from "next/cache";

export interface GradeResult {
  success: boolean;
  scorePercentage: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctCount: number;
  breakdown: {
    questionId: string;
    prompt: string;
    selectedOptionId: string | null;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string | null;
    options: { id: string; text: string }[];
  }[];
}

export async function submitAssessmentAction(
  assessmentId: string,
  studentAnswers: Record<string, string>
): Promise<GradeResult> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in to submit the assessment.");
  }

  const userEmail = session.user.email.toLowerCase().trim();

  // 1. Ensure user exists in database
  const studentRecord = await ensureUserExists({
    id: session.user.id,
    email: userEmail,
    name: session.user.name,
    role: session.user.role,
  });

  // 2. Fetch assessment details
  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) {
    throw new Error("Assessment not found.");
  }

  // 3. Fetch server grading key (includes correctOptionId & explanation)
  const questionsKey = await getGradingKey(assessmentId);
  if (questionsKey.length === 0) {
    throw new Error("No questions configured for this assessment.");
  }

  // 4. Deterministic grading algorithm
  let correctCount = 0;
  const breakdown = questionsKey.map((q) => {
    const selectedOptionId = studentAnswers[q.id] || null;
    const isCorrect = selectedOptionId === q.correctOptionId;

    if (isCorrect) {
      correctCount += 1;
    }

    return {
      questionId: q.id,
      prompt: q.prompt,
      selectedOptionId,
      correctOptionId: q.correctOptionId,
      isCorrect,
      explanation:
        q.options.find((opt) => opt.id === q.correctOptionId)?.explanation || null,
      options: q.options.map((opt) => ({ id: opt.id, text: opt.text })),
    };
  });

  const totalQuestions = questionsKey.length;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercentage >= assessment.passingScore;

  // 5. Save score in database
  await recordStudentScore({
    studentId: studentRecord.id,
    assessmentId,
    scorePercentage,
    answersJson: JSON.stringify(studentAnswers),
  });

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin");

  return {
    success: true,
    scorePercentage,
    passed,
    passingScore: assessment.passingScore,
    totalQuestions,
    correctCount,
    breakdown,
  };
}

export async function createQuestionAction(data: {
  assessmentId: string;
  prompt: string;
  points: number;
  correctOptionIndex: number;
  options: { text: string; explanation?: string }[];
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin role required to create questions.");
  }

  if (!data.prompt.trim() || data.options.length < 2) {
    throw new Error("Invalid question: Prompt and at least two options are required.");
  }

  const { questions, options: optionsTable } = await import("@/lib/db/schema");

  let existingCount = 0;
  if (shouldUseRest()) {
    const list = await restGet<any[]>("question", `assessmentId=eq.${data.assessmentId}&select=orderNumber`);
    existingCount = list?.length || 0;
  } else {
    const existingQuestions = await db
      .select({ orderNumber: questions.orderNumber })
      .from(questions)
      .where(eq(questions.assessmentId, data.assessmentId));
    existingCount = existingQuestions.length;
  }

  const nextOrderNumber = existingCount + 1;
  const questionId = `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  // Generate option IDs
  const optionRecords = data.options.map((opt, idx) => ({
    id: `opt-${questionId}-${idx + 1}`,
    questionId,
    text: opt.text.trim(),
    explanation: opt.explanation?.trim() || null,
  }));

  const correctOptionId =
    optionRecords[data.correctOptionIndex]?.id || optionRecords[0]?.id || "opt-1";

  if (shouldUseRest()) {
    await restInsert("question", {
      id: questionId,
      assessmentId: data.assessmentId,
      orderNumber: nextOrderNumber,
      prompt: data.prompt.trim(),
      correctOptionId,
      points: data.points || 10,
    });
    for (const optRec of optionRecords) {
      await restInsert("option", optRec);
    }
  } else {
    // Insert Question
    await db.insert(questions).values({
      id: questionId,
      assessmentId: data.assessmentId,
      orderNumber: nextOrderNumber,
      prompt: data.prompt.trim(),
      correctOptionId,
      points: data.points || 10,
    });

    // Insert Options
    for (const optRec of optionRecords) {
      await db.insert(optionsTable).values(optRec);
    }
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/student");

  return { success: true, questionId };
}
