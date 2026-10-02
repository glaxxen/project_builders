"use server";

import { auth } from "@/auth";
import { updateUserName, ensureUserExists, updateUserRole } from "@/lib/db/queries/users";
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

export async function adminUpdateUserRoleAction(data: {
  email: string;
  role: "admin" | "student";
}) {
  const session = await auth();
  const callerRole = session?.user?.role;
  const isDev = process.env.NODE_ENV === "development";

  // Allow in development preview or if authenticated as admin
  if (!isDev && callerRole !== "admin") {
    throw new Error("Unauthorized: Only administrators can modify roles.");
  }

  const cleanEmail = data.email.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please provide a valid email address.");
  }

  const updated = await updateUserRole(cleanEmail, data.role);

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/student");

  return {
    success: true,
    message: data.role === "admin"
      ? `Granted Administrator role to ${cleanEmail}.`
      : `Set role to Student for ${cleanEmail}.`,
    user: updated,
  };
}
