import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useUserProgress } from "@/hooks/useUserProgress";

type Strategy = "buyhold" | "trendfollowing" | "meanreversion" | "eventdriven";

const strategyOptions: { id: Strategy; label: string; desc: string }[] = [
  { id: "buyhold", label: "Buy & Hold", desc: "Long-term conviction. Ride through volatility." },
  { id: "trendfollowing", label: "Trend Following", desc: "Follow momentum. Exit when trends break." },
  { id: "meanreversion", label: "Mean Reversion", desc: "Buy dips, sell rallies. Bet on return to average." },
  { id: "eventdriven", label: "Event-Driven", desc: "React to catalysts and structural changes." },
];

interface Position {
  ticker: string;
  name: string;
  allocation: number;
  rationale: string;
}

const availableStocks = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corp." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "JNJ", name: "Johnson & Johnson" },
  { ticker: "XOM", name: "Exxon Mobil" },
  { ticker: "PG", name: "Procter & Gamble" },
  { ticker: "COST", name: "Costco Wholesale" },
];

const rationaleOptions: Record<Strategy, string[]> = {
  buyhold: [
    "Strong long-term fundamentals justify patient holding",
    "Dominant market position with durable competitive advantage",
    "Consistent dividend history supports compounding",
  ],
  trendfollowing: [
    "Strong upward price persistence with clean momentum",
    "Breakout above resistance with increasing volume pattern",
    "Relative strength leader within its sector",
  ],
  meanreversion: [
    "Price significantly below historical mean — reversion expected",
    "Oversold conditions with stabilizing momentum",
    "Deep drawdown creating contrarian entry opportunity",
  ],
  eventdriven: [
    "Upcoming catalyst expected to re-price the stock",
    "Structural shift in industry creates asymmetric opportunity",
    "Management change likely to unlock value",
  ],
};

const ModuleFour = () => {
  const [step, setStep] = useState(0);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedRationale, setSelectedRationale] = useState<string | null>(null);
  const [analysisShown, setAnalysisShown] = useState(false);
  const { markComplete } = useUserProgress();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      markComplete("module_view", "module-4");
      markComplete("knowledge_point", "portfolio-construction", { module: 4 });
    }
  }, [markComplete]);

  const addPosition = () => {
    if (!selectedStock || !selectedRationale || !strategy) return;
    const stock = availableStocks.find(s => s.ticker === selectedStock);
    if (!stock || positions.length >= 8) return;
    setPositions([...positions, {
      ticker: stock.ticker,
      name: stock.name,
      allocation: Math.round(100 / (positions.length + 1)),
      rationale: selectedRationale,
    }]);
    setSelectedStock(null);
    setSelectedRationale(null);
  };

  const consistencyScore = positions.length > 0 ? Math.min(100, 60 + positions.length * 5) : 0;
  const usedTickers = positions.map(p => p.ticker);

  return (
    <AppLayout>
      <div className="container max-w-4xl py-12 md:py-20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Module 4</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">Module 4 of 6</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Strategy-Bound Portfolio Decisions</h1>
          <p className="text-muted-foreground max-w-2xl">
            Every action requires a declared strategy. You cannot invest without first committing to <em>how</em> you are investing.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex gap-2 mb-8">
          {["Choose Strategy", "Build Portfolio", "AI Analysis"].map((label, i) => (
            <button
              key={i}
              onClick={() => { if (i <= step) setStep(i); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === i ? "bg-primary/15 text-primary" : i < step ? "text-teal" : "text-muted-foreground"
              }`}
            >
              {i < step && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 */}
          {step === 0 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-2xl text-foreground mb-6">Declare Your Strategy</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {strategyOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStrategy(s.id)}
                    className={`rounded-xl border p-5 text-left transition-all ${
                      strategy === s.id ? "border-primary/40 bg-primary/5" : "border-border bg-gradient-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <h3 className="font-serif text-base text-foreground mb-1">{s.label}</h3>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </button>
                ))}
              </div>
              {strategy && (
                <button onClick={() => setStep(1)} className="mt-6 rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground">
                  Confirm Strategy & Build Portfolio <ArrowRight className="h-4 w-4 inline ml-1" />
                </button>
              )}
            </motion.div>
          )}

          {/* Step 2 */}
          {step === 1 && strategy && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-2xl text-foreground mb-2">Build Your Portfolio</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Strategy: <span className="text-foreground font-medium">{strategyOptions.find(s => s.id === strategy)?.label}</span> — Select 5–8 positions with rationale.
              </p>

              {/* Current positions */}
              {positions.length > 0 && (
                <div className="space-y-2 mb-6">
                  {positions.map((p, i) => (
                    <div key={i} className="rounded-lg border border-border bg-gradient-card p-4 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm text-foreground">{p.ticker}</span>
                        <span className="text-xs text-muted-foreground ml-2">{p.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic max-w-xs text-right">{p.rationale}</p>
                    </div>
                  ))}
                </div>
              )}

              {positions.length < 8 && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Select stock:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableStocks.filter(s => !usedTickers.includes(s.ticker)).map((s) => (
                        <button
                          key={s.ticker}
                          onClick={() => setSelectedStock(s.ticker)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                            selectedStock === s.ticker ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"
                          }`}
                        >
                          {s.ticker}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedStock && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Why does this fit your {strategyOptions.find(s => s.id === strategy)?.label} strategy?</p>
                      <div className="space-y-2">
                        {rationaleOptions[strategy].map((r, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedRationale(r)}
                            className={`w-full text-left rounded-lg border p-3 text-xs transition-colors ${
                              selectedRationale === r ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedStock && selectedRationale && (
                    <button onClick={addPosition} className="rounded-lg bg-primary/15 text-primary px-4 py-2 text-sm font-medium">
                      Add Position
                    </button>
                  )}
                </div>
              )}

              {positions.length >= 5 && (
                <button onClick={() => { setStep(2); setAnalysisShown(true); }} className="mt-6 rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground">
                  Submit for Analysis <ArrowRight className="h-4 w-4 inline ml-1" />
                </button>
              )}
            </motion.div>
          )}

          {/* Step 3 */}
          {step === 2 && analysisShown && strategy && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-2xl text-foreground mb-6">AI Behavioral Analysis</h2>

              <div className="space-y-4">
                <div className="rounded-xl border border-teal/20 bg-teal/5 p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-teal mb-2">Strategy Consistency</p>
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-3xl text-foreground">{consistencyScore}%</span>
                    <p className="text-sm text-muted-foreground">Your positions are largely consistent with your declared {strategyOptions.find(s => s.id === strategy)?.label} framework.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-gradient-card p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warm shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Concentration Warning</p>
                      <p className="text-sm text-muted-foreground">
                        {positions.length <= 5
                          ? "Your portfolio is concentrated. A single adverse event could disproportionately affect overall exposure."
                          : "Your diversification is reasonable, but ensure you're not creating false diversification by holding correlated positions."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-gradient-card p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground mb-2">Risk Exposure Note</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This is not about whether your portfolio will profit. It's about whether your actions structurally match your declared approach. Consistency is the lesson—not returns.
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between border-t border-border pt-8 mt-12">
                <Link to="/module/3" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Module 3
                </Link>
                <Link to="/module/5" onClick={() => markComplete("module_complete", "module-4")} className="group inline-flex items-center gap-2 rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground">
                  Continue to Module 5 <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}

          {step !== 2 && (
            <div className="flex items-center justify-between border-t border-border pt-8 mt-12">
              <Link to="/module/3" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Module 3
              </Link>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default ModuleFour;
