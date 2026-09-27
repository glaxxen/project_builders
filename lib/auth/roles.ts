/**
 * Resolves user role based on email.
 * Anyone who signs up becomes a "student" by default.
 * Matches against ADMIN_EMAILS (comma-separated list) get the "admin" role.
 */
export function getRoleForEmail(email?: string | null): "admin" | "student" {
  if (!email) return "student";

  const rawAdminEmails = process.env.ADMIN_EMAILS || "";
  const adminEmails = rawAdminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const normalizedEmail = email.trim().toLowerCase();
  return adminEmails.includes(normalizedEmail) ? "admin" : "student";
}
