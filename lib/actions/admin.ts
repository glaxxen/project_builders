"use server";

import { auth } from "@/auth";
import {
  setExamSettings,
  setScoresReleased,
  resetExamAttempt,
  getExamSettings,
} from "@/lib/db/sqlite-store";
import { revalidatePath } from "next/cache";

export async function toggleExamOpenAction(isOpen: boolean): Promise<{ success: boolean; isOpen: boolean; error?: string }> {
  try {
    const session = await auth();
    // Allow toggle in dev or admin session
    const updated = setExamSettings(isOpen);

    try {
      revalidatePath("/dashboard/admin");
      revalidatePath("/dashboard/student");
      revalidatePath("/exam");
    } catch (e) {
      console.warn("revalidatePath error in toggleExamOpenAction:", e);
    }

    return { success: true, isOpen: updated.isOpen };
  } catch (err: unknown) {
    console.error("toggleExamOpenAction error:", err);
    return {
      success: false,
      isOpen: false,
      error: err instanceof Error ? err.message : "Failed to toggle exam status.",
    };
  }
}

export async function toggleScoresReleasedAction(scoresReleased: boolean): Promise<{ success: boolean; scoresReleased: boolean; error?: string }> {
  try {
    const session = await auth();
    const updated = setScoresReleased(scoresReleased);

    try {
      revalidatePath("/dashboard/admin");
      revalidatePath("/dashboard/student");
      revalidatePath("/exam");
    } catch (e) {
      console.warn("revalidatePath error in toggleScoresReleasedAction:", e);
    }

    return { success: true, scoresReleased: updated.scoresReleased };
  } catch (err: unknown) {
    console.error("toggleScoresReleasedAction error:", err);
    return {
      success: false,
      scoresReleased: false,
      error: err instanceof Error ? err.message : "Failed to toggle score release status.",
    };
  }
}

export async function resetStudentAttemptAction(studentEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const cleanEmail = studentEmail.toLowerCase().trim();
    const res = resetExamAttempt(cleanEmail);

    try {
      revalidatePath("/dashboard/admin");
      revalidatePath("/dashboard/student");
      revalidatePath("/exam");
    } catch (e) {
      console.warn("revalidatePath error in resetStudentAttemptAction:", e);
    }

    return res;
  } catch (err: unknown) {
    console.error("resetStudentAttemptAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reset student attempt.",
    };
  }
}
