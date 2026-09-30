"use client";

import { useState, useMemo } from "react";
import type { StudentCohortRow } from "@/lib/db/queries/admin";
import type { Week } from "@/lib/db/schema";
import {
  ArrowSquareOut,
  CaretDown,
  CaretUp,
  CheckCircle,
  DownloadSimple,
  Eye,
  FileText,
  Funnel,
  GithubLogo,
  MagnifyingGlass,
  Sparkle,
  User,
  WarningCircle,
  X,
  XCircle,
} from "@phosphor-icons/react";

interface CohortOverviewTableProps {
  students: StudentCohortRow[];
  weeks: Week[];
}

export function CohortOverviewTable({ students, weeks }: CohortOverviewTableProps) {
  const [search, setSearch] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "missing" | "completed">("all");
  const [scoreFilter, setScoreFilter] = useState<"all" | "at-risk" | "passing">("all");
  const [sortBy, setSortBy] = useState<"name" | "average" | "completion">("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Selected student for drill-down modal
  const [selectedStudent, setSelectedStudent] = useState<StudentCohortRow | null>(null);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Search
        const q = search.toLowerCase().trim();
        const matchesSearch =
          !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
        if (!matchesSearch) return false;

        // Submission filter
        if (submissionFilter === "missing") {
          const hasMissing = weeks.some((w) => !s.submissionsByWeek[w.weekNumber]);
          if (!hasMissing) return false;
        } else if (submissionFilter === "completed") {
          const allDone = weeks.every((w) => !!s.submissionsByWeek[w.weekNumber]);
          if (!allDone) return false;
        }

        // Score filter
        if (scoreFilter === "at-risk") {
          if (s.overallAverage === null || s.overallAverage >= 70) return false;
        } else if (scoreFilter === "passing") {
          if (s.overallAverage === null || s.overallAverage < 70) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        if (sortBy === "average") {
          const avgA = a.overallAverage ?? -1;
          const avgB = b.overallAverage ?? -1;
          return sortAsc ? avgA - avgB : avgB - avgA;
        }
        if (sortBy === "completion") {
          return sortAsc ? a.completionRate - b.completionRate : b.completionRate - a.completionRate;
        }
        return 0;
      });
  }, [students, weeks, search, submissionFilter, scoreFilter, sortBy, sortAsc]);

  // Export full table to CSV
  const handleExportCSV = () => {
    const headers = [
      "Student ID",
      "Name",
      "Email",
      ...weeks.flatMap((w) => [`Week ${w.weekNumber} Sub`, `Week ${w.weekNumber} Quiz %`]),
      "Final Score %",
      "Overall Average %",
      "Completion Rate %",
    ];

    const rows = filteredStudents.map((s) => {
      const weekCols = weeks.flatMap((w) => {
        const sub = s.submissionsByWeek[w.weekNumber];
        const score = s.scoresByWeek[w.weekNumber];
        return [
          sub ? `Submitted (${sub.githubUrl})` : "Missing",
          score !== null ? `${score}%` : "Not Taken",
        ];
      });

      return [
        `"${s.studentId}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.email}"`,
        ...weekCols.map((col) => `"${col.replace(/"/g, '""')}"`),
        s.finalScore !== null ? `"${s.finalScore}%"` : `"N/A"`,
        s.overallAverage !== null ? `"${s.overallAverage}%"` : `"N/A"`,
        `"${s.completionRate}%"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `project-builders-cohort-overview-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: "name" | "average" | "completion") => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filters, CSV Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-[#102038]">
            Cohort Performance &amp; Submissions Grid
          </h2>
          <p className="text-xs font-sans text-[#7E8B9B]">
            Unified tracking: submissions, reachability, and auto-graded checkpoint scores across all weeks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-semibold text-[#102038] bg-[#FFFFFF] hover:bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer shadow-xs self-start lg:self-auto"
        >
          <DownloadSimple size={15} weight="bold" />
          <span>Export Cohort CSV</span>
        </button>
      </div>

      {/* Filter and Search Strip */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass
              size={14}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E8B9B]"
            />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg text-xs text-[#102038] focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
            />
          </div>

          {/* Submission Filter */}
          <select
            value={submissionFilter}
            onChange={(e) => setSubmissionFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg font-mono text-xs text-[#102038] cursor-pointer"
          >
            <option value="all">Submissions: All</option>
            <option value="missing">Submissions: Missing Only</option>
            <option value="completed">Submissions: All Complete</option>
          </select>

          {/* Score Filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg font-mono text-xs text-[#102038] cursor-pointer"
          >
            <option value="all">Scores: All</option>
            <option value="at-risk">Scores: At-Risk (&lt;70%)</option>
            <option value="passing">Scores: Passing (&ge;70%)</option>
          </select>
        </div>

        <div className="text-xs font-mono text-[#7E8B9B]">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-[#E8E2D6] font-mono text-[#7E8B9B]">
                <th
                  onClick={() => toggleSort("name")}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-[#102038] transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Student</span>
                    {sortBy === "name" && (sortAsc ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />)}
                  </div>
                </th>

                {weeks.map((w) => (
                  <th key={w.id} className="py-3 px-3 font-semibold whitespace-nowrap text-center">
                    Week {w.weekNumber}
                  </th>
                ))}

                <th className="py-3 px-3 font-semibold whitespace-nowrap text-center">
                  Final Exam
                </th>

                <th
                  onClick={() => toggleSort("average")}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-[#102038] transition-colors whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Average</span>
                    {sortBy === "average" && (sortAsc ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />)}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort("completion")}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-[#102038] transition-colors whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Completion</span>
                    {sortBy === "completion" && (sortAsc ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />)}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8E2D6] font-sans">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={weeks.length + 4} className="py-10 text-center text-[#7E8B9B] font-mono">
                    {students.length === 0
                      ? "No students enrolled yet. Once students sign in and submit projects, their records appear here."
                      : "No students match the selected filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.studentId}
                    onClick={() => setSelectedStudent(s)}
                    className="hover:bg-[#FAF8F3]/60 transition-colors cursor-pointer group"
                  >
                    {/* Student Info */}
                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="font-semibold text-[#102038] group-hover:text-[#5BBFA4] transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#7E8B9B]">{s.email}</div>
                    </td>

                    {/* Weeks Submissions + Quiz Scores */}
                    {weeks.map((w) => {
                      const sub = s.submissionsByWeek[w.weekNumber];
                      const score = s.scoresByWeek[w.weekNumber];

                      return (
                        <td key={w.id} className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1 font-mono text-[11px]">
                            {sub ? (
                              <span
                                title={sub.isReachable ? "Reachable public repo" : "Check permissions"}
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold ${
                                  sub.isReachable
                                    ? "bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3]"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                }`}
                              >
                                <CheckCircle size={10} weight="fill" className="text-[#5BBFA4]" />
                                <span>Sub</span>
                              </span>
                            ) : (
                              <span className="text-[#A0AEC0]">-</span>
                            )}

                            {score !== null && score !== undefined ? (
                              <span
                                className={`font-semibold ${
                                  score >= 70 ? "text-[#1E4D40]" : "text-red-600"
                                }`}
                              >
                                {score}%
                              </span>
                            ) : (
                              <span className="text-[#CBD5E1]">--</span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Final Exam */}
                    <td className="py-3 px-3 text-center font-mono font-semibold whitespace-nowrap">
                      {s.finalScore !== null ? (
                        <span className={s.finalScore >= 75 ? "text-[#8C6D23]" : "text-red-600"}>
                          {s.finalScore}%
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1]">--</span>
                      )}
                    </td>

                    {/* Overall Average */}
                    <td className="py-3 px-3 text-center font-mono font-bold whitespace-nowrap">
                      {s.overallAverage !== null ? (
                        <span
                          className={`px-2 py-0.5 rounded ${
                            s.overallAverage >= 70
                              ? "bg-[#EBF7F4] text-[#1E4D40]"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {s.overallAverage}%
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1]">--</span>
                      )}
                    </td>

                    {/* Completion Rate */}
                    <td className="py-3 px-4 text-right font-mono font-semibold whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-[#FAF8F3] border border-[#E8E2D6] rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-[#5BBFA4]"
                            style={{ width: `${s.completionRate}%` }}
                          />
                        </div>
                        <span>{s.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Drill-Down Detail Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#102038]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8E2D6] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#102038]">
                  <User size={20} weight="bold" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#102038]">
                    {selectedStudent.name}
                  </h3>
                  <div className="text-xs font-mono text-[#7E8B9B]">
                    {selectedStudent.email} &bull; ID: {selectedStudent.studentId}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-[#7E8B9B] hover:text-[#102038] p-1.5 rounded-md"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#FAF8F3] border border-[#E8E2D6] p-3 rounded-xl">
                <div className="text-[10px] font-mono text-[#7E8B9B]">Course Completion</div>
                <div className="text-lg font-bold font-mono text-[#102038] mt-0.5">
                  {selectedStudent.completionRate}%
                </div>
              </div>

              <div className="bg-[#FAF8F3] border border-[#E8E2D6] p-3 rounded-xl">
                <div className="text-[10px] font-mono text-[#7E8B9B]">Quiz Average</div>
                <div className="text-lg font-bold font-mono text-[#102038] mt-0.5">
                  {selectedStudent.overallAverage !== null ? `${selectedStudent.overallAverage}%` : "N/A"}
                </div>
              </div>

              <div className="bg-[#FAF8F3] border border-[#E8E2D6] p-3 rounded-xl">
                <div className="text-[10px] font-mono text-[#7E8B9B]">Final Exam Score</div>
                <div className="text-lg font-bold font-mono text-[#102038] mt-0.5">
                  {selectedStudent.finalScore !== null ? `${selectedStudent.finalScore}%` : "Not Taken"}
                </div>
              </div>
            </div>

            {/* Detailed History Per Week */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#102038]">
                Weekly Milestones &amp; Submissions
              </h4>

              <div className="space-y-3">
                {weeks.map((w) => {
                  const sub = selectedStudent.submissionsByWeek[w.weekNumber];
                  const score = selectedStudent.scoresByWeek[w.weekNumber];

                  return (
                    <div
                      key={w.id}
                      className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-4 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-[#102038] text-[#FAF8F3] px-2 py-0.5 rounded">
                            Week {w.weekNumber}
                          </span>
                          <span className="font-semibold text-sm text-[#102038]">
                            {w.title}
                          </span>
                        </div>

                        {score !== null && score !== undefined ? (
                          <span
                            className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              score >= 70
                                ? "bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3]"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            Quiz: {score}%
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-[#7E8B9B]">Quiz not taken</span>
                        )}
                      </div>

                      {sub ? (
                        <div className="bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg p-3 space-y-2 text-xs font-sans">
                          <div className="flex items-center justify-between">
                            <a
                              href={sub.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono font-semibold text-[#102038] hover:text-[#5BBFA4] flex items-center gap-1.5"
                            >
                              <GithubLogo size={14} weight="bold" />
                              <span>{sub.githubUrl}</span>
                              <ArrowSquareOut size={12} weight="bold" />
                            </a>

                            <span className="text-[11px] font-mono text-[#7E8B9B]">
                              Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-[#4A5568] italic border-t border-[#E8E2D6] pt-2 mt-1">
                            &ldquo;{sub.reflectionFindings}&rdquo;
                          </p>
                        </div>
                      ) : (
                        <div className="text-xs font-mono text-[#A0AEC0] italic py-1">
                          No project repository submitted for this milestone.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-[#E8E2D6]">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
