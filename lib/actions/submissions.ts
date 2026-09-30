"use server";

import { auth } from "@/auth";
import { getPublishedWeekById } from "@/lib/db/queries/weeks";
import { upsertStudentSubmission } from "@/lib/db/queries/submissions";
import { ensureUserExists } from "@/lib/db/queries/users";
import { revalidatePath } from "next/cache";

interface SubmitProjectPayload {
  weekId: string;
  githubUrl: string;
  reflectionFindings: string;
}

export async function submitProjectAction({
  weekId,
  githubUrl,
  reflectionFindings,
}: SubmitProjectPayload) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    throw new Error("Unauthorized: Please sign in to submit your project.");
  }

  const userEmail = session.user.email?.toLowerCase().trim();
  if (!userEmail) {
    throw new Error("Invalid session: Missing email address.");
  }

  // 1. Ensure user exists in database to satisfy foreign key constraint
  const studentRecord = await ensureUserExists({
    id: session.user.id,
    email: userEmail,
    name: session.user.name,
    role: session.user.role,
  });

  const studentId = studentRecord.id;

  // 2. Verify week exists and is published
  const week = await getPublishedWeekById(weekId);
  if (!week) {
    throw new Error("Project not found or is not currently open for submissions.");
  }

  // 3. Verify deadline
  const now = new Date();
  if (now > new Date(week.deadline)) {
    throw new Error("The submission deadline for this project has passed. Resubmissions are closed.");
  }

  // 4. Validate GitHub URL format
  const trimmedUrl = githubUrl.trim();
  const githubRegex = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?.*$/;
  if (!githubRegex.test(trimmedUrl)) {
    throw new Error("Please provide a valid GitHub repository URL (e.g. https://github.com/username/repository).");
  }

  // 5. Validate reflection text
  const trimmedReflection = reflectionFindings.trim();
  if (trimmedReflection.length < 20) {
    throw new Error("Please document your findings thoroughly (minimum 20 characters summarizing your core insights).");
  }

  // 6. Check URL reachability (server-side check)
  let isReachable = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const headRes = await fetch(trimmedUrl, {
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
  } catch (err) {
    // Timeout or network glitch — do not block student, but flag reachability
    isReachable = false;
  }

  // 7. Upsert submission
  const submission = await upsertStudentSubmission({
    studentId,
    weekId,
    githubUrl: trimmedUrl,
    reflectionFindings: trimmedReflection,
    isReachable,
  });

  if (!submission) {
    throw new Error("Database error saving your submission. Please try again.");
  }

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin");

  return {
    success: true,
    submission,
    isReachable,
  };
}
