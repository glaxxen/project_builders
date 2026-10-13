import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import {
  getAllLocalUsers,
  getAllExamAttempts,
  getAllStoredQuestions,
  getExamSettings,
} from "@/lib/db/sqlite-store";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { FinalExamAdmin } from "@/components/admin/final-exam-admin";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  const adminEmail = session?.user?.email || "admin@projectbuilders.dev";

  // Fetch all students, exam attempts, questions, and settings from server store
  const allStudents = getAllLocalUsers();
  const allAttempts = getAllExamAttempts();
  const questions = getAllStoredQuestions();
  const examSettings = getExamSettings();

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Top Admin Navigation Header */}
      <header className="w-full bg-[#FFFFFF] border-b-2 border-[#102038]/15 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
              <div className="text-xs sm:text-sm font-bold text-[#BA9C60] flex items-center gap-1">
                <ShieldCheck size={14} weight="bold" />
                <span>Instructor &amp; Exam Console</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs sm:text-sm font-bold text-[#102038]">
                {adminEmail}
              </div>
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8C6D23] bg-[#FDF8ED] border border-[#BA9C60]/30 px-2 py-0.5 rounded-md inline-block mt-0.5">
                Cohort Admin
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Admin Console Area */}
      <main suppressHydrationWarning className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1">
        <FinalExamAdmin
          initialStudents={allStudents}
          initialAttempts={allAttempts}
          questions={questions}
          initialExamIsOpen={examSettings.isOpen}
          initialScoresReleased={examSettings.scoresReleased}
        />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#102038]/10 px-4 sm:px-8 py-6 text-xs font-sans text-[#102038]/50 text-center">
        <span>Project Builders &bull; Data Analysis Fall 2026 &bull; Secure Assessment Administration</span>
      </footer>
    </div>
  );
}
