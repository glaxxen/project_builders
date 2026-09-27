"use client";

import { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Lightning, 
  ShieldCheck, 
  Cpu, 
  ArrowClockwise 
} from "@phosphor-icons/react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

const SAMPLE_QUESTION = {
  week: "Week 01 Checkpoint Assessment",
  dataset: "AfriMart_Sales_Dataset.xlsx",
  title: "Formula & Mathematical Accuracy Check",
  prompt: "In the AfriMart dataset for the Nigeria market, Gross Revenue is $582,400 and Cost of Goods Sold is $396,032. What is the verified Gross Profit Margin percentage, and what formula must be used?",
  options: [
    {
      id: "opt-a",
      text: "28.5% — calculated as (Revenue − Cost) / Cost",
      isCorrect: false,
      explanation: "Incorrect. Profit Margin divides gross profit by Total Revenue, not by Cost (which would calculate markup).",
    },
    {
      id: "opt-b",
      text: "32.0% — calculated as (Revenue − Cost) / Revenue",
      isCorrect: true,
      explanation: "Correct! Profit = $582,400 − $396,032 = $186,368. Margin % = ($186,368 / $582,400) × 100 = 32.0%.",
    },
    {
      id: "opt-c",
      text: "35.2% — calculated by averaging the individual transaction margins",
      isCorrect: false,
      explanation: "Incorrect. Averaging percentages without weighting introduces severe mathematical distortion (Simpson's paradox).",
    },
    {
      id: "opt-d",
      text: "30.0% — manually rounded from approximate regional targets",
      isCorrect: false,
      explanation: "Incorrect. Per rubric rule #5, numbers must be strictly derived from formulas rather than typed or rounded manually.",
    },
  ],
};

export function AssessmentSpotlight() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const selectedOption = SAMPLE_QUESTION.options.find((o) => o.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setHasSubmitted(true);
  };

  const handleReset = () => {
    setSelectedId(null);
    setHasSubmitted(false);
  };

  return (
    <section id="assessments" className="bg-[#FAF8F3] py-16 lg:py-24 border-b border-[#E8E2D6] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FFFFFF] border border-[#E8E2D6] text-xs font-mono uppercase tracking-wider text-[#102038]">
              <Lightning size={14} weight="fill" className="text-[#C8A55B]" />
              <span>Deterministic Scoring • Zero AI Hallucination</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#102038] tracking-tight">
              Instant feedback. <br />
              100% deterministic auto-marking.
            </h2>
            <p className="font-sans text-[#4A5568] text-base leading-relaxed">
              We never use AI to guess or grade your work. Every quiz question has a pre-defined mathematical truth stored in the database. When you submit, pure deterministic logic computes your score in milliseconds.
            </p>

            {/* Architecture Comparison Specs */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E8E2D6] flex items-start gap-3 text-xs font-sans">
                <CheckCircle size={18} weight="fill" className="text-[#5BBFA4] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#102038] font-semibold">Immediate Score & Diagnostic:</strong>
                  <span className="text-[#4A5568] block">
                    You see your exact percentage and detailed question-by-question breakdown immediately. No waiting 2 weeks for TA grading.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E8E2D6] flex items-start gap-3 text-xs font-sans">
                <ShieldCheck size={18} weight="fill" className="text-[#5BBFA4] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#102038] font-semibold">Admin Dashboard Synchronization:</strong>
                  <span className="text-[#4A5568] block">
                    Course instructors instantly see cohort-wide mastery distributions in a single high-performance table.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Quiz Simulator (6 Cols) */}
          <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(16,32,56,0.04)] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D6] text-xs font-mono">
              <span className="text-[#102038] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5BBFA4]" />
                {SAMPLE_QUESTION.week}
              </span>
              <span className="text-[#7E8B9B]">Live Interactive Preview</span>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7E8B9B]">
                {SAMPLE_QUESTION.title}
              </span>
              <p className="font-display font-bold text-base sm:text-lg text-[#102038] leading-snug">
                {SAMPLE_QUESTION.prompt}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {SAMPLE_QUESTION.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                let borderStyle = "border-[#E8E2D6] hover:bg-[#FAF8F3]";
                let badgeStyle = "bg-[#FAF8F3] text-[#102038]";

                if (hasSubmitted) {
                  if (opt.isCorrect) {
                    borderStyle = "border-[#5BBFA4] bg-[#EBF7F4]";
                    badgeStyle = "bg-[#5BBFA4] text-[#FAF8F3]";
                  } else if (isSelected && !opt.isCorrect) {
                    borderStyle = "border-[#E53E3E] bg-[#FFF5F5]";
                    badgeStyle = "bg-[#E53E3E] text-[#FAF8F3]";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left p-3.5 rounded-lg border text-xs font-sans transition-all flex items-start gap-3 ${borderStyle}`}
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 ${badgeStyle}`}>
                      {opt.id.split("-")[1]?.toUpperCase()}
                    </span>
                    <span className="text-[#102038] font-medium leading-relaxed">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Drawer */}
            {hasSubmitted && selectedOption && (
              <div
                className={`p-4 rounded-xl border text-xs font-sans space-y-1.5 ${
                  selectedOption.isCorrect
                    ? "bg-[#EBF7F4] border-[#5BBFA4] text-[#1E4D40]"
                    : "bg-[#FFF5F5] border-[#E53E3E] text-[#742A2A]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    {selectedOption.isCorrect ? (
                      <>
                        <CheckCircle size={16} weight="fill" className="text-[#5BBFA4]" />
                        <span>Verified Correct (+10 Points)</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} weight="fill" className="text-[#E53E3E]" />
                        <span>Incorrect Selection</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-[11px] font-mono underline hover:opacity-80"
                  >
                    <ArrowClockwise size={12} weight="bold" />
                    <span>Try Again</span>
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedOption.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
