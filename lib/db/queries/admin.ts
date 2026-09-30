import { db } from "../index";
import { users, weeks, submissions, assessments, scores } from "../schema";
import { asc, desc, eq } from "drizzle-orm";

export interface StudentCohortRow {
  studentId: string;
  name: string;
  email: string;
  submissionsByWeek: Record<
    number,
    {
      id: string;
      githubUrl: string;
      isReachable: boolean;
      submittedAt: Date;
      reflectionFindings: string;
    } | null
  >;
  scoresByWeek: Record<number, number | null>;
  finalScore: number | null;
  overallAverage: number | null;
  completionRate: number; // e.g. 75%
}

export async function getAdminCohortOverview(cohortId: string) {
  try {
    // 1. Fetch weeks
    const cohortWeeks = await db
      .select()
      .from(weeks)
      .where(eq(weeks.cohortId, cohortId))
      .orderBy(asc(weeks.weekNumber));

    // 2. Fetch assessments
    const allAssessments = await db.select().from(assessments);

    // 3. Fetch all students
    const allStudents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.name));

    // 4. Fetch all submissions
    const allSubmissions = await db.select().from(submissions);

    // 5. Fetch all scores
    const allScores = await db.select().from(scores);

    // Build consolidated rows
    const rows: StudentCohortRow[] = allStudents.map((student) => {
      const studentSubmissions = allSubmissions.filter((s) => s.studentId === student.id);
      const studentScores = allScores.filter((sc) => sc.studentId === student.id);

      const submissionsByWeek: StudentCohortRow["submissionsByWeek"] = {};
      const scoresByWeek: StudentCohortRow["scoresByWeek"] = {};

      let totalScoreSum = 0;
      let scoreCount = 0;
      let submittedCount = 0;

      for (const w of cohortWeeks) {
        // Submission for this week
        const sub = studentSubmissions.find((s) => s.weekId === w.id);
        if (sub) {
          submissionsByWeek[w.weekNumber] = {
            id: sub.id,
            githubUrl: sub.githubUrl,
            isReachable: sub.isReachable,
            submittedAt: sub.submittedAt,
            reflectionFindings: sub.reflectionFindings,
          };
          submittedCount += 1;
        } else {
          submissionsByWeek[w.weekNumber] = null;
        }

        // Assessment for this week
        const weekAssess = allAssessments.find((a) => a.weekId === w.id && !a.isFinal);
        if (weekAssess) {
          const sc = studentScores.find((s) => s.assessmentId === weekAssess.id);
          if (sc !== undefined && sc !== null) {
            scoresByWeek[w.weekNumber] = sc.scorePercentage;
            totalScoreSum += sc.scorePercentage;
            scoreCount += 1;
          } else {
            scoresByWeek[w.weekNumber] = null;
          }
        } else {
          scoresByWeek[w.weekNumber] = null;
        }
      }

      // Final Assessment
      const finalAssess = allAssessments.find((a) => a.isFinal);
      let finalScore: number | null = null;
      if (finalAssess) {
        const sc = studentScores.find((s) => s.assessmentId === finalAssess.id);
        if (sc) {
          finalScore = sc.scorePercentage;
          totalScoreSum += sc.scorePercentage;
          scoreCount += 1;
        }
      }

      const overallAverage = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : null;
      const completionRate =
        cohortWeeks.length > 0 ? Math.round((submittedCount / cohortWeeks.length) * 100) : 0;

      return {
        studentId: student.id,
        name: student.name || student.email.split("@")[0],
        email: student.email,
        submissionsByWeek,
        scoresByWeek,
        finalScore,
        overallAverage,
        completionRate,
      };
    });

    return {
      weeks: cohortWeeks,
      assessments: allAssessments,
      students: rows,
    };
  } catch (error) {
    console.error("Error fetching admin cohort overview:", error);
    return {
      weeks: [],
      assessments: [],
      students: [],
    };
  }
}
