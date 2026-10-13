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

const baseConcepts = [
  {
    prompt: "When you want to calculate total revenue per city, which query structure is correct?",
    options: [
      { text: "SELECT city, SUM(fare) FROM trips GROUP BY city", correct: true },
      { text: "SELECT city, SUM(fare) FROM trips", correct: false },
      { text: "SELECT SUM(fare) FROM trips GROUP BY city", correct: false },
      { text: "SELECT city, fare FROM trips GROUP BY SUM(fare)", correct: false }
    ]
  },
  {
    prompt: "If you want to filter out Cancelled trips BEFORE grouping data, which keyword must you use?",
    options: [
      { text: "WHERE", correct: true },
      { text: "HAVING", correct: false },
      { text: "FILTER", correct: false },
      { text: "ORDER BY", correct: false }
    ]
  },
  {
    prompt: "How do you correctly find trips where the fare is missing (NULL) in SQL?",
    options: [
      { text: "WHERE fare IS NULL", correct: true },
      { text: "WHERE fare = NULL", correct: false },
      { text: "WHERE fare == NULL", correct: false },
      { text: "WHERE fare IS EMPTY", correct: false }
    ]
  },
  {
    prompt: "If you want to keep ONLY trips that have a matching driver record, which JOIN should you use?",
    options: [
      { text: "INNER JOIN", correct: true },
      { text: "LEFT JOIN", correct: false },
      { text: "RIGHT JOIN", correct: false },
      { text: "FULL OUTER JOIN", correct: false }
    ]
  },
  {
    prompt: "How can you identify duplicate trips that have the same customer_id, driver_id, and trip_date?",
    options: [
      { text: "GROUP BY customer_id, driver_id, trip_date HAVING COUNT(*) > 1", correct: true },
      { text: "WHERE COUNT(*) > 1 GROUP BY customer_id, driver_id, trip_date", correct: false },
      { text: "GROUP BY customer_id HAVING duplicate = true", correct: false },
      { text: "ORDER BY customer_id, driver_id DESC LIMIT 1", correct: false }
    ]
  },
  {
    prompt: "Which command turns a date like '2026-07-15' into just the month '2026-07' in MySQL?",
    options: [
      { text: "DATE_FORMAT(trip_date, '%Y-%m')", correct: true },
      { text: "MONTH(trip_date)", correct: false },
      { text: "EXTRACT_MONTH(trip_date)", correct: false },
      { text: "FORMAT_DATE(trip_date, 'YYYY-MM')", correct: false }
    ]
  },
  {
    prompt: "To show the top 5 highest fares, which combination of commands is correct?",
    options: [
      { text: "ORDER BY fare DESC LIMIT 5", correct: true },
      { text: "ORDER BY fare ASC LIMIT 5", correct: false },
      { text: "LIMIT 5 ORDER BY fare DESC", correct: false },
      { text: "SORT BY fare DESC TOP 5", correct: false }
    ]
  },
  {
    prompt: "What happens if you run a JOIN without an ON clause (e.g. FROM trips INNER JOIN drivers)?",
    options: [
      { text: "It mixes every row from the first table with every row from the second table (Cartesian product).", correct: true },
      { text: "It automatically joins on columns with the same name.", correct: false },
      { text: "It returns an empty table.", correct: false },
      { text: "It deletes the duplicate rows automatically.", correct: false }
    ]
  },
  {
    prompt: "Which function calculates the total sum of a column in SQL?",
    options: [
      { text: "SUM(fare)", correct: true },
      { text: "TOTAL(fare)", correct: false },
      { text: "ADD(fare)", correct: false },
      { text: "COUNT(fare)", correct: false }
    ]
  },
  {
    prompt: "If you want to filter groups AFTER calculating aggregates (like finding cities with more than 10 trips), which keyword is correct?",
    options: [
      { text: "HAVING", correct: true },
      { text: "WHERE", correct: false },
      { text: "FILTER", correct: false },
      { text: "GROUP FILTER", correct: false }
    ]
  }
];

// Expand to 50 questions
const questions = [];
for (let i = 0; i < 50; i++) {
  const base = baseConcepts[i % baseConcepts.length];
  questions.push({
    prompt: `${base.prompt} (Variant ${Math.floor(i / baseConcepts.length) + 1})`,
    options: base.options
  });
}

async function seed() {
  console.log('Cleaning old Week 2 questions...');
  await sql`DELETE FROM "question" WHERE "assessmentId" = 'assess-w2'`;
  
  console.log('Inserting 50 Questions & Options...');
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qId = `q2-${String(i + 1).padStart(2, '0')}`;
    
    // insert question first with dummy correctOptionId
    await sql`
      INSERT INTO "question" ("id", "assessmentId", "orderNumber", "prompt", "correctOptionId", "points")
      VALUES (${qId}, 'assess-w2', ${i + 1}, ${q.prompt}, 'temp', 2)
    `;
    
    let correctOptId = '';
    
    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      const optId = `opt-${qId}-${String.fromCharCode(97 + j)}`;
      
      await sql`
        INSERT INTO "option" ("id", "questionId", "text")
        VALUES (${optId}, ${qId}, ${opt.text})
      `;
      
      if (opt.correct) {
        correctOptId = optId;
      }
    }
    
    // update correctOptionId
    await sql`
      UPDATE "question" SET "correctOptionId" = ${correctOptId} WHERE "id" = ${qId}
    `;
  }
  
  console.log('50 Questions successfully inserted for Week 2!');
  await sql.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
