"use server";

import { auth } from "@/auth";
import {
  saveStudentAnswer,
  submitExamAttempt,
  getExamAttemptByStudent,
  autoFinalizeExpiredAttempt,
} from "@/lib/db/sqlite-store";
import { revalidatePath } from "next/cache";

export async function saveExamAnswerAction(data: {
  attemptId: string;
  questionId: string;
  optionIndex: number;
}): Promise<{ success: boolean; error?: string; autoSubmitted?: boolean }> {
  try {
    const session = await auth();
    // Validate attempt exists
    const res = saveStudentAnswer({
      attemptId: data.attemptId,
      questionId: data.questionId,
      optionIndex: data.optionIndex,
    });

    if (!res.success && res.error === "Exam deadline has passed.") {
      return { success: false, error: res.error, autoSubmitted: true };
    }

    return res;
  } catch (err: unknown) {
    console.error("saveExamAnswerAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to autosave answer.",
    };
  }
}

export async function submitExamAttemptAction(data: {
  attemptId: string;
  answers?: Record<string, number>;
}): Promise<{ success: boolean; submittedAt?: string; error?: string }> {
  try {
    const attempt = submitExamAttempt({
      attemptId: data.attemptId,
      finalAnswers: data.answers,
    });

    try {
      revalidatePath("/exam");
      revalidatePath("/dashboard/student");
      revalidatePath("/dashboard/admin");
    } catch (e) {
      console.warn("revalidatePath error in submitExamAttemptAction:", e);
    }

    // CRITICAL SECURITY: Never return score or correct answers to student!
    return {
      success: true,
      submittedAt: attempt.submittedAt || new Date().toISOString(),
    };
  } catch (err: unknown) {
    console.error("submitExamAttemptAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit exam.",
    };
  }
}
