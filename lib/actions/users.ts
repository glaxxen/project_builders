"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateStudentNameAction(newName: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in to update your profile.");
  }

  const trimmed = newName.trim();
  if (!trimmed || trimmed.length < 2) {
    throw new Error("Please enter a valid full name (at least 2 characters).");
  }

  const userEmail = session.user.email.toLowerCase().trim();

  // Find or create user
  const existing = (
    await db.select().from(users).where(eq(users.email, userEmail)).limit(1)
  )[0];

  if (existing) {
    await db
      .update(users)
      .set({ name: trimmed })
      .where(eq(users.id, existing.id));
  } else {
    const studentId = session.user.id || `usr-${Date.now().toString(36)}`;
    await db.insert(users).values({
      id: studentId,
      email: userEmail,
      name: trimmed,
      role: session.user.role || "student",
      createdAt: new Date(),
    });
  }

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin");

  return { success: true, name: trimmed };
}
