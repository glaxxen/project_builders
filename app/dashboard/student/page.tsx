import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getWeeksForStudent } from "@/lib/db/queries/weeks";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  GraduationCap,
  Sparkle,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";

export default async function StudentDashboardPage() {
  const session = await auth();
  const studentEmail = session?.user?.email || "student@projectbuilders.dev";
  const weeks = await getWeeksForStudent("cohort-data-analysis-fall-2026");

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
              <span className="text-xs font-mono text-[#7E8B9B]">Published Projects</span>
              <span className="text-2xl font-bold font-mono text-[#102038]">
                {weeks.length} / 4
              </span>
            </div>
          </div>
        </div>

        {/* Section: Published Projects (Strict Filter per PRD Section 9) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-[#102038]">
              Published Projects & Briefs
            </h2>
            <span className="text-xs font-mono text-[#7E8B9B]">
              Only published weeks are visible
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {weeks.map((week) => (
              <div
                key={week.id}
                className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-6 shadow-sm space-y-4 hover:border-[#102038] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FAF8F3] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold bg-[#102038] text-[#FAF8F3] px-2.5 py-1 rounded">
                      Week {week.weekNumber}
                    </span>
                    <h3 className="text-base font-bold text-[#102038]">
                      {week.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-[#7E8B9B]">
                    <Calendar size={14} weight="bold" />
                    <span>
                      Deadline: {new Date(week.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-sans text-[#4A5568] leading-relaxed">
                  {week.brief}
                </p>

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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer"
                    >
                      <UploadSimple size={14} weight="bold" />
                      <span>Submit Project Repo</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
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
