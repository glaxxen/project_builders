import postgres from 'postgres';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/DATABASE_URL="([^"]+)"/);
const url = urlMatch ? urlMatch[1] : '';

if (!url) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = postgres(url, { ssl: 'require', prepare: false });

async function main() {
  console.log('Altering submission table...');
  try {
    await sql`ALTER TABLE "submission" ALTER COLUMN "githubUrl" DROP NOT NULL`;
    await sql`ALTER TABLE "submission" ALTER COLUMN "reflectionFindings" DROP NOT NULL`;
    await sql`ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS "sqlQueries" text`;
    await sql`ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS "answerSheet" text`;
    await sql`ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS "managerMessage" text`;
    console.log('Columns added successfully.');
  } catch (err) {
    console.error('Error altering table:', err);
  }
  await sql.end();
}

main();
