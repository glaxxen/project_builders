import Image from "next/image";
import { auth } from "@/auth";
import { getUserByEmail, ensureUserExists } from "@/lib/db/queries/users";
import { getExamAttemptByStudent, getExamSettings } from "@/lib/db/sqlite-store";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StudentDashboardClient } from "@/components/student/student-dashboard-client";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string; email?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const session = await auth();
  const studentEmail = (
    resolvedParams?.email ||
    session?.user?.email ||
    (resolvedParams?.preview ? "glaxxen@gmail.com" : "student@projectbuilders.dev")
  ).toLowerCase().trim();

  // 1. Ensure user record exists
  let userRecord = await getUserByEmail(studentEmail);
  if (!userRecord && (session?.user?.email || resolvedParams?.preview)) {
    userRecord = await ensureUserExists({
      id: session?.user?.id,
      email: studentEmail,
      name: session?.user?.name || null,
      role: "student",
    });
  }

  // 2. Fetch exam attempt and settings (from rock-solid local store)
  const attempt = getExamAttemptByStudent(studentEmail);
  const settings = getExamSettings();

  const examStatus = attempt?.status || "not_started";

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
                priority
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
        <StudentDashboardClient
          initialName={userRecord?.name || null}
          studentEmail={studentEmail}
          examStatus={examStatus}
          examIsOpen={settings.isOpen}
          scoresReleased={settings.scoresReleased}
          attemptScore={settings.scoresReleased ? (attempt?.score ?? null) : null}
          attemptPercentage={settings.scoresReleased ? (attempt?.percentage ?? null) : null}
          attemptStartedAt={attempt?.startedAt || null}
          attemptSubmittedAt={attempt?.submittedAt || null}
        />
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
