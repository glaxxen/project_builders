import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import {
  getStudentAssessmentData,
  getStudentScore,
  getAllScoresForStudent,
  getAllAssessments,
} from "@/lib/db/queries/assessments";
import { getUserByEmail } from "@/lib/db/queries/users";
import { QuizRunner } from "@/components/assessments/quiz-runner";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ArrowLeft, Lock, ShieldCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";

interface QuizPageProps {
  params: Promise<{
    assessmentId: string;
  }>;
  searchParams?: Promise<{
    preview?: string;
    email?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function StudentQuizPage({ params, searchParams }: QuizPageProps) {
  const { assessmentId } = await params;
  const search = await searchParams;
  const isPreview = search?.preview === "student" || search?.preview === "admin";
  const session = await auth();

  if (!session?.user?.email && !isPreview) {
    redirect(`/login?callbackUrl=/dashboard/student/quiz/${assessmentId}`);
  }

  // 1. Fetch student user record
  const studentEmail = (search?.email || session?.user?.email || (isPreview ? "glaxxen@gmail.com" : "")).toLowerCase().trim();
  let userRecord = await getUserByEmail(studentEmail);
  if (!userRecord && isPreview) {
    userRecord = {
      id: "preview-student-user-id",
      name: "Student Preview",
      email: studentEmail,
      role: "student",
      emailVerified: null,
      image: null,
      createdAt: new Date(),
    };
  }

  // 2. Fetch assessment and questions (securely, no correct answers leaked)
  const assessmentData = await getStudentAssessmentData(assessmentId);
  if (!assessmentData) {
    notFound();
  }

  // 3. Check for existing score
  const existingScore = userRecord
    ? await getStudentScore(userRecord.id, assessmentId)
    : null;

  // 4. Final Assessment Gating Check (PRD Section 5.6 & TODO Phase 5)
  // Gated until checkpoint assessments are complete
  let isGated = false;
  if (assessmentData.isFinal && userRecord) {
    const studentScores = await getAllScoresForStudent(userRecord.id);
    const allCohortAssessments = await getAllAssessments();
    const nonFinalAssessments = allCohortAssessments.filter((a) => !a.isFinal);

    const completedNonFinalCount = studentScores.filter((s) =>
      nonFinalAssessments.some((nfa) => nfa.id === s.assessmentId)
    ).length;

    if (completedNonFinalCount < nonFinalAssessments.length && nonFinalAssessments.length > 0) {
      isGated = true;
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#102038] flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#E8E2D6] px-6 sm:px-10 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student" className="flex items-center gap-3">
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
                  Assessment Engine
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-sans font-bold text-[#102038]">
                {studentEmail}
              </div>
              <div className="text-xs font-sans font-bold text-[#1E4D40] bg-[#EBF7F4] border border-[#5BBFA4]/30 px-2.5 py-0.5 rounded-md inline-block mt-0.5">
                Deterministic Evaluator
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 flex-1">
        {isGated ? (
          <div className="max-w-xl mx-auto bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-8 text-center space-y-5 shadow-sm my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF8F3] border border-[#E8E2D6] text-[#8C6D23] flex items-center justify-center mx-auto">
              <Lock size={28} weight="bold" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#BA9C60]">
                Access Restricted
              </div>
              <h2 className="font-display text-2xl font-bold text-[#102038]">
                Final Assessment is Gated
              </h2>
              <p className="text-sm font-sans text-[#4A5568] leading-relaxed">
                Per course policy, the Capstone Final Assessment remains locked until all preceding weekly checkpoint assessments have been submitted and evaluated.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Return to Complete Checkpoints</span>
              </Link>
            </div>
          </div>
        ) : (
          <QuizRunner
            assessment={assessmentData}
            existingScore={
              existingScore
                ? {
                    scorePercentage: existingScore.scorePercentage,
                    completedAt: existingScore.completedAt,
                  }
                : null
            }
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E8E2D6] px-6 sm:px-10 py-4 mt-8 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-[#7E8B9B]">
          <div>Project Builders &bull; Verifiable Assessment</div>
          <div>Instant Deterministic Scoring</div>
        </div>
      </footer>
    </div>
  );
}
