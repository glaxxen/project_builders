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
  console.log('Updating Week 2 record...');
  await sql`
    UPDATE "week"
    SET 
      "title" = 'ZoomRide SQL Project',
      "brief" = 'ZoomRide is a company that sells rides in cars and bikes, like Uber or Bolt. It works in 6 cities: Lagos, Abuja, Port Harcourt, Nairobi, Accra and Kampala. The manager wants answers to 3 questions: Which city earns the most money? Which month do people ride the most? Which type of vehicle earns the most money? Your job: look at the data, clean it, find the answers with SQL, and write a short message to the manager.',
      "datasetUrl" = '/assets/zoomride_setup.txt',
      "slidesUrl" = '/assets/ZoomRide_SQL_Student_Guide.pdf'
    WHERE "id" = 'week-02'
  `;
  console.log('Week 2 updated!');
  
  console.log('Updating Week 2 Rubric Items...');
  await sql`DELETE FROM "rubricItem" WHERE "weekId" = 'week-02'`;
  
  const rubrics = [
    { id: 'rubric-w2-1', weekId: 'week-02', criterion: 'SQL Correctness', weight: 40, requirement: 'Correct answers (Q1 to Q8) using appropriate SQL syntax.' },
    { id: 'rubric-w2-2', weekId: 'week-02', criterion: 'Data Cleaning', weight: 20, requirement: 'Proper deduplication and standardization (Q4 and Q5).' },
    { id: 'rubric-w2-3', weekId: 'week-02', criterion: 'Code Quality', weight: 15, requirement: 'Neat queries with notes and good names following the Metric by Dimension style.' },
    { id: 'rubric-w2-4', weekId: 'week-02', criterion: 'Executive Summary', weight: 25, requirement: 'Message to the manager (3-5 sentences) with data-backed recommendations.' },
  ];

  for (const r of rubrics) {
    await sql`
      INSERT INTO "rubricItem" ("id", "weekId", "criterion", "weight", "requirement")
      VALUES (${r.id}, ${r.weekId}, ${r.criterion}, ${r.weight}, ${r.requirement})
    `;
  }
  
  console.log('Week 2 Rubric added!');
  
  // Create an assessment record for Week 2
  await sql`
    INSERT INTO "assessment" ("id", "weekId", "title", "isFinal", "passingScore")
    VALUES ('assess-w2', 'week-02', 'Week 2 Checkpoint: SQL Mastery', false, 70)
    ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title";
  `;
  console.log('Assessment record created!');

  await sql.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
