import { motion } from "framer-motion";
import {
  TrendingUp, Shuffle, BarChart3, Crosshair,
  PieChart, ClipboardCheck, FlaskConical, History,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import ModuleCard from "@/components/ModuleCard";
import SideModuleCard from "@/components/SideModuleCard";
import ProgressBar from "@/components/ProgressBar";

const coreModules = [
  {
    title: "Why Price Movement Is Misleading",
    description: "Discover the three fundamental approaches to investing: fundamental, technical, and momentum thinking.",
    icon: <TrendingUp className="h-5 w-5" />,
    status: "active" as const,
    to: "/module/1",
  },
  {
    title: "Strategy ≠ Right or Wrong",
    description: "Learn why strategies perform differently depending on trending, sideways, or crisis market conditions.",
    icon: <Shuffle className="h-5 w-5" />,
    status: "available" as const,
    to: "/module/2",
  },
  {
    title: "Entering Real Stock Universes",
    description: "Explore real stock pools (S&P 500, Nasdaq 100) with simplified, strategy-relevant labels only.",
    icon: <BarChart3 className="h-5 w-5" />,
    status: "available" as const,
    to: "/module/3",
  },
  {
    title: "Strategy-Bound Decisions",
    description: "Every portfolio action must be tied to a declared strategy: Buy & Hold, Trend Following, or Mean Reversion.",
    icon: <Crosshair className="h-5 w-5" />,
    status: "available" as const,
    to: "/module/4",
  },
  {
    title: "Portfolio-Level Thinking",
    description: "Shift focus from individual stocks to allocation, volatility, drawdown, and strategy mix.",
    icon: <PieChart className="h-5 w-5" />,
    status: "available" as const,
    to: "/module/5",
  },
  {
    title: "Reflection & Feedback",
    description: "Receive an automatic learning summary revealing your strategy patterns and behavioral insights.",
    icon: <ClipboardCheck className="h-5 w-5" />,
    status: "available" as const,
    to: "/module/6",
  },
];

const LearningPath = () => {
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
            <ProgressBar current={0} total={6} label="Modules completed" />
          </div>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* Core Modules */}
          <div className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Core Modules
            </h2>
            {coreModules.map((mod, i) => (
              <ModuleCard
                key={i}
                index={i + 1}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                status={mod.status}
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
              locked
            />
            <SideModuleCard
              title="Historical Stress Tests"
              description="Face the Dot-com bubble, 2008 crisis, COVID crash, and 2022 rate hikes with your strategy knowledge."
              icon={<History className="h-5 w-5" />}
              variant="stress"
              locked
            />

            {/* Gamification note */}
            <div className="rounded-xl border border-border bg-card p-5 mt-6">
              <h3 className="font-serif text-base text-foreground mb-2">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Strategy Mastery</span>
                  <span className="text-foreground">—</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scenarios Completed</span>
                  <span className="text-foreground">0 / 4</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Badges Earned</span>
                  <span className="text-foreground">0</span>
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
