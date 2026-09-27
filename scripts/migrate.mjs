import postgres from 'postgres';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/DATABASE_URL="([^"]+)"/);
const url = urlMatch ? urlMatch[1] : '';

if (!url) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase via transaction pooler...');
const sql = postgres(url, { ssl: 'require', prepare: false });

async function migrate() {
  try {
    console.log('Creating auth and core tables...');

    await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP,
        "image" TEXT,
        "role" TEXT DEFAULT 'student' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "account" (
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        PRIMARY KEY ("provider", "providerAccountId")
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sessionToken" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "expires" TIMESTAMP NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "verificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP NOT NULL,
        PRIMARY KEY ("identifier", "token")
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "cohort" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "description" TEXT,
        "startDate" TIMESTAMP,
        "endDate" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "week" (
        "id" TEXT PRIMARY KEY,
        "cohortId" TEXT NOT NULL REFERENCES "cohort"("id") ON DELETE CASCADE,
        "weekNumber" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "brief" TEXT NOT NULL,
        "datasetUrl" TEXT,
        "slidesUrl" TEXT,
        "deadline" TIMESTAMP NOT NULL,
        "published" BOOLEAN DEFAULT false NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "rubricItem" (
        "id" TEXT PRIMARY KEY,
        "weekId" TEXT NOT NULL REFERENCES "week"("id") ON DELETE CASCADE,
        "criterion" TEXT NOT NULL,
        "weight" INTEGER NOT NULL,
        "requirement" TEXT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "submission" (
        "id" TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "weekId" TEXT NOT NULL REFERENCES "week"("id") ON DELETE CASCADE,
        "githubUrl" TEXT NOT NULL,
        "reflectionFindings" TEXT NOT NULL,
        "isReachable" BOOLEAN DEFAULT true NOT NULL,
        "submittedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "assessment" (
        "id" TEXT PRIMARY KEY,
        "weekId" TEXT NOT NULL REFERENCES "week"("id") ON DELETE CASCADE,
        "title" TEXT NOT NULL,
        "isFinal" BOOLEAN DEFAULT false NOT NULL,
        "passingScore" INTEGER DEFAULT 70 NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "question" (
        "id" TEXT PRIMARY KEY,
        "assessmentId" TEXT NOT NULL REFERENCES "assessment"("id") ON DELETE CASCADE,
        "orderNumber" INTEGER NOT NULL,
        "prompt" TEXT NOT NULL,
        "correctOptionId" TEXT NOT NULL,
        "points" INTEGER DEFAULT 10 NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "option" (
        "id" TEXT PRIMARY KEY,
        "questionId" TEXT NOT NULL REFERENCES "question"("id") ON DELETE CASCADE,
        "text" TEXT NOT NULL,
        "explanation" TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "score" (
        "id" TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "assessmentId" TEXT NOT NULL REFERENCES "assessment"("id") ON DELETE CASCADE,
        "scorePercentage" INTEGER NOT NULL,
        "answers" TEXT NOT NULL,
        "completedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    console.log('ALL TABLES CREATED SUCCESSFULLY!');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    await sql.end();
    process.exit(1);
  }
}

migrate();
