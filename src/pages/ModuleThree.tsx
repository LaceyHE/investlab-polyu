import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ProgressBar from "@/components/ProgressBar";
import { useUserProgress } from "@/hooks/useUserProgress";

type Universe = "sp500" | "nasdaq100";
type StrategyLens = "trendfollower" | "meanreversion" | "buyhold";

interface StockCard {
  ticker: string;
  name: string;
  trend: "Low" | "Medium" | "Strong";
  drawdown: "Stable" | "Pullback" | "Deep Drawdown";
  volatility: "Low" | "Moderate" | "High";
  crowding: "Low" | "Moderate" | "High";
}

const sp500Stocks: StockCard[] = [
  { ticker: "AAPL", name: "Apple Inc.", trend: "Strong", drawdown: "Stable", volatility: "Moderate", crowding: "High" },
  { ticker: "JNJ", name: "Johnson & Johnson", trend: "Low", drawdown: "Stable", volatility: "Low", crowding: "Low" },
  { ticker: "XOM", name: "Exxon Mobil", trend: "Medium", drawdown: "Pullback", volatility: "Moderate", crowding: "Moderate" },
  { ticker: "BA", name: "Boeing Co.", trend: "Low", drawdown: "Deep Drawdown", volatility: "High", crowding: "Low" },
  { ticker: "JPM", name: "JPMorgan Chase", trend: "Strong", drawdown: "Stable", volatility: "Moderate", crowding: "High" },
  { ticker: "PG", name: "Procter & Gamble", trend: "Medium", drawdown: "Stable", volatility: "Low", crowding: "Moderate" },
];

const nasdaq100Stocks: StockCard[] = [
  { ticker: "NVDA", name: "NVIDIA Corp.", trend: "Strong", drawdown: "Pullback", volatility: "High", crowding: "High" },
  { ticker: "MSFT", name: "Microsoft Corp.", trend: "Strong", drawdown: "Stable", volatility: "Moderate", crowding: "High" },
  { ticker: "AMZN", name: "Amazon.com", trend: "Medium", drawdown: "Pullback", volatility: "Moderate", crowding: "High" },
  { ticker: "INTC", name: "Intel Corp.", trend: "Low", drawdown: "Deep Drawdown", volatility: "High", crowding: "Low" },
  { ticker: "COST", name: "Costco Wholesale", trend: "Strong", drawdown: "Stable", volatility: "Low", crowding: "Moderate" },
  { ticker: "GOOG", name: "Alphabet Inc.", trend: "Medium", drawdown: "Stable", volatility: "Moderate", crowding: "High" },
];

const lensInterpretations: Record<StrategyLens, Record<string, string>> = {
  trendfollower: {
    Strong: "Attractive — strong price persistence",
    Medium: "Watchlist — momentum building",
    Low: "Avoid — no clear trend",
    Stable: "Clean entry available",
    Pullback: "Wait for trend resumption",
    "Deep Drawdown": "Stay away — broken trend",
    High: "Accept as cost of momentum",
    Moderate: "Manageable",
    Low_v: "Slow mover — limited upside",
  },
  meanreversion: {
    Strong: "Risky — overextended, poor entry",
    Medium: "Neutral — fair value zone",
    Low: "Potentially attractive if oversold",
    Stable: "No opportunity — no deviation",
    Pullback: "Possible entry if reversal signals",
    "Deep Drawdown": "High opportunity — deep discount",
    High: "Amplifies reversion potential",
    Moderate: "Standard risk",
    Low_v: "Low reversion potential",
  },
  buyhold: {
    Strong: "Positive — quality momentum",
    Medium: "Acceptable — steady growth",
    Low: "Patient hold required",
    Stable: "Ideal — low maintenance",
    Pullback: "Stay the course",
    "Deep Drawdown": "Test of conviction",
    High: "Uncomfortable but irrelevant long-term",
    Moderate: "Expected variance",
    Low_v: "Stable compounder",
  },
};

const lensLabels: Record<StrategyLens, string> = {
  trendfollower: "Trend Follower",
  meanreversion: "Mean Reversion",
  buyhold: "Buy & Hold",
};

const getLensNote = (lens: StrategyLens, label: string, type: "volatility"): string => {
  if (type === "volatility" && label === "Low") return lensInterpretations[lens]["Low_v"];
  return lensInterpretations[lens][label] ?? label;
};

const ModuleThree = () => {
  const [universe, setUniverse] = useState<Universe>("sp500");
  const [lens, setLens] = useState<StrategyLens>("trendfollower");
  const [viewed, setViewed] = useState(false);
  const { markComplete } = useUserProgress();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      markComplete("module_view", "module-3");
      markComplete("knowledge_point", "stock-filtering", { module: 3 });
    }
  }, [markComplete]);

  const stocks = universe === "sp500" ? sp500Stocks : nasdaq100Stocks;

  const badgeColor = (val: string) => {
    if (["Strong", "High", "Deep Drawdown"].includes(val)) return "bg-primary/15 text-primary";
    if (["Medium", "Moderate", "Pullback"].includes(val)) return "bg-warm/15 text-warm";
    return "bg-secondary text-muted-foreground";
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl py-12 md:py-20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Module 3</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">Module 3 of 6</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Entering Real Stock Universes</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore real stock pools with simplified, strategy-relevant labels. No financial statements. No indicators. Only what matters for your strategy.
          </p>
        </motion.div>

        {/* Universe selector */}
        <div className="flex gap-3 mb-6">
          {([["sp500", "S&P 500"], ["nasdaq100", "Nasdaq 100"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setUniverse(id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                universe === id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Strategy lens toggle */}
        <div className="flex items-center gap-2 mb-8">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">View as:</span>
          {(Object.keys(lensLabels) as StrategyLens[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLens(l); setViewed(true); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                lens === l ? "bg-teal/15 text-teal" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lensLabels[l]}
            </button>
          ))}
        </div>

        {/* Stock cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${universe}-${lens}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {stocks.map((stock, i) => (
              <motion.div
                key={stock.ticker}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-gradient-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-mono text-sm text-foreground font-medium">{stock.ticker}</span>
                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {([
                    ["Trend Strength", stock.trend, "trend"],
                    ["Drawdown Status", stock.drawdown, "drawdown"],
                    ["Volatility", stock.volatility, "volatility"],
                    ["Crowding", stock.crowding, "crowding"],
                  ] as const).map(([label, value, type]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor(value)}`}>{value}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/70 italic">
                        {getLensNote(lens, value, type as "volatility")}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-8 mt-12">
          <Link to="/module/2" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Module 2
          </Link>
          <Link
            to="/module/4"
            className={`group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
              viewed ? "bg-gradient-warm text-primary-foreground" : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
            onClick={(e) => { if (!viewed) { e.preventDefault(); } else { markComplete("module_complete", "module-3"); } }}
          >
            Continue to Module 4
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ModuleThree;
