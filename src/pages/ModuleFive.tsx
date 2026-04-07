import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight, PieChart, Activity, TrendingDown, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useUserProgress } from "@/hooks/useUserProgress";

type EnvToggle = "trending" | "shock" | "neutral";

const holdings = [
  { ticker: "AAPL", strategy: "Trend Following", allocation: 22 },
  { ticker: "MSFT", strategy: "Buy & Hold", allocation: 18 },
  { ticker: "NVDA", strategy: "Trend Following", allocation: 20 },
  { ticker: "JPM", strategy: "Mean Reversion", allocation: 15 },
  { ticker: "JNJ", strategy: "Buy & Hold", allocation: 12 },
  { ticker: "XOM", strategy: "Mean Reversion", allocation: 13 },
];

const envImpact: Record<EnvToggle, { volatility: string; drawdown: string; note: string }> = {
  neutral: {
    volatility: "12.4%",
    drawdown: "–8.2%",
    note: "In neutral conditions, your portfolio is balanced. Strategy mix creates natural diversification.",
  },
  trending: {
    volatility: "18.7%",
    drawdown: "–5.1%",
    note: "Trend-following positions (42% of portfolio) drive strong performance, but mean reversion positions drag. Your portfolio is momentum-heavy.",
  },
  shock: {
    volatility: "31.2%",
    drawdown: "–24.6%",
    note: "Your trend-following exposure exits early, limiting loss. But Buy & Hold positions absorb the full drawdown. Mean reversion positions face false bottoms.",
  },
};

const ModuleFive = () => {
  const [env, setEnv] = useState<EnvToggle>("neutral");
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);

  const strategyMix = [
    { strategy: "Trend Following", pct: 42, color: "bg-primary" },
    { strategy: "Buy & Hold", pct: 30, color: "bg-teal" },
    { strategy: "Mean Reversion", pct: 28, color: "bg-warm" },
  ];

  return (
    <AppLayout>
      <div className="container max-w-4xl py-12 md:py-20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Module 5</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">Module 5 of 6</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Portfolio-Level Thinking</h1>
          <p className="text-muted-foreground max-w-2xl">
            You are not holding 6 stocks. You are holding a volatility profile, a strategy mix, and a risk exposure.
          </p>
        </motion.div>

        {/* Key insight */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-10">
          <p className="font-serif text-lg text-foreground italic">
            "You are not holding 5 stocks. You are holding a volatility profile."
          </p>
          <p className="text-sm text-muted-foreground mt-2">— Shift your perspective from positions to portfolio behavior.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Allocation */}
          <div className="rounded-xl border border-border bg-gradient-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Allocation</h3>
            </div>
            <div className="space-y-2">
              {holdings.map((h) => (
                <div key={h.ticker} className="flex items-center justify-between">
                  <span className="font-mono text-sm text-foreground">{h.ticker}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${h.allocation}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{h.allocation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Mix */}
          <div className="rounded-xl border border-border bg-gradient-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Strategy Mix</h3>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden mb-4">
              {strategyMix.map((s) => (
                <div key={s.strategy} className={`${s.color} h-full`} style={{ width: `${s.pct}%` }} />
              ))}
            </div>
            <div className="space-y-1">
              {strategyMix.map((s) => (
                <div key={s.strategy} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${s.color}`} />
                    <span className="text-muted-foreground">{s.strategy}</span>
                  </div>
                  <span className="text-foreground font-medium">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Volatility */}
          <div className="rounded-xl border border-border bg-gradient-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Volatility Exposure</h3>
            </div>
            <span className="font-serif text-3xl text-foreground">{envImpact[env].volatility}</span>
            <p className="text-xs text-muted-foreground mt-1">Annualized portfolio volatility</p>
          </div>

          {/* Drawdown */}
          <div className="rounded-xl border border-border bg-gradient-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Max Drawdown (Simulated)</h3>
            </div>
            <span className="font-serif text-3xl text-foreground">{envImpact[env].drawdown}</span>
            <p className="text-xs text-muted-foreground mt-1">Worst peak-to-trough decline</p>
          </div>
        </div>

        {/* Environment toggle */}
        <div className="rounded-xl border border-border bg-card p-5 mb-10">
          <p className="text-sm text-muted-foreground mb-3">What happens to your portfolio in different environments?</p>
          <div className="flex gap-2 mb-4">
            {([["neutral", "Normal"], ["trending", "Trending"], ["shock", "Shock / Crisis"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setEnv(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  env === id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <motion.p key={env} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground leading-relaxed">
            {envImpact[env].note}
          </motion.p>
        </div>

        {/* Reflection gate */}
        {!reflectionSubmitted ? (
          <div className="rounded-xl border border-border bg-gradient-card p-6 text-center">
            <p className="text-muted-foreground mb-4">To unlock Module 6, submit your portfolio reflection.</p>
            <button
              onClick={() => setReflectionSubmitted(true)}
              className="rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Submit Reflection & Continue
            </button>
          </div>
        ) : null}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-8 mt-12">
          <Link to="/module/4" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Module 4
          </Link>
          <Link
            to="/module/6"
            className={`group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
              reflectionSubmitted ? "bg-gradient-warm text-primary-foreground" : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
            onClick={(e) => { if (!reflectionSubmitted) e.preventDefault(); }}
          >
            Continue to Module 6 <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ModuleFive;
