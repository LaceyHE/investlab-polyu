import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, AlertCircle, ChevronRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

type Strategy = "buyhold" | "trendfollowing" | "meanreversion";

const strategyLabels: Record<Strategy, string> = {
  buyhold: "Buy & Hold",
  trendfollowing: "Trend Following",
  meanreversion: "Mean Reversion",
};

const stocks = [
  { ticker: "AAPL", name: "Apple Inc.", trend: "Strong", drawdown: "Stable", volatility: "Moderate" },
  { ticker: "MSFT", name: "Microsoft Corp.", trend: "Strong", drawdown: "Stable", volatility: "Moderate" },
  { ticker: "NVDA", name: "NVIDIA Corp.", trend: "Strong", drawdown: "Pullback", volatility: "High" },
  { ticker: "JPM", name: "JPMorgan Chase", trend: "Medium", drawdown: "Stable", volatility: "Moderate" },
  { ticker: "JNJ", name: "Johnson & Johnson", trend: "Low", drawdown: "Stable", volatility: "Low" },
  { ticker: "XOM", name: "Exxon Mobil", trend: "Medium", drawdown: "Pullback", volatility: "Moderate" },
];

interface Trade {
  ticker: string;
  strategy: Strategy;
  action: "buy" | "sell";
}

const ModuleSandbox = () => {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const executeTrade = (ticker: string, action: "buy" | "sell") => {
    if (!strategy) return;

    const newTrade: Trade = { ticker, strategy, action };
    const newTrades = [...trades, newTrade];
    setTrades(newTrades);

    // Pattern detection
    const newWarnings: string[] = [];
    const strategySwitches = newTrades.filter((t, i) =>
      i > 0 && newTrades[i - 1].strategy !== t.strategy
    );
    if (strategySwitches.length >= 2) {
      newWarnings.push("You are frequently switching strategies mid-session. This may indicate framework confusion.");
    }

    const stock = stocks.find(s => s.ticker === ticker);
    if (strategy === "trendfollowing" && stock?.trend === "Low") {
      newWarnings.push(`Using Trend Following on ${ticker} (Low trend) — potential mismatch.`);
    }
    if (strategy === "meanreversion" && stock?.trend === "Strong") {
      newWarnings.push(`Using Mean Reversion on ${ticker} (Strong trend) — risky counter-trend position.`);
    }

    setWarnings(newWarnings);
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl py-12 md:py-20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Sandbox</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/15 text-teal">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-foreground">Free Sandbox Portfolio</h1>
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-teal">Experiment Mode</span>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Test strategies freely. All constraints remain active — every action must be strategy-bound. The AI monitors for pattern misuse.
          </p>
        </motion.div>

        {/* Strategy selector */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4" /> Declare your active strategy:
          </p>
          <div className="flex gap-2">
            {(Object.keys(strategyLabels) as Strategy[]).map((s) => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  strategy === s ? "border-teal bg-teal/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {strategyLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* AI Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2 mb-6">
            {warnings.map((w, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-lg border border-warm/30 bg-warm/5 p-4 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-warm shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{w}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stock grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock) => (
            <div key={stock.ticker} className="rounded-xl border border-border bg-gradient-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-mono text-sm text-foreground font-medium">{stock.ticker}</span>
                  <p className="text-xs text-muted-foreground">{stock.name}</p>
                </div>
              </div>
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Trend</span>
                  <span className="text-foreground">{stock.trend}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Drawdown</span>
                  <span className="text-foreground">{stock.drawdown}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Volatility</span>
                  <span className="text-foreground">{stock.volatility}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!strategy}
                  onClick={() => executeTrade(stock.ticker, "buy")}
                  className="flex-1 rounded-lg bg-teal/15 text-teal text-xs font-medium py-2 disabled:opacity-30 hover:bg-teal/25 transition-colors"
                >
                  Buy
                </button>
                <button
                  disabled={!strategy}
                  onClick={() => executeTrade(stock.ticker, "sell")}
                  className="flex-1 rounded-lg bg-primary/15 text-primary text-xs font-medium py-2 disabled:opacity-30 hover:bg-primary/25 transition-colors"
                >
                  Sell
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trade log */}
        {trades.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-gradient-card p-5">
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground mb-3">Trade Log</h3>
            <div className="space-y-1">
              {trades.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${t.action === "buy" ? "bg-teal/15 text-teal" : "bg-primary/15 text-primary"}`}>
                      {t.action.toUpperCase()}
                    </span>
                    <span className="font-mono text-foreground">{t.ticker}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{strategyLabels[t.strategy]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!strategy && (
          <div className="mt-6 rounded-lg bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
            Declare a strategy above to begin trading.
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ModuleSandbox;
