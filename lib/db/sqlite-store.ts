import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

export interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  role: "student" | "admin";
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  topic?: string;
  orderNumber: number;
}

export interface ClientQuestion {
  id: string;
  text: string;
  options: string[];
  orderNumber: number;
  topic?: string;
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string | null;
  status: "not_started" | "in_progress" | "submitted";
  startedAt: string | null;
  deadline: string | null;
  submittedAt: string | null;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number | null;
  percentage: number | null;
  timeTakenSeconds: number | null;
}

export interface ExamSettings {
  id: string;
  isOpen: boolean;
  scoresReleased: boolean;
  updatedAt: string;
}

// Global database instance
let dbInstance: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const dbDir = process.env.SQLITE_DB_DIR || (isServerless ? "/tmp" : path.join(process.cwd(), "lib", "db"));
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch {
    // If mkdir fails, fallback to tmp
  }

  const dbFilePath = path.join(dbDir, "project_builders_local.db");
  const db = new DatabaseSync(dbFilePath);

  // Performance & concurrency pragmas
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA synchronous = NORMAL;");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'student',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exam_settings (
      id TEXT PRIMARY KEY,
      isOpen INTEGER DEFAULT 1,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exam_attempts (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      studentEmail TEXT NOT NULL,
      studentName TEXT,
      status TEXT NOT NULL DEFAULT 'not_started',
      startedAt TEXT,
      deadline TEXT,
      submittedAt TEXT,
      answersJson TEXT NOT NULL DEFAULT '{}',
      score INTEGER,
      percentage INTEGER,
      timeTakenSeconds INTEGER
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      optionsJson TEXT NOT NULL,
      correctOptionIndex INTEGER NOT NULL,
      topic TEXT,
      orderNumber INTEGER NOT NULL
    );
  `);

  // Ensure default exam settings exist and scoresReleased column exists
  try {
    db.exec("ALTER TABLE exam_settings ADD COLUMN scoresReleased INTEGER DEFAULT 0;");
  } catch {
    // Column already exists
  }

  const existingSettings = db.prepare("SELECT id FROM exam_settings WHERE id = 'default'").get();
  if (!existingSettings) {
    db.prepare("INSERT INTO exam_settings (id, isOpen, scoresReleased, updatedAt) VALUES ('default', 1, 0, ?)").run(
      new Date().toISOString()
    );
  }

  dbInstance = db;
  return db;
}

/* =========================================================================
 * User Operations
 * ========================================================================= */

export function getLocalUserByEmail(email: string): UserRecord | null {
  const db = getDb();
  const cleanEmail = email.toLowerCase().trim();
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name ?? null,
    email: row.email,
    role: row.role ?? "student",
    createdAt: row.createdAt,
  };
}

export function ensureLocalUserExists(data: {
  id?: string;
  email: string;
  name?: string | null;
  role?: "student" | "admin";
}): UserRecord {
  const db = getDb();
  const cleanEmail = data.email.toLowerCase().trim();
  const existing = getLocalUserByEmail(cleanEmail);
  if (existing) {
    if (data.name && data.name !== existing.name) {
      updateLocalUserName(cleanEmail, data.name);
      return { ...existing, name: data.name };
    }
    return existing;
  }

  const id = data.id || `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const role = data.role || "student";
  const name = data.name ?? null;

  db.prepare(
    "INSERT INTO users (id, name, email, role, createdAt) VALUES (?, ?, ?, ?, ?)"
  ).run(id, name, cleanEmail, role, now);

  return { id, name, email: cleanEmail, role, createdAt: now };
}

export function updateLocalUserName(emailOrId: string, newName: string): UserRecord | null {
  const db = getDb();
  const trimmed = newName.trim();
  const isEmail = emailOrId.includes("@");

  if (isEmail) {
    const cleanEmail = emailOrId.toLowerCase().trim();
    db.prepare("UPDATE users SET name = ? WHERE email = ?").run(trimmed, cleanEmail);
    // Also update any existing exam attempts
    db.prepare("UPDATE exam_attempts SET studentName = ? WHERE studentEmail = ?").run(trimmed, cleanEmail);
    return getLocalUserByEmail(cleanEmail);
  } else {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(trimmed, emailOrId);
    db.prepare("UPDATE exam_attempts SET studentName = ? WHERE studentId = ?").run(trimmed, emailOrId);
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(emailOrId) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name ?? null,
      email: row.email,
      role: row.role ?? "student",
      createdAt: row.createdAt,
    };
  }
}

export function getAllLocalUsers(): UserRecord[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM users ORDER BY createdAt DESC").all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name ?? null,
    email: r.email,
    role: r.role ?? "student",
    createdAt: r.createdAt,
  }));
}

/* =========================================================================
 * Exam Settings Operations
 * ========================================================================= */

export function getExamSettings(): ExamSettings {
  const db = getDb();
  const row = db.prepare("SELECT * FROM exam_settings WHERE id = 'default'").get() as any;
  if (!row) {
    return { id: "default", isOpen: true, scoresReleased: false, updatedAt: new Date().toISOString() };
  }
  return {
    id: row.id,
    isOpen: Boolean(row.isOpen),
    scoresReleased: Boolean(row.scoresReleased),
    updatedAt: row.updatedAt,
  };
}

export function setExamSettings(isOpen: boolean): ExamSettings {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE exam_settings SET isOpen = ?, updatedAt = ? WHERE id = 'default'").run(
    isOpen ? 1 : 0,
    now
  );
  return getExamSettings();
}

export function setScoresReleased(scoresReleased: boolean): ExamSettings {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE exam_settings SET scoresReleased = ?, updatedAt = ? WHERE id = 'default'").run(
    scoresReleased ? 1 : 0,
    now
  );
  return getExamSettings();
}

/* =========================================================================
 * Questions Operations
 * ========================================================================= */

export function getAllStoredQuestions(): ExamQuestion[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM questions ORDER BY orderNumber ASC").all() as any[];
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    options: JSON.parse(r.optionsJson || "[]"),
    correctOptionIndex: r.correctOptionIndex,
    topic: r.topic ?? undefined,
    orderNumber: r.orderNumber,
  }));
}

export function getClientQuestions(): ClientQuestion[] {
  const questions = getAllStoredQuestions();
  // CRITICAL: NEVER leak correctOptionIndex to client!
  return questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    orderNumber: q.orderNumber,
    topic: q.topic,
  }));
}

export function seedStoredQuestions(
  items: Array<{
    id?: string;
    text: string;
    options: string[];
    correct_option_index: number;
    topic?: string;
  }>
): { success: boolean; count: number; error?: string } {
  const db = getDb();

  if (!Array.isArray(items) || items.length !== 25) {
    return {
      success: false,
      count: 0,
      error: `Validation error: Expected exactly 25 questions, got ${items?.length ?? 0}.`,
    };
  }

  // Validate each question
  for (let i = 0; i < items.length; i++) {
    const q = items[i];
    if (!q) {
      return { success: false, count: 0, error: `Question ${i + 1} is missing.` };
    }
    if (!q.text || typeof q.text !== "string" || !q.text.trim()) {
      return { success: false, count: 0, error: `Question ${i + 1} is missing text.` };
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return { success: false, count: 0, error: `Question ${i + 1} must have at least 2 options.` };
    }
    if (
      typeof q.correct_option_index !== "number" ||
      q.correct_option_index < 0 ||
      q.correct_option_index >= q.options.length
    ) {
      return {
        success: false,
        count: 0,
        error: `Question ${i + 1} has invalid correct_option_index: ${q.correct_option_index} (options count: ${q.options.length}).`,
      };
    }
  }

  // Transaction to replace all questions
  db.exec("DELETE FROM questions;");
  const insertStmt = db.prepare(`
    INSERT INTO questions (id, text, optionsJson, correctOptionIndex, topic, orderNumber)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  items.forEach((item, index) => {
    const id = item.id || `q-${index + 1}`;
    insertStmt.run(
      id,
      item.text.trim(),
      JSON.stringify(item.options),
      item.correct_option_index,
      item.topic || "General",
      index + 1
    );
  });

  return { success: true, count: items.length };
}

/* =========================================================================
 * Exam Attempt Operations (Server-Enforced Timing & Scoring)
 * ========================================================================= */

function parseAttemptRow(row: any): ExamAttempt {
  return {
    id: row.id,
    studentId: row.studentId,
    studentEmail: row.studentEmail,
    studentName: row.studentName ?? null,
    status: row.status as "not_started" | "in_progress" | "submitted",
    startedAt: row.startedAt ?? null,
    deadline: row.deadline ?? null,
    submittedAt: row.submittedAt ?? null,
    answers: JSON.parse(row.answersJson || "{}"),
    score: row.score !== null ? Number(row.score) : null,
    percentage: row.percentage !== null ? Number(row.percentage) : null,
    timeTakenSeconds: row.timeTakenSeconds !== null ? Number(row.timeTakenSeconds) : null,
  };
}

export function getExamAttemptByStudent(studentEmailOrId: string): ExamAttempt | null {
  const db = getDb();
  const clean = studentEmailOrId.toLowerCase().trim();
  const row = db
    .prepare("SELECT * FROM exam_attempts WHERE studentEmail = ? OR studentId = ? LIMIT 1")
    .get(clean, clean) as any;

  if (!row) return null;
  const attempt = parseAttemptRow(row);

  // Auto-submit check: if status is in_progress but deadline has passed, finalize it!
  if (attempt.status === "in_progress" && attempt.deadline) {
    const deadlineTime = new Date(attempt.deadline).getTime();
    const nowTime = Date.now();
    if (nowTime > deadlineTime) {
      return autoFinalizeExpiredAttempt(attempt.id);
    }
  }

  return attempt;
}

export function startExamAttempt(params: {
  studentId: string;
  studentEmail: string;
  studentName: string | null;
}): ExamAttempt {
  const db = getDb();
  const cleanEmail = params.studentEmail.toLowerCase().trim();

  // Check if attempt already exists
  const existing = getExamAttemptByStudent(cleanEmail);
  if (existing) {
    if (existing.status === "submitted") {
      return existing;
    }
    if (existing.status === "in_progress") {
      // Check if deadline has passed
      if (existing.deadline && Date.now() > new Date(existing.deadline).getTime()) {
        return autoFinalizeExpiredAttempt(existing.id);
      }
      return existing;
    }
  }

  // Create new attempt: hard limit 50 minutes from start
  const now = new Date();
  const deadline = new Date(now.getTime() + 50 * 60 * 1000); // 50 minutes hard limit
  const id = existing?.id || `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  db.prepare(`
    INSERT INTO exam_attempts (
      id, studentId, studentEmail, studentName, status, startedAt, deadline, answersJson
    ) VALUES (?, ?, ?, ?, 'in_progress', ?, ?, '{}')
    ON CONFLICT(id) DO UPDATE SET
      status = 'in_progress',
      startedAt = excluded.startedAt,
      deadline = excluded.deadline,
      studentName = excluded.studentName
  `).run(
    id,
    params.studentId,
    cleanEmail,
    params.studentName,
    now.toISOString(),
    deadline.toISOString()
  );

  return getExamAttemptByStudent(cleanEmail)!;
}

export function saveStudentAnswer(params: {
  attemptId: string;
  questionId: string;
  optionIndex: number;
}): { success: boolean; error?: string } {
  const db = getDb();
  const row = db.prepare("SELECT * FROM exam_attempts WHERE id = ?").get(params.attemptId) as any;
  if (!row) return { success: false, error: "Attempt not found." };

  const attempt = parseAttemptRow(row);
  if (attempt.status === "submitted") {
    return { success: false, error: "Exam already submitted." };
  }

  // Check deadline
  if (attempt.deadline && Date.now() > new Date(attempt.deadline).getTime()) {
    autoFinalizeExpiredAttempt(attempt.id);
    return { success: false, error: "Exam deadline has passed." };
  }

  const currentAnswers = attempt.answers || {};
  currentAnswers[params.questionId] = params.optionIndex;

  db.prepare("UPDATE exam_attempts SET answersJson = ? WHERE id = ?").run(
    JSON.stringify(currentAnswers),
    params.attemptId
  );

  return { success: true };
}

export function submitExamAttempt(params: {
  attemptId: string;
  finalAnswers?: Record<string, number>;
}): ExamAttempt {
  const db = getDb();
  const row = db.prepare("SELECT * FROM exam_attempts WHERE id = ?").get(params.attemptId) as any;
  if (!row) throw new Error("Attempt not found.");

  const attempt = parseAttemptRow(row);
  if (attempt.status === "submitted") {
    return attempt;
  }

  const now = new Date();
  const startedAtTime = attempt.startedAt ? new Date(attempt.startedAt).getTime() : now.getTime();
  const timeTakenSeconds = Math.max(0, Math.round((now.getTime() - startedAtTime) / 1000));

  // Merge any provided final answers with saved answers
  const answers = { ...(attempt.answers || {}), ...(params.finalAnswers || {}) };

  // Calculate score on server
  const questions = getAllStoredQuestions();
  let correctCount = 0;
  for (const q of questions) {
    const selectedIdx = answers[q.id];
    if (typeof selectedIdx === "number" && selectedIdx === q.correctOptionIndex) {
      correctCount += 1;
    }
  }

  const totalQuestions = questions.length > 0 ? questions.length : 25;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  db.prepare(`
    UPDATE exam_attempts
    SET status = 'submitted',
        submittedAt = ?,
        answersJson = ?,
        score = ?,
        percentage = ?,
        timeTakenSeconds = ?
    WHERE id = ?
  `).run(
    now.toISOString(),
    JSON.stringify(answers),
    correctCount,
    percentage,
    timeTakenSeconds,
    params.attemptId
  );

  return getExamAttemptByStudent(attempt.studentEmail)!;
}

export function autoFinalizeExpiredAttempt(attemptId: string): ExamAttempt {
  const db = getDb();
  const row = db.prepare("SELECT * FROM exam_attempts WHERE id = ?").get(attemptId) as any;
  if (!row) throw new Error("Attempt not found.");

  const attempt = parseAttemptRow(row);
  if (attempt.status === "submitted") return attempt;

  const deadlineDate = attempt.deadline ? new Date(attempt.deadline) : new Date();
  const startedAtTime = attempt.startedAt ? new Date(attempt.startedAt).getTime() : deadlineDate.getTime();
  const timeTakenSeconds = Math.max(0, Math.round((deadlineDate.getTime() - startedAtTime) / 1000));

  const questions = getAllStoredQuestions();
  let correctCount = 0;
  for (const q of questions) {
    const selectedIdx = attempt.answers[q.id];
    if (typeof selectedIdx === "number" && selectedIdx === q.correctOptionIndex) {
      correctCount += 1;
    }
  }

  const totalQuestions = questions.length > 0 ? questions.length : 25;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  db.prepare(`
    UPDATE exam_attempts
    SET status = 'submitted',
        submittedAt = ?,
        score = ?,
        percentage = ?,
        timeTakenSeconds = ?
    WHERE id = ?
  `).run(
    deadlineDate.toISOString(),
    correctCount,
    percentage,
    timeTakenSeconds,
    attemptId
  );

  return getExamAttemptByStudent(attempt.studentEmail)!;
}

export function resetExamAttempt(studentEmailOrId: string): { success: boolean } {
  const db = getDb();
  const clean = studentEmailOrId.toLowerCase().trim();
  db.prepare("DELETE FROM exam_attempts WHERE studentEmail = ? OR studentId = ?").run(clean, clean);
  return { success: true };
}

export function getAllExamAttempts(): ExamAttempt[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM exam_attempts ORDER BY startedAt DESC").all() as any[];
  return rows.map(parseAttemptRow);
}
