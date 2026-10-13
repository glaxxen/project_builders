"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  PencilSimple,
  Sparkle,
  SpinnerGap,
  Clock,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  Lock,
  FileText,
  Database,
  GraduationCap,
  Megaphone,
  Trophy,
} from "@phosphor-icons/react";
import { updateStudentNameAction } from "@/lib/actions/users";

interface StudentDashboardClientProps {
  initialName: string | null;
  studentEmail: string;
  examStatus: "not_started" | "in_progress" | "submitted";
  examIsOpen: boolean;
  scoresReleased?: boolean;
  attemptScore?: number | null;
  attemptPercentage?: number | null;
  attemptStartedAt?: string | null;
  attemptSubmittedAt?: string | null;
}

export function StudentDashboardClient({
  initialName,
  studentEmail,
  examStatus,
  examIsOpen,
  scoresReleased = false,
  attemptScore = null,
  attemptPercentage = null,
  attemptStartedAt,
  attemptSubmittedAt,
}: StudentDashboardClientProps) {
  const router = useRouter();
  const [savedName, setSavedName] = useState<string | null>(initialName);
  const [nameInput, setNameInput] = useState<string>(initialName || "");
  const [isEditingName, setIsEditingName] = useState<boolean>(!initialName);
  const [isSavingName, setIsSavingName] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>("");

  const hasSavedName = Boolean(savedName && savedName.trim().length > 0);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (cleanName.length < 2) {
      setNameError("Please enter your full legal or preferred name (at least 2 characters).");
      return;
    }

    setIsSavingName(true);
    setNameError("");

    try {
      const res = await updateStudentNameAction(cleanName);
      if (res.success && res.name) {
        setSavedName(res.name);
        setIsEditingName(false);
        router.refresh();
      } else {
        setNameError(res.error || "Failed to save profile name.");
      }
    } catch (err: unknown) {
      setNameError(err instanceof Error ? err.message : "Failed to update profile name.");
    } finally {
      setIsSavingName(false);
    }
  }

  // Status badge formatting
  const statusConfig = {
    not_started: {
      label: "Not started",
      bg: "bg-[#FAF8F3]",
      border: "border-[#102038]/20",
      text: "text-[#102038]/80",
      icon: <Clock size={14} weight="bold" className="text-[#BA9C60]" />,
    },
    in_progress: {
      label: "In progress",
      bg: "bg-[#FEF3C7]",
      border: "border-[#F59E0B]/40",
      text: "text-[#92400E]",
      icon: <Clock size={14} weight="fill" className="text-[#D97706] animate-pulse" />,
    },
    submitted: {
      label:
        scoresReleased && attemptScore !== null
          ? `Score Released: ${attemptScore}/25 (${attemptPercentage}%)`
          : "Submitted (Under Review)",
      bg: "bg-[#EBF7F4]",
      border: "border-[#5BBFA4]/40",
      text: "text-[#1E4D40]",
      icon: <CheckCircle size={14} weight="fill" className="text-[#5BBFA4]" />,
    },
  }[examStatus];

  return (
    <div className="space-y-8 text-left">
      {/* ---------------------------------------------------------------------
          Cohort Title & Bulletin Section
          --------------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[#102038]/10 pb-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider font-sans font-semibold text-[#BA9C60]">
              Active Cohort Program
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102038] tracking-tight">
              Data Analysis — Fall 2026
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#1E4D40] bg-[#EBF7F4] border border-[#5BBFA4]/30 px-3 py-1.5 rounded-lg">
              <GraduationCap size={15} weight="bold" className="text-[#5BBFA4]" />
              <span>Capstone Final Assessment</span>
            </span>
          </div>
        </div>

        {/* Updated Bulletin Text (strictly conforming to requirement) */}
        <div className="bg-[#FAF8F3] border-2 border-[#102038]/15 border-l-6 border-l-[#5BBFA4] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EBF7F4] text-[#1E4D40] flex items-center justify-center shrink-0 border border-[#5BBFA4]/30">
            <Megaphone size={20} weight="fill" className="text-[#5BBFA4]" />
          </div>
          <div className="space-y-0.5 text-left flex-1">
            <div className="font-bold text-[#102038] text-sm sm:text-base font-display">
              Cohort Bulletin &bull; Examination Notice
            </div>
            <p className="text-sm sm:text-base font-normal text-[#102038]/90 leading-relaxed">
              The Final Assessment is open. 25 questions, 45 minutes recommended, one attempt.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          1. Welcome Line & Official Builder Profile
          If no name is saved, show the name field first and block the exam.
          --------------------------------------------------------------------- */}
      <section className="space-y-4">
        {hasSavedName ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102038] tracking-tight">
                Welcome back, {savedName}
              </h2>
              <p className="text-xs sm:text-sm font-sans text-[#102038]/60">
                Builder account verified for cohort examination and credentials.
              </p>
            </div>

            {/* Official Builder Profile Row (with edit option) */}
            <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <UserCheck size={18} weight="bold" className="text-[#5BBFA4]" />
                <span className="text-xs sm:text-sm font-sans text-[#102038]/60">
                  Official Builder Profile:
                </span>
                <strong className="text-xs sm:text-sm font-sans font-semibold text-[#102038]">
                  {savedName}
                </strong>
              </div>

              {!isEditingName && (
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-[#102038]/70 hover:text-[#102038] bg-[#FAF8F3] hover:bg-[#E8E2D6] border border-[#102038]/15 rounded-lg transition-colors cursor-pointer w-fit"
                >
                  <PencilSimple size={13} weight="bold" />
                  <span>Edit Name</span>
                </button>
              )}
            </div>

            {isEditingName && (
              <form
                onSubmit={handleSaveName}
                className="bg-[#FFFFFF] border-2 border-[#5BBFA4]/40 rounded-xl p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-semibold text-[#102038]">
                    Update Official Name:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(savedName || "");
                      setIsEditingName(false);
                      setNameError("");
                    }}
                    className="text-xs font-sans text-[#102038]/50 hover:text-[#102038]"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter full legal or preferred name"
                    disabled={isSavingName}
                    required
                    className="flex-1 min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-sans bg-[#FAF8F3] border border-[#102038]/20 rounded-lg text-[#102038] focus:outline-none focus:border-[#102038]"
                  />
                  <button
                    type="submit"
                    disabled={isSavingName}
                    className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2 text-xs font-sans font-medium text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-all cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    {isSavingName ? (
                      <>
                        <SpinnerGap size={14} weight="bold" className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Name</span>
                    )}
                  </button>
                </div>
                {nameError && <p className="text-xs font-sans text-[#B91C1C]">{nameError}</p>}
              </form>
            )}
          </div>
        ) : (
          /* NO NAME SAVED: Show name field FIRST and prominent */
          <div className="bg-[#FFFFFF] border-2 border-[#102038]/20 rounded-2xl p-6 sm:p-8 space-y-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#BA9C60] border border-[#BA9C60]/30 flex items-center justify-center shrink-0">
                <Sparkle size={20} weight="fill" />
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider font-sans font-semibold text-[#BA9C60]">
                  Builder Profile Registration
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102038]">
                  Enter Your Official Builder Name
                </h2>
                <p className="text-xs sm:text-sm font-sans text-[#102038]/70 leading-relaxed">
                  Before you can access the Capstone Final Assessment, please enter your full legal or preferred name. This name will appear on your official assessment record and certificate.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Samuel Adebayo"
                  disabled={isSavingName}
                  required
                  autoFocus
                  className="flex-1 min-h-[46px] px-4 py-2.5 text-sm font-sans bg-[#FAF8F3] border-2 border-[#102038]/20 rounded-xl text-[#102038] focus:outline-none focus:border-[#102038] placeholder-[#102038]/40"
                />
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-7 py-2.5 text-sm font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-60 shadow-sm"
                >
                  {isSavingName ? (
                    <>
                      <SpinnerGap size={16} weight="bold" className="animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Name &amp; Unlock Exam</span>
                  )}
                </button>
              </div>

              {nameError && (
                <p className="text-xs sm:text-sm font-sans font-medium text-[#B91C1C]">
                  {nameError}
                </p>
              )}
            </form>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------------
          2. Primary "Final Assessment" Card
          Showing: 25 questions, recommended time 45 minutes (hard limit 50),
          one attempt only, status (Not started / In progress / Submitted),
          and a "Start Exam" button.
          --------------------------------------------------------------------- */}
      <section>
        <div className="bg-[#102038] text-[#FAF8F3] rounded-3xl p-7 sm:p-10 lg:p-12 border border-[#233B5F] shadow-xl space-y-6 sm:space-y-8 relative overflow-hidden text-left">
          {/* Top Specification Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF8F3]/15 pb-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs uppercase tracking-wider font-sans font-semibold text-[#5BBFA4] bg-[#5BBFA4]/10 border border-[#5BBFA4]/30 px-3 py-1 rounded-md">
                Official Capstone
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-sans font-semibold border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
              >
                {statusConfig.icon}
                <span>Status: {statusConfig.label}</span>
              </span>
            </div>

            <div className="text-xs sm:text-sm font-sans text-[#FAF8F3]/70 flex items-center gap-2">
              <Clock size={16} weight="bold" className="text-[#5BBFA4]" />
              <span>Recommended time: 45 min &bull; Hard limit: 50 min</span>
            </div>
          </div>

          {/* Heading & Core Description */}
          <div className="space-y-3 max-w-3xl">
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#FAF8F3] tracking-tight leading-tight">
              Final Assessment
            </h2>
            <p className="font-sans font-normal text-sm sm:text-base text-[#FAF8F3]/80 leading-relaxed">
              Comprehensive multiple-choice assessment evaluating practical cross-domain analytics, SQL relational querying, and business dashboard modeling.
            </p>
          </div>

          {/* Key Parameters Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-[#FAF8F3]/5 border border-[#FAF8F3]/10 rounded-xl p-4 space-y-1">
              <div className="text-xs uppercase font-sans text-[#FAF8F3]/50 font-semibold tracking-wider">
                Question Count
              </div>
              <div className="font-display text-2xl font-bold text-[#FAF8F3]">
                25 Questions
              </div>
              <div className="text-xs text-[#FAF8F3]/60 font-sans">
                Multiple-choice format
              </div>
            </div>

            <div className="bg-[#FAF8F3]/5 border border-[#FAF8F3]/10 rounded-xl p-4 space-y-1">
              <div className="text-xs uppercase font-sans text-[#FAF8F3]/50 font-semibold tracking-wider">
                Time Allocation
              </div>
              <div className="font-display text-2xl font-bold text-[#FAF8F3]">
                45 Minutes
              </div>
              <div className="text-xs text-[#FAF8F3]/60 font-sans">
                50-minute server hard limit
              </div>
            </div>

            <div className="bg-[#FAF8F3]/5 border border-[#FAF8F3]/10 rounded-xl p-4 space-y-1">
              <div className="text-xs uppercase font-sans text-[#FAF8F3]/50 font-semibold tracking-wider">
                Attempt Policy
              </div>
              <div className="font-display text-2xl font-bold text-[#BA9C60]">
                One Attempt Only
              </div>
              <div className="text-xs text-[#FAF8F3]/60 font-sans">
                Strict single-attempt standard
              </div>
            </div>
          </div>

          {/* Primary Action Button Bar */}
          <div className="pt-2 space-y-3">
            {!examIsOpen ? (
              <div className="bg-[#FAF8F3]/10 border border-[#FAF8F3]/20 rounded-xl p-4 text-xs sm:text-sm text-[#FAF8F3]/80 flex items-center gap-3">
                <WarningCircle size={20} weight="fill" className="text-[#BA9C60] shrink-0" />
                <span>The assessment is currently closed by course instructors. Please check back soon.</span>
              </div>
            ) : !hasSavedName ? (
              /* Blocked because name is not saved */
              <div className="space-y-2">
                <div className="inline-flex items-center gap-3 min-h-[52px] px-8 py-3.5 rounded-xl bg-[#FAF8F3]/15 text-[#FAF8F3]/50 text-base font-sans font-semibold cursor-not-allowed border border-[#FAF8F3]/10">
                  <Lock size={18} weight="bold" />
                  <span>Start Exam (Locked — Name Required)</span>
                </div>
                <p className="text-xs font-sans text-[#BA9C60] flex items-center gap-1.5">
                  <WarningCircle size={14} weight="bold" />
                  <span>Please enter and save your official builder name above to unlock the exam.</span>
                </p>
              </div>
            ) : examStatus === "submitted" ? (
              /* Submitted State */
              scoresReleased && attemptScore !== null ? (
                /* OFFICIAL SCORE RELEASED */
                <div className="bg-[#0A1424]/95 border-2 border-[#5BBFA4] rounded-2xl p-6 sm:p-7 space-y-4 max-w-xl shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#FAF8F3]/15">
                    <div className="flex items-center gap-2.5 text-[#5BBFA4]">
                      <Trophy size={22} weight="fill" className="text-[#BA9C60]" />
                      <span className="font-display font-bold text-lg text-[#FAF8F3]">
                        Official Assessment Grade
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#1E4D40] bg-[#5BBFA4] px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                      Verified &bull; {attemptPercentage ?? Math.round((attemptScore / 25) * 100)}%
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-wider font-sans text-[#FAF8F3]/60 font-medium">
                        Score Result
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-4xl sm:text-5xl font-extrabold text-[#FAF8F3]">
                          {attemptScore}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-[#FAF8F3]/50">
                          / 25
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right space-y-1">
                      <div className="text-xs uppercase tracking-wider font-sans text-[#FAF8F3]/60 font-medium">
                        Cohort Standing
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#5BBFA4] flex sm:justify-end items-center gap-1.5">
                        <CheckCircle size={16} weight="fill" />
                        <span>
                          {(attemptPercentage ?? Math.round((attemptScore / 25) * 100)) >= 80
                            ? "Distinguished Builder (Pass)"
                            : (attemptPercentage ?? Math.round((attemptScore / 25) * 100)) >= 60
                            ? "Capstone Completed (Pass)"
                            : "Assessment Completed"}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#FAF8F3]/50 font-sans">
                        Graded by server verification key
                      </div>
                    </div>
                  </div>

                  {attemptSubmittedAt && (
                    <div suppressHydrationWarning className="pt-2 border-t border-[#FAF8F3]/10 text-xs font-mono text-[#FAF8F3]/50">
                      Recorded on {new Date(attemptSubmittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              ) : (
                /* UNDER REVIEW (Scores Hidden) */
                <div className="bg-[#0A1424]/90 border border-[#BA9C60]/40 rounded-2xl p-5 sm:p-6 space-y-2.5 max-w-xl shadow-md">
                  <div className="flex items-center gap-2.5 text-[#BA9C60]">
                    <CheckCircle size={22} weight="fill" className="text-[#5BBFA4]" />
                    <span className="font-display font-bold text-lg text-[#FAF8F3]">
                      Submitted Successfully
                    </span>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8C6D23] bg-[#FDF8ED] px-2 py-0.5 rounded ml-auto">
                      Under Review
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans text-[#FAF8F3]/75 leading-relaxed">
                    Your final assessment attempt has been safely recorded on the server. Official scores will be published by cohort instructors once the examination evaluation concludes.
                  </p>
                  {attemptSubmittedAt && (
                    <p suppressHydrationWarning className="text-xs font-mono text-[#FAF8F3]/50 pt-1">
                      Submission recorded at: {new Date(attemptSubmittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              )
            ) : examStatus === "in_progress" ? (
              /* In Progress State */
              <div className="space-y-2">
                <Link
                  href="/exam"
                  className="inline-flex items-center justify-center gap-3 min-h-[54px] px-8 py-3.5 rounded-xl bg-[#5BBFA4] hover:bg-[#77CBB3] text-[#102038] text-base font-sans font-bold shadow-lg transition-all cursor-pointer hover:translate-y-[-1px]"
                >
                  <Clock size={20} weight="fill" />
                  <span>Continue Exam in Progress &rarr;</span>
                </Link>
                <p className="text-xs font-sans text-[#FAF8F3]/60">
                  Your server timer is active. Click above to return to your assessment immediately.
                </p>
              </div>
            ) : (
              /* Not Started State */
              <div className="space-y-2">
                <Link
                  href="/exam"
                  className="inline-flex items-center justify-center gap-3 min-h-[54px] px-9 py-3.5 rounded-xl bg-[#5BBFA4] hover:bg-[#77CBB3] active:bg-[#4AA88F] text-[#102038] text-base sm:text-lg font-sans font-bold shadow-xl transition-all cursor-pointer hover:translate-y-[-1px]"
                >
                  <GraduationCap size={22} weight="bold" />
                  <span>Start Exam &rarr;</span>
                </Link>
                <p className="text-xs font-sans text-[#FAF8F3]/60">
                  Starting the exam will initiate the 50-minute server timer. Ensure you have an uninterrupted testing environment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          3. Compact "Your Projects" Section (Two read-only cards)
          - "Project 1: AfriMart KollyBright Sales Dashboard (Excel)"
          - "Project 2: ZoomRide SQL Analysis (MySQL)"
          --------------------------------------------------------------------- */}
      <section className="space-y-4 pt-4">
        <div className="border-b border-[#102038]/10 pb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs uppercase tracking-wider font-sans font-semibold text-[#BA9C60]">
              Curriculum Deliverables
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#102038] tracking-tight">
              Your Projects
            </h3>
          </div>
          <span className="text-xs font-sans text-[#102038]/50">
            Read-only curriculum references
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-6 space-y-3.5 shadow-xs text-left hover:border-[#102038]/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F4] text-[#1E4D40] flex items-center justify-center shrink-0 border border-[#5BBFA4]/30">
                <FileText size={20} weight="fill" className="text-[#5BBFA4]" />
              </div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#1E4D40] bg-[#EBF7F4] border border-[#5BBFA4]/30 px-2.5 py-0.5 rounded-md">
                Excel &bull; Read-only
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-lg text-[#102038]">
                Project 1: AfriMart KollyBright Sales Dashboard (Excel)
              </h4>
              <p className="text-xs sm:text-sm font-sans text-[#102038]/70 leading-relaxed">
                Multi-store commercial sales intelligence model utilizing spreadsheet formulas, nested lookups, and executive pivot summary views.
              </p>
            </div>

            <div className="pt-2 border-t border-[#102038]/10 flex items-center justify-between text-xs font-sans text-[#102038]/60">
              <span>Tooling: Microsoft Excel</span>
              <span className="font-mono text-[#5BBFA4] font-medium">Completed Deliverable</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-6 space-y-3.5 shadow-xs text-left hover:border-[#102038]/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#102038] flex items-center justify-center shrink-0 border border-[#102038]/20">
                <Database size={20} weight="fill" className="text-[#BA9C60]" />
              </div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8C6D23] bg-[#FDF8ED] border border-[#BA9C60]/30 px-2.5 py-0.5 rounded-md">
                MySQL &bull; Read-only
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-lg text-[#102038]">
                Project 2: ZoomRide SQL Analysis (MySQL)
              </h4>
              <p className="text-xs sm:text-sm font-sans text-[#102038]/70 leading-relaxed">
                Relational query model inspecting ride-hailing operational metrics, revenue splits, hourly surge volume, and driver cohort retention.
              </p>
            </div>

            <div className="pt-2 border-t border-[#102038]/10 flex items-center justify-between text-xs font-sans text-[#102038]/60">
              <span>Tooling: MySQL Workbench</span>
              <span className="font-mono text-[#5BBFA4] font-medium">Completed Deliverable</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
