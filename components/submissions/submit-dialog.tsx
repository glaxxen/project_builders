"use client";

import { useState, useTransition } from "react";
import type { Week, Submission } from "@/lib/db/schema";
import { submitProjectAction } from "@/lib/actions/submissions";
import {
  ArrowSquareOut,
  Calendar,
  CheckCircle,
  Clock,
  GitBranch,
  GithubLogo,
  SpinnerGap,
  UploadSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";

interface SubmitDialogProps {
  week: Week;
  existingSubmission?: Submission | null;
  variant?: "default" | "hero" | "hero-primary" | "hero-secondary";
  customLabel?: string;
}

export function SubmitDialog({ week, existingSubmission, variant = "default", customLabel }: SubmitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [githubUrl, setGithubUrl] = useState(existingSubmission?.githubUrl || "");
  const [reflection, setReflection] = useState(
    existingSubmission?.reflectionFindings || ""
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isDeadlinePassed = new Date() > new Date(week.deadline);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedUrl = githubUrl.trim();
    const githubRegex = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?.*$/;
    if (!githubRegex.test(trimmedUrl)) {
      setErrorMsg("Please provide a valid GitHub repository URL (e.g. https://github.com/username/repository).");
      return;
    }

    const trimmedReflection = reflection.trim();
    if (trimmedReflection.length < 20) {
      setErrorMsg(`Please write at least 20 characters for your key findings (currently ${trimmedReflection.length}/20).`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitProjectAction({
          weekId: week.id,
          githubUrl: trimmedUrl,
          reflectionFindings: trimmedReflection,
        });

        if (result.success) {
          setSuccessMsg(
            result.isReachable
              ? "Project repository verified and submitted successfully!"
              : "Project submitted! Note: Repository could not be confirmed public — ensure your repo permissions are public."
          );
          setTimeout(() => {
            setIsOpen(false);
            setSuccessMsg(null);
          }, 1800);
        } else {
          setErrorMsg(result.error);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to submit project.");
      }
    });
  };

  let buttonClasses = "";
  if (variant === "hero-primary") {
    buttonClasses = "text-[#102038] bg-[#5BBFA4] hover:bg-[#77CBB3] active:bg-[#4AA88F] min-h-[54px] px-8 py-3.5 text-base font-sans font-bold rounded-xl shadow-xl border-transparent";
  } else if (variant === "hero-secondary") {
    buttonClasses = "text-[#FAF8F3]/90 hover:text-white bg-[#FAF8F3]/10 hover:bg-[#FAF8F3]/15 border border-[#FAF8F3]/25 min-h-[46px] px-5 py-2.5 text-sm font-sans font-normal rounded-xl";
  } else if (variant === "hero") {
    buttonClasses = existingSubmission
      ? "text-[#FAF8F3] bg-[#FAF8F3]/15 hover:bg-[#FAF8F3]/25 border border-[#FAF8F3]/30 min-h-[48px] px-6 py-3 text-xs font-sans font-semibold rounded-xl"
      : "text-[#102038] bg-[#5BBFA4] hover:bg-[#77CBB3] active:bg-[#4AA88F] min-h-[48px] px-8 py-3.5 text-sm font-sans font-bold rounded-xl shadow-lg border-transparent";
  } else {
    buttonClasses = existingSubmission
      ? "text-[#102038] bg-[#FAF8F3] hover:bg-[#E8E2D6] border-[#102038]/20 min-h-[44px] px-4 py-2.5 text-xs font-sans font-semibold rounded-lg"
      : "text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] active:bg-[#0A1424] border-transparent min-h-[44px] px-4 py-2.5 text-xs font-sans font-semibold rounded-lg";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setErrorMsg(null);
          setSuccessMsg(null);
        }}
        className={`inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer border ${buttonClasses}`}
      >
        {customLabel ? (
          <>
            <UploadSimple size={16} weight="bold" />
            <span>{customLabel}</span>
          </>
        ) : existingSubmission ? (
          <>
            <GitBranch size={15} weight="bold" />
            <span>{isDeadlinePassed ? "View Submission" : "Update Submission"}</span>
          </>
        ) : (
          <>
            <UploadSimple size={15} weight="bold" />
            <span>Submit Project Repo</span>
          </>
        )}
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#102038]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#102038]/20 rounded-xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#102038]/10 pb-3 gap-4">
              <div>
                <div className="text-xs font-sans text-[#7E8B9B]">
                  Week {week.weekNumber} project submission
                </div>
                <h3 className="font-display font-bold text-lg text-[#102038] mt-0.5">
                  {week.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#7E8B9B] hover:text-[#102038] rounded-lg transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Deadline & Past Submission Notice */}
            <div className="bg-[#FAF8F3] border border-[#E8E2D6] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[#7E8B9B]">
                <Calendar size={14} weight="bold" />
                <span>
                  Deadline:{" "}
                  <strong className="text-[#102038]">
                    {new Date(week.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </span>
              </div>

              {existingSubmission && (
                <div className="flex items-center gap-1.5 text-[#1E4D40]">
                  <CheckCircle size={14} weight="fill" className="text-[#5BBFA4]" />
                  <span>
                    Last submitted:{" "}
                    {new Date(existingSubmission.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Messages */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans px-4 py-3 rounded-lg flex items-center gap-2">
                <WarningCircle size={16} weight="bold" className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-[#EBF7F4] border border-[#77CBB3] text-[#1E4D40] text-xs font-sans px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle size={16} weight="fill" className="text-[#5BBFA4] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-[#102038] flex items-center gap-1.5">
                  <GithubLogo size={15} weight="bold" />
                  <span>Public GitHub Repository URL</span>
                </label>
                <input
                  type="url"
                  required
                  disabled={isDeadlinePassed}
                  placeholder="https://github.com/your-username/afrimart-analysis"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF8F3] border border-[#102038]/20 rounded-lg font-mono text-xs text-[#102038] focus:outline-none focus:ring-2 focus:ring-[#102038] disabled:opacity-60"
                />
                <p className="text-[11px] text-[#7E8B9B]">
                  Ensure your repository is <strong>public</strong> so instructors can review your work.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-sans font-semibold text-[#102038]">
                    Key findings and reflection (3 core insights)
                  </label>
                  <span className={`text-[11px] font-mono font-medium ${
                    reflection.trim().length >= 20 ? "text-emerald-700 font-bold" : "text-[#7E8B9B]"
                  }`}>
                    {reflection.trim().length}/20 min chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  disabled={isDeadlinePassed}
                  placeholder="1. Resolved accented country strings and reconciled $12.4k shipping discrepancy.&#10;2. Gross profit margin peaked at 38% in Kenya via cosmetics category.&#10;3. Identified top 5 return items and recommended supplier SLA adjustments."
                  value={reflection}
                  onChange={(e) => {
                    setReflection(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F3] border border-[#102038]/20 rounded-lg text-xs leading-relaxed text-[#102038] focus:outline-none focus:ring-2 focus:ring-[#102038] disabled:opacity-60"
                />
                <div className="flex items-center justify-between text-[11px] text-[#7E8B9B]">
                  <span>Summarize your 3 most significant findings discovered from the dataset.</span>
                  {reflection.trim().length < 20 && reflection.trim().length > 0 && (
                    <span className="text-amber-600 font-medium">Needs {20 - reflection.trim().length} more char{20 - reflection.trim().length === 1 ? "" : "s"}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#102038]/10">
                <div>
                  {existingSubmission && (
                    <a
                      href={existingSubmission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-mono text-[#102038] hover:text-[#5BBFA4] transition-colors"
                    >
                      <ArrowSquareOut size={14} weight="bold" />
                      <span>Open current repository</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="min-h-[44px] px-4 py-2.5 text-xs font-sans font-medium text-[#4A5568] hover:text-[#102038] rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  {!isDeadlinePassed && (
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isPending ? (
                        <SpinnerGap size={15} weight="bold" className="animate-spin" />
                      ) : (
                        <CheckCircle size={15} weight="bold" />
                      )}
                      <span>{existingSubmission ? "Save Resubmission" : "Confirm Submission"}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
