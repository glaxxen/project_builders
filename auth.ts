import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { getRoleForEmail } from "@/lib/auth/roles";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  events: {
    async createUser({ user }) {
      if (user.email) {
        try {
          const role = getRoleForEmail(user.email);
          if (role === "admin") {
            await db
              .update(users)
              .set({ role: "admin" })
              .where(eq(users.email, user.email));
          }
        } catch (err) {
          console.warn("Could not update role in createUser event:", err);
        }
      }
    },
    async linkAccount({ user }) {
      if (user.email) {
        try {
          const role = getRoleForEmail(user.email);
          await db
            .update(users)
            .set({ role })
            .where(eq(users.email, user.email));
        } catch (err) {
          console.warn("Could not update role in linkAccount event:", err);
        }
      }
    },
  },
});
