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
  ArrowRight,
  ArrowSquareOut,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  GithubLogo,
  GraduationCap,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string; expanded?: string; week?: string; email?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isExpanded = resolvedParams?.expanded === "1";
  const session = await auth();
  const studentEmail = resolvedParams?.email || session?.user?.email || "glaxxen@gmail.com";

  // 1. Fetch weeks (strict query-level filtering: only published = true)
  const publishedWeeks = await getWeeksForStudent("cohort-data-analysis-fall-2026");

  // Sort by weekNumber ascending
  const sortedPublishedWeeks = [...publishedWeeks].sort((a, b) => a.weekNumber - b.weekNumber);

  // Fetch all assessments configured for this cohort
  const allAssessments = await getAllAssessments();

  // Fetch student submissions & scores if registered in DB
  let submissionsList: Awaited<ReturnType<typeof getSubmissionsForStudent>> = [];
  let studentScores: Awaited<ReturnType<typeof getAllScoresForStudent>> = [];
  let userRecord: User | null = null;

  const emailToQuery = studentEmail;
  const fetchedUser = await getUserByEmail(emailToQuery);

  if (fetchedUser) {
    userRecord = fetchedUser;
    submissionsList = await getSubmissionsForStudent(fetchedUser.id);
    studentScores = await getAllScoresForStudent(fetchedUser.id);
  }

  // 2. Student Progression Engine:
  // A week is completed when the student has taken the exam AND submitted the project repository
  const isWeekCompletedByStudent = (w: (typeof sortedPublishedWeeks)[number]) => {
    const assess = allAssessments.find((a) => a.weekId === w.id && !a.isFinal);
    const hasScore = assess ? studentScores.some((s) => s.assessmentId === assess.id) : false;
    const hasSub = submissionsList.some((s) => s.weekId === w.id);
    return hasScore && hasSub;
  };

  // Support explicit week navigation via query parameter (?week=1, ?week=2)
  const requestedWeekNumber = resolvedParams?.week ? parseInt(resolvedParams.week, 10) : null;
  const requestedWeek = requestedWeekNumber
    ? sortedPublishedWeeks.find((w) => w.weekNumber === requestedWeekNumber)
    : null;

  // By default, the student's active focus is the earliest published week they haven't completed
  const activeProgressionWeek = sortedPublishedWeeks.find((w) => !isWeekCompletedByStudent(w));

  const currentWeek =
    requestedWeek ||
    activeProgressionWeek ||
    (sortedPublishedWeeks.length > 0 ? sortedPublishedWeeks[sortedPublishedWeeks.length - 1] : null);

  // 3. All earlier published weeks go into "Previous weeks" (sorted descending)
  const previousWeeks = currentWeek
    ? sortedPublishedWeeks.filter((w) => w.weekNumber < currentWeek.weekNumber).reverse()
    : [];

  // 4. Any published weeks after currentWeek (if viewing an earlier archived week)
  const upcomingPublishedWeeks = currentWeek
    ? sortedPublishedWeeks.filter((w) => w.weekNumber > currentWeek.weekNumber)
    : [];

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

  // Status for Current Week (Strict Single-Attempt Policy)
  let currentStatusLabel = "Active Curriculum Focus";
  let currentStatusBg = "bg-[#BA9C60]";
  let currentStatusTextColor = "text-[#102038]";

  if (currentAssessmentScore && currentAssessment) {
    if (currentAssessmentScore.scorePercentage >= currentAssessment.passingScore) {
      currentStatusLabel = `Exam Passed (${currentAssessmentScore.scorePercentage}%)`;
      currentStatusBg = "bg-[#5BBFA4]";
      currentStatusTextColor = "text-[#102038]";
    } else {
      currentStatusLabel = `Exam Completed (${currentAssessmentScore.scorePercentage}%)`;
      currentStatusBg = "bg-[#F87171]";
      currentStatusTextColor = "text-[#102038]";
    }
  } else if (currentSubmission) {
    currentStatusLabel = "Project Submitted & Under Review";
    currentStatusBg = "bg-[#5BBFA4]";
    currentStatusTextColor = "text-[#102038]";
  } else if (isCurrentDeadlinePassed) {
    currentStatusLabel = "Past Deadline Window";
    currentStatusBg = "bg-[#F87171]";
    currentStatusTextColor = "text-[#102038]";
  }

  const formattedDeadline = currentWeek
    ? new Date(currentWeek.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between overflow-x-hidden text-left font-sans">
      {/* Top Navigation Bar: High Contrast, Bold, Authoritative */}
      <header className="w-full bg-[#FFFFFF] border-b-2 border-[#102038]/15 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-xl bg-[#FAF8F3] border-2 border-[#102038]/20 p-1 flex items-center justify-center shrink-0">
              <Image
                src="/brand/project_buillders_logo.PNG"
                alt="Project Builders"
                fill
                sizes="40px"
                className="object-contain p-0.5"
              />
            </div>
            <div className="text-left">
              <div className="text-base sm:text-lg font-bold tracking-tight text-[#102038] font-display">
                Project Builders
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#102038]/70">
                Student Learning Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-[#102038]">
                {studentEmail}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1E4D40] bg-[#EBF7F4] border border-[#5BBFA4]/40 px-2 py-0.5 rounded-md inline-block mt-0.5">
                Active Student
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main suppressHydrationWarning className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 flex-1 text-left space-y-6">
        {/* Cohort Header: Understated, Elegant Breadcrumb & Metadata (Visibly Secondary to Hero) */}
        <section className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[#102038]/10 pb-5">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider font-sans font-semibold text-[#BA9C60]">
              Active Cohort Program
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#102038] tracking-tight">
              Data Analysis — Fall 2026
            </h1>
            <p className="text-xs sm:text-sm font-sans font-normal text-[#102038]/60">
              4-week practical curriculum &bull; {publishedWeeks.length} of 4 weeks published &bull; Capstone certification
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentAssessment && (
              <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#1E4D40] bg-[#EBF7F4] border border-[#5BBFA4]/30 px-3 py-1.5 rounded-lg">
                <GraduationCap size={15} weight="bold" className="text-[#5BBFA4]" />
                <span>Examination active</span>
              </span>
            )}
          </div>
        </section>

        {/* Builder Profile: Quiet, Subordinate Row */}
        <StudentProfileBanner
          currentName={userRecord?.name || null}
          studentEmail={studentEmail}
        />

        {/* DOMINANT CURRENT WEEK SECTION (SOLID DEEP NAVY #102038, 48-64px DISPLAY, ONE PRIMARY ACTION) */}
        {currentWeek ? (
          <section className="my-14 sm:my-20 lg:my-24">
            <div className="bg-[#102038] text-[#FAF8F3] rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#233B5F] shadow-2xl space-y-8 sm:space-y-10 text-left relative overflow-hidden">
              {/* Top Context Bar: Subdued, Clean, Informative */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF8F3]/15 pb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-widest font-sans font-semibold text-[#FAF8F3]/70 bg-[#FAF8F3]/10 border border-[#FAF8F3]/15 px-3 py-1 rounded-md">
                    Week {currentWeek.weekNumber} of 4
                  </span>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-sans font-semibold ${currentStatusBg} ${currentStatusTextColor}`}>
                    {currentStatusLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-sans font-normal text-[#FAF8F3]/70">
                  <Calendar size={15} weight="bold" className="text-[#5BBFA4]" />
                  <span>
                    Deadline: <strong className="text-[#FAF8F3] font-medium">{formattedDeadline}</strong>
                  </span>
                </div>
              </div>

              {/* Title & Executive Brief: Massive 48-64px Newsreader vs 14-16px Hanken Grotesk 400 */}
              <div className="space-y-4 max-w-4xl">
                <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] leading-[1.06] tracking-tight text-[#FAF8F3] break-words">
                  {currentWeek.title}
                </h2>

                <p className="font-sans font-normal text-sm sm:text-base text-[#FAF8F3]/80 leading-relaxed max-w-2xl pt-1">
                  {currentWeek.brief}
                </p>
              </div>

              {/* Official Recorded Score (Huge Gold #BA9C60 Newsreader Display When Available) */}
              {currentAssessmentScore && (
                <div className="bg-[#0A1424]/80 border border-[#FAF8F3]/15 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 max-w-3xl">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-[#BA9C60] font-sans font-semibold">
                      Official Exam Score Recorded
                    </span>
                    <div className="flex items-baseline gap-4 pt-1">
                      <span className="font-display font-bold text-5xl sm:text-6xl lg:text-[64px] text-[#BA9C60] leading-none">
                        {currentAssessmentScore.scorePercentage}%
                      </span>
                      <span className="text-xs sm:text-sm font-sans font-normal text-[#FAF8F3]/70">
                        {currentAssessmentScore.scorePercentage >= (currentAssessment?.passingScore ?? 70)
                          ? `Benchmark Met (${currentAssessment?.passingScore ?? 70}% required)`
                          : `Benchmark Not Met (${currentAssessment?.passingScore ?? 70}% required)`}
                      </span>
                    </div>
                    <p className="text-xs font-sans font-normal text-[#FAF8F3]/50 pt-1">
                      Deterministic auto-marked &bull; Single-attempt policy enforced
                    </p>
                  </div>

                  {currentAssessment && (
                    <Link
                      href={`/dashboard/student/quiz/${currentAssessment.id}?preview=student`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#FAF8F3]/25 hover:bg-[#FAF8F3]/10 text-xs sm:text-sm font-sans font-normal text-[#FAF8F3] transition-colors shrink-0"
                    >
                      <BookOpen size={16} weight="bold" />
                      <span>Review Questions &amp; Score</span>
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  )}
                </div>
              )}

              {/* THE ONE MOST IMPORTANT THING: SINGULAR DOMINANT HERO ACTION */}
              <div className="pt-2 space-y-4">
                <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#5BBFA4]">
                  {currentAssessmentScore ? "Next Deliverable" : "Primary Action"}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* If exam has NOT been taken yet: Writing the Exam is the dominant hero CTA */}
                  {!currentAssessmentScore && currentAssessment ? (
                    <>
                      <Link
                        href={`/dashboard/student/quiz/${currentAssessment.id}?preview=student`}
                        className="inline-flex items-center justify-center gap-3 min-h-[56px] px-8 py-4 rounded-xl bg-[#5BBFA4] hover:bg-[#77CBB3] active:bg-[#4AA88F] text-[#102038] text-base sm:text-lg font-sans font-bold shadow-xl transition-all cursor-pointer hover:translate-y-[-1px]"
                      >
                        <GraduationCap size={22} weight="bold" />
                        <span>Write Week {currentWeek.weekNumber} Examination &rarr;</span>
                      </Link>

                      <div className="flex items-center gap-2">
                        <SubmitDialog
                          week={currentWeek}
                          existingSubmission={currentSubmission}
                          variant="hero-secondary"
                          customLabel="Submit Project Repo"
                        />
                        <span className="text-xs font-sans font-normal text-[#FAF8F3]/50 hidden md:inline">
                          (Project deliverable)
                        </span>
                      </div>
                    </>
                  ) : (
                    /* If exam IS already taken: Submitting or Reviewing the Project is the dominant hero CTA */
                    <>
                      <SubmitDialog
                        week={currentWeek}
                        existingSubmission={currentSubmission}
                        variant="hero-primary"
                        customLabel={
                          currentSubmission
                            ? "View / Update Project Submission &rarr;"
                            : "Submit Project Repository &rarr;"
                        }
                      />

                      {currentSubmission && (
                        <a
                          href={currentSubmission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 min-h-[50px] px-5 py-2.5 rounded-xl border border-[#FAF8F3]/25 hover:bg-[#FAF8F3]/10 text-xs sm:text-sm font-sans font-normal text-[#FAF8F3] transition-colors"
                        >
                          <ArrowSquareOut size={16} weight="bold" />
                          <span>View Public GitHub Repo</span>
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* Subordinate Action Notes */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-sans font-normal text-[#FAF8F3]/60 pt-1">
                  {currentAssessment && (
                    <>
                      <span>Benchmark: {currentAssessment.passingScore}% passing score</span>
                      <span>&bull;</span>
                      <span>Deterministic evaluation</span>
                      <span>&bull;</span>
                    </>
                  )}
                  <span>Public GitHub repo with 3 findings</span>
                </div>
              </div>

              {/* Curriculum Materials & Datasets: Visibly Subordinate Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#FAF8F3]/15 text-xs sm:text-sm font-sans font-normal text-[#FAF8F3]/70">
                <div>Curriculum materials &amp; study files:</div>

                <div className="flex flex-wrap items-center gap-4">
                  {currentWeek.datasetUrl && (
                    <a
                      href={currentWeek.datasetUrl}
                      download
                      className="inline-flex items-center gap-1.5 text-[#FAF8F3]/80 hover:text-white underline underline-offset-4 decoration-[#FAF8F3]/30 transition-colors"
                    >
                      <FileText size={15} weight="bold" />
                      <span>Dataset (.csv)</span>
                    </a>
                  )}

                  {currentWeek.slidesUrl && (
                    <a
                      href={currentWeek.slidesUrl}
                      download
                      className="inline-flex items-center gap-1.5 text-[#FAF8F3]/80 hover:text-white underline underline-offset-4 decoration-[#FAF8F3]/30 transition-colors"
                    >
                      <BookOpen size={15} weight="bold" />
                      <span>Brief Guide (.pdf)</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white border border-[#102038]/15 rounded-2xl p-8 text-left space-y-2">
            <h2 className="text-xl font-display font-semibold text-[#102038]">
              No active projects published
            </h2>
            <p className="text-sm font-sans font-normal text-[#102038]/60">
              The cohort has not published any project briefs yet. Please check back when class commences.
            </p>
          </section>
        )}

        {/* SECTION: Previous Weeks (Visibly secondary, collapsed by default, quiet & clean) */}
        {previousWeeks.length > 0 && (
          <section className="pt-8 sm:pt-12">
            <div className="mb-4">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#102038] tracking-tight">
                Previous Weeks Archive
              </h3>
              <p className="text-xs sm:text-sm font-sans font-normal text-[#102038]/60 mt-0.5">
                Archived curriculum from earlier in the cohort. Expand any week to review past project submissions, examination scores, and study materials.
              </p>
            </div>

            <PreviousWeeksSection
              weeks={previousWeeks}
              submissionsList={submissionsList}
              studentScores={studentScores}
              allAssessments={allAssessments}
              defaultOpenFirst={isExpanded}
            />
          </section>
        )}

        {/* Section: Technical Briefing & Course FAQ */}
        <section className="pt-8 sm:pt-12">
          <CourseFaqSection />
        </section>
      </main>

      {/* Footer: Clean, Restrained, Academic */}
      <footer className="w-full bg-white border-t border-[#102038]/10 px-4 sm:px-8 py-6 mt-16 text-left">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm font-sans font-normal text-[#102038]/80">
            &copy; 2026 Project Builders &bull; Data Analysis Cohort
          </div>
          <div className="text-xs font-sans font-normal text-[#102038]/50 flex items-center gap-4">
            <span>Deterministic Assessment Engine</span>
            <span>&bull;</span>
            <span>Verified Graduation Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
