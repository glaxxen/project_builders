import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserByEmail, ensureUserExists } from "@/lib/db/queries/users";
import {
  getExamSettings,
  getExamAttemptByStudent,
  startExamAttempt,
  getAllStoredQuestions,
  autoFinalizeExpiredAttempt,
} from "@/lib/db/sqlite-store";
import { prepareStudentQuestions } from "@/lib/exam/shuffle";
import { ExamRunner } from "@/components/exam/exam-runner";
import { SubmittedScreen } from "@/components/exam/submitted-screen";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { WarningCircle, ArrowLeft, GraduationCap } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

interface ExamPageProps {
  searchParams?: Promise<{
    preview?: string;
    email?: string;
  }>;
}

export default async function ExamPage({ searchParams }: ExamPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isPreview = resolvedParams?.preview === "student" || resolvedParams?.preview === "admin";
  const session = await auth();

  // Authentication gate
  if (!session?.user?.email && !isPreview) {
    redirect("/login?callbackUrl=/exam");
  }

  const studentEmail = (
    resolvedParams?.email ||
    session?.user?.email ||
    (isPreview ? "glaxxen@gmail.com" : "student@projectbuilders.dev")
  ).toLowerCase().trim();

  // 1. Fetch user record
  let userRecord = await getUserByEmail(studentEmail);
  if (!userRecord && isPreview) {
    userRecord = await ensureUserExists({
      id: "preview-student-user-id",
      email: studentEmail,
      name: "Student Preview",
      role: "student",
    });
  }

  // Name Gating: Student must have saved an official builder name
  if (!userRecord?.name || userRecord.name.trim().length === 0) {
    redirect("/dashboard/student");
  }

  // 2. Exam Settings Check (Open/Closed)
  const settings = getExamSettings();
  if (!settings.isOpen) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between">
        <header className="w-full bg-[#FFFFFF] border-b border-[#102038]/15 px-6 sm:px-10 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/dashboard/student" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-[#FAF8F3] border border-[#102038]/20 p-1 flex items-center justify-center">
                <Image
                  src="/brand/project_buillders_logo.PNG"
                  alt="Project Builders"
                  fill
                  sizes="36px"
                  className="object-contain p-0.5"
                />
              </div>
              <span className="font-display font-bold text-base text-[#102038]">
                Project Builders
              </span>
            </Link>
            <SignOutButton />
          </div>
        </header>

        <main className="w-full max-w-xl mx-auto px-6 py-12 flex-1 flex items-center justify-center">
          <div className="bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-3xl p-8 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 flex items-center justify-center mx-auto">
              <WarningCircle size={28} weight="fill" className="text-[#D97706]" />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-display font-bold text-2xl text-[#102038]">
                Assessment Currently Closed
              </h1>
              <p className="text-sm font-sans text-[#102038]/70">
                The Capstone Final Assessment is currently paused by course administration. Please check back when instructors open the examination window.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#102038] text-[#FAF8F3] text-sm font-sans font-medium hover:bg-[#233B5F] transition-colors"
              >
                <ArrowLeft size={16} weight="bold" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. Attempt Inspection & Server-Enforced Timing
  let attempt = getExamAttemptByStudent(studentEmail);

  // If already submitted: show submitted receipt immediately
  if (attempt?.status === "submitted") {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between">
        <header className="w-full bg-[#FFFFFF] border-b border-[#102038]/15 px-6 sm:px-10 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/dashboard/student" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-[#FAF8F3] border border-[#102038]/20 p-1 flex items-center justify-center">
                <Image
                  src="/brand/project_buillders_logo.PNG"
                  alt="Project Builders"
                  fill
                  sizes="36px"
                  className="object-contain p-0.5"
                />
              </div>
              <span className="font-display font-bold text-base text-[#102038]">
                Project Builders
              </span>
            </Link>
            <SignOutButton />
          </div>
        </header>

        <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 flex-1">
          <SubmittedScreen submittedAt={attempt.submittedAt} />
        </main>
      </div>
    );
  }

  // If not started yet, initialize the attempt (50-minute server deadline)
  if (!attempt || attempt.status === "not_started") {
    attempt = startExamAttempt({
      studentId: userRecord.id,
      studentEmail,
      studentName: userRecord.name,
    });
  }

  // If deadline has passed while in progress, auto-finalize on server
  if (attempt.deadline && Date.now() > new Date(attempt.deadline).getTime()) {
    attempt = autoFinalizeExpiredAttempt(attempt.id);
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between">
        <header className="w-full bg-[#FFFFFF] border-b border-[#102038]/15 px-6 sm:px-10 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/dashboard/student" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-[#FAF8F3] border border-[#102038]/20 p-1 flex items-center justify-center">
                <Image
                  src="/brand/project_buillders_logo.PNG"
                  alt="Project Builders"
                  fill
                  sizes="36px"
                  className="object-contain p-0.5"
                />
              </div>
              <span className="font-display font-bold text-base text-[#102038]">
                Project Builders
              </span>
            </Link>
            <SignOutButton />
          </div>
        </header>

        <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 flex-1">
          <SubmittedScreen submittedAt={attempt.submittedAt} />
        </main>
      </div>
    );
  }

  // 4. Fetch questions and deterministically shuffle for this student
  const rawQuestions = getAllStoredQuestions();
  // Guaranteed stable across refreshes, seeded per student
  const studentQuestions = prepareStudentQuestions(rawQuestions, studentEmail);

  const serverTimeIso = new Date().toISOString();

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Top Header Bar */}
      <header className="w-full bg-[#FFFFFF] border-b-2 border-[#102038]/15 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student" className="flex items-center gap-3">
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
              <div>
                <div className="text-base font-bold tracking-tight text-[#102038] font-display">
                  Project Builders
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#5BBFA4] flex items-center gap-1">
                  <GraduationCap size={13} weight="bold" />
                  <span>Final Examination</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs sm:text-sm font-bold text-[#102038]">
                {userRecord.name}
              </div>
              <div className="text-[11px] font-mono text-[#102038]/60">
                {studentEmail}
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 flex-1">
        <ExamRunner
          attemptId={attempt.id}
          studentEmail={studentEmail}
          deadlineIso={attempt.deadline || new Date(Date.now() + 50 * 60 * 1000).toISOString()}
          serverTimeIso={serverTimeIso}
          questions={studentQuestions}
          existingAnswers={attempt.answers || {}}
        />
      </main>

      {/* Academic Footer */}
      <footer className="w-full bg-white border-t border-[#102038]/10 px-4 sm:px-8 py-4 text-xs font-sans text-[#102038]/50 text-center">
        <span>Project Builders &bull; Data Analysis Capstone &bull; Server-Enforced Deterministic Examination</span>
      </footer>
    </div>
  );
}
