"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle,
  Clock,
  WarningCircle,
  MagnifyingGlass,
  DownloadSimple,
  ArrowClockwise,
  Eye,
  EyeSlash,
  X,
  Lock,
  LockOpen,
  SpinnerGap,
  Sparkle,
  TrendUp,
  ChartBar,
} from "@phosphor-icons/react";
import type { UserRecord, ExamAttempt, ExamQuestion } from "@/lib/db/sqlite-store";
import { QuestionRenderer } from "@/components/exam/question-renderer";
import {
  toggleExamOpenAction,
  toggleScoresReleasedAction,
  resetStudentAttemptAction,
} from "@/lib/actions/admin";

interface StudentRowData {
  id: string;
  name: string | null;
  email: string;
  status: "not_started" | "in_progress" | "submitted";
  score: number | null;
  percentage: number | null;
  timeTakenSeconds: number | null;
  submittedAt: string | null;
  answers: Record<string, number>;
}

interface FinalExamAdminProps {
  initialStudents: UserRecord[];
  initialAttempts: ExamAttempt[];
  questions: ExamQuestion[];
  initialExamIsOpen: boolean;
  initialScoresReleased?: boolean;
}

export function FinalExamAdmin({
  initialStudents,
  initialAttempts,
  questions,
  initialExamIsOpen,
  initialScoresReleased = false,
}: FinalExamAdminProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [examIsOpen, setExamIsOpen] = useState<boolean>(initialExamIsOpen);
  const [isTogglingExam, setIsTogglingExam] = useState<boolean>(false);
  const [scoresReleased, setScoresReleased] = useState<boolean>(initialScoresReleased);
  const [isTogglingScores, setIsTogglingScores] = useState<boolean>(false);

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "not_started" | "in_progress" | "submitted">("all");
  const [sortField, setSortField] = useState<"name" | "email" | "status" | "score" | "submittedAt">("submittedAt");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Modals state
  const [inspectStudent, setInspectStudent] = useState<StudentRowData | null>(null);
  const [resettingStudent, setResettingStudent] = useState<StudentRowData | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>("");

  // Map students and attempts together
  const rows: StudentRowData[] = useMemo(() => {
    // Index attempts by student email
    const attemptMap = new Map<string, ExamAttempt>();
    initialAttempts.forEach((att) => {
      attemptMap.set(att.studentEmail.toLowerCase().trim(), att);
    });

    // Also include any students found in attempts who might not be in initialStudents
    const emailSet = new Set<string>();
    const studentList: StudentRowData[] = [];

    initialStudents.forEach((st) => {
      const cleanEmail = st.email.toLowerCase().trim();
      emailSet.add(cleanEmail);
      const att = attemptMap.get(cleanEmail);

      studentList.push({
        id: st.id,
        name: st.name || att?.studentName || null,
        email: cleanEmail,
        status: att?.status || "not_started",
        score: att?.score !== null && att?.score !== undefined ? att.score : null,
        percentage: att?.percentage !== null && att?.percentage !== undefined ? att.percentage : null,
        timeTakenSeconds: att?.timeTakenSeconds ?? null,
        submittedAt: att?.submittedAt ?? null,
        answers: att?.answers || {},
      });
    });

    // Add attempts not yet in initialStudents list
    initialAttempts.forEach((att) => {
      const cleanEmail = att.studentEmail.toLowerCase().trim();
      if (!emailSet.has(cleanEmail)) {
        emailSet.add(cleanEmail);
        studentList.push({
          id: att.studentId,
          name: att.studentName,
          email: cleanEmail,
          status: att.status,
          score: att.score !== null && att.score !== undefined ? att.score : null,
          percentage: att.percentage !== null && att.percentage !== undefined ? att.percentage : null,
          timeTakenSeconds: att.timeTakenSeconds ?? null,
          submittedAt: att.submittedAt ?? null,
          answers: att.answers || {},
        });
      }
    });

    return studentList;
  }, [initialStudents, initialAttempts]);

  // Summary Metrics calculations
  const totalStudents = rows.length;
  const submittedRows = rows.filter((r) => r.status === "submitted" && r.score !== null);
  const submittedCount = submittedRows.length;

  const scoreValues = submittedRows.map((r) => r.score as number);
  const averageScore =
    scoreValues.length > 0
      ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1)
      : null;
  const averagePercentage =
    scoreValues.length > 0
      ? Math.round((Number(averageScore) / 25) * 100)
      : null;
  const highestScore = scoreValues.length > 0 ? Math.max(...scoreValues) : null;
  const lowestScore = scoreValues.length > 0 ? Math.min(...scoreValues) : null;

  // Filtered & Sorted Rows
  const filteredRows = useMemo(() => {
    let result = rows.filter((row) => {
      const matchesSearch =
        searchQuery === "" ||
        row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.name && row.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === null || valA === undefined) return sortAsc ? 1 : -1;
      if (valB === null || valB === undefined) return sortAsc ? -1 : 1;

      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return result;
  }, [rows, searchQuery, statusFilter, sortField, sortAsc]);

  // Handle Exam Open/Close Toggle
  async function handleToggleExam() {
    setIsTogglingExam(true);
    try {
      const nextState = !examIsOpen;
      const res = await toggleExamOpenAction(nextState);
      if (res.success) {
        setExamIsOpen(res.isOpen);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle exam status:", err);
    } finally {
      setIsTogglingExam(false);
    }
  }

  // Handle Scores Released Toggle (Publish to Students)
  async function handleToggleScoresReleased() {
    setIsTogglingScores(true);
    try {
      const nextState = !scoresReleased;
      const res = await toggleScoresReleasedAction(nextState);
      if (res.success) {
        setScoresReleased(res.scoresReleased);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle score release status:", err);
    } finally {
      setIsTogglingScores(false);
    }
  }

  // Handle Student Attempt Reset
  async function handleConfirmReset() {
    if (!resettingStudent) return;
    setIsResetting(true);
    setResetError("");

    try {
      const res = await resetStudentAttemptAction(resettingStudent.email);
      if (res.success) {
        setResettingStudent(null);
        window.location.reload();
      } else {
        setResetError(res.error || "Failed to reset attempt.");
      }
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Failed to reset attempt.");
    } finally {
      setIsResetting(false);
    }
  }

  // Export to CSV
  function handleExportCsv() {
    const headers = [
      "Student Name",
      "Email",
      "Status",
      "Score (x/25)",
      "Percentage (%)",
      "Time Taken (Seconds)",
      "Submitted At",
    ];

    const csvLines = [headers.join(",")];

    filteredRows.forEach((r) => {
      const name = `"${(r.name || "").replace(/"/g, '""')}"`;
      const email = `"${r.email.replace(/"/g, '""')}"`;
      const status = r.status;
      const score = r.score !== null ? r.score : "";
      const percentage = r.percentage !== null ? `${r.percentage}%` : "";
      const timeTaken = r.timeTakenSeconds !== null ? r.timeTakenSeconds : "";
      const submittedAt = r.submittedAt ? `"${new Date(r.submittedAt).toISOString()}"` : "";

      csvLines.push([name, email, status, score, percentage, timeTaken, submittedAt].join(","));
    });

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `project_builders_final_exam_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function formatDuration(seconds: number | null) {
    if (!seconds && seconds !== 0) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  function formatTimestamp(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "—";
    }
  }

  return (
    <div className="space-y-8 text-left font-sans">
      {/* ---------------------------------------------------------------------
          Summary Header & Live Exam Controls
          --------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#102038]/10 pb-5">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#BA9C60]">
            Capstone Assessment Console
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#102038]">
            Final Examination Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#102038]/60">
            Real-time cohort roster, server-calculated scoring, and attempt management.
          </p>
        </div>

        {/* Exam Controls: Open/Close Toggle & Scores Release Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Exam Window Toggle */}
          <button
            type="button"
            onClick={handleToggleExam}
            disabled={isTogglingExam}
            title={examIsOpen ? "Click to lock the exam window" : "Click to open the exam window"}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-all cursor-pointer shadow-xs ${
              examIsOpen
                ? "bg-[#EBF7F4] text-[#1E4D40] border-2 border-[#5BBFA4] hover:bg-[#5BBFA4]/20"
                : "bg-[#FEF2F2] text-[#991B1B] border-2 border-[#EF4444] hover:bg-[#EF4444]/20"
            }`}
          >
            {isTogglingExam ? (
              <SpinnerGap size={16} weight="bold" className="animate-spin" />
            ) : examIsOpen ? (
              <LockOpen size={16} weight="bold" className="text-[#5BBFA4]" />
            ) : (
              <Lock size={16} weight="bold" className="text-[#EF4444]" />
            )}
            <span>Exam Window: {examIsOpen ? "Open" : "Closed"}</span>
          </button>

          {/* Scores Released Toggle */}
          <button
            type="button"
            onClick={handleToggleScoresReleased}
            disabled={isTogglingScores}
            title={
              scoresReleased
                ? "Scores are currently visible to students on their dashboard. Click to hide."
                : "Scores are currently hidden from students. Click to publish grades to students."
            }
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-all cursor-pointer shadow-xs ${
              scoresReleased
                ? "bg-[#EBF7F4] text-[#1E4D40] border-2 border-[#5BBFA4] hover:bg-[#5BBFA4]/20"
                : "bg-[#FDF8ED] text-[#8C6D23] border-2 border-[#BA9C60] hover:bg-[#BA9C60]/20"
            }`}
          >
            {isTogglingScores ? (
              <SpinnerGap size={16} weight="bold" className="animate-spin" />
            ) : scoresReleased ? (
              <Eye size={16} weight="bold" className="text-[#5BBFA4]" />
            ) : (
              <EyeSlash size={16} weight="bold" className="text-[#BA9C60]" />
            )}
            <span>
              Student Scores: {scoresReleased ? "Published (Visible)" : "Hidden (Under Review)"}
            </span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          Summary Statistics Cards (Total, Submitted, Average, Highest, Lowest)
          --------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Total Students */}
        <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <div className="text-xs uppercase font-sans font-semibold text-[#102038]/50 flex items-center justify-between">
            <span>Enrolled Students</span>
            <Users size={16} weight="bold" className="text-[#102038]/40" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[#102038]">
            {totalStudents}
          </div>
          <div className="text-[11px] font-sans text-[#102038]/50">
            Registered accounts
          </div>
        </div>

        {/* Submitted Count */}
        <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <div className="text-xs uppercase font-sans font-semibold text-[#1E4D40] flex items-center justify-between">
            <span>Submitted Count</span>
            <CheckCircle size={16} weight="fill" className="text-[#5BBFA4]" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[#1E4D40]">
            {submittedCount}
          </div>
          <div className="text-[11px] font-sans text-[#1E4D40]/70">
            {totalStudents > 0 ? `${Math.round((submittedCount / totalStudents) * 100)}% completion rate` : "0%"}
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <div className="text-xs uppercase font-sans font-semibold text-[#102038]/50 flex items-center justify-between">
            <span>Average Score</span>
            <ChartBar size={16} weight="bold" className="text-[#BA9C60]" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[#102038]">
            {averageScore !== null ? `${averageScore} / 25` : "—"}
          </div>
          <div className="text-[11px] font-sans text-[#102038]/50">
            {averagePercentage !== null ? `${averagePercentage}% cohort average` : "No submissions"}
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <div className="text-xs uppercase font-sans font-semibold text-[#5BBFA4] flex items-center justify-between">
            <span>Highest Score</span>
            <TrendUp size={16} weight="bold" className="text-[#5BBFA4]" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[#1E4D40]">
            {highestScore !== null ? `${highestScore} / 25` : "—"}
          </div>
          <div className="text-[11px] font-sans text-[#1E4D40]/70">
            {highestScore !== null ? `${Math.round((highestScore / 25) * 100)}% top score` : "No submissions"}
          </div>
        </div>

        {/* Lowest Score */}
        <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="text-xs uppercase font-sans font-semibold text-[#102038]/50 flex items-center justify-between">
            <span>Lowest Score</span>
            <Clock size={16} weight="bold" className="text-[#102038]/40" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[#102038]">
            {lowestScore !== null ? `${lowestScore} / 25` : "—"}
          </div>
          <div className="text-[11px] font-sans text-[#102038]/50">
            {lowestScore !== null ? `${Math.round((lowestScore / 25) * 100)}% floor score` : "No submissions"}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          Search, Filters & Export Bar
          --------------------------------------------------------------------- */}
      <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#102038]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or email address..."
            className="w-full min-h-[42px] pl-10 pr-4 text-xs sm:text-sm font-sans bg-[#FAF8F3] border border-[#102038]/20 rounded-xl text-[#102038] focus:outline-none focus:border-[#102038]"
          />
        </div>

        {/* Status Filter Tabs & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-[#FAF8F3] border border-[#102038]/15 p-1 text-xs font-sans">
            {(["all", "not_started", "in_progress", "submitted"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#102038] text-[#FAF8F3] font-semibold"
                    : "text-[#102038]/70 hover:text-[#102038]"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-[#FAF8F3] hover:bg-[#E8E2D6] border border-[#102038]/20 text-xs sm:text-sm font-sans font-medium text-[#102038] transition-colors cursor-pointer shadow-xs"
          >
            <DownloadSimple size={16} weight="bold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          Students Roster Table
          --------------------------------------------------------------------- */}
      <div className="bg-[#FFFFFF] border border-[#102038]/15 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F3] border-b border-[#102038]/15 text-[#102038]/70 font-sans font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-[#102038]"
                  onClick={() => {
                    if (sortField === "name") setSortAsc(!sortAsc);
                    else { setSortField("name"); setSortAsc(true); }
                  }}
                >
                  Student Name {sortField === "name" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-[#102038]"
                  onClick={() => {
                    if (sortField === "email") setSortAsc(!sortAsc);
                    else { setSortField("email"); setSortAsc(true); }
                  }}
                >
                  Email {sortField === "email" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-[#102038]"
                  onClick={() => {
                    if (sortField === "status") setSortAsc(!sortAsc);
                    else { setSortField("status"); setSortAsc(true); }
                  }}
                >
                  Status {sortField === "status" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-[#102038]"
                  onClick={() => {
                    if (sortField === "score") setSortAsc(!sortAsc);
                    else { setSortField("score"); setSortAsc(false); }
                  }}
                >
                  Score (x/25) {sortField === "score" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4">Time Taken</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-[#102038]"
                  onClick={() => {
                    if (sortField === "submittedAt") setSortAsc(!sortAsc);
                    else { setSortField("submittedAt"); setSortAsc(false); }
                  }}
                >
                  Submitted At {sortField === "submittedAt" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#102038]/10 font-sans">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#102038]/50">
                    No students match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((st) => (
                  <tr
                    key={st.email}
                    className="hover:bg-[#FAF8F3]/60 transition-colors cursor-pointer"
                    onClick={() => {
                      if (st.status === "submitted" || Object.keys(st.answers).length > 0) {
                        setInspectStudent(st);
                      }
                    }}
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#102038]">
                      {st.name || <span className="text-[#102038]/40 italic">No name saved</span>}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-[#102038]/80">
                      {st.email}
                    </td>

                    <td className="py-3.5 px-4">
                      {st.status === "submitted" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EBF7F4] border border-[#5BBFA4]/40 text-[#1E4D40]">
                          <CheckCircle size={13} weight="fill" className="text-[#5BBFA4]" />
                          <span>Submitted</span>
                        </span>
                      ) : st.status === "in_progress" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FEF3C7] border border-[#F59E0B]/40 text-[#92400E]">
                          <Clock size={13} weight="fill" className="text-[#D97706]" />
                          <span>In progress</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FAF8F3] border border-[#102038]/15 text-[#102038]/60">
                          <span>Not started</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-sm text-[#102038]">
                      {st.score !== null ? `${st.score} / 25` : "—"}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-xs">
                      {st.percentage !== null ? (
                        <span className={st.percentage >= 70 ? "text-[#1E4D40] font-semibold" : "text-[#991B1B]"}>
                          {st.percentage}%
                        </span>
                      ) : "—"}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-[#102038]/70">
                      {formatDuration(st.timeTakenSeconds)}
                    </td>

                    <td suppressHydrationWarning className="py-3.5 px-4 text-xs text-[#102038]/70">
                      {formatTimestamp(st.submittedAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-2">
                        {(st.status === "submitted" || Object.keys(st.answers).length > 0) && (
                          <button
                            type="button"
                            onClick={() => setInspectStudent(st)}
                            className="p-1.5 rounded-lg border border-[#102038]/15 hover:bg-[#FAF8F3] text-[#102038]/80 hover:text-[#102038] transition-colors"
                            title="Inspect Student Answers"
                          >
                            <Eye size={15} weight="bold" />
                          </button>
                        )}

                        {(st.status === "in_progress" || st.status === "submitted") && (
                          <button
                            type="button"
                            onClick={() => setResettingStudent(st)}
                            className="p-1.5 rounded-lg border border-[#EF4444]/30 hover:bg-[#FEF2F2] text-[#DC2626] transition-colors"
                            title="Reset Student Attempt"
                          >
                            <ArrowClockwise size={15} weight="bold" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          Inspect Student Answers vs Correct Answers Modal
          --------------------------------------------------------------------- */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 bg-[#102038]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#102038]/20 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#102038]/10 flex items-start justify-between gap-4 bg-[#FAF8F3]">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#BA9C60]">
                  Official Grading Key &amp; Student Submissions
                </div>
                <h3 className="font-display font-bold text-2xl text-[#102038] mt-0.5">
                  {inspectStudent.name || inspectStudent.email}
                </h3>
                <div className="text-xs font-sans text-[#102038]/60 flex flex-wrap items-center gap-3 pt-1">
                  <span>Email: <strong className="text-[#102038]">{inspectStudent.email}</strong></span>
                  <span>&bull;</span>
                  <span>Server Score: <strong className="text-[#1E4D40]">{inspectStudent.score !== null ? `${inspectStudent.score} / 25 (${inspectStudent.percentage}%)` : "Pending"}</strong></span>
                  <span>&bull;</span>
                  <span>Time Taken: <strong>{formatDuration(inspectStudent.timeTakenSeconds)}</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="text-[#102038]/40 hover:text-[#102038] p-2 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Questions Inspection List */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-[#102038]/10">
              {questions.map((q, idx) => {
                const selectedOptionIdx = inspectStudent.answers[q.id];
                const isAnswered = typeof selectedOptionIdx === "number";
                const isCorrect = isAnswered && selectedOptionIdx === q.correctOptionIndex;

                return (
                  <div key={q.id} className="pt-5 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-[#102038]">
                          Question {idx + 1} of 25
                        </span>
                        {q.topic && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#BA9C60] bg-[#FAF8F3] border border-[#BA9C60]/30 px-2 py-0.5 rounded">
                            {q.topic}
                          </span>
                        )}
                      </div>

                      {/* Point Tag */}
                      <div>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E4D40] bg-[#EBF7F4] border border-[#5BBFA4]/40 px-2.5 py-0.5 rounded-md">
                            <CheckCircle size={14} weight="fill" className="text-[#5BBFA4]" />
                            <span>1 / 1 point (Correct)</span>
                          </span>
                        ) : isAnswered ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] border border-[#EF4444]/40 px-2.5 py-0.5 rounded-md">
                            <X size={14} weight="bold" className="text-[#EF4444]" />
                            <span>0 / 1 point (Incorrect)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#102038]/50 bg-[#FAF8F3] border border-[#102038]/15 px-2.5 py-0.5 rounded-md">
                            <span>0 / 1 point (Unanswered)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <QuestionRenderer text={q.text} />

                    {/* Options Breakdown */}
                    <div className="space-y-2 pt-1">
                      {q.options.map((optText, optIdx) => {
                        const isStudentChoice = selectedOptionIdx === optIdx;
                        const isTheCorrectAnswer = optIdx === q.correctOptionIndex;

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                              isTheCorrectAnswer
                                ? "bg-[#EBF7F4] border-[#5BBFA4] text-[#102038] font-medium"
                                : isStudentChoice
                                ? "bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]"
                                : "bg-[#FFFFFF] border-[#102038]/10 text-[#102038]/70"
                            }`}
                          >
                            <span className="font-mono font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{optText}</span>

                            <div className="shrink-0 flex items-center gap-2">
                              {isStudentChoice && (
                                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/5 text-[#102038]">
                                  Student Choice
                                </span>
                              )}
                              {isTheCorrectAnswer && (
                                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#5BBFA4] text-[#102038]">
                                  ✓ Correct Key
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#102038]/10 bg-[#FAF8F3] text-right">
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="px-5 py-2 text-xs sm:text-sm font-sans font-medium text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-xl transition-colors cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          Reset Student Attempt Confirmation Modal
          --------------------------------------------------------------------- */}
      {resettingStudent && (
        <div className="fixed inset-0 z-50 bg-[#102038]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#EF4444]/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/40 flex items-center justify-center shrink-0">
                <WarningCircle size={22} weight="fill" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-[#102038]">
                  Reset Student Attempt?
                </h3>
                <p className="text-xs font-sans text-[#102038]/60">
                  Confirmation required for retake authorization
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-sans text-[#102038]/80 leading-relaxed">
              Are you sure you want to reset the exam attempt for{" "}
              <strong>{resettingStudent.name || resettingStudent.email}</strong>?
            </p>

            <div className="bg-[#FEF2F2] border border-[#EF4444]/30 rounded-xl p-3.5 text-xs text-[#991B1B] leading-relaxed">
              This will permanently clear their server timer, recorded answers, and score ({resettingStudent.score !== null ? `${resettingStudent.score}/25` : "in-progress"}), allowing them to begin a fresh 50-minute exam session.
            </div>

            {resetError && (
              <p className="text-xs text-[#DC2626] font-semibold">{resetError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResettingStudent(null)}
                disabled={isResetting}
                className="px-4 py-2 text-xs sm:text-sm font-sans text-[#102038]/70 hover:text-[#102038] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-sans font-semibold text-[#FAF8F3] bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isResetting ? (
                  <>
                    <SpinnerGap size={14} weight="bold" className="animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Yes, Reset Attempt</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
