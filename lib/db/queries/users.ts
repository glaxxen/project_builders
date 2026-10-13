import { db } from "../index";
import { users, type User } from "../schema";
import { eq } from "drizzle-orm";
import {
  getLocalUserByEmail,
  ensureLocalUserExists,
  updateLocalUserName,
  getAllLocalUsers,
  type UserRecord,
} from "../sqlite-store";

function toSchemaUser(local: UserRecord): User {
  return {
    id: local.id,
    name: local.name,
    email: local.email,
    role: local.role,
    image: null,
    emailVerified: null,
    createdAt: new Date(local.createdAt),
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();

  // Fast local SQLite check
  const local = getLocalUserByEmail(cleanEmail);
  if (local) {
    return toSchemaUser(local);
  }

  // Attempt Drizzle DB if connected
  try {
    const res = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);
    if (res[0]) {
      // Sync to local
      ensureLocalUserExists({
        id: res[0].id,
        email: res[0].email,
        name: res[0].name,
        role: res[0].role as any,
      });
      return res[0];
    }
  } catch {
    // DB offline, rely on local SQLite
  }

  return null;
}

export async function ensureUserExists(data: {
  id?: string;
  email: string;
  name?: string | null;
  role?: string;
}): Promise<User> {
  const cleanEmail = data.email.toLowerCase().trim();

  const local = ensureLocalUserExists({
    id: data.id,
    email: cleanEmail,
    name: data.name,
    role: (data.role as any) || "student",
  });

  // Background sync to Drizzle if connected
  try {
    await db
      .insert(users)
      .values({
        id: local.id,
        email: local.email,
        name: local.name,
        role: local.role,
        createdAt: new Date(local.createdAt),
      })
      .onConflictDoNothing();
  } catch {
    // DB offline
  }

  return toSchemaUser(local);
}

export async function updateUserName(emailOrId: string, newName: string): Promise<User | null> {
  const trimmed = newName.trim();
  const updatedLocal = updateLocalUserName(emailOrId, trimmed);

  // Background sync to Drizzle if connected
  try {
    const isEmail = emailOrId.includes("@");
    const condition = isEmail
      ? eq(users.email, emailOrId.toLowerCase().trim())
      : eq(users.id, emailOrId);
    await db
      .update(users)
      .set({ name: trimmed })
      .where(condition);
  } catch {
    // DB offline
  }

  return updatedLocal ? toSchemaUser(updatedLocal) : null;
}

export async function getAllAdmins(): Promise<User[]> {
  const allUsers = getAllLocalUsers();
  return allUsers.filter((u) => u.role === "admin").map(toSchemaUser);
}

export async function updateUserRole(emailOrId: string, role: "admin" | "student"): Promise<User | null> {
  const cleanEmail = emailOrId.toLowerCase().trim();
  const existing = await ensureUserExists({
    email: cleanEmail,
    role,
  });

  const updatedLocal = updateLocalUserName(cleanEmail, existing.name || cleanEmail.split("@")[0]);
  return updatedLocal ? toSchemaUser(updatedLocal) : existing;
}
