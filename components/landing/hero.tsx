import Link from "next/link";
import { 
  Lightbulb, 
  ArrowRight, 
  CheckCircle, 
  Database, 
  GitBranch, 
  ShieldCheck,
  CalendarCheck
} from "@phosphor-icons/react";
import { DashboardMockup } from "./dashboard-mockup";

export function Hero() {

  return (
    <section className="relative bg-[#FAF8F3] pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E8E2D6] px-4 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10 lg:space-y-12">
        {/* Editorial Top Lockup */}
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Brand Crest Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E8E2D6] text-xs font-sans text-[#102038] shadow-[0_1px_3px_rgba(16,32,56,0.04)]">
            <div className="relative flex items-center justify-center text-[#C8A55B]">
              <Lightbulb size={18} weight="fill" />
            </div>
            <span className="font-semibold text-[#102038]">Project Builders</span>
            <span className="text-[#DCD5C5]">|</span>
            <span className="text-[#4A5568]">Build Real Experience</span>
            <span className="text-[#DCD5C5]">|</span>
            <span className="font-mono text-[#1E4D40] bg-[#EBF7F4] px-2 py-0.5 rounded font-semibold text-[11px]">
              Cohort 01 Live
            </span>
          </div>

          {/* Editorial Display Heading (Fraunces) */}
          <h1 className="hero-reveal font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#102038] tracking-tight leading-[1.12]">
            Stop watching tutorials. <br className="hidden sm:inline" />
            Build real dashboards with enterprise data.
          </h1>

          {/* Body Prose (Public Sans) */}
          <p className="hero-reveal font-sans text-base sm:text-lg text-[#4A5568] max-w-2xl mx-auto leading-relaxed">
            A 4-week, cohort-driven apprenticeship. You build executive-ready business intelligence projects from messy datasets like <strong>AfriMart</strong>, publish to GitHub, pass deterministic checkpoint assessments, and walk away with verified proof of work.
          </p>

          {/* Primary Action Row */}
          <div className="hero-reveal flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="#dashboard-preview"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors shadow-sm"
            >
              <span>Inspect Live Project Dashboard</span>
              <ArrowRight size={16} weight="bold" />
            </Link>

            <Link
              href="#curriculum"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-sans font-semibold text-[#102038] bg-[#FFFFFF] border border-[#E8E2D6] hover:bg-[#F3EFE6] rounded-lg transition-colors"
            >
              <span>View 4-Week Syllabus</span>
            </Link>
          </div>

          {/* Value Verification Badges */}
          <div className="hero-reveal pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-sans text-[#7E8B9B]">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={15} weight="fill" className="text-[#5BBFA4]" />
              <strong className="text-[#102038]">400+ Students</strong> in Current Cohort
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={15} weight="fill" className="text-[#5BBFA4]" />
              <strong className="text-[#102038]">Zero AI Grading</strong> (100% Deterministic)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={15} weight="fill" className="text-[#5BBFA4]" />
              <strong className="text-[#102038]">GitHub Proof of Work</strong> Each Week
            </span>
          </div>
        </div>

        {/* Dashboard Lead Visual Mockup (Explicitly Leading the Hero) */}
        <div id="dashboard-preview" className="pt-2">
          <div className="flex items-center justify-between pb-3 px-1 text-xs font-sans text-[#7E8B9B]">
            <span className="font-mono uppercase tracking-wider text-[11px] text-[#102038] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5BBFA4]" />
              Week 1 Deliverable: AfriMart Sales Intelligence Dashboard
            </span>
            <span className="hidden sm:inline font-mono text-[11px]">
              Dataset: 50,000+ Transactions Across 6 African Nations
            </span>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
