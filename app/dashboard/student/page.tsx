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
import { PreviousWeeksSection } from "@/components/student/previous-weeks-section";
import {
  ArrowSquareOut,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  GithubLogo,
  GraduationCap,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string; expanded?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isExpanded = resolvedParams?.expanded === "1";
  const session = await auth();
  const studentEmail = session?.user?.email || "student@projectbuilders.dev";

  // 1. Fetch weeks (strict query-level filtering: only published = true)
  const publishedWeeks = await getWeeksForStudent("cohort-data-analysis-fall-2026");

  // Sort by weekNumber ascending
  const sortedPublishedWeeks = [...publishedWeeks].sort((a, b) => a.weekNumber - b.weekNumber);

  // 2. Compute "current week" as the published week with the highest weekNumber
  const currentWeek = sortedPublishedWeeks.length > 0
    ? sortedPublishedWeeks[sortedPublishedWeeks.length - 1]
    : null;

  // 3. All earlier published weeks go into "Previous weeks" (sorted descending)
  const previousWeeks = sortedPublishedWeeks.length > 1
    ? sortedPublishedWeeks.slice(0, -1).reverse()
    : [];

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

  // Current week submission & assessment calculations
  const currentSubmission = currentWeek
    ? submissionsList.find((s) => s.weekId === currentWeek.id)
    : null;
  const isCurrentDeadlinePassed = currentWeek
    ? new Date() > new Date(currentWeek.deadline)
    : false;
  const currentAssessment = currentWeek
    ? allAssessments.find((a) => a.weekId === currentWeek.id && !a.isFinal)
    : null;
  const currentAssessmentScore = currentAssessment
    ? studentScores.find((s) => s.assessmentId === currentAssessment.id)
    : null;

  // Left-edge 4px solid status color bar for Current Week
  let currentStatusBorder = "border-l-[#102038]";
  let currentStatusLabel = "Not started";
  let currentStatusTextColor = "text-[#102038]";
  let currentStatusDotColor = "bg-[#102038]";

  if (currentAssessmentScore && currentAssessment) {
    if (currentAssessmentScore.scorePercentage >= currentAssessment.passingScore) {
      currentStatusBorder = "border-l-[#5BBFA4]";
      currentStatusLabel = `Graded (${currentAssessmentScore.scorePercentage}% passed)`;
      currentStatusTextColor = "text-[#1E4D40]";
      currentStatusDotColor = "bg-[#5BBFA4]";
    } else {
      currentStatusBorder = "border-l-[#B91C1C]";
      currentStatusLabel = `Needs retake (${currentAssessmentScore.scorePercentage}%)`;
      currentStatusTextColor = "text-[#B91C1C]";
      currentStatusDotColor = "bg-[#B91C1C]";
    }
  } else if (currentSubmission) {
    currentStatusBorder = "border-l-[#BA9C60]";
    currentStatusLabel = "Submitted";
    currentStatusTextColor = "text-[#8C6D23]";
    currentStatusDotColor = "bg-[#BA9C60]";
  } else if (isCurrentDeadlinePassed) {
    currentStatusBorder = "border-l-[#B91C1C]";
    currentStatusLabel = "Past deadline";
    currentStatusTextColor = "text-[#B91C1C]";
    currentStatusDotColor = "bg-[#B91C1C]";
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between overflow-x-hidden text-left">
      {/* Top Navigation Bar */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#102038]/15 px-4 sm:px-8 py-3.5 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-lg bg-[#FAF8F3] border border-[#102038]/15 p-1 flex items-center justify-center shrink-0">
              <Image
                src="/brand/project_buillders_logo.PNG"
                alt="Project Builders"
                fill
                sizes="36px"
                className="object-contain p-0.5"
              />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold tracking-tight text-[#102038]">
                Project Builders
              </div>
              <div className="text-xs font-sans text-[#7E8B9B]">
                Student workspace
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-sans font-medium text-[#102038]">
                {studentEmail}
              </div>
              <div className="text-xs font-sans text-[#7E8B9B]">
                Student account
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 flex-1 text-left">
        {/* Cohort Header Banner */}
        <section className="bg-[#FFFFFF] border border-[#102038]/15 rounded-xl p-6 sm:p-8 space-y-3 text-left">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="text-left">
              <div className="text-xs font-sans text-[#7E8B9B]">
                Active cohort
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102038] mt-1 tracking-tight">
                Data Analysis — Fall 2026
              </h1>
              <p className="text-sm font-sans text-[#4A5568] max-w-2xl mt-1.5 leading-relaxed">
                4-week intensive project cadence. Master real-world enterprise datasets, metric definitions, and verifiable executive reporting.
              </p>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-[#102038]/10 pt-3 sm:pt-0 sm:pl-6 text-left sm:text-right shrink-0">
              <span className="text-xs font-sans text-[#7E8B9B]">Active projects</span>
              <span className="text-2xl font-bold font-mono text-[#102038]">
                {publishedWeeks.length} / 4
              </span>
            </div>
          </div>
        </section>

        {/* Builder Profile Setup */}
        <StudentProfileBanner
          currentName={userRecord?.name || null}
          studentEmail={studentEmail}
        />

        {/* DOMINANT SECTION: Current Week */}
        {currentWeek ? (
          <section className="space-y-3 text-left">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-sans text-[#7E8B9B]">
                  Dominant focus
                </span>
                <h2 className="text-xl font-display font-bold text-[#102038]">
                  Current week project
                </h2>
              </div>
            </div>

            <div
              className={`bg-[#FFFFFF] border border-[#102038]/15 border-l-4 ${currentStatusBorder} rounded-xl p-6 sm:p-7 space-y-5 text-left transition-colors motion-reduce:transition-none`}
            >
              {/* Header: Week number, Title, Status & Deadline */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#102038]/10 pb-4">
                <div className="space-y-1 text-left">
                  <div className="text-xs font-mono font-semibold text-[#7E8B9B]">
                    Week {currentWeek.weekNumber}
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#102038] tracking-tight">
                    {currentWeek.title}
                  </h3>

                  {/* Status Indicator */}
                  <div className={`text-xs font-sans font-medium ${currentStatusTextColor} flex items-center gap-1.5 pt-0.5`}>
                    <span className={`w-2 h-2 rounded-full ${currentStatusDotColor}`} />
                    <span>{currentStatusLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-sans text-[#7E8B9B] shrink-0 pt-0.5">
                  <Calendar size={14} weight="bold" />
                  <span>
                    Deadline:{" "}
                    <strong className="text-[#102038] font-medium">
                      {new Date(currentWeek.deadline).toLocaleDateString("en-US", {
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
              <div className="space-y-1.5 text-left">
                <div className="text-xs font-sans font-medium text-[#7E8B9B]">
                  Executive briefing &amp; objectives
                </div>
                <p className="text-sm font-sans text-[#4A5568] leading-relaxed text-left">
                  {currentWeek.brief}
                </p>
              </div>

              {/* If Submission Exists: Display Submission Details */}
              {currentSubmission && (
                <div className="bg-[#FAF8F3] border border-[#102038]/15 rounded-lg p-4 space-y-2.5 text-xs font-sans text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#102038]/10 pb-2">
                    <div className="flex items-center gap-2">
                      <GithubLogo size={16} weight="bold" className="text-[#102038]" />
                      <a
                        href={currentSubmission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-semibold text-[#102038] hover:text-[#5BBFA4] hover:underline flex items-center gap-1 min-h-[44px]"
                      >
                        <span>{currentSubmission.githubUrl}</span>
                        <ArrowSquareOut size={13} weight="bold" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-sans">
                      {currentSubmission.isReachable ? (
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
                        {new Date(currentSubmission.updatedAt).toLocaleDateString("en-US", {
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
                      &ldquo;{currentSubmission.reflectionFindings}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Action Bar: All min-44px touch targets */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {currentWeek.datasetUrl && (
                    <a
                      href={currentWeek.datasetUrl}
                      download
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-sans font-medium text-[#102038] bg-[#FAF8F3] hover:bg-[#E8E2D6] border border-[#102038]/20 rounded-lg transition-colors"
                    >
                      <FileText size={15} weight="bold" />
                      <span>Download Dataset</span>
                    </a>
                  )}
                  {currentWeek.slidesUrl && (
                    <a
                      href={currentWeek.slidesUrl}
                      download
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-sans font-medium text-[#102038] bg-[#FAF8F3] hover:bg-[#E8E2D6] border border-[#102038]/20 rounded-lg transition-colors"
                    >
                      <BookOpen size={15} weight="bold" />
                      <span>Brief Guide</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {currentAssessment && (
                    <Link
                      href={`/dashboard/student/quiz/${currentAssessment.id}`}
                      className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-sans font-semibold rounded-lg transition-colors border ${
                        currentAssessmentScore
                          ? currentAssessmentScore.scorePercentage >= currentAssessment.passingScore
                            ? "bg-[#FAF8F3] text-[#1E4D40] border-[#5BBFA4] hover:bg-[#EBF7F4]"
                            : "bg-[#FAF8F3] text-[#B91C1C] border-[#B91C1C] hover:bg-red-50"
                          : "bg-[#FAF8F3] text-[#102038] border-[#102038]/20 hover:bg-[#E8E2D6]"
                      }`}
                    >
                      <GraduationCap size={15} weight="bold" />
                      <span>
                        {currentAssessmentScore
                          ? `Quiz Score: ${currentAssessmentScore.scorePercentage}% (${
                              currentAssessmentScore.scorePercentage >= currentAssessment.passingScore
                                ? "Passed"
                                : "Retake"
                            })`
                          : "Take Checkpoint Quiz"}
                      </span>
                    </Link>
                  )}

                  <SubmitDialog week={currentWeek} existingSubmission={currentSubmission} />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-[#FFFFFF] border border-[#102038]/15 rounded-xl p-8 text-left space-y-2">
            <h2 className="text-xl font-display font-bold text-[#102038]">
              No active projects published
            </h2>
            <p className="text-sm font-sans text-[#7E8B9B]">
              The cohort has not published any project briefs yet. Please check back when class commences.
            </p>
          </section>
        )}

        {/* SECTION: Previous Weeks (Collapsed by default, only appears if earlier published weeks exist) */}
        {previousWeeks.length > 0 && (
          <PreviousWeeksSection
            weeks={previousWeeks}
            submissionsList={submissionsList}
            studentScores={studentScores}
            allAssessments={allAssessments}
            defaultOpenFirst={isExpanded}
          />
        )}

        {/* Section: Technical Briefing & Course FAQ */}
        <CourseFaqSection />
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#102038]/15 px-4 sm:px-8 py-4 mt-8 text-left">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-[#7E8B9B]">
          <div>Project Builders &bull; Student Workspace</div>
          <div>All Submissions &amp; Checkpoints Gated by Proof of Work</div>
        </div>
      </footer>
    </div>
  );
}
