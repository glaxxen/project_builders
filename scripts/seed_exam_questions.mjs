import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { questions as rawQuestions } from "./questions_data.mjs";

const dbPath = path.join(process.cwd(), "lib", "db", "project_builders_local.db");
const db = new DatabaseSync(dbPath);

// Ensure questions table exists
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

// Pick 25 questions, ensuring practical SQL queries and Excel analysis
const curated25 = rawQuestions.slice(0, 25).map((q, idx) => {
  return {
    id: `q-${idx + 1}`,
    text: q.prompt,
    options: q.options.map((opt) => opt.text),
    correct_option_index: q.correct,
    topic: idx < 10 ? "Spreadsheet & Modeling" : idx < 18 ? "SQL & Relational Databases" : "Business Intelligence",
  };
});

// Add code blocks to a few SQL questions if needed
curated25[12].text = `Examine the following SQL query for monthly retail performance:
\`\`\`sql
SELECT 
  store_id, 
  DATE_FORMAT(sale_date, '%Y-%m') AS sale_month, 
  SUM(revenue) AS monthly_revenue,
  COUNT(DISTINCT transaction_id) AS total_orders
FROM sales_transactions
WHERE status = 'completed'
GROUP BY store_id, sale_month
HAVING monthly_revenue >= 50000
ORDER BY sale_month DESC, monthly_revenue DESC;
\`\`\`
Which clause is responsible for filtering out groups that generated less than 50,000 in monthly revenue?`;
curated25[12].options = [
  "WHERE status = 'completed'",
  "HAVING monthly_revenue >= 50000",
  "GROUP BY store_id, sale_month",
  "ORDER BY monthly_revenue DESC"
];
curated25[12].correct_option_index = 1;

curated25[14].text = `Consider this ride-hailing operational analysis query:
\`\`\`sql
SELECT 
  d.driver_id,
  d.full_name,
  AVG(r.passenger_rating) AS avg_rating,
  COUNT(r.ride_id) AS completed_rides
FROM drivers d
JOIN rides r ON d.driver_id = r.driver_id
WHERE r.trip_status = 'finished'
GROUP BY d.driver_id, d.full_name
ORDER BY completed_rides DESC
LIMIT 10;
\`\`\`
What is the primary function of \`JOIN rides r ON d.driver_id = r.driver_id\`?`;
curated25[14].options = [
  "It matches ride records to their respective drivers using the foreign key driver_id.",
  "It permanently deletes rides without drivers from the disk.",
  "It creates a new database table named drivers_rides.",
  "It groups the output by passenger rating."
];
curated25[14].correct_option_index = 0;

console.log(`Seeding exactly ${curated25.length} questions into local SQLite store...`);

db.exec("DELETE FROM questions;");
const insertStmt = db.prepare(`
  INSERT INTO questions (id, text, optionsJson, correctOptionIndex, topic, orderNumber)
  VALUES (?, ?, ?, ?, ?, ?)
`);

curated25.forEach((q, idx) => {
  insertStmt.run(
    q.id,
    q.text,
    JSON.stringify(q.options),
    q.correct_option_index,
    q.topic,
    idx + 1
  );
});

const count = db.prepare("SELECT COUNT(*) as count FROM questions").get();
console.log("Successfully seeded questions. Total in database:", count.count);
