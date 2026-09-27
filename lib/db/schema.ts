import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ==========================================
// 1. Auth.js / NextAuth Tables
// ==========================================

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("student").notNull(), // 'student' | 'admin'
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// ==========================================
// 2. Core Domain Tables (Cohorts, Weeks, Submissions, Assessments)
// ==========================================

export const cohorts = pgTable("cohort", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // e.g. "Data Analysis — Fall 2026"
  slug: text("slug").unique().notNull(),
  description: text("description"),
  startDate: timestamp("startDate", { mode: "date" }),
  endDate: timestamp("endDate", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const weeks = pgTable("week", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  cohortId: text("cohortId")
    .notNull()
    .references(() => cohorts.id, { onDelete: "cascade" }),
  weekNumber: integer("weekNumber").notNull(), // 1, 2, 3, 4
  title: text("title").notNull(),
  brief: text("brief").notNull(),
  datasetUrl: text("datasetUrl"),
  slidesUrl: text("slidesUrl"),
  deadline: timestamp("deadline", { mode: "date" }).notNull(),
  
  /**
   * Publication Gate:
   * Defaults to false. Any query returning weeks to students MUST filter to published = true.
   * Unpublished weeks must NEVER appear in student view.
   */
  published: boolean("published").default(false).notNull(),
  
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const rubricItems = pgTable("rubricItem", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weekId: text("weekId")
    .notNull()
    .references(() => weeks.id, { onDelete: "cascade" }),
  criterion: text("criterion").notNull(),
  weight: integer("weight").notNull(), // percentage e.g. 20, 25
  requirement: text("requirement").notNull(),
});

export const submissions = pgTable("submission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: text("studentId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekId: text("weekId")
    .notNull()
    .references(() => weeks.id, { onDelete: "cascade" }),
  githubUrl: text("githubUrl").notNull(),
  reflectionFindings: text("reflectionFindings").notNull(),
  isReachable: boolean("isReachable").default(true).notNull(),
  submittedAt: timestamp("submittedAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const assessments = pgTable("assessment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weekId: text("weekId")
    .notNull()
    .references(() => weeks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isFinal: boolean("isFinal").default(false).notNull(),
  passingScore: integer("passingScore").default(70).notNull(),
});

export const questions = pgTable("question", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  assessmentId: text("assessmentId")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  orderNumber: integer("orderNumber").notNull(),
  prompt: text("prompt").notNull(),
  correctOptionId: text("correctOptionId").notNull(),
  points: integer("points").default(10).notNull(),
});

export const options = pgTable("option", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  questionId: text("questionId")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  explanation: text("explanation"),
});

export const scores = pgTable("score", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: text("studentId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assessmentId: text("assessmentId")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  scorePercentage: integer("scorePercentage").notNull(),
  answers: text("answers").notNull(), // JSON string
  completedAt: timestamp("completedAt", { mode: "date" }).defaultNow().notNull(),
});

// Type definitions for inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Week = typeof weeks.$inferSelect;
export type NewWeek = typeof weeks.$inferInsert;
export type Cohort = typeof cohorts.$inferSelect;
export type NewCohort = typeof cohorts.$inferInsert;
export type RubricItem = typeof rubricItems.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Option = typeof options.$inferSelect;
export type Score = typeof scores.$inferSelect;
