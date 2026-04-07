import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight, TrendingUp, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ProgressBar from "@/components/ProgressBar";
import { useUserProgress } from "@/hooks/useUserProgress";

type Environment = "trending" | "sideways" | "crisis";
type Strategy = "buyhold" | "trendfollowing" | "meanreversion";

const environments: { id: Environment; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "trending", label: "Trending Market", icon: <TrendingUp className="h-5 w-5" />, desc: "Sustained directional price movement with momentum." },
  { id: "sideways", label: "Sideways Market", icon: <Minus className="h-5 w-5" />, desc: "Range-bound price action with no clear direction." },
  { id: "crisis", label: "Shock / Crisis", icon: <AlertTriangle className="h-5 w-5" />, desc: "Sudden, severe drawdown with high volatility." },
];

const strategies: { id: Strategy; label: string }[] = [
  { id: "buyhold", label: "Buy & Hold" },
  { id: "trendfollowing", label: "Trend Following" },
  { id: "meanreversion", label: "Mean Reversion" },
];

const behaviorMatrix: Record<Environment, Record<Strategy, { outcome: string; explanation: string }>> = {
  trending: {
    buyhold: {
      outcome: "Steady gains",
      explanation: "Buy & Hold captures the full trend without interference. Patience is rewarded as the market moves in one direction.",
    },
    trendfollowing: {
      outcome: "Strong alignment",
      explanation: "Trend-following strategies align naturally with price persistence. Signals stay consistent and false exits are rare.",
    },
    meanreversion: {
      outcome: "Repeated losses",
      explanation: "Mean reversion bets against the trend, selling too early and buying too soon. In trending markets, 'cheap' keeps getting cheaper.",
    },
  },
  sideways: {
    buyhold: {
      outcome: "Stagnation",
      explanation: "Buy & Hold sees no meaningful returns. The portfolio drifts sideways, testing patience without reward.",
    },
    trendfollowing: {
      outcome: "Whipsaw losses",
      explanation: "Trend-following generates repeated false signals. Each breakout attempt fails, eroding capital through frequent entries and exits.",
    },
    meanreversion: {
      outcome: "Consistent small gains",
      explanation: "Mean reversion thrives in range-bound markets. Buying at support and selling at resistance produces reliable, small returns.",
    },
  },
  crisis: {
    buyhold: {
      outcome: "Deep drawdown",
      explanation: "Buy & Hold absorbs the full crash. Recovery may take months or years. The strategy requires extreme emotional tolerance.",
    },
    trendfollowing: {
      outcome: "Early exit, capital preserved",
      explanation: "Trend-following exits early as momentum reverses. It doesn't predict the crash but reacts to it quickly.",
    },
    meanreversion: {
      outcome: "Dangerous false bottoms",
      explanation: "Mean reversion sees the crash as a buying opportunity, but the market keeps falling. 'Cheap' becomes a trap during crises.",
    },
  },
};

// Simplified abstract chart shapes
const chartPaths: Record<Environment, string> = {
  trending: "M 0 80 Q 30 70, 60 55 Q 90 40, 120 30 Q 150 20, 180 15 Q 210 12, 240 5",
  sideways: "M 0 45 Q 30 30, 60 50 Q 90 60, 120 40 Q 150 35, 180 55 Q 210 45, 240 42",
  crisis: "M 0 15 Q 30 18, 60 20 Q 90 25, 120 35 Q 130 60, 140 70 Q 160 80, 180 85 Q 210 78, 240 82",
};

const ModuleTwo = () => {
  const [section, setSection] = useState(0);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [exerciseStrategy, setExerciseStrategy] = useState<Strategy | null>(null);
  const [exerciseEnv, setExerciseEnv] = useState<Environment | null>(null);
  const { markComplete } = useUserProgress();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      markComplete("module_view", "module-2");
    }
  }, [markComplete]);
  const [prediction, setPrediction] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const completeSection = (s: number) => {
    if (!completedSections.includes(s)) setCompletedSections([...completedSections, s]);
  };

  const startExercise = () => {
    const envs: Environment[] = ["trending", "sideways", "crisis"];
    setExerciseEnv(envs[Math.floor(Math.random() * envs.length)]);
    setExerciseStrategy(null);
    setPrediction("");
    setRevealed(false);
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-12 md:py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Module 2</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">Module 2 of 6</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Strategy ≠ Right or Wrong</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            No strategy is universally good or bad. Performance depends entirely on the environment it operates in.
          </p>
          <div className="mt-6 max-w-sm">
            <ProgressBar current={completedSections.length} total={3} label="Sections completed" />
          </div>
        </motion.div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          {["Market Regime Simulator", "Mismatch Exercise", "Reflection"].map((label, i) => (
            <button
              key={i}
              onClick={() => setSection(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                section === i ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Section 1: Market Regime Simulator */}
          {section === 0 && (
            <motion.div key="sim" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-serif text-2xl text-foreground mb-6">Interactive Market Regime Simulator</h2>
              <p className="text-muted-foreground mb-6">Select an environment to see how each strategy behaves within it.</p>

              <div className="grid gap-3 sm:grid-cols-3 mb-8">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => { setSelectedEnv(env.id); completeSection(0); }}
                    className={`rounded-xl border p-5 text-left transition-all ${
                      selectedEnv === env.id
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-gradient-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                      selectedEnv === env.id ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      {env.icon}
                    </div>
                    <h3 className="font-serif text-base text-foreground mb-1">{env.label}</h3>
                    <p className="text-xs text-muted-foreground">{env.desc}</p>
                  </button>
                ))}
              </div>

              {selectedEnv && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Abstract chart */}
                  <div className="rounded-xl border border-border bg-gradient-card p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground mb-4">
                      Abstracted Price Movement — {environments.find(e => e.id === selectedEnv)?.label}
                    </p>
                    <svg viewBox="0 0 240 100" className="w-full h-32" preserveAspectRatio="none">
                      <path d={chartPaths[selectedEnv]} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Strategy outcomes */}
                  <div className="space-y-3">
                    {strategies.map((strat) => {
                      const result = behaviorMatrix[selectedEnv][strat.id];
                      return (
                        <div key={strat.id} className="rounded-xl border border-border bg-gradient-card p-5">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-serif text-base text-foreground">{strat.label}</h4>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {result.outcome}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Section 2: Mismatch Exercise */}
          {section === 1 && (
            <motion.div key="exercise" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-serif text-2xl text-foreground mb-4">Strategy–Environment Mismatch Exercise</h2>
              <p className="text-muted-foreground mb-6">Choose a strategy, and we'll assign a random environment. Predict the outcome, then see the AI explanation.</p>

              {!exerciseEnv && (
                <button onClick={startExercise} className="rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground">
                  Start Exercise
                </button>
              )}

              {exerciseEnv && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary mb-1">Assigned Environment</p>
                    <p className="text-foreground font-serif text-lg">{environments.find(e => e.id === exerciseEnv)?.label}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Select your strategy:</p>
                    <div className="flex flex-wrap gap-2">
                      {strategies.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setExerciseStrategy(s.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            exerciseStrategy === s.id
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exerciseStrategy && !revealed && (
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">What do you think will happen?</label>
                      <textarea
                        value={prediction}
                        onChange={(e) => setPrediction(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Describe your prediction..."
                      />
                      <button
                        onClick={() => { setRevealed(true); completeSection(1); }}
                        disabled={!prediction.trim()}
                        className="mt-3 rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                      >
                        Reveal Outcome
                      </button>
                    </div>
                  )}

                  {revealed && exerciseStrategy && exerciseEnv && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="rounded-xl border border-teal/20 bg-teal/5 p-5">
                        <p className="text-xs font-medium uppercase tracking-[0.15em] text-teal mb-2">AI Analysis</p>
                        <p className="text-foreground font-serif text-base mb-2">{behaviorMatrix[exerciseEnv][exerciseStrategy].outcome}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{behaviorMatrix[exerciseEnv][exerciseStrategy].explanation}</p>
                      </div>
                      <button onClick={startExercise} className="text-sm text-primary hover:underline">Try another combination →</button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Section 3: Reflection */}
          {section === 2 && (
            <motion.div key="reflection" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-serif text-2xl text-foreground mb-4">Reflection Panel</h2>
              <p className="text-muted-foreground mb-8">Based on your exploration, here's what your behavior reveals.</p>

              <div className="space-y-4">
                {[
                  { label: "Most Explored Environment", value: selectedEnv ? environments.find(e => e.id === selectedEnv)?.label ?? "—" : "—" },
                  { label: "Overconfidence Pattern", value: revealed ? "You may assume strategies work across all environments. This is the core illusion." : "Complete the exercise to reveal." },
                  { label: "Key Takeaway", value: "No strategy is inherently right or wrong. It is always relative to the environment." },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-border bg-gradient-card p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-foreground leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => completeSection(2)}
                className="mt-8 rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                Mark Reflection Complete
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-8 mt-12">
          <Link to="/module/1" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Module 1
          </Link>
          <Link
            to="/module/3"
            className={`group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
              completedSections.length >= 3
                ? "bg-gradient-warm text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
            onClick={(e) => { if (completedSections.length < 3) e.preventDefault(); }}
          >
            Continue to Module 3
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ModuleTwo;
