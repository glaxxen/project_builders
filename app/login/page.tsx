"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  GithubLogo,
  ShieldCheck,
  Sparkle,
  SpinnerGap,
  WarningCircle,
} from "@phosphor-icons/react";

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  function getInitialErrorMessage(param: string | null): string {
    if (!param) return "";
    if (param === "OAuthAccountNotLinked") {
      return "An account already exists with this email address. Please sign in with your primary OAuth provider.";
    }
    if (param === "Configuration") {
      return "Authentication setup in progress. Please contact the administrator.";
    }
    if (param === "AccessDenied") {
      return "Access denied. Please ensure you authorize the account to continue.";
    }
    return "Unable to complete sign in. Please try again.";
  }

  const [errorMessage, setErrorMessage] = useState(getInitialErrorMessage(errorParam));

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      await signIn("google", {
        callbackUrl,
      });
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      const msg = err instanceof Error ? err.message : "Unable to initiate Google sign-in.";
      setErrorMessage(msg);
    }
  }

  async function handleGithubSignIn() {
    setIsGithubLoading(true);
    setErrorMessage("");
    try {
      await signIn("github", {
        callbackUrl,
      });
    } catch (err: unknown) {
      setIsGithubLoading(false);
      const msg = err instanceof Error ? err.message : "Unable to initiate GitHub sign-in.";
      setErrorMessage(msg);
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-3xl p-8 sm:p-10 shadow-xl space-y-7 text-left"
    >
      {/* Brand Insignia */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative w-16 h-16 rounded-2xl bg-[#FAF8F3] border-2 border-[#102038]/15 p-2 flex items-center justify-center">
          <Image
            src="/brand/project_buillders_logo.PNG"
            alt="Project Builders"
            fill
            sizes="64px"
            className="object-contain p-1.5"
            priority
          />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#BA9C60]">
            <Sparkle size={14} weight="fill" />
            <span>Student &amp; Instructor Access</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#102038]">
            Sign in to Platform
          </h1>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-sans font-normal text-[#102038]/70 text-center leading-relaxed">
        One-click authorization. Use your Google or GitHub account to access your active cohort curriculum, weekly project briefs, and examinations.
      </p>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] text-xs font-sans">
          <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OAuth Action Buttons */}
      <div className="space-y-3">
        {/* Google 1-Click Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isGithubLoading}
          className="w-full inline-flex items-center justify-center gap-3.5 min-h-[56px] px-6 py-4 text-sm sm:text-base font-sans font-bold text-[#102038] bg-[#FFFFFF] hover:bg-[#FAF8F3] active:bg-[#F3EFE6] border-2 border-[#102038] rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGoogleLoading ? (
            <>
              <SpinnerGap size={20} weight="bold" className="animate-spin text-[#102038]" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* GitHub 1-Click Sign-In */}
        <button
          type="button"
          onClick={handleGithubSignIn}
          disabled={isGoogleLoading || isGithubLoading}
          className="w-full inline-flex items-center justify-center gap-3 min-h-[52px] px-6 py-3.5 text-sm sm:text-base font-sans font-bold text-[#FFFFFF] bg-[#102038] hover:bg-[#233B5F] active:bg-[#0A1424] rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGithubLoading ? (
            <>
              <SpinnerGap size={20} weight="bold" className="animate-spin text-[#FFFFFF]" />
              <span>Connecting to GitHub...</span>
            </>
          ) : (
            <>
              <GithubLogo size={22} weight="fill" className="text-[#FFFFFF]" />
              <span>Continue with GitHub</span>
            </>
          )}
        </button>
      </div>

      {/* Reassurance Notice */}
      <div className="bg-[#FAF8F3] border border-[#102038]/10 rounded-xl p-4 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#102038]">
          <ShieldCheck size={16} weight="bold" className="text-[#5BBFA4]" />
          <span>Zero Password Friction</span>
        </div>
        <p className="text-[11px] font-sans font-normal text-[#102038]/60 leading-normal">
          Students land directly on their active curriculum workspace. Instructors and administrators route to the grading console automatically.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen w-full bg-[#FAF8F3] text-[#102038] flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none"
    >
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-[#7E8B9B] hover:text-[#102038] transition-colors"
        >
          <ArrowLeft size={14} weight="bold" />
          <span className="w-2 h-2 rounded-full bg-[#5BBFA4]" />
          <span className="font-semibold text-[#102038]">Project Builders</span>
          <span>/</span>
          <span>Sign In</span>
        </Link>

        <div className="text-[11px] font-mono uppercase tracking-widest text-[#7E8B9B]">
          Build Real Experience
        </div>
      </header>

      {/* Centerpiece Sign-In Box */}
      <main suppressHydrationWarning className="w-full max-w-md mx-auto my-auto py-8">
        <Suspense
          fallback={
            <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-10 text-center text-sm font-sans text-[#7E8B9B]">
              Loading sign-in...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Bottom Status Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#7E8B9B] pt-4 border-t border-[#102038]/10">
        <div>&copy; {new Date().getFullYear()} Project Builders &bull; Data Analysis Cohort</div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#1E4D40] bg-[#EBF7F4] px-2.5 py-1 rounded-md font-semibold border border-[#5BBFA4]/30">
            One-Click OAuth Verified
          </span>
        </div>
      </footer>
    </div>
  );
}
