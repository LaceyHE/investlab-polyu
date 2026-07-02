import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, TrendingUp, BarChart3, Zap,
  ChevronRight, ChevronDown, CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGamification } from "@/contexts/GamificationContext";
import ProgressBar from "@/components/ProgressBar";
import KnowledgeCheck, { type QuizQuestion } from "@/components/KnowledgeCheck";

const approaches = [
  {
    id: "fundamental-thinking",
    icon: <TrendingUp className="h-6 w-6" />,
    name: "Fundamental Thinking",
    tagline: "Value over time",
    description:
      "Judges a company by its intrinsic worth — earnings, cash flow, competitive moat. Trusts that price eventually catches up to true value.",
    reaction:
      "Sees the 15% drop as a discount. If the business still earns the same cash, a lower price simply means a better deal — so they buy more.",
    inPractice:
      "Pores over earnings reports, balance sheets, and industry position. Holds for years, not days. Patron saint: Warren Buffett.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "technical-thinking",
    icon: <BarChart3 className="h-6 w-6" />,
    name: "Technical Thinking",
    tagline: "Timing and trends",
    description:
      "Reads price charts, patterns, and volume to time entries and exits. Believes the chart already prices in everything worth knowing.",
    reaction:
      "Sees the 15% drop as a breakdown — price has sliced through support. The chart says danger, so they step aside until it stabilises.",
    inPractice:
      "Watches moving averages, support/resistance, and momentum indicators. Acts in days or weeks, guided by what price is doing now.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    id: "momentum-thinking",
    icon: <Zap className="h-6 w-6" />,
    name: "Momentum Thinking",
    tagline: "Relative strength",
    description:
      "Bets that recent winners keep winning and losers keep losing. Cares about the speed and direction of price, not the story behind it.",
    reaction:
      "Sees the 15% drop as confirmation the trend has turned down. Momentum is now negative, so they exit — or even bet against it.",
    inPractice:
      "Ranks assets by relative strength and rides the strongest. Cuts losers fast. The motto: 'the trend is your friend — until it ends.'",
    color: "text-foreground",
    bg: "bg-secondary",
  },
];

const quiz: QuizQuestion[] = [
  {
    q: "A stock you own drops 15% in a week, with no real change to the underlying business. How does a fundamental investor most likely read it?",
    options: [
      "A breakdown signal — time to get out",
      "Confirmation the downtrend will continue",
      "A potential buying opportunity at a discount",
    ],
    correct: 2,
  },
  {
    q: "What is the single core idea of this module?",
    options: [
      "The same price move can mean opposite things depending on your lens",
      "Technical analysis always beats fundamental analysis",
      "You should always buy after a 15% drop",
    ],
    correct: 0,
  },
  {
    q: "A momentum investor mainly pays attention to…",
    options: [
      "A company's long-term cash flows and competitive moat",
      "The speed and direction of recent price movement",
      "Whether the dividend payout is safe",
    ],
    correct: 1,
  },
];

const ModuleOne = () => {
  const { markComplete } = useUserProgress();
  const { completeModule } = useGamification();
  const tracked = useRef(false);

  const [open, setOpen] = useState<string | null>(null);
  const [explored, setExplored] = useState<string[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      markComplete("module_view", "module-1");
    }
  }, [markComplete]);

  const toggle = (a: typeof approaches[number]) => {
    setOpen((prev) => (prev === a.id ? null : a.id));
    if (!explored.includes(a.id)) {
      const next = [...explored, a.id];
      setExplored(next);
      markComplete("knowledge_point", a.id, { module: 1 });
    }
  };

  const allExplored = explored.length === approaches.length;
  const canContinue = allExplored && quizPassed;

  return (
    <AppLayout>
      <div className="container max-w-4xl py-12 md:py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">
            Learning Path
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Module 1</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">
            Module 1 of 6
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Why Price Movement Alone Is Misleading
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Before you touch a single stock, you need to see the three lenses people use to read markets. Point all three at the <em>same</em> price chart and they reach completely different conclusions. Knowing which lens you're looking through is where every good decision starts.
          </p>
          <div className="mt-6 max-w-sm">
            <ProgressBar current={explored.length} total={approaches.length} label="Lenses explored" />
          </div>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 rounded-xl border border-primary/20 bg-primary/5 p-6"
        >
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary mb-2">
            Key Insight
          </p>
          <p className="text-foreground leading-relaxed">
            One stock falls 15% in a week. The fundamental investor sees a bargain. The technical investor sees a breakdown. The momentum investor sees a reason to exit. <strong>Same event — three opposite conclusions.</strong> None of them is "wrong." They're just reading different signals.
          </p>
        </motion.div>

        {/* Three Approaches */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-foreground mb-2">
            Three Ways to See the Market
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Tap each lens to see how it would react to that same 15% drop.
          </p>
          <div className="space-y-4">
            {approaches.map((a, i) => {
              const isOpen = open === a.id;
              const isDone = explored.includes(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                  className={`rounded-xl border bg-gradient-card transition-all ${
                    isOpen ? "border-primary/40" : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <button
                    onClick={() => toggle(a)}
                    className="flex w-full items-start gap-4 p-6 text-left"
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                      isDone ? "bg-teal/10 text-teal" : `${a.bg} ${a.color}`
                    }`}>
                      {isDone ? <CheckCircle2 className="h-6 w-6" /> : a.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-lg text-foreground">{a.name}</h3>
                        <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                          {a.tagline}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {a.description}
                      </p>
                    </div>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 md:pl-[5.5rem] space-y-3">
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary mb-1">
                              Reaction to a 15% drop
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">{a.reaction}</p>
                          </div>
                          <div className="rounded-lg border border-border bg-card p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground mb-1">
                              In practice
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{a.inPractice}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Knowledge Check */}
        <div className="mb-12">
          <KnowledgeCheck
            questions={quiz}
            locked={!allExplored}
            lockedHint={`👆 Explore all three lenses above to unlock the knowledge check. ${explored.length}/${approaches.length} done.`}
            onResult={({ allCorrect }) => setQuizPassed(allCorrect)}
          />
        </div>

        {/* Reminder */}
        <div className="mb-12 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Remember:</strong> there's no stock picking or real trading yet. The point is simply this — the lens you choose shapes every decision that follows. And no lens is inherently right or wrong; <em>which one fits which market</em> is exactly what Module 2 unpacks.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-8">
          <Link
            to="/learning-path"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Path
          </Link>
          {canContinue ? (
            <Link
              to="/module/2"
              onClick={() => (markComplete("module_complete", "module-1"), completeModule("module-1", 5, 5))}
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Continue to Module 2
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed">
              Continue to Module 2
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ModuleOne;
