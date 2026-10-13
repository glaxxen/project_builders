"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  WarningCircle,
  CaretLeft,
  CaretRight,
  FloppyDisk,
  PaperPlaneTilt,
  X,
  SpinnerGap,
  Sparkle,
} from "@phosphor-icons/react";
import type { StudentExamQuestion } from "@/lib/exam/shuffle";
import { QuestionRenderer } from "./question-renderer";
import { SubmittedScreen } from "./submitted-screen";
import { saveExamAnswerAction, submitExamAttemptAction } from "@/lib/actions/exam";

interface ExamRunnerProps {
  attemptId: string;
  studentEmail: string;
  deadlineIso: string;
  serverTimeIso: string;
  questions: StudentExamQuestion[];
  existingAnswers: Record<string, number>;
}

export function ExamRunner({
  attemptId,
  studentEmail,
  deadlineIso,
  serverTimeIso,
  questions,
  existingAnswers,
}: ExamRunnerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Current question index (0 to 24)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Answers map: questionId -> originalOptionIndex
  const [answers, setAnswers] = useState<Record<string, number>>(existingAnswers || {});

  // Autosave status per question
  const [saveStatus, setSaveStatus] = useState<Record<string, "saved" | "saving" | "error">>({});

  // Confirmation dialog state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  // Server-computed deadline timer
  const deadlineTime = new Date(deadlineIso).getTime();
  const serverTime = new Date(serverTimeIso).getTime();
  const clockSkewOffset = useRef(Date.now() - serverTime);

  const calculateRemainingSeconds = () => {
    const adjustedNow = Date.now() - clockSkewOffset.current;
    return Math.max(0, Math.floor((deadlineTime - adjustedNow) / 1000));
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemainingSeconds());
  const hasAutoSubmitted = useRef<boolean>(false);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setRemainingSeconds(remaining);

      // Auto-submit when time expires
      if (remaining <= 0 && !hasAutoSubmitted.current && !submittedAt) {
        hasAutoSubmitted.current = true;
        clearInterval(timer);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineIso, submittedAt]);

  // Handle auto-submit when deadline passes
  async function handleAutoSubmit() {
    setIsSubmitting(true);
    try {
      const res = await submitExamAttemptAction({
        attemptId,
        answers,
      });
      if (res.success && res.submittedAt) {
        setSubmittedAt(res.submittedAt);
      }
    } catch (err) {
      console.error("Auto-submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle user selecting an option
  async function handleSelectOption(questionId: string, optionIndex: number) {
    if (submittedAt || isSubmitting) return;

    // Optimistically update answers state
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));

    setSaveStatus((prev) => ({
      ...prev,
      [questionId]: "saving",
    }));

    try {
      const res = await saveExamAnswerAction({
        attemptId,
        questionId,
        optionIndex,
      });

      if (res.autoSubmitted) {
        handleAutoSubmit();
        return;
      }

      if (res.success) {
        setSaveStatus((prev) => ({
          ...prev,
          [questionId]: "saved",
        }));
      } else {
        setSaveStatus((prev) => ({
          ...prev,
          [questionId]: "error",
        }));
      }
    } catch {
      setSaveStatus((prev) => ({
        ...prev,
        [questionId]: "error",
      }));
    }
  }

  // Handle manual submit from confirm dialog
  async function handleManualSubmit() {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await submitExamAttemptAction({
        attemptId,
        answers,
      });

      if (res.success && res.submittedAt) {
        setShowConfirmModal(false);
        setSubmittedAt(res.submittedAt);
      } else {
        setSubmitError(res.error || "Failed to submit exam. Please try again.");
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit exam.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Render submitted screen if done
  if (submittedAt) {
    return <SubmittedScreen submittedAt={submittedAt} />;
  }

  const currentQuestion = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Format countdown mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isUrgent = remainingSeconds < 300; // < 5 minutes

  const currentSelectedOptionIndex = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentSaveState = currentQuestion ? saveStatus[currentQuestion.id] : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left font-sans">
      {/* ---------------------------------------------------------------------
          Sticky Top Exam Control Bar (Timer, Progress & Autosave Indicator)
          --------------------------------------------------------------------- */}
      <div className="sticky top-16 z-20 bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Progress info */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between text-xs font-sans text-[#102038]/70 pr-4">
            <span className="font-semibold text-[#102038]">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>
              {answeredCount} of {totalQuestions} answered ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#FAF8F3] border border-[#102038]/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5BBFA4] rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Right: Server-Enforced Timer & Save Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Autosave Status Badge */}
          <div className="text-[11px] font-mono text-[#102038]/60 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#102038]/10">
            {currentSaveState === "saving" ? (
              <>
                <SpinnerGap size={12} weight="bold" className="animate-spin text-[#BA9C60]" />
                <span>Saving...</span>
              </>
            ) : currentSaveState === "error" ? (
              <>
                <WarningCircle size={12} weight="bold" className="text-[#B91C1C]" />
                <span className="text-[#B91C1C]">Save error</span>
              </>
            ) : (
              <>
                <FloppyDisk size={12} weight="bold" className="text-[#5BBFA4]" />
                <span>Autosaved</span>
              </>
            )}
          </div>

          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono font-bold text-sm sm:text-base transition-colors ${
              isUrgent
                ? "bg-[#FEF2F2] border-[#EF4444] text-[#B91C1C] animate-pulse"
                : "bg-[#102038] border-[#102038] text-[#FAF8F3]"
            }`}
          >
            <Clock size={18} weight="bold" className={isUrgent ? "text-[#EF4444]" : "text-[#5BBFA4]"} />
            <span>{formattedCountdown}</span>
          </div>

          {/* Quick Submit Button */}
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5BBFA4] hover:bg-[#77CBB3] text-[#102038] text-xs sm:text-sm font-sans font-bold transition-all shadow-xs cursor-pointer"
          >
            <PaperPlaneTilt size={15} weight="bold" />
            <span className="hidden sm:inline">Finish &amp; Submit</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          Question Navigator Grid (1 to 25 with answered/unanswered states)
          --------------------------------------------------------------------- */}
      <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-sans text-[#102038]/70 border-b border-[#102038]/10 pb-2">
          <span className="font-semibold text-[#102038]">Question Navigator:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5BBFA4]" />
              <span>Answered</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FAF8F3] border border-[#102038]/30" />
              <span>Unanswered</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-25 gap-1.5 sm:gap-2">
          {questions.map((q, idx) => {
            const isAnswered = typeof answers[q.id] === "number";
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? "bg-[#102038] text-[#FAF8F3] ring-2 ring-[#5BBFA4] ring-offset-2 scale-105 z-10"
                    : isAnswered
                    ? "bg-[#EBF7F4] text-[#1E4D40] border border-[#5BBFA4]/60 hover:bg-[#5BBFA4]/30"
                    : "bg-[#FAF8F3] text-[#102038]/70 border border-[#102038]/20 hover:border-[#102038]/50"
                }`}
                title={`Question ${idx + 1}: ${isAnswered ? "Answered" : "Unanswered"}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          Main Active Question Card (One Question at a Time)
          --------------------------------------------------------------------- */}
      {currentQuestion && (
        <div className="bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 text-left">
          {/* Question Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#102038]/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-bold text-xl sm:text-2xl text-[#102038]">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              {currentQuestion.topic && (
                <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#BA9C60] bg-[#FAF8F3] border border-[#BA9C60]/30 px-2.5 py-0.5 rounded-md">
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            <div className="text-xs font-sans text-[#102038]/60">
              {currentSelectedOptionIndex !== undefined ? (
                <span className="text-[#1E4D40] font-medium flex items-center gap-1">
                  <CheckCircle size={14} weight="fill" className="text-[#5BBFA4]" />
                  <span>Answer Selected</span>
                </span>
              ) : (
                <span className="text-[#BA9C60] font-medium">Unanswered</span>
              )}
            </div>
          </div>

          {/* Question Text (Monospace/Pre-formatted Code Block Supported) */}
          <div className="py-2">
            <QuestionRenderer text={currentQuestion.text} />
          </div>

          {/* Options Selection List */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-sans font-semibold uppercase tracking-wider text-[#102038]/60 pb-1">
              Select One Option:
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, optIndex) => {
                const isSelected = currentSelectedOptionIndex === opt.originalIndex;
                const letter = String.fromCharCode(65 + optIndex); // A, B, C, D

                return (
                  <button
                    key={`${currentQuestion.id}-opt-${opt.originalIndex}`}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, opt.originalIndex)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-4 text-left cursor-pointer ${
                      isSelected
                        ? "bg-[#EBF7F4] border-[#5BBFA4] text-[#102038] shadow-sm ring-1 ring-[#5BBFA4]"
                        : "bg-[#FFFFFF] border-[#102038]/15 text-[#102038]/90 hover:bg-[#FAF8F3] hover:border-[#102038]/30"
                    }`}
                  >
                    {/* Letter Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#5BBFA4] text-[#102038]"
                          : "bg-[#FAF8F3] text-[#102038]/70 border border-[#102038]/20"
                      }`}
                    >
                      {letter}
                    </div>

                    <div className="flex-1 text-sm sm:text-base font-sans font-normal leading-relaxed pt-1">
                      {opt.text}
                    </div>

                    {isSelected && (
                      <div className="text-[#5BBFA4] shrink-0 pt-1">
                        <CheckCircle size={20} weight="fill" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Buttons: Previous / Next / Submit */}
          <div className="pt-6 border-t border-[#102038]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-xl border border-[#102038]/20 bg-[#FAF8F3] hover:bg-[#E8E2D6] disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-sans font-medium text-[#102038] transition-colors cursor-pointer"
            >
              <CaretLeft size={16} weight="bold" />
              <span>Previous Question</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[46px] px-8 py-2.5 rounded-xl bg-[#102038] hover:bg-[#233B5F] text-xs sm:text-sm font-sans font-semibold text-[#FAF8F3] transition-all cursor-pointer shadow-sm"
                >
                  <span>Next Question</span>
                  <CaretRight size={16} weight="bold" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[46px] px-8 py-2.5 rounded-xl bg-[#5BBFA4] hover:bg-[#77CBB3] text-xs sm:text-sm font-sans font-bold text-[#102038] transition-all cursor-pointer shadow-md"
                >
                  <PaperPlaneTilt size={16} weight="bold" />
                  <span>Review &amp; Final Submit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          Final Submit Confirmation Modal (Shows answered vs unanswered count)
          --------------------------------------------------------------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#102038]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#102038]/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#102038] border border-[#102038]/20 flex items-center justify-center shrink-0">
                  <PaperPlaneTilt size={20} weight="fill" className="text-[#5BBFA4]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#102038]">
                    Submit Final Assessment?
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-[#102038]/60">
                    Verify your completion status before finalizing your attempt.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-[#102038]/40 hover:text-[#102038] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Answered / Unanswered Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#EBF7F4] border border-[#5BBFA4]/40 rounded-2xl p-4 text-left">
                <div className="text-xs uppercase font-sans text-[#1E4D40] font-semibold tracking-wider">
                  Answered
                </div>
                <div className="font-display text-3xl font-bold text-[#1E4D40] mt-0.5">
                  {answeredCount} <span className="text-sm font-sans font-normal text-[#1E4D40]/70">/ {totalQuestions}</span>
                </div>
              </div>

              <div
                className={`border rounded-2xl p-4 text-left ${
                  unansweredCount > 0
                    ? "bg-[#FEF3C7] border-[#F59E0B]/50 text-[#92400E]"
                    : "bg-[#FAF8F3] border-[#102038]/15 text-[#102038]"
                }`}
              >
                <div className="text-xs uppercase font-sans font-semibold tracking-wider">
                  Unanswered
                </div>
                <div className="font-display text-3xl font-bold mt-0.5">
                  {unansweredCount}
                </div>
              </div>
            </div>

            {/* Warning Callout */}
            {unansweredCount > 0 ? (
              <div className="bg-[#FEF3C7] border border-[#F59E0B]/50 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-[#92400E]">
                <WarningCircle size={20} weight="fill" className="shrink-0 text-[#D97706] mt-0.5" />
                <p>
                  You have <strong>{unansweredCount} unanswered questions</strong>. Any unanswered questions will receive 0 points.
                </p>
              </div>
            ) : (
              <div className="bg-[#EBF7F4] border border-[#5BBFA4]/40 rounded-xl p-3.5 flex items-center gap-2.5 text-xs sm:text-sm text-[#1E4D40]">
                <CheckCircle size={18} weight="fill" className="text-[#5BBFA4] shrink-0" />
                <span>All 25 questions answered. Ready for official evaluation.</span>
              </div>
            )}

            <p className="text-xs font-sans text-[#102038]/60 leading-relaxed">
              <strong>Single-attempt policy:</strong> Once submitted, your examination is complete and cannot be resumed or retaken.
            </p>

            {submitError && (
              <p className="text-xs font-sans font-medium text-[#B91C1C]">
                {submitError}
              </p>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2 text-xs sm:text-sm font-sans font-medium text-[#102038]/70 hover:text-[#102038] rounded-xl hover:bg-[#FAF8F3] transition-colors cursor-pointer"
              >
                Return to Review Questions
              </button>

              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-7 py-2 text-xs sm:text-sm font-sans font-bold text-[#102038] bg-[#5BBFA4] hover:bg-[#77CBB3] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <SpinnerGap size={16} weight="bold" className="animate-spin" />
                    <span>Submitting Assessment...</span>
                  </>
                ) : (
                  <span>Yes, Submit Exam Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
