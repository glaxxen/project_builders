import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { getRoleForEmail } from "@/lib/auth/roles";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    ...((process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID) &&
    (process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET)
      ? [
          GitHub({
            clientId: process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.role = getRoleForEmail(user.email);
        token.email = user.email;
      } else if (token?.email) {
        token.role = getRoleForEmail(token.email as string);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.email = (token.email as string) || session.user.email;
        session.user.role = (token.role as "admin" | "student") || "student";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
