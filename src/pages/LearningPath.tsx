import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp, Shuffle, BarChart3, Crosshair,
  PieChart, ClipboardCheck, FlaskConical, History,
  Sprout, ArrowRight, CheckCircle2,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import ModuleCard from "@/components/ModuleCard";
import SideModuleCard from "@/components/SideModuleCard";
import ProgressBar from "@/components/ProgressBar";
import { useGamification, BADGES } from "@/contexts/GamificationContext";

const coreModules = [
  {
    id: "module-1",
    title: "Why Price Movement Is Misleading",
    description: "Discover the three fundamental approaches to investing: fundamental, technical, and momentum thinking.",
    icon: <TrendingUp className="h-5 w-5" />,
    to: "/module/1",
  },
  {
    id: "module-2",
    title: "Strategy ≠ Right or Wrong",
    description: "Learn why strategies perform differently depending on trending, sideways, or crisis market conditions.",
    icon: <Shuffle className="h-5 w-5" />,
    to: "/module/2",
  },
  {
    id: "module-3",
    title: "Entering Real Stock Universes",
    description: "Explore real stock pools (S&P 500, Nasdaq 100) with simplified, strategy-relevant labels only.",
    icon: <BarChart3 className="h-5 w-5" />,
    to: "/module/3",
  },
  {
    id: "module-4",
    title: "Strategy-Bound Decisions",
    description: "Every portfolio action must be tied to a declared strategy: Buy & Hold, Trend Following, or Mean Reversion.",
    icon: <Crosshair className="h-5 w-5" />,
    to: "/module/4",
  },
  {
    id: "module-5",
    title: "Portfolio-Level Thinking",
    description: "Shift focus from individual stocks to allocation, volatility, drawdown, and strategy mix.",
    icon: <PieChart className="h-5 w-5" />,
    to: "/module/5",
  },
  {
    id: "module-6",
    title: "Reflection & Feedback",
    description: "Receive an automatic learning summary revealing your strategy patterns and behavioral insights.",
    icon: <ClipboardCheck className="h-5 w-5" />,
    to: "/module/6",
  },
];

const LearningPath = () => {
  const { state, levelInfo } = useGamification();
  const completed = state.completedModuleIds ?? [];

  const coreCompletedCount = coreModules.filter((m) => completed.includes(m.id)).length;
  const foundationsDone = completed.includes("foundations");
  const allCoreDone = coreCompletedCount === coreModules.length;

  // First not-yet-completed module becomes the "active" one
  const activeIndex = coreModules.findIndex((m) => !completed.includes(m.id));

  // Sequential unlock: a module opens only once the previous one is completed.
  const getStatus = (mod: typeof coreModules[number], i: number) => {
    if (completed.includes(mod.id)) return "completed" as const;
    if (i === activeIndex) return "active" as const;
    return "locked" as const;
  };

  const badgeCount = state.earnedBadgeIds.length;

  return (
    <AppLayout>
      <div className="container py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">
            Your Journey
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Learning Path
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-6">
            A six-module journey from understanding price movement to mastering portfolio-level strategic thinking.
          </p>
          <div className="max-w-md">
            <ProgressBar current={coreCompletedCount} total={coreModules.length} label="Modules completed" />
          </div>
        </motion.div>

        {/* Start Here — Foundations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Link to="/foundations" className="block group">
            <div className={`relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-lg hover:shadow-primary/10 ${
              foundationsDone ? "border-teal/30 bg-teal/5 hover:border-teal/50" : "border-primary/30 bg-primary/5 hover:border-primary/50"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                  foundationsDone ? "bg-teal/15 text-teal" : "bg-primary/15 text-primary"
                }`}>
                  {foundationsDone ? <CheckCircle2 className="h-6 w-6" /> : <Sprout className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${foundationsDone ? "text-teal" : "text-primary"}`}>
                    {foundationsDone ? "Foundations · Completed" : "Start Here · New to investing?"}
                  </p>
                  <h3 className="font-serif text-xl text-foreground mb-1">
                    Foundations — Investing From Zero
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Six plain-language ideas — stocks vs bonds, risk &amp; return, compounding, diversification, fees, and why time beats timing. No jargon. Build the bedrock before the strategy modules.
                  </p>
                </div>
                <ArrowRight className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 ${foundationsDone ? "text-teal" : "text-primary"}`} />
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* Core Modules */}
          <div className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Core Modules
            </h2>
            {coreModules.map((mod, i) => (
              <ModuleCard
                key={mod.id}
                index={i + 1}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                status={getStatus(mod, i)}
                to={mod.to}
                delay={i}
              />
            ))}
          </div>

          {/* Side Modules */}
          <div className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Side Modules
            </h2>
            <SideModuleCard
              title="Free Sandbox Portfolio"
              description="Test strategies freely using the same stock universe with all strategy constraints active. Unlocked after core lessons."
              icon={<FlaskConical className="h-5 w-5" />}
              variant="sandbox"
              locked={!allCoreDone}
              to="/sandbox"
            />
            <SideModuleCard
              title="Scenario Simulator"
              description="Explore historical market scenarios with real data. Build portfolios and understand how environments shape outcomes."
              icon={<History className="h-5 w-5" />}
              variant="stress"
              locked={!allCoreDone}
              to="/scenarios"
            />

            {/* Live progress panel */}
            <div className="rounded-xl border border-border bg-card p-5 mt-6">
              <h3 className="font-serif text-base text-foreground mb-2">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Strategy Mastery</span>
                  <span className="text-foreground font-medium">
                    {levelInfo.current.emoji} {levelInfo.current.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Modules Completed</span>
                  <span className="text-foreground font-medium">{coreCompletedCount} / {coreModules.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scenarios Completed</span>
                  <span className="text-foreground font-medium">{state.scenariosCompleted} / 4</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Badges Earned</span>
                  <span className="text-foreground font-medium">{badgeCount} / {BADGES.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total XP</span>
                  <span className="text-foreground font-medium">{state.xp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LearningPath;
