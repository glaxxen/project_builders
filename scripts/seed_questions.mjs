import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * Validate and import 25 examination questions from JSON.
 * Enforces strict single correct option and exact 25-question count.
 */
export function validateAndImportQuestions(filePath) {
  const resolvedPath = filePath || path.join(process.cwd(), "data", "questions.json");

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Seed file not found at path: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, "utf-8");
  let items;
  try {
    items = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse JSON in ${resolvedPath}: ${err.message}`);
  }

  // 1. Strict Array & Count Validation
  if (!Array.isArray(items)) {
    throw new Error("Validation Error: Questions JSON must be an array of question objects.");
  }

  if (items.length !== 25) {
    throw new Error(
      `Validation Error: Expected exactly 25 questions, but found ${items.length}. The exam requires exactly 25 questions.`
    );
  }

  // 2. Per-Question Validation
  for (let i = 0; i < items.length; i++) {
    const q = items[i];
    const qNum = i + 1;

    if (!q || typeof q !== "object") {
      throw new Error(`Validation Error: Question ${qNum} is not a valid object.`);
    }

    if (!q.text || typeof q.text !== "string" || !q.text.trim()) {
      throw new Error(`Validation Error: Question ${qNum} is missing valid non-empty 'text'.`);
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(
        `Validation Error: Question ${qNum} must have an 'options' array with at least 2 choices.`
      );
    }

    for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
      const opt = q.options[optIdx];
      if (typeof opt !== "string" || !opt.trim()) {
        throw new Error(
          `Validation Error: Question ${qNum}, option ${optIdx + 1} must be a non-empty string.`
        );
      }
    }

    // Exactly one correct option index check
    if (
      typeof q.correct_option_index !== "number" ||
      !Number.isInteger(q.correct_option_index) ||
      q.correct_option_index < 0 ||
      q.correct_option_index >= q.options.length
    ) {
      throw new Error(
        `Validation Error: Question ${qNum} has invalid 'correct_option_index' (${q.correct_option_index}). Must be an integer between 0 and ${q.options.length - 1}. Every question must have exactly one correct option.`
      );
    }
  }

  // 3. Database Ingestion
  const dbDir = path.join(process.cwd(), "lib", "db");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "project_builders_local.db");
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      optionsJson TEXT NOT NULL,
      correctOptionIndex INTEGER NOT NULL,
      topic TEXT,
      orderNumber INTEGER NOT NULL
    );
  `);

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
      JSON.stringify(item.options.map((o) => o.trim())),
      item.correct_option_index,
      item.topic ? item.topic.trim() : "General",
      index + 1
    );
  });

  const countRow = db.prepare("SELECT COUNT(*) as count FROM questions").get();
  return {
    success: true,
    count: countRow.count,
    filePath: resolvedPath,
  };
}

// CLI execution
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  const targetFile = process.argv[2];
  try {
    const result = validateAndImportQuestions(targetFile);
    console.log(`\n========================================`);
    console.log(`✓ Questions Successfully Validated & Seeded`);
    console.log(`Source File: ${result.filePath}`);
    console.log(`Total Validated Questions: ${result.count}`);
    console.log(`Validation: Exactly 25 questions, exactly 1 correct option per question.`);
    console.log(`========================================\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Import Failed: ${err.message}\n`);
    process.exit(1);
  }
}
