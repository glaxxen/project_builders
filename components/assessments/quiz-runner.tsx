"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import type { AssessmentWithQuestions } from "@/lib/db/queries/assessments";
import { submitAssessmentAction, type GradeResult } from "@/lib/actions/assessments";
import {
  ArrowLeft,
  CheckCircle,
  GraduationCap,
  Printer,
  Sparkle,
  SpinnerGap,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";

interface QuizRunnerProps {
  assessment: AssessmentWithQuestions;
  existingScore?: {
    scorePercentage: number;
    completedAt: Date;
  } | null;
}

export function QuizRunner({ assessment, existingScore }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<GradeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScoreRevealed, setIsScoreRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(media.matches);
    }
  }, []);

  const totalQuestions = assessment.questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return; // Prevent changing after submission
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleScoreRevealed = useCallback(() => {
    setIsScoreRevealed(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (answeredCount < totalQuestions) {
      setErrorMsg(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    startTransition(async () => {
      try {
        const gradeResult = await submitAssessmentAction(assessment.id, answers);
        setResult(gradeResult);
        setIsScoreRevealed(prefersReducedMotion);
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to submit assessment.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4 text-left">
      {/* Quiz Header */}
      <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-xl p-6 sm:p-8 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-sans text-[#7E8B9B] hover:text-[#102038] transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Back to workspace</span>
          </Link>

          <div className="flex items-center gap-2">
            {assessment.isFinal ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#8C6D23] bg-[#FDF8ED] border border-[#BA9C60]/30 px-3 py-1 rounded-lg">
                <Sparkle size={13} weight="fill" />
                <span>Capstone final exam</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#1E4D40] bg-[#EBF7F4] border border-[#77CBB3]/40 px-3 py-1 rounded-lg">
                <GraduationCap size={14} weight="bold" />
                <span>Weekly checkpoint</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102038] tracking-tight">
            {assessment.title}
          </h1>
          <p className="text-sm font-sans text-[#4A5568]">
            Passing benchmark: <strong className="text-[#102038]">{assessment.passingScore}%</strong>. Instant deterministic auto-grading.
          </p>
        </div>

        {/* Existing score alert if previously completed */}
        {existingScore && !result && (
          <div className="bg-[#FAF8F3] border border-[#102038]/15 rounded-lg p-3.5 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} weight="fill" className="text-[#5BBFA4]" />
              <span>
                Previous attempt recorded:{" "}
                <strong className="text-[#102038]">{existingScore.scorePercentage}%</strong> on{" "}
                {new Date(existingScore.completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <span className="text-[#7E8B9B]">Retakes update your official record</span>
          </div>
        )}

        {/* Progress indicator (prior to submission) */}
        {!result && (
          <div className="space-y-1.5 pt-2 border-t border-[#102038]/10 text-left">
            <div className="flex items-center justify-between text-xs font-sans text-[#7E8B9B]">
              <span>Progress</span>
              <span>
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#FAF8F3] border border-[#102038]/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#102038] transition-all duration-200 motion-reduce:transition-none"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Graded Result Card: Single animated count-up moment */}
      {result && (
        <QuizScoreRevealCard
          result={result}
          isScoreRevealed={isScoreRevealed}
          onScoreRevealed={handleScoreRevealed}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-[#B91C1C] text-xs font-sans px-4 py-3 rounded-lg flex items-center gap-2">
          <WarningCircle size={16} weight="bold" className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Questions Form (Prior to submission) */}
      {!result && (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {assessment.questions.map((q, index) => {
            const selectedOptionId = answers[q.id];

            return (
              <div
                key={q.id}
                className={`bg-[#FFFFFF] border rounded-xl p-5 sm:p-6 space-y-4 transition-colors motion-reduce:transition-none text-left ${
                  selectedOptionId ? "border-[#102038]/40" : "border-[#102038]/15"
                }`}
              >
                {/* Question Number */}
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-[#102038] bg-[#FAF8F3] border border-[#102038]/15 px-2.5 py-1 rounded">
                    Question {index + 1} of {totalQuestions}
                  </span>
                  <span className="text-[#7E8B9B]">{q.points} points</span>
                </div>

                {/* Prompt */}
                <h3 className="font-sans font-semibold text-base text-[#102038] leading-relaxed">
                  {q.prompt}
                </h3>

                {/* Options */}
                <div className="space-y-2 pt-1 text-left">
                  {q.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;

                    let optionBorder = "border-[#102038]/15 bg-[#FAF8F3] hover:border-[#102038]/40";
                    if (isSelected) {
                      optionBorder = "border-[#102038] bg-[#FFFFFF] ring-1 ring-[#102038]";
                    }

                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs sm:text-sm font-sans transition-colors cursor-pointer text-left min-h-[44px] ${optionBorder}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => handleSelectOption(q.id, opt.id)}
                          className="mt-0.5 text-[#102038] focus:ring-[#102038] cursor-pointer"
                        />
                        <span className="flex-1 text-[#102038] leading-relaxed">
                          {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Submit Actions */}
          <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-sans text-[#7E8B9B]">
              Deterministic auto-grading evaluates instantly upon submission.
            </div>

            <button
              type="submit"
              disabled={isPending || answeredCount < totalQuestions}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <SpinnerGap size={15} weight="bold" className="animate-spin" />
                  <span>Computing grade...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} weight="bold" />
                  <span>Submit &amp; calculate grade</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Post-Grading: Per-question breakdown with a simple fade-in (no slide, no bounce, no stagger) */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isScoreRevealed ? 1 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
          className="space-y-4 text-left"
        >
          <div className="border-b border-[#102038]/10 pb-2">
            <h2 className="font-display font-bold text-lg text-[#102038]">
              Per-question breakdown
            </h2>
            <p className="text-xs font-sans text-[#7E8B9B]">
              Review your answers, correct solutions, and analytical rationales.
            </p>
          </div>

          {assessment.questions.map((q, index) => {
            const breakdownItem = result.breakdown.find((b) => b.questionId === q.id);
            const isCorrect = breakdownItem?.isCorrect;

            return (
              <div
                key={q.id}
                className={`bg-[#FFFFFF] border border-[#102038]/15 border-l-4 ${
                  isCorrect ? "border-l-[#5BBFA4]" : "border-l-[#B91C1C]"
                } rounded-xl p-5 sm:p-6 space-y-3.5 text-left`}
              >
                {/* Question Status */}
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-[#102038] bg-[#FAF8F3] border border-[#102038]/15 px-2.5 py-1 rounded">
                    Question {index + 1} of {totalQuestions}
                  </span>

                  {isCorrect ? (
                    <span className="text-[#1E4D40] font-medium flex items-center gap-1.5 bg-[#EBF7F4] px-2.5 py-1 rounded-lg border border-[#77CBB3]/40">
                      <CheckCircle size={14} weight="fill" className="text-[#5BBFA4]" />
                      <span>Correct (+{q.points} pts)</span>
                    </span>
                  ) : (
                    <span className="text-[#B91C1C] font-medium flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                      <XCircle size={14} weight="fill" className="text-[#B91C1C]" />
                      <span>Incorrect (0 pts)</span>
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <h3 className="font-sans font-semibold text-sm sm:text-base text-[#102038] leading-relaxed">
                  {q.prompt}
                </h3>

                {/* Options display with correct/user selections */}
                <div className="space-y-2 pt-1 text-left">
                  {q.options.map((opt) => {
                    const isCorrectAnswer = breakdownItem?.correctOptionId === opt.id;
                    const isUserSelection = breakdownItem?.selectedOptionId === opt.id;

                    let optionBorder = "border-[#102038]/10 bg-[#FFFFFF] opacity-70";
                    if (isCorrectAnswer) {
                      optionBorder = "border-[#5BBFA4] bg-[#EBF7F4] text-[#1E4D40] font-medium";
                    } else if (isUserSelection && !isCorrect) {
                      optionBorder = "border-red-300 bg-red-50 text-[#B91C1C]";
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-xs sm:text-sm font-sans text-left ${optionBorder}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCorrectAnswer ? (
                            <CheckCircle size={14} weight="fill" className="text-[#5BBFA4]" />
                          ) : isUserSelection ? (
                            <XCircle size={14} weight="fill" className="text-[#B91C1C]" />
                          ) : (
                            <span className="w-3.5 h-3.5 block rounded-full border border-[#102038]/20" />
                          )}
                        </div>
                        <span className="leading-relaxed flex-1">{opt.text}</span>
                        {isCorrectAnswer && (
                          <span className="text-[11px] font-semibold text-[#1E4D40] shrink-0">
                            Correct answer
                          </span>
                        )}
                        {isUserSelection && !isCorrectAnswer && (
                          <span className="text-[11px] font-semibold text-[#B91C1C] shrink-0">
                            Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Rationale & Explanation */}
                {breakdownItem?.explanation && (
                  <div className="bg-[#FAF8F3] border-l-4 border-l-[#102038] p-3.5 rounded-r-lg text-xs font-sans text-[#4A5568] space-y-1">
                    <div className="font-semibold text-[#102038]">
                      Rationale and explanation:
                    </div>
                    <p className="leading-relaxed">{breakdownItem.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Return button */}
          <div className="pt-2">
            <Link
              href="/dashboard/student"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Return to student workspace</span>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * The single animated moment on the entire site:
 * 1. Count-up number animation from 0 to final percentage (or immediate if prefers-reduced-motion).
 * 2. Simple fade-in of the pass/fail badge (no slide, no bounce).
 */
function QuizScoreRevealCard({
  result,
  isScoreRevealed,
  onScoreRevealed,
  prefersReducedMotion,
}: {
  result: GradeResult;
  isScoreRevealed: boolean;
  onScoreRevealed: () => void;
  prefersReducedMotion: boolean;
}) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayCount(result.scorePercentage);
      onScoreRevealed();
      return;
    }

    // Single count-up animation from 0 to final percentage
    const controls = animate(0, result.scorePercentage, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => setDisplayCount(Math.round(latest)),
      onComplete: () => {
        onScoreRevealed();
      },
    });

    return () => controls.stop();
  }, [result.scorePercentage, prefersReducedMotion, onScoreRevealed]);

  return (
    <div
      className={`bg-[#FFFFFF] border border-[#102038]/15 border-l-4 ${
        result.passed ? "border-l-[#5BBFA4]" : "border-l-[#B91C1C]"
      } rounded-xl p-6 sm:p-8 space-y-6 text-left shadow-none`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#102038]/10 pb-6">
        <div className="space-y-2 text-left">
          {/* Pass/fail badge: Simple fade-in after score count-up (no slide, no bounce) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isScoreRevealed ? 1 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
            className="flex items-center gap-2"
          >
            {result.passed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans font-semibold bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3]">
                <CheckCircle size={15} weight="fill" className="text-[#5BBFA4]" />
                <span>Passed benchmark ({result.passingScore}% required)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans font-semibold bg-red-50 text-[#B91C1C] border border-red-200">
                <WarningCircle size={15} weight="bold" />
                <span>Below benchmark ({result.passingScore}% required)</span>
              </span>
            )}
          </motion.div>

          <h2 className="font-display text-2xl font-bold text-[#102038]">
            Assessment evaluation
          </h2>
          <p className="text-xs font-sans text-[#7E8B9B]">
            Automated grading computed deterministically against the rubric benchmark.
          </p>
        </div>

        {/* Count-Up Score */}
        <div className="text-left sm:text-right shrink-0">
          <div className="text-4xl sm:text-5xl font-display font-bold text-[#102038] tracking-tight">
            {displayCount}%
          </div>
          <div className="text-xs font-sans text-[#7E8B9B] mt-0.5">
            {result.correctCount} of {result.totalQuestions} questions correct
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        <span className="text-[#7E8B9B]">Deterministic grade &bull; Saved to official record</span>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-[#102038]/20 bg-[#FAF8F3] hover:bg-[#E8E2D6] text-[#102038] font-sans font-medium transition-colors cursor-pointer"
        >
          <Printer size={15} weight="bold" />
          <span>Print / save PDF report</span>
        </button>
      </div>
    </div>
  );
}
