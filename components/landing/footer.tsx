"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-[#102038] text-[#FAF8F3] border-t border-[#233B5F] px-4 lg:px-8 py-12 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-lg bg-[#233B5F] border border-[#335384] p-1 flex items-center justify-center">
                <Image
                  src="/brand/project_buillders_logo.PNG"
                  alt="Project Builders"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-[#FAF8F3] block leading-tight">
                  Project Builders
                </span>
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#77CBB3]">
                  Build Real Experience
                </span>
              </div>
            </div>

            <p className="text-xs text-[#FAF8F3]/70 max-w-sm leading-relaxed">
              Cohort-based, project-driven practical learning. We replace PDF briefs and manual spreadsheet submissions with a reusable, scalable learning engine.
            </p>

            <div className="text-[11px] font-mono text-[#FAF8F3]/50">
              Zero AI Grading • 100% Deterministic Verification
            </div>
          </div>

          {/* Column 1: Projects */}
          <div className="space-y-3 text-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#C8A55B] font-semibold block">
              Curriculum
            </span>
            <ul className="space-y-2 text-[#FAF8F3]/80">
              <li>
                <Link href="#dashboard-preview" className="hover:text-[#5BBFA4] transition-colors">
                  Week 1: AfriMart Sales Intelligence
                </Link>
              </li>
              <li>
                <Link href="#curriculum" className="hover:text-[#5BBFA4] transition-colors">
                  Week 2: FinTech Churn Forensics
                </Link>
              </li>
              <li>
                <Link href="#curriculum" className="hover:text-[#5BBFA4] transition-colors">
                  Week 3: Logistics SLAs
                </Link>
              </li>
              <li>
                <Link href="#curriculum" className="hover:text-[#5BBFA4] transition-colors">
                  Week 4: Executive Capstone
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform Standards */}
          <div className="space-y-3 text-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#C8A55B] font-semibold block">
              Architecture
            </span>
            <ul className="space-y-2 text-[#FAF8F3]/80">
              <li>
                <Link href="#rhythm" className="hover:text-[#5BBFA4] transition-colors">
                  Weekly Operating Rhythm
                </Link>
              </li>
              <li>
                <Link href="#assessments" className="hover:text-[#5BBFA4] transition-colors">
                  Deterministic Scoring Engine
                </Link>
              </li>
              <li>
                <Link href="/dashboard/student" className="hover:text-[#5BBFA4] transition-colors">
                  Student Submission Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-[#5BBFA4] transition-colors">
                  Admin Cohort Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3 text-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#C8A55B] font-semibold block">
              Student Guides
            </span>
            <ul className="space-y-2 text-[#FAF8F3]/80">
              <li>
                <Link href="#faq" className="hover:text-[#5BBFA4] transition-colors">
                  Course Technical FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#5BBFA4] transition-colors"
                >
                  <span>GitHub Repository Setup</span>
                  <ArrowUpRight size={11} weight="bold" />
                </a>
              </li>
              <li>
                <Link href="#dashboard-preview" className="hover:text-[#5BBFA4] transition-colors">
                  AfriMart Rubric (100% Weight)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#233B5F] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF8F3]/50 font-mono">
          <div>
            © {new Date().getFullYear()} Project Builders. Built with Next.js 15, TypeScript & Tailwind CSS v4.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#5BBFA4]">Status: Cohort 01 Running</span>
            <span>•</span>
            <span>Deterministic Assessment Core</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
