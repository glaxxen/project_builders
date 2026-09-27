"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F3] border-b border-[#E8E2D6] px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logotype */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#E8E2D6] p-1 flex items-center justify-center shrink-0">
            <Image
              src="/brand/project_buillders_logo.PNG"
              alt="Project Builders Crest"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-tight text-[#102038] tracking-tight">
              Project Builders
            </span>
            <span className="text-[10px] uppercase tracking-widest font-sans font-medium text-[#7E8B9B]">
              Build Real Experience
            </span>
          </div>
        </Link>

        {/* Live Cohort Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF7F4] border border-[#CDEAE2] text-xs text-[#1E4D40] font-sans font-medium">
          <span className="w-2 h-2 rounded-full bg-[#5BBFA4] animate-pulse" />
          <span>Active Cohort: <strong>Data Analysis (AfriMart)</strong></span>
          <span className="text-[#5BBFA4]">•</span>
          <span className="text-[#5B756C]">420 Students Active</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-sans font-medium text-[#4A5568]">
          <Link href="#dashboard-preview" className="hover:text-[#102038] transition-colors">
            AfriMart Dashboard
          </Link>
          <Link href="#curriculum" className="hover:text-[#102038] transition-colors">
            4-Week Projects
          </Link>
          <Link href="#rhythm" className="hover:text-[#102038] transition-colors">
            Cohort Cadence
          </Link>
          <Link href="#assessments" className="hover:text-[#102038] transition-colors">
            Assessment Engine
          </Link>
          <Link href="#faq" className="hover:text-[#102038] transition-colors">
            Course FAQ
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/student"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-sans font-semibold tracking-wide text-[#102038] bg-[#FFFFFF] border border-[#E8E2D6] rounded-md hover:bg-[#F3EFE6] transition-colors"
          >
            Student Portal
          </Link>
          <Link
            href="#curriculum"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-md transition-colors"
          >
            <span>View Brief</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}
