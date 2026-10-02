"use server";

import { auth } from "@/auth";
import {
  getAssessmentById,
  getGradingKey,
  recordStudentScore,
  getStudentScore,
} from "@/lib/db/queries/assessments";
import { ensureUserExists } from "@/lib/db/queries/users";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { shouldUseRest, restGet, restInsert, restDelete } from "@/lib/db/rest-fallback";
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
  const userEmail = (session?.user?.email || "student@projectbuilders.dev").toLowerCase().trim();

  // 1. Ensure user exists in database
  const studentRecord = await ensureUserExists({
    id: session?.user?.id || "preview-student-user-id",
    email: userEmail,
    name: session?.user?.name || "Student Preview",
    role: "student",
  });

  // 1.5 Strict single attempt policy: Check if student has already completed this assessment
  const existingScore = await getStudentScore(studentRecord.id, assessmentId);
  if (existingScore) {
    throw new Error(
      "Official examination has already been completed. Cohort policy strictly enforces one attempt. Retakes are locked unless authorized by an instructor."
    );
  }

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

export async function adminAllowExamRetakeAction(data: {
  studentId: string;
  assessmentId: string;
}): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  
  // Allow admins or local preview development
  if (!isAdmin && process.env.NODE_ENV === "production") {
    throw new Error("Unauthorized: Admin authorization required to reset student examination attempts.");
  }

  const { scores: scoresTable } = await import("@/lib/db/schema");

  if (shouldUseRest()) {
    await restDelete("score", `studentId=eq.${data.studentId}&assessmentId=eq.${data.assessmentId}`);
  } else {
    try {
      await db
        .delete(scoresTable)
        .where(
          and(
            eq(scoresTable.studentId, data.studentId),
            eq(scoresTable.assessmentId, data.assessmentId)
          )
        );
    } catch {
      await restDelete("score", `studentId=eq.${data.studentId}&assessmentId=eq.${data.assessmentId}`);
    }
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/student");

  return {
    success: true,
    message: "Retake granted. The student's examination attempt has been reset and unlocked."
  };
}

