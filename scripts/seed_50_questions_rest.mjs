import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);

const supabaseUrl = urlMatch ? urlMatch[1] : '';
const serviceKey = keyMatch ? keyMatch[1] : '';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

// 50 Questions extracted directly from project-1-class
import { questions } from './questions_data.mjs';

async function main() {
  console.log(`Connecting to Supabase via HTTPS REST API (${supabaseUrl})...`);
  
  // 1. Update assessment title
  await fetch(`${supabaseUrl}/rest/v1/assessment?id=eq.assess-w1`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      title: 'Week 1 Checkpoint: Retail Intelligence Dashboard (AfriMart KollyBright)',
      passingScore: 70
    })
  });

  // 2. Fetch existing questions for assess-w1 to clean
  const existingRes = await fetch(`${supabaseUrl}/rest/v1/question?assessmentId=eq.assess-w1&select=id`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  });
  const existingQuestions = await existingRes.json();
  const qIds = existingQuestions.map(q => q.id);

  if (qIds.length > 0) {
    console.log(`Cleaning existing ${qIds.length} questions...`);
    // Delete options
    await fetch(`${supabaseUrl}/rest/v1/option?questionId=in.(${qIds.join(',')})`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    // Delete questions
    await fetch(`${supabaseUrl}/rest/v1/question?assessmentId=eq.assess-w1`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
  }

  console.log(`Inserting 50 questions & 200 options via HTTPS...`);

  const questionRecords = [];
  const optionRecords = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qId = `q1-${String(i + 1).padStart(2, '0')}`;
    const correctOptId = `opt-${qId}-${String.fromCharCode(97 + q.correct)}`;

    questionRecords.push({
      id: qId,
      assessmentId: 'assess-w1',
      orderNumber: i + 1,
      prompt: q.prompt,
      correctOptionId: correctOptId,
      points: q.points || 2
    });

    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      const optId = `opt-${qId}-${String.fromCharCode(97 + j)}`;
      optionRecords.push({
        id: optId,
        questionId: qId,
        text: opt.text,
        explanation: opt.explanation || null
      });
    }
  }

  // Batch insert questions
  const qRes = await fetch(`${supabaseUrl}/rest/v1/question`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(questionRecords)
  });

  if (!qRes.ok) {
    const errText = await qRes.text();
    throw new Error(`Failed to insert questions: ${errText}`);
  }
  console.log(`✓ 50 Questions inserted!`);

  // Batch insert options in chunks of 50
  for (let c = 0; c < optionRecords.length; c += 50) {
    const chunk = optionRecords.slice(c, c + 50);
    const optRes = await fetch(`${supabaseUrl}/rest/v1/option`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(chunk)
    });

    if (!optRes.ok) {
      const errText = await optRes.text();
      throw new Error(`Failed to insert options chunk: ${errText}`);
    }
  }

  console.log(`✓ All 200 Options inserted successfully!`);
  console.log(`\n🎉 50-Question Week 1 Assessment is 100% LIVE in Supabase!`);
}

main().catch(err => {
  console.error('Error seeding via REST:', err);
  process.exit(1);
});
