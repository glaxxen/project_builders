"use client";

import { useState } from "react";
import Link from "next/link";
import type { Week, Submission } from "@/lib/db/schema";
import type { Assessment, Score } from "@/lib/db/schema";
import {
  ArrowRight,
  ArrowSquareOut,
  BookOpen,
  Calendar,
  CaretDown,
  CheckCircle,
  FileText,
  GithubLogo,
  GraduationCap,
  LockKey,
  LockSimple,
  WarningCircle,
} from "@phosphor-icons/react";

interface PreviousWeeksSectionProps {
  weeks: Week[];
  submissionsList: Submission[];
  studentScores: Score[];
  allAssessments: Assessment[];
  defaultOpenFirst?: boolean;
}

export function PreviousWeeksSection({
  weeks,
  submissionsList,
  studentScores,
  allAssessments,
  defaultOpenFirst = false,
}: PreviousWeeksSectionProps) {
  // Collapsed by default — set of open week IDs
  const [openWeekIds, setOpenWeekIds] = useState<Record<string, boolean>>(
    defaultOpenFirst && weeks[0] ? { [weeks[0].id]: true } : {}
  );

  if (!weeks || weeks.length === 0) {
    return null;
  }

  const toggleWeek = (weekId: string) => {
    setOpenWeekIds((prev) => ({
      ...prev,
      [weekId]: !prev[weekId],
    }));
  };

  return (
    <section className="space-y-4 text-left">
      <div className="text-left">
        <h2 className="text-2xl font-display font-bold text-[#102038]">
          Previous Weeks Archive
        </h2>
        <p className="text-sm sm:text-base font-medium text-[#102038]/70 mt-1">
          Archived curriculum from earlier in the cohort. Expand any week to review past project submissions, examination scores, and study materials.
        </p>
      </div>

      <div className="space-y-4">
        {weeks.map((week) => {
          const submission = submissionsList.find((s) => s.weekId === week.id);
          const isDeadlinePassed = new Date() > new Date(week.deadline);
          const weekAssessment = allAssessments.find((a) => a.weekId === week.id && !a.isFinal);
          const assessmentScore = weekAssessment
            ? studentScores.find((s) => s.assessmentId === weekAssessment.id)
            : null;

          const isOpen = !!openWeekIds[week.id];

          // Consistent bold status system
          let statusBorder = "border-l-[#102038]";
          let statusLabel = "Not started";
          let statusTextColor = "text-[#102038]";
          let statusDotColor = "bg-[#102038]";

          if (assessmentScore && weekAssessment) {
            if (assessmentScore.scorePercentage >= weekAssessment.passingScore) {
              statusBorder = "border-l-[#5BBFA4]";
              statusLabel = `Exam Passed (${assessmentScore.scorePercentage}%)`;
              statusTextColor = "text-[#1E4D40]";
              statusDotColor = "bg-[#5BBFA4]";
            } else {
              statusBorder = "border-l-[#F87171]";
              statusLabel = `Exam Completed (${assessmentScore.scorePercentage}%)`;
              statusTextColor = "text-[#991B1B]";
              statusDotColor = "bg-[#F87171]";
            }
          } else if (submission) {
            statusBorder = "border-l-[#BA9C60]";
            statusLabel = "Project Submitted";
            statusTextColor = "text-[#8C6D23]";
            statusDotColor = "bg-[#BA9C60]";
          } else if (isDeadlinePassed) {
            statusBorder = "border-l-[#B91C1C]";
            statusLabel = "Past deadline";
            statusTextColor = "text-[#B91C1C]";
            statusDotColor = "bg-[#B91C1C]";
          }

          const formattedDeadline = new Date(week.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={week.id}
              className={`bg-[#FFFFFF] border-2 border-[#102038]/15 border-l-6 ${statusBorder} rounded-2xl overflow-hidden transition-all text-left shadow-xs`}
            >
              {/* Collapsed Header / Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleWeek(week.id)}
                aria-expanded={isOpen}
                className="w-full min-h-[58px] p-5 sm:px-6 sm:py-5 flex items-center justify-between gap-4 cursor-pointer text-left hover:bg-[#FAF8F3] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs sm:text-sm font-mono font-bold bg-[#FAF8F3] border border-[#102038]/20 px-2.5 py-1 rounded-md text-[#102038]">
                      Week {week.weekNumber}
                    </span>
                    <span className="font-sans font-bold text-base sm:text-lg text-[#102038]">
                      {week.title}
                    </span>
                  </div>

                  <div className={`text-sm font-bold ${statusTextColor} flex items-center gap-2`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor}`} />
                    <span>{statusLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isDeadlinePassed && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102038]/60 bg-[#FAF8F3] px-2.5 py-1 rounded-md border border-[#102038]/10 hidden sm:inline-flex">
                      <LockSimple size={14} weight="bold" />
                      <span>Archive</span>
                    </span>
                  )}

                  <div
                    className={`w-8 h-8 rounded-lg bg-[#FAF8F3] border border-[#102038]/20 flex items-center justify-center text-[#102038] transition-transform duration-150 motion-reduce:transition-none ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <CaretDown size={16} weight="bold" />
                  </div>
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isOpen && (
                <div className="p-6 sm:p-7 border-t-2 border-[#102038]/10 bg-[#FAF8F3]/40 space-y-6 text-left">
                  {/* Lock Notice */}
                  {isDeadlinePassed ? (
                    <div className="flex items-start sm:items-center gap-3 text-sm font-medium text-[#102038] bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-xl p-4">
                      <LockKey size={20} weight="bold" className="text-[#102038] shrink-0 mt-0.5 sm:mt-0" />
                      <div>
                        <strong className="font-bold">Submission and exam window closed.</strong> Completed on {formattedDeadline}. Past checkpoints cannot be resubmitted, but your graded answers, scores, and datasets remain available below.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-bold text-[#102038]">
                      <Calendar size={16} weight="bold" className="text-[#5BBFA4]" />
                      <span>
                        Deadline: <strong className="text-[#102038]">{formattedDeadline}</strong>
                      </span>
                    </div>
                  )}

                  {/* Brief */}
                  <div className="space-y-1.5 text-left">
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#BA9C60]">
                      Executive Briefing:
                    </div>
                    <p className="text-sm sm:text-base font-normal text-[#102038]/90 leading-relaxed">
                      {week.brief}
                    </p>
                  </div>

                  {/* Submission Record */}
                  {submission ? (
                    <div className="bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-xl p-5 space-y-3 text-sm text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#102038]/10 pb-3">
                        <div className="flex items-center gap-2">
                          <GithubLogo size={18} weight="bold" className="text-[#102038]" />
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono font-bold text-[#102038] hover:text-[#5BBFA4] hover:underline flex items-center gap-1.5"
                          >
                            <span>{submission.githubUrl}</span>
                            <ArrowSquareOut size={15} weight="bold" />
                          </a>
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                          {submission.isReachable ? (
                            <span className="text-[#1E4D40] flex items-center gap-1">
                              <CheckCircle size={15} weight="bold" className="text-[#5BBFA4]" />
                              <span>Public Repository Verified</span>
                            </span>
                          ) : (
                            <span className="text-[#B91C1C] flex items-center gap-1">
                              <WarningCircle size={15} weight="bold" />
                              <span>Private Repo</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left pt-1">
                        <div className="text-xs sm:text-sm font-bold text-[#102038]/70 mb-1">
                          Documented findings:
                        </div>
                        <p className="text-sm sm:text-base text-[#102038]/90 whitespace-pre-line leading-relaxed italic text-left">
                          &ldquo;{submission.reflectionFindings}&rdquo;
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-[#102038]/60 bg-[#FFFFFF] border border-[#102038]/10 rounded-xl p-4">
                      No repository submission was recorded for this checkpoint.
                    </div>
                  )}

                  {/* Actions & Examination Review */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    {/* Materials re-download */}
                    <div className="flex flex-wrap items-center gap-3">
                      {week.datasetUrl && (
                        <a
                          href={week.datasetUrl}
                          download
                          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 text-sm font-bold text-[#102038] bg-[#FFFFFF] hover:bg-[#FAF8F3] border-2 border-[#102038]/20 rounded-xl transition-colors cursor-pointer"
                        >
                          <FileText size={16} weight="bold" />
                          <span>Dataset (.csv)</span>
                        </a>
                      )}
                      {week.slidesUrl && (
                        <a
                          href={week.slidesUrl}
                          download
                          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 text-sm font-bold text-[#102038] bg-[#FFFFFF] hover:bg-[#FAF8F3] border-2 border-[#102038]/20 rounded-xl transition-colors cursor-pointer"
                        >
                          <BookOpen size={16} weight="bold" />
                          <span>Guide (.pdf)</span>
                        </a>
                      )}
                    </div>

                    {/* Examination Review / Score */}
                    <div>
                      {weekAssessment && (
                        assessmentScore ? (
                          <Link
                            href={`/dashboard/student/quiz/${weekAssessment.id}?preview=student`}
                            className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 text-sm font-bold rounded-xl border-2 border-[#5BBFA4] bg-[#EBF7F4] text-[#1E4D40] hover:bg-[#d8f1eb] transition-colors"
                          >
                            <GraduationCap size={18} weight="bold" className="text-[#5BBFA4]" />
                            <span>
                              Exam Score: {assessmentScore.scorePercentage}% ({assessmentScore.scorePercentage >= weekAssessment.passingScore ? "Passed" : "Recorded"}) &bull; Review Answers
                            </span>
                            <ArrowRight size={14} weight="bold" />
                          </Link>
                        ) : (
                          <div className="inline-flex items-center gap-2 min-h-[46px] px-4 py-2 text-sm font-bold text-[#102038]/70 border-2 border-[#102038]/15 rounded-xl bg-[#FFFFFF]">
                            <LockSimple size={16} weight="bold" />
                            <span>Examination closed</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
