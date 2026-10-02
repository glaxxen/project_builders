import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getAllWeeksForAdmin } from "@/lib/db/queries/weeks";
import { getAdminCohortOverview } from "@/lib/db/queries/admin";
import { getGradingKey } from "@/lib/db/queries/assessments";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { WeeksManagement } from "@/components/admin/weeks-management";
import { CohortOverviewTable } from "@/components/admin/cohort-overview-table";
import { AssessmentBuilder } from "@/components/admin/assessment-builder";
import { AdminTeamManagement } from "@/components/admin/admin-team-management";
import { getConfiguredAdminEmails } from "@/lib/auth/roles";
import { getAllAdmins } from "@/lib/db/queries/users";
import {
  CheckCircle,
  GearSix,
  GraduationCap,
  ShieldCheck,
  Table,
  Users,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  const adminEmail = session?.user?.email || "admin@projectbuilders.dev";
  const cohortId = "cohort-data-analysis-fall-2026";

  const allWeeks = await getAllWeeksForAdmin(cohortId);
  const cohortOverview = await getAdminCohortOverview(cohortId);
  const configuredEnvEmails = getConfiguredAdminEmails();
  const dbAdmins = await getAllAdmins();

  // Fetch full assessment question trees for builder
  const assessmentDetails = await Promise.all(
    cohortOverview.assessments.map(async (assess) => {
      const questionsWithKeys = await getGradingKey(assess.id);
      return {
        ...assess,
        questions: questionsWithKeys,
      };
    })
  );

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
      <main suppressHydrationWarning className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-10 flex-1">
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
              {cohortOverview.students.length} Enrolled Student Accounts
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
              Strict Gate Enforced for Student Views
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
              <span>Assessment Engine</span>
              <Table size={16} weight="bold" />
            </div>
            <div className="text-xl font-bold font-mono text-[#102038]">
              {assessmentDetails.length} Quizzes Ready
            </div>
            <div className="text-xs text-[#1E4D40] font-medium font-sans">
              Deterministic Instant Marking (Zero Cost)
            </div>
          </div>
        </div>

        {/* Section 1: Phase 6 Consolidated Students × Scores Grid (The Most Important Screen) */}
        <section className="space-y-4">
          <CohortOverviewTable
            students={cohortOverview.students}
            weeks={allWeeks}
            assessments={cohortOverview.assessments}
          />
        </section>

        {/* Section 2: Phase 3 Week Management & Publishing Gate */}
        <section className="space-y-4 pt-4 border-t border-[#E8E2D6]">
          <WeeksManagement weeks={allWeeks} cohortId={cohortId} />
        </section>

        {/* Section 3: Phase 5 Assessment & Question Builder */}
        <section className="space-y-4 pt-4 border-t border-[#E8E2D6]">
          <AssessmentBuilder assessments={assessmentDetails} />
        </section>

        {/* Section 4: Admin Team & Instructor Permissions */}
        <section className="space-y-4 pt-4 border-t border-[#E8E2D6]">
          <AdminTeamManagement
            configuredEnvEmails={configuredEnvEmails}
            dbAdmins={dbAdmins}
            currentAdminEmail={adminEmail}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E8E2D6] px-6 sm:px-10 py-4 mt-8 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
          <div>Project Builders &bull; Admin Console</div>
          <div>Strict Role Gate Enforced &bull; Real-time Verification</div>
        </div>
      </footer>
    </div>
  );
}
