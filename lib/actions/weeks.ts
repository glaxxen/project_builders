"use server";

import { auth } from "@/auth";
import { setWeekPublishedStatus, createWeek } from "@/lib/db/queries/weeks";
import { revalidatePath } from "next/cache";

export async function toggleWeekPublishAction(weekId: string, currentPublished: boolean) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin privilege required");
  }

  const updated = await setWeekPublishedStatus(weekId, !currentPublished);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/student");
  return { success: true, week: updated };
}

export async function createWeekAction(data: {
  cohortId: string;
  weekNumber: number;
  title: string;
  brief: string;
  deadline: string;
  datasetUrl?: string;
  slidesUrl?: string;
  published?: boolean;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin privilege required");
  }

  if (!data.title?.trim() || !data.brief?.trim() || !data.deadline) {
    throw new Error("Missing required week details: title, brief, and deadline are required.");
  }

  const created = await createWeek({
    cohortId: data.cohortId,
    weekNumber: Number(data.weekNumber),
    title: data.title.trim(),
    brief: data.brief.trim(),
    deadline: new Date(data.deadline),
    datasetUrl: data.datasetUrl?.trim() || null,
    slidesUrl: data.slidesUrl?.trim() || null,
    published: !!data.published,
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/student");
  return { success: true, week: created };
}
