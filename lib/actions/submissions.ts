"use server";

import { auth } from "@/auth";
import { getPublishedWeekById } from "@/lib/db/queries/weeks";
import { upsertStudentSubmission } from "@/lib/db/queries/submissions";
import { ensureUserExists, getUserByEmail } from "@/lib/db/queries/users";
import { revalidatePath } from "next/cache";

interface SubmitProjectPayload {
  weekId: string;
  githubUrl?: string;
  reflectionFindings?: string;
  sqlQueries?: string;
  answerSheet?: string;
  managerMessage?: string;
}

export type SubmitProjectResult =
  | { success: true; submission: any; isReachable: boolean }
  | { success: false; error: string };

export async function submitProjectAction({
  weekId,
  githubUrl,
  reflectionFindings,
  sqlQueries,
  answerSheet,
  managerMessage,
}: SubmitProjectPayload): Promise<SubmitProjectResult> {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return { success: false, error: "Unauthorized: Please sign in to submit your project." };
    }

    const userEmail = session.user.email?.toLowerCase().trim();
    if (!userEmail) {
      return { success: false, error: "Invalid session: Missing email address." };
    }

    // 1. Ensure user exists in database to satisfy foreign key constraint
    let studentId = session.user.id;
    try {
      const existingUser = await getUserByEmail(userEmail);
      if (existingUser) {
        studentId = existingUser.id;
      } else {
        const studentRecord = await ensureUserExists({
          id: session.user.id,
          email: userEmail,
          name: session.user.name,
          role: session.user.role,
        });
        if (studentRecord?.id) {
          studentId = studentRecord.id;
        }
      }
    } catch (err) {
      console.warn("User lookup/creation warning:", err);
    }

    // 2. Verify week exists and is published
    const week = await getPublishedWeekById(weekId);
    if (!week) {
      return { success: false, error: "Project not found or is not currently open for submissions." };
    }

    // 3. Verify deadline
    const now = new Date();
    if (now > new Date(week.deadline)) {
      return { success: false, error: "The submission deadline for this project has passed. Resubmissions are closed." };
    }

    // Validation & Routing
    const isWeek2 = !!sqlQueries || !!answerSheet || !!managerMessage;
    let cleanUrl = "";
    let trimmedReflection = "";
    let isReachable = true;

    if (isWeek2) {
      if (!sqlQueries?.trim() || !answerSheet?.trim() || !managerMessage?.trim()) {
        return { success: false, error: "All three fields are required for this project." };
      }
      if (!sqlQueries.includes(";")) {
        return { success: false, error: "Your SQL queries should contain at least one semicolon (;)." };
      }
    } else {
      // 4. Validate GitHub URL format (normalize and case-insensitive)
      cleanUrl = (githubUrl || "").trim();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl}`;
      }
      const githubRegex = /^https?:\/\/(www\.)?github\.com\/[^\s/]+\/[^\s/]+/i;
      if (!githubRegex.test(cleanUrl)) {
        return { success: false, error: "Please provide a valid GitHub repository URL (e.g. https://github.com/username/repository)." };
      }

      // 5. Validate reflection text
      trimmedReflection = (reflectionFindings || "").trim();
      if (!trimmedReflection || trimmedReflection.length < 3) {
        return {
          success: false,
          error: "Please enter your key findings and reflections from the dataset.",
        };
      }

      // 6. Check URL reachability (server-side check)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const headRes = await fetch(cleanUrl, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            "User-Agent": "Project-Builders-Verifier/1.0",
          },
        });

        clearTimeout(timeoutId);
        // If GitHub returns 404 or 500+, mark unreachable
        if (!headRes.ok && headRes.status === 404) {
          isReachable = false;
        }
      } catch {
        // Timeout or network glitch — do not block student, but flag reachability
        isReachable = false;
      }
    }

    // 7. Upsert submission
    const submission = await upsertStudentSubmission({
      studentId,
      weekId,
      githubUrl: isWeek2 ? null : cleanUrl,
      reflectionFindings: isWeek2 ? null : trimmedReflection,
      sqlQueries: sqlQueries?.trim() || null,
      answerSheet: answerSheet?.trim() || null,
      managerMessage: managerMessage?.trim() || null,
      isReachable,
    });

    if (!submission) {
      return { success: false, error: "Database error saving your submission. Please try again." };
    }

    try {
      revalidatePath("/dashboard/student");
      revalidatePath("/dashboard/admin");
    } catch (e) {
      console.warn("revalidatePath error in submitProjectAction:", e);
    }

    return {
      success: true,
      submission,
      isReachable,
    };
  } catch (err: unknown) {
    console.error("submitProjectAction unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred while saving your submission. Please try again.",
    };
  }
}
