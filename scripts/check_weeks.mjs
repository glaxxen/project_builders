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

async function checkDB() {
  const weeks = await sql`SELECT id, "weekNumber", title, published FROM week ORDER BY "weekNumber"`;
  console.log(JSON.stringify(weeks, null, 2));
  await sql.end();
}

checkDB();
