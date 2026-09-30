"use server";

import { auth } from "@/auth";
import { updateUserName, ensureUserExists } from "@/lib/db/queries/users";
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

  // Ensure user exists first
  await ensureUserExists({
    id: session.user.id,
    email: userEmail,
    name: trimmed,
    role: session.user.role,
  });

  // Update their display name
  await updateUserName(userEmail, trimmed);

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin");

  return { success: true, name: trimmed };
}
