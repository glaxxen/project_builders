import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getWeeksForStudent } from "@/lib/db/queries/weeks";
import { getSubmissionsForStudent } from "@/lib/db/queries/submissions";
import { getAllScoresForStudent, getAllAssessments } from "@/lib/db/queries/assessments";
import { getUserByEmail } from "@/lib/db/queries/users";
import type { User } from "@/lib/db/schema";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SubmitDialog } from "@/components/submissions/submit-dialog";
import { StudentProfileBanner } from "@/components/student/student-profile-banner";
import { CourseFaqSection } from "@/components/student/course-faq-section";
import {
  ArrowSquareOut,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  GitBranch,
  GithubLogo,
  GraduationCap,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await auth();
  const studentEmail = session?.user?.email || "student@projectbuilders.dev";

  // Fetch weeks (strict query-level filtering: only published = true)
  const weeks = await getWeeksForStudent("cohort-data-analysis-fall-2026");

  // Fetch all assessments configured for this cohort
  const allAssessments = await getAllAssessments();

  // Fetch student submissions & scores if registered in DB
  let submissionsList: Awaited<ReturnType<typeof getSubmissionsForStudent>> = [];
  let studentScores: Awaited<ReturnType<typeof getAllScoresForStudent>> = [];
  let userRecord: User | null = null;

  if (session?.user?.email) {
    const fetchedUser = await getUserByEmail(session.user.email);

    if (fetchedUser) {
      userRecord = fetchedUser;
      submissionsList = await getSubmissionsForStudent(fetchedUser.id);
      studentScores = await getAllScoresForStudent(fetchedUser.id);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#E8E2D6] px-6 sm:px-10 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6] p-1 flex items-center justify-center">
              <Image
                src="/brand/project_buillders_logo.PNG"
                alt="Project Builders"
                fill
                sizes="36px"
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-[#102038]">
                Project Builders
              </div>
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#5BBFA4]">
                Student Workspace
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-sans font-medium text-[#102038]">
                {studentEmail}
              </div>
              <div className="text-[10px] font-mono font-semibold text-[#1E4D40] bg-[#EBF7F4] px-2 py-0.5 rounded inline-block mt-0.5">
                Role: Student
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-8 flex-1">
        {/* Cohort Header Banner */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(16,32,56,0.04)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#5BBFA4] font-semibold uppercase tracking-widest">
                <Sparkle size={14} weight="fill" />
                <span>Active Cohort</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102038] mt-1">
                Data Analysis — Fall 2026
              </h1>
              <p className="text-sm font-sans text-[#4A5568] max-w-2xl mt-1">
                4-week intensive project cadence. Master real-world enterprise datasets, metric definitions, and verifiable executive reporting.
              </p>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-[#E8E2D6] pt-3 sm:pt-0 sm:pl-6 text-right">
              <span className="text-xs font-mono text-[#7E8B9B]">Active Projects</span>
              <span className="text-2xl font-bold font-mono text-[#102038]">
                {weeks.length} / 4
              </span>
            </div>
          </div>
        </div>

        {/* Builder Profile Setup (Real Name for Roster & Certificates) */}
        <StudentProfileBanner
          currentName={userRecord?.name || null}
          studentEmail={studentEmail}
        />

        {/* Section: Published Projects (Strict Filter per PRD Section 9) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-[#102038]">
                Published Projects &amp; Briefs
              </h2>
              <p className="text-xs font-sans text-[#7E8B9B]">
                Review project briefs, download real datasets, and submit repository proof-of-work before deadlines.
              </p>
            </div>
            <span className="text-xs font-mono text-[#7E8B9B] hidden sm:inline">
              Strict Gate: Published Only
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {weeks.map((week) => {
              const submission = submissionsList.find((s) => s.weekId === week.id);
              const isDeadlinePassed = new Date() > new Date(week.deadline);
              const weekAssessment = allAssessments.find((a) => a.weekId === week.id && !a.isFinal);
              const assessmentScore = weekAssessment
                ? studentScores.find((s) => s.assessmentId === weekAssessment.id)
                : null;

              return (
                <div
                  key={week.id}
                  className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-6 shadow-sm space-y-4 hover:border-[#102038] transition-colors"
                >
                  {/* Top Bar with Title, Status & Deadline */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FAF8F3] pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-mono font-bold bg-[#102038] text-[#FAF8F3] px-2.5 py-1 rounded">
                        Week {week.weekNumber}
                      </span>
                      <h3 className="text-base font-bold text-[#102038]">
                        {week.title}
                      </h3>

                      {/* Status Badges */}
                      {submission ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3]">
                          <CheckCircle size={12} weight="fill" className="text-[#5BBFA4]" />
                          <span>Submitted</span>
                        </span>
                      ) : isDeadlinePassed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-red-50 text-red-700 border border-red-200">
                          <WarningCircle size={12} weight="bold" />
                          <span>Past Deadline</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#FAF8F3] text-[#7E8B9B] border border-[#E8E2D6]">
                          <span>Not Started</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#7E8B9B]">
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
                  </div>

                  {/* Project Brief */}
                  <p className="text-sm font-sans text-[#4A5568] leading-relaxed">
                    {week.brief}
                  </p>

                  {/* If Submission Exists: Display Submission Details */}
                  {submission && (
                    <div className="bg-[#FAF8F3] border border-[#E8E2D6] rounded-xl p-4 space-y-2 text-xs font-sans">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D6] pb-2">
                        <div className="flex items-center gap-2">
                          <GithubLogo size={16} weight="bold" className="text-[#102038]" />
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono font-semibold text-[#102038] hover:text-[#5BBFA4] hover:underline flex items-center gap-1"
                          >
                            <span>{submission.githubUrl}</span>
                            <ArrowSquareOut size={12} weight="bold" />
                          </a>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          {submission.isReachable ? (
                            <span className="text-[#1E4D40] flex items-center gap-1">
                              <CheckCircle size={12} weight="bold" className="text-[#5BBFA4]" />
                              <span>Publicly Accessible</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 flex items-center gap-1">
                              <WarningCircle size={12} weight="bold" />
                              <span>Check Repo Permissions</span>
                            </span>
                          )}
                          <span>&bull;</span>
                          <span className="text-[#7E8B9B]">
                            {new Date(submission.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-[#102038] text-[11px] font-mono uppercase tracking-wider text-[#7E8B9B] mb-1">
                          Documented Insights &amp; Findings:
                        </div>
                        <p className="text-[#4A5568] whitespace-pre-line leading-relaxed italic">
                          &ldquo;{submission.reflectionFindings}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {week.datasetUrl && (
                        <a
                          href={week.datasetUrl}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-[#102038] bg-[#FAF8F3] hover:bg-[#E8E2D6] border border-[#E8E2D6] rounded-md transition-colors"
                        >
                          <FileText size={14} weight="bold" />
                          <span>Download Dataset</span>
                        </a>
                      )}
                      {week.slidesUrl && (
                        <a
                          href={week.slidesUrl}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-[#102038] bg-[#FAF8F3] hover:bg-[#E8E2D6] border border-[#E8E2D6] rounded-md transition-colors"
                        >
                          <BookOpen size={14} weight="bold" />
                          <span>Brief Guide</span>
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {weekAssessment && (
                        <Link
                          href={`/dashboard/student/quiz/${weekAssessment.id}`}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-semibold rounded-lg transition-colors border shadow-xs ${
                            assessmentScore
                              ? assessmentScore.scorePercentage >= weekAssessment.passingScore
                                ? "bg-[#EBF7F4] text-[#1E4D40] border-[#77CBB3] hover:bg-[#D6ECE6]"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              : "bg-[#FAF8F3] text-[#102038] border-[#E8E2D6] hover:bg-[#E8E2D6]"
                          }`}
                        >
                          <GraduationCap size={15} weight="bold" />
                          <span>
                            {assessmentScore
                              ? `Quiz Score: ${assessmentScore.scorePercentage}% (${
                                  assessmentScore.scorePercentage >= weekAssessment.passingScore
                                    ? "Passed"
                                    : "Retake"
                                })`
                              : "Take Checkpoint Quiz"}
                          </span>
                        </Link>
                      )}

                      <SubmitDialog week={week} existingSubmission={submission} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Technical Briefing & Course FAQ (PRD Section 5.9) */}
        <CourseFaqSection />
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E8E2D6] px-6 sm:px-10 py-4 mt-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
          <div>Project Builders &bull; Student Portal</div>
          <div>All Submissions &amp; Checkpoints Gated by Proof of Work</div>
        </div>
      </footer>
    </div>
  );
}
