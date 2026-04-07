import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, BookOpen, Clock, CheckCircle2, Circle, LogOut, FlaskConical, Compass, Lightbulb, Eye } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
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

function formatActivityLabel(record: { activity_type: string; activity_id: string; metadata: Record<string, unknown> }): string {
  const meta = record.metadata;
  switch (record.activity_type) {
    case "module_complete":
      return `Completed Module ${record.activity_id.replace("module-", "")}`;
    case "module_view":
      return `Studied Module ${record.activity_id.replace("module-", "")}`;
    case "sandbox_backtest":
      return `Ran ${(meta?.strategy as string) || record.activity_id} backtest`;
    case "sandbox_custom":
      return `Built custom portfolio`;
    case "scenario_run":
      return `Explored ${(meta?.scenario as string) || record.activity_id} scenario`;
    case "knowledge_point":
      return `Learned: ${knowledgeLabels[record.activity_id] || record.activity_id}`;
    default:
      return record.activity_type;
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

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { completedModules, hasActivity, getActivities, activityCount, recentActivities, loading: progressLoading } = useUserProgress();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  const displayName = (user.user_metadata?.display_name as string) || user.email || "Investor";
  const initials = displayName.slice(0, 2).toUpperCase();

  const modules = moduleList.map((m) => {
    const viewRecord = getActivities("module_view").find((p) => p.activity_id === `module-${m.id}`);
    const completeRecord = getActivities("module_complete").find((p) => p.activity_id === `module-${m.id}`);
    return {
      ...m,
      visited: !!viewRecord,
      completed: completedModules.includes(m.id),
      date: completeRecord?.created_at || viewRecord?.created_at || null,
    };
  });

  const completedCount = modules.filter((m) => m.completed).length;
  const progressPct = Math.round((completedCount / modules.length) * 100);

  const sandboxRuns = activityCount("sandbox_backtest");
  const customRuns = activityCount("sandbox_custom");
  const scenarioRuns = activityCount("scenario_run");
  const knowledgePoints = getActivities("knowledge_point");
  const uniqueScenarios = new Set(getActivities("scenario_run").map((p) => p.activity_id)).size;

  const badges = [
    { label: "First Module", description: "Complete your first module", earned: completedCount >= 1 },
    { label: "Scenario Runner", description: "Run your first scenario simulation", earned: hasActivity("scenario_run") },
    { label: "Sandbox Explorer", description: "Back-test a strategy in the Sandbox", earned: hasActivity("sandbox_backtest") },
    { label: "Strategy Thinker", description: "Complete 3 modules", earned: completedCount >= 3 },
    { label: "Portfolio Architect", description: "Build a custom portfolio", earned: hasActivity("sandbox_custom") },
    { label: "History Student", description: "Explore all 4 scenarios", earned: uniqueScenarios >= 4 },
    { label: "Risk Aware", description: "Survive a stress-test scenario", earned: hasActivity("scenario_run") },
    { label: "Full Graduate", description: "Complete all 6 modules", earned: completedCount === 6 },
  ];

  const abilityData = [
    { dimension: "Strategy", score: Math.min(10, completedCount * 1.2 + sandboxRuns * 0.8) },
    { dimension: "Risk", score: Math.min(10, scenarioRuns * 2.5) },
    { dimension: "Environment", score: Math.min(10, (completedModules.includes(3) ? 4 : 0) + uniqueScenarios * 1.5) },
    { dimension: "Reflection", score: Math.min(10, (completedModules.includes(6) ? 4 : 0) + customRuns * 2 + (sandboxRuns > 0 ? 2 : 0)) },
    { dimension: "Allocation", score: Math.min(10, (completedModules.includes(4) ? 4 : 0) + customRuns * 3) },
  ];

  // Filter activity timeline to show meaningful events (not knowledge_point)
  const timelineEvents = recentActivities.filter(
    (r) => r.activity_type !== "knowledge_point" && r.activity_type !== "module_view"
  ).slice(0, 8);

  return (
    <AppLayout>
      <div className="container py-10 md:py-16 space-y-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-serif bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-foreground">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </motion.div>

        {/* Stats summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <BookOpen className="h-4 w-4" />, label: "Modules", value: `${completedCount}/6` },
            { icon: <FlaskConical className="h-4 w-4" />, label: "Backtests", value: String(sandboxRuns + customRuns) },
            { icon: <Compass className="h-4 w-4" />, label: "Scenarios", value: String(scenarioRuns) },
            { icon: <Lightbulb className="h-4 w-4" />, label: "Knowledge", value: String(knowledgePoints.length) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">{s.icon}<span className="text-xs">{s.label}</span></div>
              <p className="text-xl font-mono text-foreground">{s.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{completedCount} of {modules.length} modules</span>
                  <span className="font-mono text-foreground">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-2" />
                <ul className="space-y-2 pt-1">
                  {modules.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {m.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : m.visited ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                        )}
                        <span className={m.completed ? "text-foreground" : m.visited ? "text-muted-foreground" : "text-muted-foreground/60"}>
                          Module {m.id}: {m.title}
                        </span>
                      </div>
                      {m.date && (
                        <span className="text-[10px] text-muted-foreground/60">{timeAgo(m.date)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ability Analysis */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Investment Ability Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={abilityData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name="Ability" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground text-center mt-2">Scores driven by modules, backtests & scenarios</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelineEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Start exploring modules and sandbox to see your activity here.</p>
                ) : (
                  <ul className="space-y-3">
                    {timelineEvents.map((r, i) => (
                      <li key={i} className="flex items-start justify-between gap-3">
                        <p className="text-sm text-foreground">{formatActivityLabel(r)}</p>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap mt-0.5">{timeAgo(r.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((b) => (
                    <div key={b.label} className={`rounded-lg border p-3 text-center transition-colors ${b.earned ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/30 opacity-50"}`}>
                      <Award className={`h-5 w-5 mx-auto mb-1 ${b.earned ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-xs font-medium text-foreground">{b.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{b.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Knowledge Points */}
          {knowledgePoints.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" /> Knowledge Points Collected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {knowledgePoints.map((kp, i) => (
                      <span key={i} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                        {knowledgeLabels[kp.activity_id] || kp.activity_id}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Account;
