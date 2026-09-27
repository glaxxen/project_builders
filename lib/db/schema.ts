/**
 * Project Builders — Database Schema & Data Models
 *
 * Defines the core entities for cohorts, weeks, submissions, rubrics, and assessments.
 */

export interface Cohort {
  id: string;
  name: string; // e.g. "Data Analysis — Fall 2026"
  slug: string; // e.g. "data-analysis-fall-2026"
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Week {
  id: string;
  cohortId: string;
  weekNumber: number; // 1, 2, 3, 4
  title: string;
  brief: string; // Brief markdown/text
  datasetUrl?: string; // Link to raw dataset (e.g. AfriMart_Sales_Dataset.xlsx)
  slidesUrl?: string; // Link to slides / PDF guide
  deadline: string; // ISO timestamp (e.g. Friday 23:59:59)
  
  /**
   * Publication Gate:
   * Defaults to false. An unpublished week must NEVER appear anywhere
   * in the student-facing experience (not even as a "coming soon" teaser).
   */
  published: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface RubricItem {
  id: string;
  weekId: string;
  criterion: string;
  weight: number; // Percentage e.g. 20, 25, 10
  requirement: string;
}

export interface Submission {
  id: string;
  studentId: string;
  weekId: string;
  githubUrl: string;
  reflectionFindings: string; // 3 plain-English findings
  submittedAt: string;
  updatedAt: string;
  isReachable: boolean;
}

export interface Assessment {
  id: string;
  weekId: string;
  title: string;
  isFinal: boolean; // Gated until all 4 checkpoints complete
  passingScore: number;
}

export interface Question {
  id: string;
  assessmentId: string;
  orderNumber: number;
  prompt: string;
  correctOptionId: string; // Pre-defined correct answer for deterministic scoring
  points: number;
}

export interface Option {
  id: string;
  questionId: string;
  text: string;
  explanation: string;
}

export interface Score {
  id: string;
  studentId: string;
  assessmentId: string;
  scorePercentage: number;
  answers: Record<string, string>; // questionId -> selectedOptionId
  completedAt: string;
}
