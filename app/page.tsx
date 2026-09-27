"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, SignIn, Sparkle } from "@phosphor-icons/react";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Gentle entrance reveal
      gsap.from(".entry-element", {
        y: 16,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
      });

      // Subtle breath on logo crest border
      gsap.to(logoRef.current, {
        borderColor: "#BA9C60",
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
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
          ref={logoRef}
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

        {/* Primary Login Action */}
        <div className="entry-element pt-2 w-full max-w-xs space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-sans font-semibold tracking-wide text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] active:bg-[#0A1424] rounded-lg transition-colors shadow-sm"
          >
            <SignIn size={18} weight="bold" />
            <span>Sign In to Platform</span>
            <ArrowRight size={15} weight="bold" />
          </Link>

          <p className="text-[11px] font-sans text-[#7E8B9B]">
            Registered student or instructor? Sign in to access your active cohort.
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
