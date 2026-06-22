import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award, BookOpen, Clock, CheckCircle2, Circle, LogOut, FlaskConical,
  Compass, Lightbulb, Eye, BarChart2, Shield, Target, TrendingUp,
  ChevronRight,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const moduleList = [
  { id: 1, title: "The Price Illusion" },
  { id: 2, title: "Strategy Foundations" },
  { id: 3, title: "Environment Reading" },
  { id: 4, title: "Portfolio Construction" },
  { id: 5, title: "Behavioral Traps" },
  { id: 6, title: "Full Integration" },
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

type LevelTier = { label: string; color: string; bg: string; border: string; ring: string };
function getLevel(completedCount: number): LevelTier {
  if (completedCount === 6)  return { label: "Graduate",  color: "text-teal",            bg: "bg-teal/10",    border: "border-teal/30",    ring: "ring-teal/40"    };
  if (completedCount >= 4)   return { label: "Strategist", color: "text-warm",            bg: "bg-warm/10",    border: "border-warm/30",    ring: "ring-warm/40"    };
  if (completedCount >= 2)   return { label: "Explorer",   color: "text-primary",         bg: "bg-primary/10", border: "border-primary/30", ring: "ring-primary/40" };
  return                            { label: "Learner",    color: "text-muted-foreground", bg: "bg-secondary", border: "border-border",     ring: "ring-border"     };
}

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

const badgeDefs = [
  { label: "First Module",      description: "Complete your first module",      icon: BookOpen,  check: (c: number)                                       => c >= 1 },
  { label: "Scenario Runner",   description: "Run your first simulation",       icon: Compass,   check: (_c: number, h: (t: string) => boolean)             => h("scenario_run") },
  { label: "Sandbox Explorer",  description: "Back-test a strategy",            icon: FlaskConical, check: (_c: number, h: (t: string) => boolean)          => h("sandbox_backtest") },
  { label: "Strategy Thinker",  description: "Complete 3 modules",              icon: Target,    check: (c: number)                                       => c >= 3 },
  { label: "Portfolio Architect",description: "Build a custom portfolio",       icon: BarChart2, check: (_c: number, h: (t: string) => boolean)             => h("sandbox_custom") },
  { label: "History Student",   description: "Explore all 4 scenarios",        icon: Clock,     check: (_c: number, _h: (t: string) => boolean, us: number) => us >= 4 },
  { label: "Risk Aware",        description: "Survive a stress-test scenario",  icon: Shield,    check: (_c: number, h: (t: string) => boolean)             => h("scenario_run") },
  { label: "Full Graduate",     description: "Complete all 6 modules",         icon: Award,     check: (c: number)                                       => c === 6 },
];

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    completedModules, hasActivity, getActivities, activityCount,
    recentActivities,
  } = useUserProgress();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  const displayName = (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "Investor";
  const initials = displayName.slice(0, 2).toUpperCase();

  const modules = moduleList.map((m) => {
    const viewRecord    = getActivities("module_view").find((p) => p.activity_id === `module-${m.id}`);
    const completeRecord = getActivities("module_complete").find((p) => p.activity_id === `module-${m.id}`);
    return {
      ...m,
      visited:   !!viewRecord,
      completed: completedModules.includes(m.id),
      date:      completeRecord?.created_at || viewRecord?.created_at || null,
    };
  });

  const completedCount  = modules.filter((m) => m.completed).length;
  const progressPct     = Math.round((completedCount / modules.length) * 100);
  const level           = getLevel(completedCount);

  const sandboxRuns     = activityCount("sandbox_backtest");
  const customRuns      = activityCount("sandbox_custom");
  const scenarioRuns    = activityCount("scenario_run");
  const knowledgePoints = getActivities("knowledge_point");
  const uniqueScenarios = new Set(getActivities("scenario_run").map((p) => p.activity_id)).size;

  const badges     = badgeDefs.map((b) => ({ ...b, earned: b.check(completedCount, hasActivity, uniqueScenarios) }));
  const earnedCount = badges.filter((b) => b.earned).length;

  const abilityData = [
    { dimension: "Strategy",    score: Math.min(10, completedCount * 1.2 + sandboxRuns * 0.8) },
    { dimension: "Risk",        score: Math.min(10, scenarioRuns * 2.5) },
    { dimension: "Environment", score: Math.min(10, (completedModules.includes(3) ? 4 : 0) + uniqueScenarios * 1.5) },
    { dimension: "Reflection",  score: Math.min(10, (completedModules.includes(6) ? 4 : 0) + customRuns * 2 + (sandboxRuns > 0 ? 2 : 0)) },
    { dimension: "Allocation",  score: Math.min(10, (completedModules.includes(4) ? 4 : 0) + customRuns * 3) },
  ];

  const timelineEvents = recentActivities
    .filter((r) => r.activity_type !== "knowledge_point" && r.activity_type !== "module_view")
    .slice(0, 8);

  return (
    <AppLayout>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="container relative z-10 py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              <div className={`rounded-full ring-2 ring-offset-2 ring-offset-background ${level.ring}`}>
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={`text-lg font-serif ${level.bg} ${level.color}`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="font-serif text-2xl md:text-3xl text-foreground">{displayName}</h1>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${level.bg} ${level.color} ${level.border}`}>
                    {level.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {earnedCount}/{badges.length} badges · {completedCount}/6 modules completed
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2 self-start md:self-auto">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { icon: BookOpen,    label: "Modules",   value: `${completedCount}/6`, accent: "text-primary" },
              { icon: FlaskConical,label: "Backtests", value: String(sandboxRuns + customRuns), accent: "text-warm" },
              { icon: Compass,     label: "Scenarios", value: String(scenarioRuns), accent: "text-teal" },
              { icon: Lightbulb,   label: "Insights",  value: String(knowledgePoints.length), accent: "text-primary" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
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
        <div className="grid gap-6 md:grid-cols-2">

          {/* Learning Journey */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> Learning Journey
                  </CardTitle>
                  <span className="font-mono text-sm text-muted-foreground">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-1.5 mt-2" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {modules.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {m.completed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        ) : m.visited ? (
                          <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                        )}
                        <span className={`text-sm ${m.completed ? "text-foreground" : m.visited ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
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
              <CardHeader className="pb-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Investment Ability
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Scores reflect modules, backtests and scenarios</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={230}>
                  <RadarChart cx="50%" cy="50%" outerRadius="68%" data={abilityData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                      name="Ability"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {abilityData.map((d) => (
                    <div key={d.dimension} className="text-center">
                      <p className="text-[9px] text-muted-foreground/70 leading-tight">{d.dimension}</p>
                      <p className="font-mono text-xs text-foreground">{d.score.toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Badges
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{earnedCount}/{badges.length} earned</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2.5">
                  {badges.map((b) => {
                    const Icon = b.icon;
                    return (
                      <div
                        key={b.label}
                        className={`relative rounded-xl border p-3 transition-all ${
                          b.earned ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20 opacity-45"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${b.earned ? "bg-primary/15" : "bg-secondary"}`}>
                            <Icon className={`h-3.5 w-3.5 ${b.earned ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground leading-tight">{b.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{b.description}</p>
                          </div>
                        </div>
                        {b.earned && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                    );
                  })}
                </div>
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
                    <span key={i} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
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
    </AppLayout>
  );
};

export default Account;
