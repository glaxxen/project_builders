import postgres from 'postgres';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/DATABASE_URL="([^"]+)"/);
const url = urlMatch ? urlMatch[1] : '';

const sql = postgres(url, { ssl: 'require', prepare: false });

async function main() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;
  console.log('Tables currently in Supabase:');
  console.log(tables.map(t => t.table_name).join(', '));

  const users = await sql`SELECT id, name, email, role FROM "user";`;
  console.log('Current registered users:', users);

  await sql.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
