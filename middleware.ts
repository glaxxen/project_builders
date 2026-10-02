import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user?.role as "admin" | "student") || "student";
  const { pathname } = req.nextUrl;

  // 1. If user is at /login or /login/verify and already authenticated, redirect to role dashboard
  if (pathname === "/login" || pathname === "/login/verify") {
    if (isLoggedIn) {
      const destination = userRole === "admin" ? "/dashboard/admin" : "/dashboard/student";
      return NextResponse.redirect(new URL(destination, req.url));
    }
    return NextResponse.next();
  }

  // 2. Protected /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Allow development preview to inspect dashboard without hitting OAuth redirect
    if (process.env.NODE_ENV === "development" && (req.nextUrl.searchParams.get("preview") === "student" || req.nextUrl.searchParams.get("preview") === "admin")) {
      return NextResponse.next();
    }

    // Unauthenticated access -> redirect to login with callback
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Generic /dashboard root -> redirect to role-specific dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      const destination = userRole === "admin" ? "/dashboard/admin" : "/dashboard/student";
      return NextResponse.redirect(new URL(destination, req.url));
    }

    // Role-based route protection:
    // Students visiting /dashboard/admin -> redirect to /dashboard/student
    if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/student", req.url));
    }

    // Admins visiting /dashboard/student -> redirect to /dashboard/admin
    if (pathname.startsWith("/dashboard/student") && userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/login/verify",
  ],
};
