"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import type { AssessmentWithQuestions } from "@/lib/db/queries/assessments";
import { submitAssessmentAction, type GradeResult } from "@/lib/actions/assessments";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
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

  const totalQuestions = assessment.questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return; // Prevent changing after submission
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

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
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to submit assessment.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Quiz Header */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(16,32,56,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7E8B9B] hover:text-[#102038] transition-colors"
          >
            <ArrowLeft size={13} weight="bold" />
            <span>Back to Workspace</span>
          </Link>

          <div className="flex items-center gap-2">
            {assessment.isFinal ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-[#FDF8ED] text-[#8C6D23] border border-[#BA9C60] px-2.5 py-1 rounded-full">
                <Sparkle size={12} weight="fill" />
                <span>Capstone Final Exam</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3] px-2.5 py-1 rounded-full">
                <GraduationCap size={13} weight="bold" />
                <span>Weekly Checkpoint</span>
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102038]">
            {assessment.title}
          </h1>
          <p className="text-sm font-sans text-[#4A5568] mt-1">
            Passing benchmark: <strong>{assessment.passingScore}%</strong>. Instant deterministic auto-grading.
          </p>
        </div>

        {/* Existing score alert if previously completed */}
        {existingScore && !result && (
          <div className="bg-[#FAF8F3] border border-[#E8E2D6] rounded-xl p-4 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-[#5BBFA4]" />
              <span>
                Previous attempt recorded:{" "}
                <strong className="text-[#102038]">{existingScore.scorePercentage}%</strong> on{" "}
                {new Date(existingScore.completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <span className="text-[#7E8B9B]">Retakes update your official score</span>
          </div>
        )}

        {/* Progress indicator */}
        {!result && (
          <div className="space-y-1.5 pt-2 border-t border-[#E8E2D6]">
            <div className="flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
              <span>Progress</span>
              <span>
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>
            <div className="w-full h-2 bg-[#FAF8F3] border border-[#E8E2D6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5BBFA4] transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Graded Result Card (Framer Motion Score Reveal & Count-Up Animation) */}
      {result && (
        <QuizScoreRevealCard result={result} />
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans px-4 py-3 rounded-xl flex items-center gap-2">
          <WarningCircle size={16} weight="bold" className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {assessment.questions.map((q, index) => {
          const breakdownItem = result?.breakdown.find((b) => b.questionId === q.id);
          const selectedOptionId = answers[q.id];

          return (
            <div
              key={q.id}
              className={`bg-[#FFFFFF] border rounded-2xl p-6 sm:p-7 shadow-sm space-y-4 transition-all ${
                breakdownItem
                  ? breakdownItem.isCorrect
                    ? "border-[#77CBB3] bg-[#FCFDFD]"
                    : "border-red-300 bg-[#FFFDFD]"
                  : selectedOptionId
                  ? "border-[#102038]"
                  : "border-[#E8E2D6]"
              }`}
            >
              {/* Question Number & Status Header */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#102038] bg-[#FAF8F3] border border-[#E8E2D6] px-2.5 py-1 rounded-md">
                  Question {index + 1} of {totalQuestions}
                </span>

                {breakdownItem ? (
                  breakdownItem.isCorrect ? (
                    <span className="text-[#1E4D40] font-semibold flex items-center gap-1 bg-[#EBF7F4] px-2.5 py-0.5 rounded-full border border-[#77CBB3]">
                      <CheckCircle size={13} weight="fill" className="text-[#5BBFA4]" />
                      <span>Correct (+{q.points} pts)</span>
                    </span>
                  ) : (
                    <span className="text-red-700 font-semibold flex items-center gap-1 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                      <XCircle size={13} weight="fill" className="text-red-500" />
                      <span>Incorrect (0 pts)</span>
                    </span>
                  )
                ) : (
                  <span className="text-[#7E8B9B]">{q.points} points</span>
                )}
              </div>

              {/* Prompt */}
              <h3 className="font-sans font-semibold text-base text-[#102038] leading-relaxed">
                {q.prompt}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {q.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrectAnswer = breakdownItem?.correctOptionId === opt.id;
                  const isUserSelection = breakdownItem?.selectedOptionId === opt.id;

                  let optionBorder = "border-[#E8E2D6] bg-[#FAF8F3] hover:border-[#102038]";
                  if (isSelected && !breakdownItem) {
                    optionBorder = "border-[#102038] bg-[#FAF8F3] ring-1 ring-[#102038]";
                  }
                  if (breakdownItem) {
                    if (isCorrectAnswer) {
                      optionBorder = "border-[#5BBFA4] bg-[#EBF7F4] ring-1 ring-[#5BBFA4]";
                    } else if (isUserSelection && !breakdownItem.isCorrect) {
                      optionBorder = "border-red-400 bg-red-50 ring-1 ring-red-400";
                    } else {
                      optionBorder = "border-[#E8E2D6] bg-[#FFFFFF] opacity-60";
                    }
                  }

                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm font-sans transition-all cursor-pointer ${optionBorder}`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => handleSelectOption(q.id, opt.id)}
                        disabled={!!result}
                        className="mt-0.5 text-[#102038] focus:ring-[#5BBFA4] cursor-pointer"
                      />
                      <span className="flex-1 text-[#102038] leading-relaxed">
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Explanation (Shown post-grading) */}
              {breakdownItem && breakdownItem.explanation && (
                <div className="bg-[#FAF8F3] border-l-3 border-[#5BBFA4] p-3.5 rounded-r-lg text-xs font-sans text-[#4A5568] space-y-1">
                  <div className="font-mono font-semibold text-[#102038]">
                    Rationale &amp; Explanation:
                  </div>
                  <p>{breakdownItem.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Actions */}
        {!result && (
          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-mono text-[#7E8B9B]">
              Deterministic auto-grading evaluates instantly upon submission.
            </div>

            <button
              type="submit"
              disabled={isPending || answeredCount < totalQuestions}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isPending ? (
                <>
                  <SpinnerGap size={15} weight="bold" className="animate-spin" />
                  <span>Computing Grade...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} weight="bold" />
                  <span>Submit &amp; Calculate Grade</span>
                </>
              )}
            </button>
          </div>
        )}

        {result && (
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/dashboard/student"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors shadow-sm"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Return to Student Workspace</span>
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * The ONE deliberate Framer Motion animation moment in the application:
 * Quiz Score Reveal & Count-Up Number upon submission.
 */
function QuizScoreRevealCard({ result }: { result: GradeResult }) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayCount(result.scorePercentage);
      return;
    }

    const controls = animate(0, result.scorePercentage, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => setDisplayCount(Math.round(latest)),
    });

    return () => controls.stop();
  }, [result.scorePercentage]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#FFFFFF] border-2 border-[#102038] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D6] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {result.passed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3]">
                <CheckCircle size={14} weight="fill" />
                <span>PASSED BENCHMARK</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                <WarningCircle size={14} weight="bold" />
                <span>BELOW BENCHMARK ({result.passingScore}% REQUIRED)</span>
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl font-bold text-[#102038]">
            Assessment Evaluation
          </h2>
        </div>

        <div className="text-right">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="text-4xl font-display font-bold text-[#102038]"
          >
            {displayCount}%
          </motion.div>
          <div className="text-xs font-mono text-[#7E8B9B]">
            {result.correctCount} of {result.totalQuestions} questions correct
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#7E8B9B]">Deterministic Grade &bull; Saved to Record</span>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E8E2D6] bg-[#FAF8F3] hover:bg-[#E8E2D6] text-[#102038] font-sans font-semibold transition-colors cursor-pointer"
        >
          <Printer size={14} weight="bold" />
          <span>Print / Save PDF Report</span>
        </button>
      </div>
    </motion.div>
  );
}
