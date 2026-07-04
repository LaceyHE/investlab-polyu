import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award, BookOpen, Clock, CheckCircle2, Circle, LogOut, LogIn, FlaskConical,
  Compass, Lightbulb, Eye, TrendingUp, ChevronRight, Pencil,
  Shuffle, BarChart3, Crosshair, PieChart, ClipboardCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGamification, BADGES, CORE_MODULE_IDS } from "@/contexts/GamificationContext";
import { AvatarDisplay, AvatarPicker } from "@/components/gamification/AvatarSystem";
import { DailyXPBar, XPBar, StreakWidget, BadgeDisplay } from "@/components/gamification/XPSidebar";
import { AbilityRadarWidget } from "@/components/gamification/AbilityRadarWidget";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";

const moduleList = [
  { id: 1, title: "Why Price Movement Is Misleading", icon: TrendingUp },
  { id: 2, title: "Strategy ≠ Right or Wrong", icon: Shuffle },
  { id: 3, title: "Entering Real Stock Universes", icon: BarChart3 },
  { id: 4, title: "Strategy-Bound Decisions", icon: Crosshair },
  { id: 5, title: "Portfolio-Level Thinking", icon: PieChart },
  { id: 6, title: "Reflection & Feedback", icon: ClipboardCheck },
];

const knowledgeLabels: Record<string, string> = {
  "fundamental-thinking": "Fundamental Thinking",
  "technical-thinking": "Technical Thinking",
  "momentum-thinking": "Momentum Thinking",
  "stock-filtering": "Stock Filtering",
  "portfolio-construction": "Portfolio Construction",
  "risk-exposure": "Risk Exposure",
  "behavioral-reflection": "Behavioral Reflection",
};

function formatActivityLabel(record: {
  activity_type: string;
  activity_id: string;
  metadata: Record<string, unknown>;
}): string {
  const meta = record.metadata;
  switch (record.activity_type) {
    case "module_complete":  return `Completed Module ${record.activity_id.replace("module-", "")}`;
    case "module_view":      return `Studied Module ${record.activity_id.replace("module-", "")}`;
    case "sandbox_backtest": return `Ran ${(meta?.strategy as string) || record.activity_id} backtest`;
    case "sandbox_custom":   return `Built custom portfolio`;
    case "scenario_run":     return `Explored ${(meta?.scenario as string) || record.activity_id} scenario`;
    case "knowledge_point":  return `Learned: ${knowledgeLabels[record.activity_id] || record.activity_id}`;
    default:                 return record.activity_type;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getActivityIcon(type: string) {
  switch (type) {
    case "module_complete":  return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
    case "sandbox_backtest":
    case "sandbox_custom":   return <FlaskConical  className="h-3.5 w-3.5 text-warm" />;
    case "scenario_run":     return <Compass       className="h-3.5 w-3.5 text-teal" />;
    default:                 return <Lightbulb     className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    completedModules, getActivities, activityCount,
    recentActivities,
  } = useUserProgress();
  const { state, levelInfo, currentAvatar } = useGamification();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (authLoading) return null;

  const displayName = state.displayName || (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "Investor";

  // A module counts as done if EITHER the cross-device Supabase log or this browser's local
  // gamification state says so — keeps the Hub in sync with /learning-path (which reads only
  // the local state) without ever showing less progress than a user has already made.
  const isModuleDone = (id: number) =>
    completedModules.includes(id) || state.completedModuleIds.includes(`module-${id}`);

  const modules = moduleList.map((m) => {
    const viewRecord    = getActivities("module_view").find((p) => p.activity_id === `module-${m.id}`);
    const completeRecord = getActivities("module_complete").find((p) => p.activity_id === `module-${m.id}`);
    return {
      ...m,
      visited:   !!viewRecord,
      completed: isModuleDone(m.id),
      date:      completeRecord?.created_at || viewRecord?.created_at || null,
    };
  });

  const completedCount  = modules.filter((m) => m.completed).length;
  const coreCompletedCount = CORE_MODULE_IDS.filter((id) => state.completedModuleIds.includes(id)).length;

  // Sandbox/Scenario/Concept counts are tracked in two places (Supabase activity log +
  // local gamification counters); take the higher of the two so nothing appears to regress.
  const sandboxCount    = Math.max(activityCount("sandbox_backtest") + activityCount("sandbox_custom"), state.backtestsRun);
  const scenarioCount   = Math.max(activityCount("scenario_run"), state.scenariosCompleted);
  const knowledgePoints = getActivities("knowledge_point");
  const conceptsCount   = Math.max(knowledgePoints.length, state.conceptsLearned);

  const earnedCount = state.earnedBadgeIds.length;

  // Nearest-to-unlock badges — a small, curated set of countable badges to keep users
  // pointed at their next achievable goal rather than just a flat earned/locked grid.
  const badgeProgress: Partial<Record<typeof BADGES[number]["id"], { current: number; target: number }>> = {
    first_module:  { current: coreCompletedCount, target: 1 },
    halfway:       { current: coreCompletedCount, target: 3 },
    all_modules:   { current: coreCompletedCount, target: 6 },
    concept_10:    { current: conceptsCount, target: 10 },
    backtester:    { current: sandboxCount, target: 5 },
    crisis_pro:    { current: scenarioCount, target: 4 },
    streak_3:      { current: state.currentStreak, target: 3 },
    streak_7:      { current: state.currentStreak, target: 7 },
  };
  const nextBadges = BADGES
    .filter((b) => !state.earnedBadgeIds.includes(b.id) && badgeProgress[b.id])
    .map((b) => ({ badge: b, ...badgeProgress[b.id]! }))
    .sort((a, b) => (b.current / b.target) - (a.current / a.target))
    .slice(0, 3);

  const timelineEvents = recentActivities
    .filter((r) => r.activity_type !== "knowledge_point" && r.activity_type !== "module_view")
    .slice(0, 8);

  return (
    <AppLayout>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b-2 border-foreground bg-background">
        <div className="container relative z-10 py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <AvatarDisplay size="xl" showRing />
                <button
                  onClick={() => setPickerOpen(true)}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                  title="Change avatar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="font-serif text-2xl md:text-3xl text-foreground">{displayName}</h1>
                  <span
                    className="inline-flex items-center gap-1 rounded-none border-2 border-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-[2px_2px_0_hsl(var(--foreground))]"
                    style={{ backgroundColor: levelInfo.current.color, color: "white" }}
                  >
                    {levelInfo.current.emoji} {levelInfo.current.title}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user ? user.email : "Playing as a guest — progress stays on this device"}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {currentAvatar?.name ?? "No avatar"} · {earnedCount}/{BADGES.length} badges · {completedCount}/6 modules completed
                </p>
              </div>
            </div>

            {user ? (
              <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2 self-start md:self-auto rounded-none border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="gap-2 self-start md:self-auto rounded-none border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                <LogIn className="h-4 w-4" /> Sign In to Sync
              </Button>
            )}
          </motion.div>

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 rounded-none border-2 border-foreground bg-[var(--accent-yellow)] px-4 py-2.5 text-sm text-black shadow-[2px_2px_0_hsl(var(--foreground))]"
            >
              Sign in to save progress for every avatar across your devices — your local progress won't be lost.
            </motion.div>
          )}

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { icon: BookOpen,    label: "Modules",   value: `${completedCount}/6`, accent: "text-primary" },
              { icon: FlaskConical,label: "Sandbox",   value: String(sandboxCount), accent: "text-warm" },
              { icon: Compass,     label: "Scenarios", value: String(scenarioCount), accent: "text-teal" },
              { icon: Lightbulb,   label: "Concepts",  value: String(conceptsCount), accent: "text-primary" },
            ].map((s) => (
              <div key={s.label} className="rounded-none border-2 border-foreground bg-card px-4 py-3 flex items-center gap-3 shadow-[2px_2px_0_hsl(var(--foreground))]">
                <s.icon className={`h-4 w-4 shrink-0 ${s.accent}`} />
                <div>
                  <p className="text-xs text-muted-foreground leading-none mb-1">{s.label}</p>
                  <p className="font-mono text-lg text-foreground leading-none">{s.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className="container py-8 md:py-12 max-w-5xl space-y-6">

        {/* XP / Daily Goal / Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <DailyXPBar />
          <XPBar />
          <StreakWidget />
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Learning Journey */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Learning Journey
                </CardTitle>
                <div className="pt-1">
                  <ProgressBar current={completedCount} total={6} />
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {modules.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {m.completed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        ) : m.visited ? (
                          <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                        )}
                        <m.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                        <span className={`text-sm truncate ${m.completed ? "text-foreground" : m.visited ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                          <span className="text-muted-foreground/60 text-xs mr-1.5">0{m.id}</span>
                          {m.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.date && <span className="text-[10px] text-muted-foreground/50">{timeAgo(m.date)}</span>}
                        {m.completed && <ChevronRight className="h-3.5 w-3.5 text-primary/40" />}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Investment Ability Radar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardContent className="pt-6">
                <AbilityRadarWidget />
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Badges
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{earnedCount}/{BADGES.length} earned</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BadgeDisplay compact />
                {nextBadges.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Next up</p>
                    {nextBadges.map(({ badge, current, target }) => (
                      <div key={badge.id} className="flex items-center gap-2">
                        <span className="text-sm shrink-0" title={badge.desc}>{badge.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="font-medium text-foreground truncate">{badge.name}</span>
                            <span className="text-muted-foreground shrink-0 ml-2">{Math.min(current, target)}/{target}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, (current / target) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {timelineEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                    <Compass className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Start exploring modules and sandbox to track your journey.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                    <ul className="space-y-4 pl-7">
                      {timelineEvents.map((r, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="relative"
                        >
                          <div className="absolute -left-7 top-0 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
                            {getActivityIcon(r.activity_type)}
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-foreground leading-tight">{formatActivityLabel(r)}</p>
                            <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap mt-0.5">{timeAgo(r.created_at)}</span>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Knowledge Points */}
        {knowledgePoints.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" /> Knowledge Collected
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{knowledgePoints.length} concepts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {knowledgePoints.map((kp, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-none border-2 border-foreground bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      {knowledgeLabels[kp.activity_id] || kp.activity_id}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <AvatarPicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)} />
    </AppLayout>
  );
};

export default Account;
