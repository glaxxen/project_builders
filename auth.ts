import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { ensureLocalUserExists } from "@/lib/db/sqlite-store";
import { ensureUserExists as ensureDbUserExists } from "@/lib/db/queries/users";
import { getRoleForEmail } from "@/lib/auth/roles";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (user?.email) {
        const cleanEmail = user.email.toLowerCase().trim();
        const role = getRoleForEmail(cleanEmail);

        try {
          // 1. Sync to local SQLite store (guaranteed sub-millisecond persistence)
          ensureLocalUserExists({
            id: user.id || undefined,
            email: cleanEmail,
            name: user.name || null,
            role: role as any,
          });

          // 2. Safe background sync to external DB if available (non-blocking)
          ensureDbUserExists({
            id: user.id || undefined,
            email: cleanEmail,
            name: user.name || null,
            role,
          }).catch((err) => {
            console.warn("[Auth] Background external DB sync warning (non-fatal):", err?.message || err);
          });
        } catch (err) {
          console.warn("[Auth] User persistence warning during signIn (non-fatal):", err);
        }
      }
      return true;
    },
  },
});
