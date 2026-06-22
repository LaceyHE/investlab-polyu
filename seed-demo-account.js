/**
 * InvestLab — Demo Account Seeder
 * Creates laceyhzx@gmail.com (password: 262626) and inserts realistic
 * progress data so the Investor Hub shows a partially-completed profile.
 *
 * Run once:  node seed-demo-account.js
 * Requires:  node >= 16  (uses built-in fetch via https import)
 */

const SUPABASE_URL = "https://kctbccbqremmzsksqqsu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdGJjY2JxcmVtbXpza3NxcXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTgxODMsImV4cCI6MjA5MTAzNDE4M30.nusudkt099n0VDDr0VMB2wN9-27F2p2KsZPRM8oLmuI";

const EMAIL = "laceyhzx@gmail.com";
const PASSWORD = "262626";
const DISPLAY_NAME = "Lacey";

// Days ago helper
const daysAgo = (d) => new Date(Date.now() - d * 86_400_000).toISOString();

// Progress records — 3 modules completed, 5 viewed, 4 backtests, 1 custom,
// 3 historical scenario runs — gives a partially-filled radar and timeline.
const PROGRESS = [
  // Module views
  { activity_type: "module_view",     activity_id: "module-1", metadata: {}, created_at: daysAgo(18) },
  { activity_type: "module_view",     activity_id: "module-2", metadata: {}, created_at: daysAgo(13) },
  { activity_type: "module_view",     activity_id: "module-3", metadata: {}, created_at: daysAgo(9)  },
  { activity_type: "module_view",     activity_id: "module-4", metadata: {}, created_at: daysAgo(4)  },
  { activity_type: "module_view",     activity_id: "module-5", metadata: {}, created_at: daysAgo(1)  },
  // Module completions
  { activity_type: "module_complete", activity_id: "module-1", metadata: {}, created_at: daysAgo(17) },
  { activity_type: "module_complete", activity_id: "module-2", metadata: {}, created_at: daysAgo(11) },
  { activity_type: "module_complete", activity_id: "module-3", metadata: {}, created_at: daysAgo(7)  },
  // Sandbox backtests
  { activity_type: "sandbox_backtest", activity_id: "sma-crossover",  metadata: { strategy: "SMA Crossover" },   created_at: daysAgo(6) },
  { activity_type: "sandbox_backtest", activity_id: "momentum",       metadata: { strategy: "Momentum" },        created_at: daysAgo(5) },
  { activity_type: "sandbox_backtest", activity_id: "mean-reversion", metadata: { strategy: "Mean Reversion" },  created_at: daysAgo(3) },
  { activity_type: "sandbox_backtest", activity_id: "buy-hold",       metadata: { strategy: "Buy & Hold" },      created_at: daysAgo(2) },
  // Custom portfolio
  { activity_type: "sandbox_custom",   activity_id: "custom-1",       metadata: {},                              created_at: daysAgo(2) },
  // Scenario runs
  { activity_type: "scenario_run", activity_id: "dotcom", metadata: { scenario: "Dot-Com Bubble" },        created_at: daysAgo(10) },
  { activity_type: "scenario_run", activity_id: "gfc",    metadata: { scenario: "2008 Financial Crisis" }, created_at: daysAgo(8)  },
  { activity_type: "scenario_run", activity_id: "covid",  metadata: { scenario: "COVID Crash" },           created_at: daysAgo(5)  },
  // Knowledge points
  { activity_type: "knowledge_point", activity_id: "fundamental-thinking",  metadata: {}, created_at: daysAgo(17) },
  { activity_type: "knowledge_point", activity_id: "technical-thinking",    metadata: {}, created_at: daysAgo(13) },
  { activity_type: "knowledge_point", activity_id: "momentum-thinking",     metadata: {}, created_at: daysAgo(9)  },
  { activity_type: "knowledge_point", activity_id: "stock-filtering",       metadata: {}, created_at: daysAgo(7)  },
  { activity_type: "knowledge_point", activity_id: "portfolio-construction",metadata: {}, created_at: daysAgo(4)  },
];

async function api(path, body, token) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function main() {
  console.log("=== InvestLab Demo Account Seeder ===\n");

  // 1. Sign up (idempotent — ignores "already registered" error)
  console.log(`1. Creating account for ${EMAIL}...`);
  const signUp = await api("/auth/v1/signup", {
    email: EMAIL,
    password: PASSWORD,
    data: { display_name: DISPLAY_NAME },
  });
  if (signUp.error && !signUp.error?.message?.includes("already registered")) {
    console.error("Sign-up error:", signUp.error.message);
    process.exit(1);
  }
  console.log(signUp.error ? `   Already exists — skipping sign-up.` : `   Account created.`);

  // 2. Sign in
  console.log("2. Signing in...");
  const signIn = await api("/auth/v1/token?grant_type=password", {
    email: EMAIL,
    password: PASSWORD,
  });
  if (!signIn.access_token) {
    console.error("Sign-in failed:", signIn.error_description || JSON.stringify(signIn));
    if (signIn.error_description?.includes("Email not confirmed")) {
      console.log("\n⚠  Email confirmation is enabled on your Supabase project.");
      console.log("   Disable it: Supabase Dashboard → Auth → Settings → uncheck 'Enable email confirmations'");
      console.log("   Then re-run this script.");
    }
    process.exit(1);
  }
  const token = signIn.access_token;
  const userId = signIn.user.id;
  console.log(`   Signed in as ${userId.slice(0, 8)}...`);

  // 3. Upsert display name in profiles table
  console.log("3. Updating profile display name...");
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ display_name: DISPLAY_NAME }),
  });
  console.log(`   Profile update: ${profileRes.status === 204 ? "OK" : profileRes.status}`);

  // 4. Insert progress records
  console.log(`4. Inserting ${PROGRESS.length} progress records...`);
  let ok = 0;
  let skip = 0;
  for (const record of PROGRESS) {
    const row = { ...record, user_id: userId };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (res.status === 201 || res.status === 200 || res.status === 204) {
      ok++;
    } else {
      const body = await res.text();
      if (body.includes("duplicate")) skip++;
      else console.warn(`   WARN ${record.activity_type}/${record.activity_id}: ${res.status} ${body}`);
    }
  }
  console.log(`   Inserted: ${ok}  Already existed: ${skip}`);

  console.log("\n✅ Done! Log in with:");
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log("\nExpected Investor Hub state:");
  console.log("  • 3/6 modules completed → Explorer tier");
  console.log("  • Radar: Strategy ~7.8, Risk 7.5, Environment 8.5, Reflection 4.0, Allocation 3.0");
  console.log("  • 4 backtests, 1 custom portfolio, 3 scenario runs");
  console.log("  • 5 knowledge points");
  console.log("  • 4 badges earned (First Module, Scenario Runner, Sandbox Explorer, Strategy Thinker)");
}

main().catch((e) => { console.error(e); process.exit(1); });
