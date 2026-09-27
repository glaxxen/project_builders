"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, EnvelopeSimple, SpinnerGap, WarningCircle } from "@phosphor-icons/react";

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  function getInitialErrorMessage(param: string | null): string {
    if (!param) return "";
    if (param === "Configuration") {
      return "Resend free tier restriction: testing emails can only be delivered to your registered Resend email (twcfgdc@gmail.com). In development, your magic link is printed in your terminal console!";
    }
    if (param === "Verification") {
      return "Sign-in link was invalid or has expired. Please request a new one.";
    }
    return "Unable to sign in. Please try again or check terminal logs.";
  }

  const [errorMessage, setErrorMessage] = useState(getInitialErrorMessage(errorParam));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await signIn("resend", {
        email,
        callbackUrl,
        redirect: true,
        redirectTo: "/login/verify",
      });
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Unable to send sign-in link.";
      setErrorMessage(msg);
    }
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-8 sm:p-10 shadow-[0_2px_12px_rgba(16,32,56,0.06)] space-y-6">
      {/* Brand Insignia */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative w-16 h-16 rounded-xl bg-[#FAF8F3] border border-[#E8E2D6] p-2 flex items-center justify-center">
          <Image
            src="/brand/project_buillders_logo.PNG"
            alt="Project Builders Crest"
            fill
            sizes="64px"
            className="object-contain p-1.5"
            priority
          />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#102038]">
            Sign in to Platform
          </h1>
          <p className="text-xs uppercase tracking-widest font-mono font-semibold text-[#5BBFA4] mt-1">
            Passwordless Magic Link
          </p>
        </div>
      </div>

      <p className="text-sm font-sans text-[#4A5568] text-center leading-relaxed">
        Enter your email address. We&apos;ll send a single-use magic link directly to your inbox.
      </p>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] text-xs font-sans">
          <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-sans font-semibold tracking-wide text-[#102038] uppercase"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="builder@projectbuilders.dev"
              className="w-full px-4 py-3 pl-11 text-sm font-sans text-[#102038] bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg focus:outline-none focus:border-[#102038] focus:ring-1 focus:ring-[#102038] transition-colors placeholder:text-[#7E8B9B]"
            />
            <EnvelopeSimple
              size={18}
              weight="regular"
              className="absolute left-3.5 top-3.5 text-[#7E8B9B]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-sans font-semibold tracking-wide text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] active:bg-[#0A1424] rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <SpinnerGap size={18} weight="bold" className="animate-spin" />
              <span>Sending Magic Link...</span>
            </>
          ) : (
            <>
              <span>Send Magic Link</span>
              <ArrowRight size={16} weight="bold" />
            </>
          )}
        </button>
      </form>

      {/* Role Footnote */}
      <div className="pt-2 border-t border-[#E8E2D6] text-center">
        <p className="text-[11px] font-sans text-[#7E8B9B]">
          New builders automatically enroll as <span className="font-semibold text-[#102038]">Student</span>. Instructors and admins route per authorized roster.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAF8F3] text-[#102038] flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none">
      {/* Top Header Micro-Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
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

      {/* Centerpiece Sign-In Box wrapped in Suspense */}
      <main className="w-full max-w-md mx-auto my-auto">
        <Suspense
          fallback={
            <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-10 text-center text-sm font-sans text-[#7E8B9B]">
              Loading sign-in form...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Bottom Status Footer */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-[#7E8B9B] pt-4 border-t border-[#E8E2D6]">
        <div>© {new Date().getFullYear()} Project Builders.</div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#1E4D40] bg-[#EBF7F4] px-2 py-0.5 rounded font-semibold">
            Deterministic Engine
          </span>
          <span>•</span>
          <span>Next.js 15</span>
        </div>
      </footer>
    </div>
  );
}
