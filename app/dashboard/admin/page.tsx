import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getAllWeeksForAdmin } from "@/lib/db/queries/weeks";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  CheckCircle,
  Eye,
  EyeSlash,
  GearSix,
  ShieldCheck,
  Table,
  Users,
} from "@phosphor-icons/react/dist/ssr";

export default async function AdminDashboardPage() {
  const session = await auth();
  const adminEmail = session?.user?.email || "admin@projectbuilders.dev";
  const allWeeks = await getAllWeeksForAdmin("cohort-data-analysis-fall-2026");

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between">
      {/* Top Admin Navigation */}
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
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#BA9C60]">
                Admin &amp; Instructor Console
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-sans font-medium text-[#102038]">
                {adminEmail}
              </div>
              <div className="text-[10px] font-mono font-semibold text-[#8C6D23] bg-[#FDF8ED] px-2 py-0.5 rounded inline-block mt-0.5 border border-[#E8E2D6]">
                Role: Admin
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-8 flex-1">
        {/* Admin Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
              <span>Active Cohort</span>
              <Users size={16} weight="bold" />
            </div>
            <div className="text-xl font-bold font-display text-[#102038]">
              Data Analysis &bull; Fall 2026
            </div>
            <div className="text-xs text-[#5BBFA4] font-medium font-sans">
              400+ Enrolled Students
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
              <span>Curriculum Weeks</span>
              <GearSix size={16} weight="bold" />
            </div>
            <div className="text-xl font-bold font-mono text-[#102038]">
              {allWeeks.filter((w) => w.published).length} Published / {allWeeks.length} Total
            </div>
            <div className="text-xs text-[#7E8B9B] font-medium font-sans">
              Week 1 Active &bull; Weeks 2-4 Staged
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
              <span>Assessment Engine</span>
              <Table size={16} weight="bold" />
            </div>
            <div className="text-xl font-bold font-mono text-[#102038]">
              Deterministic
            </div>
            <div className="text-xs text-[#1E4D40] font-medium font-sans">
              Auto-marked Checkpoints (Zero LLM cost)
            </div>
          </div>
        </div>

        {/* Section: Week Management & Publishing Gate */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-[#102038]">
                Cohort Weeks &amp; Publishing Gate
              </h2>
              <p className="text-xs font-sans text-[#7E8B9B]">
                Students only see published weeks. Unpublished weeks remain strictly excluded from student queries.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#FAF8F3] border-b border-[#E8E2D6] text-xs font-mono text-[#7E8B9B]">
                  <th className="py-3 px-4 font-semibold">Week</th>
                  <th className="py-3 px-4 font-semibold">Project Title</th>
                  <th className="py-3 px-4 font-semibold">Deadline</th>
                  <th className="py-3 px-4 font-semibold">Publication Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D6] font-sans">
                {allWeeks.map((week) => (
                  <tr key={week.id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#102038]">
                      Week {week.weekNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#102038]">{week.title}</div>
                      <div className="text-xs text-[#7E8B9B] line-clamp-1">{week.brief}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#7E8B9B]">
                      {new Date(week.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3.5 px-4">
                      {week.published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3]">
                          <Eye size={12} weight="bold" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#FAF8F3] text-[#7E8B9B] border border-[#E8E2D6]">
                          <EyeSlash size={12} weight="bold" />
                          <span>Unpublished (Hidden)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E8E2D6] px-6 sm:px-10 py-4 mt-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
          <div>Project Builders &bull; Admin Console</div>
          <div>Strict Role Gate Enforced</div>
        </div>
      </footer>
    </div>
  );
}
