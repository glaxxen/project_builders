import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);

const supabaseUrl = urlMatch ? urlMatch[1] : '';
const serviceKey = keyMatch ? keyMatch[1] : '';

async function publishWeek2() {
  console.log('Publishing Week 2 in Supabase...');
  const res = await fetch(`${supabaseUrl}/rest/v1/week?id=eq.week-02`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      published: true,
      updatedAt: new Date().toISOString(),
    }),
  });

  const data = await res.json();
  console.log('Week 2 published result:', data);
}

publishWeek2().catch(console.error);
