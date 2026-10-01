"use client";

import { useState } from "react";
import Link from "next/link";
import type { Week, Submission } from "@/lib/db/schema";
import type { Assessment, Score } from "@/lib/db/schema";
import {
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
        <h2 className="text-xl font-display font-bold text-[#102038]">
          Previous weeks
        </h2>
        <p className="text-xs font-sans text-[#7E8B9B] mt-0.5">
          Archived projects from earlier in the cohort. Expand any week to review past submissions, quiz scores, and materials.
        </p>
      </div>

      <div className="space-y-3">
        {weeks.map((week) => {
          const submission = submissionsList.find((s) => s.weekId === week.id);
          const isDeadlinePassed = new Date() > new Date(week.deadline);
          const weekAssessment = allAssessments.find((a) => a.weekId === week.id && !a.isFinal);
          const assessmentScore = weekAssessment
            ? studentScores.find((s) => s.assessmentId === weekAssessment.id)
            : null;

          const isOpen = !!openWeekIds[week.id];

          // Consistent status system:
          // Left-edge 4px solid color bar:
          // - Navy #102038 = not started
          // - Gold #BA9C60 = in progress / submitted
          // - Mint #5BBFA4 = graded
          // - Muted rust/red #B91C1C = failed or needs-retake / past deadline without submission
          let statusBorder = "border-l-[#102038]";
          let statusLabel = "Not started";
          let statusTextColor = "text-[#102038]";
          let statusDotColor = "bg-[#102038]";

          if (assessmentScore && weekAssessment) {
            if (assessmentScore.scorePercentage >= weekAssessment.passingScore) {
              statusBorder = "border-l-[#5BBFA4]";
              statusLabel = `Graded (${assessmentScore.scorePercentage}% passed)`;
              statusTextColor = "text-[#1E4D40]";
              statusDotColor = "bg-[#5BBFA4]";
            } else {
              statusBorder = "border-l-[#B91C1C]";
              statusLabel = `Needs retake (${assessmentScore.scorePercentage}%)`;
              statusTextColor = "text-[#B91C1C]";
              statusDotColor = "bg-[#B91C1C]";
            }
          } else if (submission) {
            statusBorder = "border-l-[#BA9C60]";
            statusLabel = "Submitted";
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
              className={`bg-[#FFFFFF] border border-[#102038]/15 border-l-4 ${statusBorder} rounded-xl overflow-hidden transition-colors text-left`}
            >
              {/* Collapsed Header / Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleWeek(week.id)}
                aria-expanded={isOpen}
                className="w-full min-h-[52px] p-4 sm:px-6 sm:py-4 flex items-center justify-between gap-4 cursor-pointer text-left hover:bg-[#FAF8F3]/60 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-[#7E8B9B]">
                      Week {week.weekNumber}
                    </span>
                    <span className="font-sans font-bold text-sm sm:text-base text-[#102038]">
                      {week.title}
                    </span>
                  </div>

                  <div className={`text-xs font-sans font-medium ${statusTextColor} flex items-center gap-1.5`}>
                    <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
                    <span>{statusLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isDeadlinePassed && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-sans text-[#7E8B9B] hidden sm:inline-flex">
                      <LockSimple size={13} weight="bold" />
                      <span>Locked</span>
                    </span>
                  )}

                  <div
                    className={`w-7 h-7 rounded-md bg-[#FAF8F3] border border-[#102038]/15 flex items-center justify-center text-[#102038] transition-transform duration-150 motion-reduce:transition-none ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <CaretDown size={14} weight="bold" />
                  </div>
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isOpen && (
                <div className="p-5 sm:p-6 border-t border-[#102038]/10 bg-[#FAF8F3]/30 space-y-4 text-left">
                  {/* Explicit Lock Notice */}
                  {isDeadlinePassed ? (
                    <div className="flex items-start sm:items-center gap-2.5 text-xs font-sans text-[#4A5568] bg-[#FFFFFF] border border-[#102038]/15 rounded-lg p-3">
                      <LockKey size={16} weight="bold" className="text-[#102038] shrink-0 mt-0.5 sm:mt-0" />
                      <div>
                        <strong>Submission and quiz windows are closed.</strong> Deadline was {formattedDeadline}. Past checkpoints cannot be resubmitted or retaken, but materials and records remain accessible below.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-sans text-[#7E8B9B]">
                      <Calendar size={14} weight="bold" />
                      <span>
                        Deadline: <strong className="text-[#102038]">{formattedDeadline}</strong>
                      </span>
                    </div>
                  )}

                  {/* Project Brief */}
                  <div className="text-left space-y-1">
                    <div className="text-xs font-sans text-[#7E8B9B]">
                      Project brief
                    </div>
                    <p className="text-sm font-sans text-[#4A5568] leading-relaxed">
                      {week.brief}
                    </p>
                  </div>

                  {/* Past Submission Record (if any) */}
                  {submission ? (
                    <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-lg p-4 space-y-2.5 text-xs font-sans text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#102038]/10 pb-2">
                        <div className="flex items-center gap-2">
                          <GithubLogo size={16} weight="bold" className="text-[#102038]" />
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono font-semibold text-[#102038] hover:text-[#5BBFA4] hover:underline flex items-center gap-1 min-h-[44px]"
                          >
                            <span>{submission.githubUrl}</span>
                            <ArrowSquareOut size={13} weight="bold" />
                          </a>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-sans">
                          {submission.isReachable ? (
                            <span className="text-[#1E4D40] flex items-center gap-1 font-medium">
                              <CheckCircle size={13} weight="bold" className="text-[#5BBFA4]" />
                              <span>Repository is public</span>
                            </span>
                          ) : (
                            <span className="text-[#B91C1C] flex items-center gap-1 font-medium">
                              <WarningCircle size={13} weight="bold" />
                              <span>Make this repository public</span>
                            </span>
                          )}
                          <span>&bull;</span>
                          <span className="text-[#7E8B9B]">
                            Submitted on{" "}
                            {new Date(submission.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-left pt-1">
                        <div className="text-xs font-sans font-medium text-[#7E8B9B] mb-1">
                          Documented insights and findings:
                        </div>
                        <p className="text-[#4A5568] whitespace-pre-line leading-relaxed italic text-left">
                          &ldquo;{submission.reflectionFindings}&rdquo;
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-sans text-[#7E8B9B] italic bg-[#FFFFFF] border border-[#102038]/10 rounded-lg p-3">
                      No repository submission was recorded for this checkpoint.
                    </div>
                  )}

                  {/* Actions & Materials */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Materials re-download */}
                    <div className="flex flex-wrap items-center gap-2">
                      {week.datasetUrl && (
                        <a
                          href={week.datasetUrl}
                          download
                          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-sans font-medium text-[#102038] bg-[#FFFFFF] hover:bg-[#FAF8F3] border border-[#102038]/20 rounded-lg transition-colors"
                        >
                          <FileText size={15} weight="bold" />
                          <span>Download Dataset</span>
                        </a>
                      )}
                      {week.slidesUrl && (
                        <a
                          href={week.slidesUrl}
                          download
                          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-sans font-medium text-[#102038] bg-[#FFFFFF] hover:bg-[#FAF8F3] border border-[#102038]/20 rounded-lg transition-colors"
                        >
                          <BookOpen size={15} weight="bold" />
                          <span>Brief Guide</span>
                        </a>
                      )}
                    </div>

                    {/* Quiz Record (Locked if deadline passed) */}
                    <div className="flex items-center gap-2">
                      {weekAssessment && (
                        assessmentScore ? (
                          <div className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-sans font-semibold rounded-lg border border-[#102038]/15 bg-[#FFFFFF] text-[#102038]">
                            <GraduationCap size={15} weight="bold" />
                            <span>
                              Quiz score: {assessmentScore.scorePercentage}% (
                              {assessmentScore.scorePercentage >= weekAssessment.passingScore
                                ? "Passed"
                                : "Failed"}
                              )
                            </span>
                            {isDeadlinePassed && (
                              <span className="text-[11px] text-[#7E8B9B] font-normal ml-1">
                                &bull; Locked
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2.5 text-xs font-sans text-[#7E8B9B] border border-[#102038]/10 rounded-lg bg-[#FFFFFF]">
                            <LockSimple size={14} weight="bold" />
                            <span>Quiz checkpoint closed</span>
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
