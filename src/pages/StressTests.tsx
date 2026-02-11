import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronRight, ArrowLeft, AlertTriangle, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

interface Scenario {
  year: string;
  name: string;
  desc: string;
  duration: string;
  peakDrawdown: string;
  narrative: string[];
  summary: {
    failed: string;
    survived: string;
    lesson: string;
  };
}

const scenarios: Scenario[] = [
  {
    year: "2000",
    name: "Dot-Com Bubble",
    desc: "Tech euphoria meets reality",
    duration: "Mar 2000 – Oct 2002",
    peakDrawdown: "–78% (Nasdaq)",
    narrative: [
      "The market is euphoric. Tech stocks have tripled in 18 months. Everyone is a genius.",
      "First cracks appear. A few high-profile IPOs collapse. The broader market ignores the signal.",
      "Selling accelerates. Trend followers exit. Buy & Hold investors rationalize. Mean reversion traders start buying 'cheap' tech.",
      "The crash deepens for two years. Mean reversion entries are devastated. Buy & Hold portfolios lose 50–70%.",
    ],
    summary: {
      failed: "Mean Reversion failed catastrophically — 'cheap' kept getting cheaper for years. Buy & Hold endured severe emotional and financial pain.",
      survived: "Trend Following exited early and preserved capital, though it required conviction to stay out during brief rallies.",
      lesson: "Euphoric environments create the deepest traps for contrarian strategies. The bubble lasted longer than expected, and the crash was deeper.",
    },
  },
  {
    year: "2008",
    name: "Global Financial Crisis",
    desc: "Systemic collapse and contagion",
    duration: "Oct 2007 – Mar 2009",
    peakDrawdown: "–57% (S&P 500)",
    narrative: [
      "Housing market shows stress. Banks reassure investors. Markets dip but recover.",
      "Bear Stearns collapses. Lehman Brothers follows. Panic spreads across all asset classes.",
      "Global contagion. Correlations spike to 1.0 — diversification fails. Every stock falls together.",
      "Governments intervene. Recovery begins slowly, but trust is shattered.",
    ],
    summary: {
      failed: "Buy & Hold absorbed a –57% drawdown. Many investors panic-sold at the bottom. Mean Reversion caught 'falling knives' repeatedly.",
      survived: "Trend Following exited as momentum reversed, but faced whipsaws during government intervention periods.",
      lesson: "Systemic crises break all normal correlations. The only strategy that 'worked' was one that could exit entirely — and stay out.",
    },
  },
  {
    year: "2020",
    name: "COVID Crash",
    desc: "Fastest bear market in history",
    duration: "Feb 2020 – Mar 2020",
    peakDrawdown: "–34% (S&P 500)",
    narrative: [
      "Markets hit all-time highs in February. COVID cases are a distant concern.",
      "Within 23 trading days, the S&P 500 falls 34%. The fastest bear market in history.",
      "Government stimulus is unprecedented. The Fed acts within weeks.",
      "Markets recover to all-time highs by August. The entire crash lasted 5 months.",
    ],
    summary: {
      failed: "Trend Following exited correctly but struggled to re-enter the V-shaped recovery. Many missed the bounce entirely.",
      survived: "Buy & Hold endured terrifying weeks but was fully rewarded. Mean Reversion had a rare window of success — deep drawdown, rapid recovery.",
      lesson: "Speed of crash vs. speed of recovery creates unique challenges. The 'right' strategy depended entirely on time horizon and emotional tolerance.",
    },
  },
  {
    year: "2022",
    name: "Rate-Hike Cycle",
    desc: "Inflation shock and multiple compression",
    duration: "Jan 2022 – Oct 2022",
    peakDrawdown: "–25% (S&P 500)",
    narrative: [
      "Inflation reaches 40-year highs. The Fed signals aggressive rate hikes.",
      "Growth stocks collapse as discount rates rise. The Nasdaq falls further than the S&P.",
      "Bonds offer no refuge — they fall alongside stocks. The traditional 60/40 portfolio fails.",
      "Energy and value stocks outperform. A regime change favors entirely different strategies.",
    ],
    summary: {
      failed: "Buy & Hold in growth stocks suffered badly. The same names that led the 2020 recovery now led the decline. Mean Reversion on tech was premature.",
      survived: "Trend Following in commodities and value stocks worked well. The key was recognizing a regime shift — not just a dip.",
      lesson: "Rate environments change which strategies work. What succeeded in 2020 failed in 2022. Regime awareness is everything.",
    },
  },
];

const StressTests = () => {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [narrativeStep, setNarrativeStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const scenario = activeScenario !== null ? scenarios[activeScenario] : null;

  const enterScenario = (i: number) => {
    setActiveScenario(i);
    setNarrativeStep(0);
    setShowSummary(false);
  };

  const advanceNarrative = () => {
    if (!scenario) return;
    if (narrativeStep < scenario.narrative.length - 1) {
      setNarrativeStep(narrativeStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-12 md:py-20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Stress Tests</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <History className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-3xl text-foreground">Historical Stress Tests</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Enter real market crises with your strategy knowledge. No hints. No new tools. Just your understanding against history.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeScenario === null ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2">
              {scenarios.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => enterScenario(i)}
                  className="rounded-xl border border-border bg-gradient-card p-6 text-left hover:border-muted-foreground/30 transition-all group"
                >
                  <p className="text-3xl font-serif text-primary/60 mb-2">{s.year}</p>
                  <h3 className="font-serif text-lg text-foreground mb-1">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration}</span>
                    <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{s.peakDrawdown}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : scenario && !showSummary ? (
            <motion.div key="narrative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setActiveScenario(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to scenarios
              </button>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-serif text-2xl text-foreground">{scenario.name} ({scenario.year})</h2>
                  <span className="text-xs text-muted-foreground">Phase {narrativeStep + 1} of {scenario.narrative.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">{scenario.duration} · Peak drawdown: {scenario.peakDrawdown}</p>
              </div>

              {/* Narrative phases */}
              <div className="space-y-3 mb-6">
                {scenario.narrative.slice(0, narrativeStep + 1).map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-border bg-gradient-card p-4"
                  >
                    <span className="text-xs font-medium text-muted-foreground mr-2">Phase {i + 1}</span>
                    <p className="text-sm text-foreground leading-relaxed mt-1">{text}</p>
                  </motion.div>
                ))}
              </div>

              <button onClick={advanceNarrative} className="rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground">
                {narrativeStep < scenario.narrative.length - 1 ? "Next Phase →" : "View Stress-Test Summary"}
              </button>
            </motion.div>
          ) : scenario && showSummary ? (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setActiveScenario(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to scenarios
              </button>

              <h2 className="font-serif text-2xl text-foreground mb-6">Stress-Test Summary: {scenario.name}</h2>

              <div className="space-y-4 mb-8">
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-medium text-foreground">What Failed Structurally</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scenario.summary.failed}</p>
                </div>

                <div className="rounded-xl border border-teal/20 bg-teal/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-teal" />
                    <h3 className="text-sm font-medium text-foreground">What Survived (But Required Patience)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scenario.summary.survived}</p>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <h3 className="text-sm font-medium text-foreground mb-2">What This Teaches</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scenario.summary.lesson}</p>
                </div>
              </div>

              {/* Closing message */}
              <div className="rounded-xl border border-border bg-gradient-card p-8 text-center">
                <blockquote className="font-serif text-lg text-foreground italic leading-relaxed">
                  "Failure did not come from stock selection.<br />
                  It came from strategy–environment mismatch."
                </blockquote>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default StressTests;
