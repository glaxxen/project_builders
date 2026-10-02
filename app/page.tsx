"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GithubLogo, SpinnerGap } from "@phosphor-icons/react";

export default function HomePage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  async function handleSignIn(provider: "google" | "github") {
    setLoadingProvider(provider);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      setLoadingProvider(null);
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="h-screen w-screen overflow-hidden bg-[#FAF8F3] text-[#102038] flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none"
    >
      {/* Top Header Micro-Bar */}
      <header className="entry-element w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#7E8B9B]">
          <span className="w-2 h-2 rounded-full bg-[#5BBFA4] animate-pulse" />
          <span className="font-semibold text-[#102038]">Project Builders</span>
          <span>/</span>
          <span>Learning Platform</span>
        </div>

        <div className="text-[11px] font-mono uppercase tracking-widest text-[#7E8B9B]">
          Build Real Experience
        </div>
      </header>

      {/* Centerpiece Hero Gateway (Single Viewport, Zero Scrolling) */}
      <main className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-7 my-auto">
        {/* Master Insignia Crest */}
        <div
          className="entry-element relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#FFFFFF] border-2 border-[#E8E2D6] p-3 shadow-[0_2px_12px_rgba(16,32,56,0.06)] flex items-center justify-center transition-colors"
        >
          <Image
            src="/brand/project_buillders_logo.PNG"
            alt="Project Builders Crest"
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-contain p-2"
            priority
          />
        </div>

        {/* Identity Headings */}
        <div className="entry-element space-y-2">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#102038]">
            Project Builders
          </h1>
          <p className="text-xs uppercase tracking-widest font-mono font-semibold text-[#5BBFA4]">
            Build Real Experience
          </p>
        </div>

        {/* The One Short Mission Sentence */}
        <p className="entry-element font-sans text-base sm:text-lg text-[#4A5568] leading-relaxed max-w-md">
          Practical, cohort-driven courses where builders gain real-world experience through industry datasets and verifiable proof of work.
        </p>

        {/* Dual OAuth Actions (Google & GitHub) */}
        <div className="entry-element pt-1 w-full max-w-xs space-y-2.5">
          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => handleSignIn("google")}
            disabled={loadingProvider !== null}
            className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 text-sm font-sans font-bold text-[#102038] bg-[#FFFFFF] hover:bg-[#FAF8F3] active:bg-[#F3EFE6] border-2 border-[#102038] rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingProvider === "google" ? (
              <>
                <SpinnerGap size={18} weight="bold" className="animate-spin text-[#102038]" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Sign In with Google</span>
              </>
            )}
          </button>

          {/* Continue with GitHub */}
          <button
            type="button"
            onClick={() => handleSignIn("github")}
            disabled={loadingProvider !== null}
            className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 text-sm font-sans font-bold text-[#FFFFFF] bg-[#102038] hover:bg-[#233B5F] active:bg-[#0A1424] rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingProvider === "github" ? (
              <>
                <SpinnerGap size={18} weight="bold" className="animate-spin text-[#FFFFFF]" />
                <span>Connecting to GitHub...</span>
              </>
            ) : (
              <>
                <GithubLogo size={20} weight="fill" className="text-[#FFFFFF]" />
                <span>Sign In with GitHub</span>
              </>
            )}
          </button>

          <p className="text-[11px] font-sans text-[#7E8B9B] pt-0.5">
            Instant one-click access for registered students and instructors.
          </p>
        </div>
      </main>

      {/* Bottom Legal / Status Footer */}
      <footer className="entry-element w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#7E8B9B] pt-4 border-t border-[#E8E2D6]">
        <div>
          © {new Date().getFullYear()} Project Builders. All rights reserved.
        </div>
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
