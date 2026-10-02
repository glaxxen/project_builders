import { db } from "../index";
import { users, type User } from "../schema";
import { eq } from "drizzle-orm";
import {
  shouldUseRest,
  restGet,
  restInsert,
  restUpdate,
} from "../rest-fallback";

export async function getUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();

  if (shouldUseRest()) {
    const list = await restGet<User[]>("user", `email=eq.${encodeURIComponent(cleanEmail)}&limit=1`);
    return list?.[0] || null;
  }

  try {
    const res = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);
    return res[0] || null;
  } catch (err) {
    console.warn("Direct DB user query failed, falling back to REST:", err);
    const list = await restGet<User[]>("user", `email=eq.${encodeURIComponent(cleanEmail)}&limit=1`);
    return list?.[0] || null;
  }
}

export async function ensureUserExists(data: {
  id?: string;
  email: string;
  name?: string | null;
  role?: string;
}): Promise<User> {
  const cleanEmail = data.email.toLowerCase().trim();
  const existing = await getUserByEmail(cleanEmail);
  if (existing) return existing;

  const id = data.id || `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const newUser = {
    id,
    email: cleanEmail,
    name: data.name || cleanEmail.split("@")[0],
    role: data.role || "student",
    createdAt: new Date().toISOString(),
  };

  if (shouldUseRest()) {
    const inserted = await restInsert<User[]>("user", newUser);
    if (inserted?.[0]) return inserted[0];
  }

  try {
    const [created] = await db
      .insert(users)
      .values({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: new Date(),
      })
      .returning();
    if (created) return created;
  } catch (err) {
    console.warn("Direct DB user insert failed, falling back to REST:", err);
    const inserted = await restInsert<User[]>("user", newUser);
    if (inserted?.[0]) return inserted[0];
  }

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name ?? null,
    role: newUser.role,
    image: null,
    emailVerified: null,
    createdAt: new Date(),
  };
}

export async function updateUserName(emailOrId: string, newName: string): Promise<User | null> {
  const trimmed = newName.trim();
  const isEmail = emailOrId.includes("@");

  if (shouldUseRest()) {
    const filter = isEmail
      ? `email=eq.${encodeURIComponent(emailOrId.toLowerCase().trim())}`
      : `id=eq.${encodeURIComponent(emailOrId)}`;
    const updated = await restUpdate<User[]>("user", filter, {
      name: trimmed,
    });
    return updated?.[0] || null;
  }

  try {
    const condition = isEmail
      ? eq(users.email, emailOrId.toLowerCase().trim())
      : eq(users.id, emailOrId);
    const [updated] = await db
      .update(users)
      .set({ name: trimmed })
      .where(condition)
      .returning();
    return updated || null;
  } catch (err) {
    console.warn("Direct DB user update failed, falling back to REST:", err);
    const filter = isEmail
      ? `email=eq.${encodeURIComponent(emailOrId.toLowerCase().trim())}`
      : `id=eq.${encodeURIComponent(emailOrId)}`;
    const updated = await restUpdate<User[]>("user", filter, {
      name: trimmed,
    });
    return updated?.[0] || null;
  }
}

export async function getAllAdmins(): Promise<User[]> {
  if (shouldUseRest()) {
    const list = await restGet<User[]>("user", "role=eq.admin&order=createdAt.desc");
    return list || [];
  }

  try {
    return await db.select().from(users).where(eq(users.role, "admin"));
  } catch (err) {
    console.warn("Direct DB getAllAdmins failed, falling back to REST:", err);
    const list = await restGet<User[]>("user", "role=eq.admin&order=createdAt.desc");
    return list || [];
  }
}

export async function updateUserRole(emailOrId: string, role: "admin" | "student"): Promise<User | null> {
  const cleanEmail = emailOrId.toLowerCase().trim();
  const isEmail = cleanEmail.includes("@");

  if (isEmail) {
    // Ensure user row exists so role persists
    await ensureUserExists({
      email: cleanEmail,
      role,
    });
  }

  if (shouldUseRest()) {
    const filter = isEmail
      ? `email=eq.${encodeURIComponent(cleanEmail)}`
      : `id=eq.${encodeURIComponent(cleanEmail)}`;
    const updated = await restUpdate<User[]>("user", filter, {
      role,
    });
    return updated?.[0] || null;
  }

  try {
    const condition = isEmail
      ? eq(users.email, cleanEmail)
      : eq(users.id, cleanEmail);
    const [updated] = await db
      .update(users)
      .set({ role })
      .where(condition)
      .returning();
    return updated || null;
  } catch (err) {
    console.warn("Direct DB updateUserRole failed, falling back to REST:", err);
    const filter = isEmail
      ? `email=eq.${encodeURIComponent(cleanEmail)}`
      : `id=eq.${encodeURIComponent(cleanEmail)}`;
    const updated = await restUpdate<User[]>("user", filter, {
      role,
    });
    return updated?.[0] || null;
  }
}
