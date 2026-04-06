import { motion } from "framer-motion";
import { Award, BookOpen, MessageSquare, CheckCircle2, Circle } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const modules = [
  { id: 1, title: "The Price Illusion", completed: false },
  { id: 2, title: "Strategy Foundations", completed: false },
  { id: 3, title: "Environment Reading", completed: false },
  { id: 4, title: "Portfolio Construction", completed: false },
  { id: 5, title: "Behavioral Traps", completed: false },
  { id: 6, title: "Full Integration", completed: false },
];

const badges = [
  { label: "First Module", description: "Complete your first module", earned: false },
  { label: "Scenario Runner", description: "Run your first scenario simulation", earned: false },
  { label: "Sandbox Explorer", description: "Back-test a strategy in the Sandbox", earned: false },
  { label: "Strategy Thinker", description: "Complete 3 modules", earned: false },
  { label: "Risk Aware", description: "Survive a stress-test scenario", earned: false },
  { label: "Full Graduate", description: "Complete all 6 modules", earned: false },
];

const abilityData = [
  { dimension: "Strategy", score: 0 },
  { dimension: "Risk", score: 0 },
  { dimension: "Environment", score: 0 },
  { dimension: "Reflection", score: 0 },
  { dimension: "Allocation", score: 0 },
];

const comments = [
  { text: "Complete modules and run scenarios to receive AI commentary on your decisions.", date: "—" },
];

const completedCount = modules.filter((m) => m.completed).length;
const progressPct = Math.round((completedCount / modules.length) * 100);

const Account = () => {
  return (
    <AppLayout>
      <div className="container py-10 md:py-16 space-y-8 max-w-5xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-serif bg-primary/10 text-primary">
              IL
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground">Investor Profile</h1>
            <p className="text-sm text-muted-foreground">Track your learning journey and growth</p>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Learning Progress
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
                    <li key={m.id} className="flex items-center gap-2 text-sm">
                      {m.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40" />
                      )}
                      <span className={m.completed ? "text-foreground" : "text-muted-foreground"}>
                        Module {m.id}: {m.title}
                      </span>
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
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                      name="Ability"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Complete modules and scenarios to build your profile
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((b) => (
                    <div
                      key={b.label}
                      className={`rounded-lg border p-3 text-center transition-colors ${
                        b.earned
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-secondary/30 opacity-50"
                      }`}
                    >
                      <Award className={`h-5 w-5 mx-auto mb-1 ${b.earned ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-xs font-medium text-foreground">{b.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{b.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Commentary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  AI Commentary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {comments.map((c, i) => (
                    <li key={i} className="rounded-lg border border-border bg-secondary/30 p-3">
                      <p className="text-sm text-muted-foreground">{c.text}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block">{c.date}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Account;
