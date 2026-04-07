import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Award, Brain, Target, AlertTriangle, Unlock } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useUserProgress } from "@/hooks/useUserProgress";

const ModuleSix = () => {
  const [reflectionAnswer, setReflectionAnswer] = useState("");
  const [completed, setCompleted] = useState(false);

  return (
    <AppLayout>
      <div className="container max-w-4xl py-12 md:py-20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Module 6</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">Module 6 of 6</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Structured Reflection & Behavioral Summary</h1>
          <p className="text-muted-foreground max-w-2xl">
            Your complete learning summary — what you used, where you struggled, and what it reveals about your thinking.
          </p>
        </motion.div>

        {/* Summary sections */}
        <div className="space-y-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-gradient-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-lg text-foreground">Strategies Most Used</h3>
            </div>
            <div className="space-y-2">
              {[
                { strategy: "Trend Following", usage: "42%", note: "Your dominant framework. You gravitate toward momentum-based reasoning." },
                { strategy: "Buy & Hold", usage: "30%", note: "Used for familiar, large-cap positions. Comfort-driven selections." },
                { strategy: "Mean Reversion", usage: "28%", note: "Applied selectively to drawdown situations. Lower conviction." },
              ].map((s, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <span className="text-sm text-foreground font-medium">{s.strategy}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>
                  </div>
                  <span className="text-sm text-foreground font-mono">{s.usage}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-gradient-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-warm" />
              <h3 className="font-serif text-lg text-foreground">Environments Most Struggled With</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sideways markets caused the most confusion. When trends stalled, you hesitated between strategies — a common pattern. Crisis environments triggered emotional responses, with premature exits or over-aggressive mean reversion entries.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-gradient-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="h-5 w-5 text-teal" />
              <h3 className="font-serif text-lg text-foreground">Emotional Bias Patterns</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Tendency to switch strategies mid-scenario when discomfort rises",
                "Overconfidence in trend-following during extended uptrends",
                "Reluctance to hold through drawdowns despite Buy & Hold declaration",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-gradient-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-lg text-foreground">Overconcentration Tendencies</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You showed a preference for technology and growth names regardless of strategy. True diversification comes from strategy mix, not just sector mix.
            </p>
          </motion.div>
        </div>

        {/* Final reflection */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-10">
          <h3 className="font-serif text-lg text-foreground mb-3">Final Reflection</h3>
          <p className="text-sm text-muted-foreground mb-4">
            "What environment would most challenge your current strategy mix?"
          </p>
          <textarea
            value={reflectionAnswer}
            onChange={(e) => setReflectionAnswer(e.target.value)}
            className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary mb-4"
            placeholder="Take a moment to reflect..."
          />
          <button
            onClick={() => setCompleted(true)}
            disabled={!reflectionAnswer.trim()}
            className="rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Complete Learning Path
          </button>
        </div>

        {completed && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Core realization */}
            <div className="rounded-xl border border-teal/20 bg-teal/5 p-8 text-center mb-8">
              <blockquote className="font-serif text-xl md:text-2xl text-foreground italic leading-relaxed">
                "I didn't fail because I picked the wrong stock.<br />
                I failed because I used the wrong strategy in the wrong environment."
              </blockquote>
            </div>

            {/* Unlock */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/sandbox" className="rounded-xl border border-teal/30 bg-gradient-card p-6 hover:border-teal/50 transition-colors group">
                <div className="flex items-center gap-2 text-teal mb-2">
                  <Unlock className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-[0.15em]">Unlocked</span>
                </div>
                <h3 className="font-serif text-lg text-foreground mb-1">Free Sandbox Portfolio</h3>
                <p className="text-sm text-muted-foreground">Test strategies freely in an open experimentation space.</p>
              </Link>
              <Link to="/stress-tests" className="rounded-xl border border-primary/30 bg-gradient-card p-6 hover:border-primary/50 transition-colors group">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Unlock className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-[0.15em]">Unlocked</span>
                </div>
                <h3 className="font-serif text-lg text-foreground mb-1">Historical Stress Tests</h3>
                <p className="text-sm text-muted-foreground">Face real market crises with your strategy knowledge.</p>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-8 mt-12">
          <Link to="/module/5" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Module 5
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ModuleSix;
