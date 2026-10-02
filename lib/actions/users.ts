"use server";

import { auth } from "@/auth";
import { updateUserName, ensureUserExists, updateUserRole } from "@/lib/db/queries/users";
import { revalidatePath } from "next/cache";

export async function updateStudentNameAction(newName: string): Promise<{ success: boolean; name?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized: Please sign in to update your profile." };
    }

    const trimmed = newName.trim();
    if (!trimmed || trimmed.length < 2) {
      return { success: false, error: "Please enter a valid full name (at least 2 characters)." };
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

    try {
      revalidatePath("/dashboard/student");
      revalidatePath("/dashboard/admin");
    } catch (e) {
      console.warn("revalidatePath error in updateStudentNameAction:", e);
    }

    return { success: true, name: trimmed };
  } catch (err: unknown) {
    console.error("updateStudentNameAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update profile name.",
    };
  }
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
