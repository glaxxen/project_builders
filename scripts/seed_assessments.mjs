import postgres from 'postgres';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/DATABASE_URL="([^"]+)"/);
const url = urlMatch ? urlMatch[1] : '';

if (!url) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase to seed Assessments, Questions, and Options...');
const sql = postgres(url, { ssl: 'require', prepare: false });

async function seedAssessments() {
  try {
    // 1. Checkpoint 1 (Week 1)
    console.log('Seeding Week 1 Checkpoint Assessment...');
    await sql`
      INSERT INTO "assessment" ("id", "weekId", "title", "isFinal", "passingScore")
      VALUES ('assess-w1', 'week-01', 'Week 1 Checkpoint: AfriMart Retail Analytics', false, 70)
      ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title", "passingScore" = EXCLUDED."passingScore";
    `;

    // 2. Final Assessment (Week 4)
    console.log('Seeding Final Assessment...');
    await sql`
      INSERT INTO "assessment" ("id", "weekId", "title", "isFinal", "passingScore")
      VALUES ('assess-final', 'week-04', 'Executive Capstone Final Assessment', true, 75)
      ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title", "isFinal" = true, "passingScore" = EXCLUDED."passingScore";
    `;

    // Week 1 Questions & Options
    const w1Questions = [
      {
        id: 'q1-1',
        assessmentId: 'assess-w1',
        orderNumber: 1,
        prompt: 'In the AfriMart dataset, several country names contain accented strings (e.g. Côte d’Ivoire). What is the mandatory first cleaning transformation required before grouping?',
        correctOptionId: 'opt-q1-1-c',
        points: 20,
        options: [
          { id: 'opt-q1-1-a', text: 'Delete all rows with non-ASCII characters to prevent pivot chart bugs.', explanation: 'Deleting rows would cause data loss of genuine market transactions.' },
          { id: 'opt-q1-1-b', text: 'Convert all text to UPPERCASE and leave accents unaltered.', explanation: 'Leaving accents unaltered causes duplicate country groupings across systems with different encodings.' },
          { id: 'opt-q1-1-c', text: 'Normalize text encoding (de-accent/transliterate) and trim leading/trailing whitespace.', explanation: 'Proper text normalization and trim ensures consistent grouping and avoids split market dimensions.' },
          { id: 'opt-q1-1-d', text: 'Replace country names with numeric ISO country codes manually in Excel.', explanation: 'Manual replacement is non-repeatable and error-prone.' },
        ],
      },
      {
        id: 'q1-2',
        assessmentId: 'assess-w1',
        orderNumber: 2,
        prompt: 'According to the Metric by Dimension visual design rule, what chart type must be used when analyzing Profit (continuous numerical metric) across 6 African Regional Markets (nominal categorical dimension)?',
        correctOptionId: 'opt-q1-2-b',
        points: 20,
        options: [
          { id: 'opt-q1-2-a', text: 'A multi-colored 3D Donut Chart with percentage slices.', explanation: '3D and multi-colored donut charts distort proportions and are visual anti-patterns.' },
          { id: 'opt-q1-2-b', text: 'A horizontal Bar Chart sorted descending by Profit.', explanation: 'A horizontal bar chart sorted descending allows instant visual scanning of market rankings with clear category labels.' },
          { id: 'opt-q1-2-c', text: 'A continuous Area Line chart connected between regions.', explanation: 'Line and area charts imply a continuous time dimension, which does not apply to nominal markets.' },
          { id: 'opt-q1-2-d', text: 'A Scatter Plot with random jitter.', explanation: 'Scatter plots are for bivariate continuous correlation, not categorical rankings.' },
        ],
      },
      {
        id: 'q1-3',
        assessmentId: 'assess-w1',
        orderNumber: 3,
        prompt: 'How is Gross Profit Margin Percentage mathematically defined and aggregated across orders in AfriMart?',
        correctOptionId: 'opt-q1-3-a',
        points: 20,
        options: [
          { id: 'opt-q1-3-a', text: '(SUM of Total Profit / SUM of Total Revenue) * 100', explanation: 'Ratio of sums is the mathematically correct weighted aggregate margin. Averaging row percentages is a fatal aggregation error.' },
          { id: 'opt-q1-3-b', text: 'AVERAGE of the row-level (Profit / Revenue) column', explanation: 'Averaging individual order margins treats a $10 sale equal to a $10,000 sale, yielding distorted executive KPIs.' },
          { id: 'opt-q1-3-c', text: '(SUM of Total Revenue - SUM of Shipping Cost) / SUM of Units', explanation: 'This calculates net realization per unit, not gross profit margin.' },
          { id: 'opt-q1-3-d', text: 'MEDIAN of Total Profit across all transactions', explanation: 'Median profit gives central tendency of dollar profit, not margin percentage.' },
        ],
      },
      {
        id: 'q1-4',
        assessmentId: 'assess-w1',
        orderNumber: 4,
        prompt: 'When auditing Return Rate across Product Categories, what constitutes the correct numerator and denominator?',
        correctOptionId: 'opt-q1-4-d',
        points: 20,
        options: [
          { id: 'opt-q1-4-a', text: 'Count of Returned Items / Total Profit USD', explanation: 'Units cannot be divided by dollars for a rate.' },
          { id: 'opt-q1-4-b', text: 'Total Revenue of Returned Orders / Total Shipping Cost', explanation: 'This measures financial recovery ratio, not product return incidence.' },
          { id: 'opt-q1-4-c', text: 'Unique Customer ID returns / Total Customers', explanation: 'This measures customer churn incidence, not product return rate.' },
          { id: 'opt-q1-4-d', text: 'Count of Returned Orders / Total Orders Placed', explanation: 'Return rate measures the proportion of fulfilled transactions returned by customers.' },
        ],
      },
      {
        id: 'q1-5',
        assessmentId: 'assess-w1',
        orderNumber: 5,
        prompt: 'Which practice is strictly listed as a visual design anti-pattern in DESIGN_SYSTEM.md?',
        correctOptionId: 'opt-q1-5-c',
        points: 20,
        options: [
          { id: 'opt-q1-5-a', text: 'Displaying KPI cards with clear currency symbols and micro-labels.', explanation: 'KPI cards with formatted units are standard executive best practice.' },
          { id: 'opt-q1-5-b', text: 'Using warm neutral background (#FAF8F3) with deep navy typography.', explanation: 'Warm cream and deep navy is the official brand palette.' },
          { id: 'opt-q1-5-c', text: 'Raw unformatted numbers (e.g. 14295.834) and rainbow color palettes without semantic meaning.', explanation: 'Raw decimals and arbitrary multi-colored rainbow charts are visual anti-patterns prohibited by the design system.' },
          { id: 'opt-q1-5-d', text: 'Sorting category bar charts descending by magnitude.', explanation: 'Sorting by magnitude is standard information design.' },
        ],
      },
    ];

    for (const q of w1Questions) {
      // Upsert Question
      await sql`
        INSERT INTO "question" ("id", "assessmentId", "orderNumber", "prompt", "correctOptionId", "points")
        VALUES (${q.id}, ${q.assessmentId}, ${q.orderNumber}, ${q.prompt}, ${q.correctOptionId}, ${q.points})
        ON CONFLICT ("id") DO UPDATE SET
          "orderNumber" = EXCLUDED."orderNumber",
          "prompt" = EXCLUDED."prompt",
          "correctOptionId" = EXCLUDED."correctOptionId",
          "points" = EXCLUDED."points";
      `;

      // Upsert Options
      for (const opt of q.options) {
        await sql`
          INSERT INTO "option" ("id", "questionId", "text", "explanation")
          VALUES (${opt.id}, ${q.id}, ${opt.text}, ${opt.explanation})
          ON CONFLICT ("id") DO UPDATE SET
            "text" = EXCLUDED."text",
            "explanation" = EXCLUDED."explanation";
        `;
      }
    }

    // Final Assessment Questions (Capstone)
    const finalQuestions = [
      {
        id: 'qf-1',
        assessmentId: 'assess-final',
        orderNumber: 1,
        prompt: 'In end-to-end executive synthesis, how should metric discrepancies between transactional logs and financial ledgers be formally handled in a capstone report?',
        correctOptionId: 'opt-qf-1-b',
        points: 20,
        options: [
          { id: 'opt-qf-1-a', text: 'Omit mismatched figures from the executive slides to avoid stakeholder confusion.', explanation: 'Omitting mismatches conceals systemic reporting errors.' },
          { id: 'opt-qf-1-b', text: 'Explicitly reconcile discrepancies in the documentation with audited root-cause drivers (e.g. timing of returns vs revenue recognition).', explanation: 'Verifiable proof of work requires documented reconciliation and transparency.' },
          { id: 'opt-qf-1-c', text: 'Average the two numbers to present a compromised middle figure.', explanation: 'Averaging conflicting numbers is factually invalid.' },
          { id: 'opt-qf-1-d', text: 'Alter database timestamps until reconciliation matches exactly.', explanation: 'Altering database logs violates data integrity.' },
        ],
      },
      {
        id: 'qf-2',
        assessmentId: 'assess-final',
        orderNumber: 2,
        prompt: 'When presenting cohort retention curves to executives, what is the most critical actionable insight to highlight?',
        correctOptionId: 'opt-qf-2-a',
        points: 20,
        options: [
          { id: 'opt-qf-2-a', text: 'The stabilization point (retention baseline) and the highest drop-off month in the customer lifecycle.', explanation: 'The drop-off cliff identifies where interventions are needed, and the baseline determines true recurring value.' },
          { id: 'opt-qf-2-b', text: 'The aesthetic curve gradient and 3D shadow depth of the visualization.', explanation: 'Aesthetic decorations do not provide strategic business decisions.' },
          { id: 'opt-qf-2-c', text: 'The total cumulative signup count without factoring attrition.', explanation: 'Cumulative signups is a vanity metric that masks churn.' },
          { id: 'opt-qf-2-d', text: 'The font size of the axis tick marks.', explanation: 'Formatting detail is secondary to strategic lifecycle insight.' },
        ],
      },
      {
        id: 'qf-3',
        assessmentId: 'assess-final',
        orderNumber: 3,
        prompt: 'In logistics throughput analytics, what metric best evaluates carrier SLA compliance across cross-border border bottlenecks?',
        correctOptionId: 'opt-qf-3-c',
        points: 20,
        options: [
          { id: 'opt-qf-3-a', text: 'Gross vehicle weight capacity.', explanation: 'Capacity measures fleet size, not SLA timeliness.' },
          { id: 'opt-qf-3-b', text: 'Driver feedback ratings from warehouse staff.', explanation: 'Feedback ratings are qualitative, not an SLA adherence metric.' },
          { id: 'opt-qf-3-c', text: 'On-Time In-Full (OTIF) % and variance between promised transit window vs actual border clearance timestamp.', explanation: 'OTIF % and transit variance directly quantify operational SLA performance and delivery reliability.' },
          { id: 'opt-qf-3-d', text: 'Total fuel consumption in liters.', explanation: 'Fuel consumption is an operating expense metric, not a delivery SLA.' },
        ],
      },
      {
        id: 'qf-4',
        assessmentId: 'assess-final',
        orderNumber: 4,
        prompt: 'What constitutes verifiable proof of work in a Project Builders capstone submission?',
        correctOptionId: 'opt-qf-4-a',
        points: 20,
        options: [
          { id: 'opt-qf-4-a', text: 'A clean, reproducible public GitHub repository with documented methodology, executable code/sheets, and verifiable insights.', explanation: 'Project Builders assesses capability via authentic, inspectable public code and data artifacts.' },
          { id: 'opt-qf-4-b', text: 'A screenshot of a dashboard posted to social media.', explanation: 'Screenshots are unverifiable and cannot be audited.' },
          { id: 'opt-qf-4-c', text: 'A written claim of attendance in weekly live lectures.', explanation: 'Attendance is passive; proof of work requires active artifact creation.' },
          { id: 'opt-qf-4-d', text: 'A summary generated entirely by generative AI without personal analysis.', explanation: 'Model outputs without builder verification do not demonstrate competency.' },
        ],
      },
      {
        id: 'qf-5',
        assessmentId: 'assess-final',
        orderNumber: 5,
        prompt: 'Why does the Project Builders platform utilize deterministic auto-scoring for assessments instead of LLM-based grading?',
        correctOptionId: 'opt-qf-5-d',
        points: 20,
        options: [
          { id: 'opt-qf-5-a', text: 'Because LLMs are unable to read text files.', explanation: 'Incorrect — LLMs can process text.' },
          { id: 'opt-qf-5-b', text: 'Because deterministic databases are newer technology than neural networks.', explanation: 'Incorrect.' },
          { id: 'opt-qf-5-c', text: 'Because multiple-choice questions require manual intervention.', explanation: 'Multiple-choice scoring is completely automated.' },
          { id: 'opt-qf-5-d', text: 'To ensure instant results, zero latency, zero API costs, and objective fairness with mathematically verifiable correct answers.', explanation: 'PRD Section 8 & Tech Stack specify deterministic grading for zero budget, instant student feedback, and unbiased fairness.' },
        ],
      },
    ];

    for (const q of finalQuestions) {
      await sql`
        INSERT INTO "question" ("id", "assessmentId", "orderNumber", "prompt", "correctOptionId", "points")
        VALUES (${q.id}, ${q.assessmentId}, ${q.orderNumber}, ${q.prompt}, ${q.correctOptionId}, ${q.points})
        ON CONFLICT ("id") DO UPDATE SET
          "orderNumber" = EXCLUDED."orderNumber",
          "prompt" = EXCLUDED."prompt",
          "correctOptionId" = EXCLUDED."correctOptionId",
          "points" = EXCLUDED."points";
      `;

      for (const opt of q.options) {
        await sql`
          INSERT INTO "option" ("id", "questionId", "text", "explanation")
          VALUES (${opt.id}, ${q.id}, ${opt.text}, ${opt.explanation})
          ON CONFLICT ("id") DO UPDATE SET
            "text" = EXCLUDED."text",
            "explanation" = EXCLUDED."explanation";
        `;
      }
    }

    console.log('ALL ASSESSMENTS AND QUESTIONS SEEDED SUCCESSFULLY!');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('Seeding assessments failed:', err);
    await sql.end();
    process.exit(1);
  }
}

seedAssessments();
