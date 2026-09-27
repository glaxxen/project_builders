"use client";

import { 
  FileArrowDown, 
  PresentationChart, 
  GitCommit, 
  SealCheck,
  Clock,
  ArrowRight
} from "@phosphor-icons/react";

interface CadenceStep {
  time: string;
  day: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: typeof FileArrowDown;
}

const STEPS: CadenceStep[] = [
  {
    day: "Day 01",
    time: "Monday 09:00 AM",
    title: "Raw Dataset & Brief Unlocked",
    subtitle: "Enterprise Data Drop",
    description: "Download the uncleaned transaction dataset (e.g. AfriMart 50k rows), data dictionary, dimension rubric, and core business questions.",
    badge: "Brief Released",
    icon: FileArrowDown,
  },
  {
    day: "Day 03",
    time: "Wednesday 07:00 PM",
    title: "Live Masterclass & Office Hours",
    subtitle: "Live Guided Lab",
    description: "Walkthrough of edge cases: accented character encodings (Côte d'Ivoire), Profit reconciliation logic, and pivot table modeling.",
    badge: "Live Interactive",
    icon: PresentationChart,
  },
  {
    day: "Day 05",
    time: "Friday 11:59 PM",
    title: "GitHub Submission Deadline",
    subtitle: "Public Proof of Work",
    description: "Submit your public GitHub repo containing your dashboard file, screenshot, and 3 written insights. System validates repo reachability automatically.",
    badge: "Hard Milestone",
    icon: GitCommit,
  },
  {
    day: "Instant",
    time: "Immediate on Submit",
    title: "Deterministic Checkpoint Quiz",
    subtitle: "Auto-Scored in Real Time",
    description: "Take the 10-question multiple-choice checkpoint tied directly to that week's dataset. Pre-defined answer logic scores you instantly with zero manual delays.",
    badge: "Zero AI Guesswork",
    icon: SealCheck,
  },
];

export function CohortRhythm() {
  return (
    <section id="rhythm" className="bg-[#FAF8F3] py-16 lg:py-24 border-b border-[#E8E2D6] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FFFFFF] border border-[#E8E2D6] text-xs font-mono uppercase tracking-wider text-[#102038]">
            <Clock size={14} weight="bold" className="text-[#C8A55B]" />
            <span>Weekly Operating Cadence</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#102038] tracking-tight">
            How a cohort week actually runs.
          </h2>
          <p className="font-sans text-[#4A5568] text-base leading-relaxed">
            No endless unguided video bingeing. Project Builders operates on a structured, weekly sprint cadence engineered to simulate a high-performance analytics team.
          </p>
        </div>

        {/* Structured Pipeline Timeline (Architectural Grid, NOT 3 Generic Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative p-6 rounded-xl bg-[#FFFFFF] border border-[#E8E2D6] flex flex-col justify-between"
              >
                {/* Step Index & Time Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#F3EFE6] mb-4">
                    <span className="font-mono text-xs font-bold text-[#102038] px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E8E2D6]">
                      {step.day}
                    </span>
                    <span className="text-[11px] font-mono text-[#7E8B9B]">
                      {step.time}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#102038] mb-3">
                    <Icon size={22} weight="duotone" />
                  </div>

                  <div className="text-xs font-mono uppercase tracking-wider text-[#5BBFA4] font-semibold mb-1">
                    {step.subtitle}
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#102038] tracking-tight mb-2">
                    {step.title}
                  </h3>

                  <p className="font-sans text-xs text-[#4A5568] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Verification Stamp */}
                <div className="mt-5 pt-3 border-t border-[#F3EFE6] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#7E8B9B]">Stage {idx + 1} of 4</span>
                  <span className="font-semibold text-[#102038] bg-[#FAF8F3] px-2 py-0.5 rounded border border-[#E8E2D6]">
                    {step.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Guarantee Callout */}
        <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E8E2D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EBF7F4] text-[#1E4D40] flex items-center justify-center shrink-0">
              <SealCheck size={18} weight="fill" />
            </div>
            <div>
              <strong className="text-[#102038] block sm:inline font-semibold">
                Strict GitHub Verification:
              </strong>{" "}
              <span className="text-[#4A5568]">
                Every project submission is permanently committed to your personal GitHub portfolio with structured READMEs and screenshot evidence.
              </span>
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#7E8B9B] shrink-0">
            Cohort Standard v1.0
          </span>
        </div>
      </div>
    </section>
  );
}
