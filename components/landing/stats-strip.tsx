"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users, FileCode, CheckSquareOffset, Trophy } from "@phosphor-icons/react";

interface StatItem {
  id: string;
  target: number;
  suffix: string;
  label: string;
  description: string;
  icon: typeof Users;
}

const STATS: StatItem[] = [
  {
    id: "stat-students",
    target: 420,
    suffix: "+",
    label: "Active Cohort Builders",
    description: "400+ enrolled students working on live dataset challenges weekly.",
    icon: Users,
  },
  {
    id: "stat-projects",
    target: 4,
    suffix: " Weeks",
    label: "Enterprise Datasets",
    description: "From AfriMart e-commerce to FinTech churn and supply chains.",
    icon: FileCode,
  },
  {
    id: "stat-deterministic",
    target: 100,
    suffix: "%",
    label: "Deterministic Scoring",
    description: "Instant, objective auto-grading on quizzes. Zero subjective delays.",
    icon: CheckSquareOffset,
  },
  {
    id: "stat-completion",
    target: 96,
    suffix: "%",
    label: "Checkpoint Submission Rate",
    description: "High accountability via weekly live classes and GitHub milestones.",
    icon: Trophy,
  },
];

export function StatsStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      STATS.forEach((s) => {
        const el = countersRef.current[s.id];
        if (el) el.innerText = `${s.target}${s.suffix}`;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            STATS.forEach((stat) => {
              const el = countersRef.current[stat.id];
              if (!el) return;

              const counterObj = { val: 0 };
              gsap.to(counterObj, {
                val: stat.target,
                duration: 1.8,
                ease: "power2.out",
                onUpdate: () => {
                  el.innerText = `${Math.floor(counterObj.val)}${stat.suffix}`;
                },
              });
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="bg-[#FAF8F3] py-12 lg:py-16 border-b border-[#E8E2D6] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((s) => {
            const IconComponent = s.icon;
            return (
              <div
                key={s.id}
                className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E8E2D6] shadow-[0_1px_3px_rgba(16,32,56,0.04)] flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#102038] mb-4">
                    <IconComponent size={22} weight="duotone" />
                  </div>
                  <div className="font-display text-3xl sm:text-4xl font-bold text-[#102038] tracking-tight">
                    <span ref={(el) => { countersRef.current[s.id] = el; }}>
                      0{s.suffix}
                    </span>
                  </div>
                  <div className="mt-1 font-sans font-semibold text-sm text-[#102038]">
                    {s.label}
                  </div>
                </div>
                <p className="mt-3 text-xs font-sans text-[#7E8B9B] leading-relaxed pt-3 border-t border-[#F3EFE6]">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
