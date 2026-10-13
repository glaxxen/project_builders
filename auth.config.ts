import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { getRoleForEmail } from "@/lib/auth/roles";

const googleId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;
const githubId = process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET;

const activeProviders: any[] = [];

if (googleId && googleSecret) {
  activeProviders.push(
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (githubId && githubSecret) {
  activeProviders.push(
    GitHub({
      clientId: githubId,
      clientSecret: githubSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: activeProviders,
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
