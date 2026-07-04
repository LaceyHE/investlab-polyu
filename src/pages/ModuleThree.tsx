import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight, Eye, CheckCircle2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGamification } from "@/contexts/GamificationContext";
import KnowledgeCheck, { type QuizQuestion } from "@/components/KnowledgeCheck";

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

// One-line summary of what each strategy is hunting for.
const lensSummary: Record<StrategyLens, string> = {
  trendfollower: "strong, persistent uptrends it can ride",
  meanreversion: "beaten-down names trading at a deep discount",
  buyhold: "stable, low-volatility quality it can hold for years",
};

// Which stocks are the best fit for the active lens — drives the ★ highlight.
const isTopPick = (stock: StockCard, lens: StrategyLens): boolean => {
  if (lens === "trendfollower") return stock.trend === "Strong" && stock.drawdown !== "Deep Drawdown";
  if (lens === "meanreversion") return stock.drawdown === "Deep Drawdown";
  if (lens === "buyhold") return stock.drawdown === "Stable" && stock.volatility === "Low";
  return false;
};

const quiz: QuizQuestion[] = [
  {
    q: "A stock is tagged 'Deep Drawdown' — far below its usual price. Which lens sees this as the BEST opportunity?",
    options: [
      "Trend Follower — momentum is clearly negative",
      "Mean Reversion — a deep discount likely to snap back",
      "Buy & Hold — drawdowns should always be avoided",
    ],
    correct: 1,
    explanation: "Mean reversion strategies bet that prices swing back toward their average — so a deep drawdown reads as an opportunity, not a warning.",
  },
  {
    q: "A Trend Follower is most attracted to a stock showing…",
    options: [
      "Strong trend strength with clean upward momentum",
      "A deep drawdown far below its historical average",
      "A flat, low-volatility price that barely moves",
    ],
    correct: 0,
    explanation: "Trend followers ride existing momentum — they want confirmation that a move is already underway, not a bet that it will reverse.",
  },
  {
    q: "Why does the very same stock get opposite labels depending on the lens?",
    options: [
      "Because the underlying data is unreliable",
      "Because newer companies are inherently riskier",
      "Because each strategy cares about completely different signals",
    ],
    correct: 2,
    explanation: "The price data is the same for every lens — what differs is which signal each strategy weighs (momentum vs. reversion vs. stability), so the same stock gets read differently.",
  },
];

const ModuleThree = () => {
  const [universe, setUniverse] = useState<Universe>("sp500");
  const [lens, setLens] = useState<StrategyLens>("trendfollower");
  const [viewedLenses, setViewedLenses] = useState<StrategyLens[]>(["trendfollower"]);
  const [quizPassed, setQuizPassed] = useState(false);
  const { markComplete } = useUserProgress();
  const { completeModule, recordConceptLearned } = useGamification();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      markComplete("module_view", "module-3");
      markComplete("knowledge_point", "stock-filtering", { module: 3 });
      recordConceptLearned();
    }
  }, [markComplete, recordConceptLearned]);

  const selectLens = (l: StrategyLens) => {
    setLens(l);
    setViewedLenses((prev) => (prev.includes(l) ? prev : [...prev, l]));
  };

  const stocks = universe === "sp500" ? sp500Stocks : nasdaq100Stocks;
  const allLensesSeen = viewedLenses.length === 3;
  const topPicks = stocks.filter((s) => isTopPick(s, lens));

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
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">View as:</span>
          {(Object.keys(lensLabels) as StrategyLens[]).map((l) => (
            <button
              key={l}
              onClick={() => selectLens(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                lens === l ? "bg-teal/15 text-teal" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lensLabels[l]}
              {viewedLenses.includes(l) && <CheckCircle2 className="h-3 w-3 inline ml-1 text-teal" />}
            </button>
          ))}
        </div>

        {/* Lens insight + next-step guidance */}
        <div className="rounded-xl border border-teal/20 bg-teal/5 p-4 mb-8">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-medium text-teal">{lensLabels[lens]}</span> hunts for {lensSummary[lens]}.
            {topPicks.length > 0 ? (
              <> Cards marked <span className="text-warm font-medium">★ Top pick</span> are its best fits here — <span className="font-medium text-foreground">{topPicks.map((s) => s.ticker).join(", ")}</span>.</>
            ) : (
              <> No stock in this pool is a clean fit for it right now — that itself is a signal.</>
            )}
          </p>
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground border-t border-teal/15 pt-3">
            <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-teal" />
            {!allLensesSeen ? (
              <span>
                <span className="font-medium text-foreground">Next step:</span> switch to the other lenses ({viewedLenses.length}/3 seen) and watch the ★ highlights jump to completely different stocks.
              </span>
            ) : (
              <span>
                <span className="font-medium text-foreground">Nice — you've seen all three lenses.</span> Notice the same stock is a "top pick" for one strategy and a "stay away" for another. Next: scroll down and take the knowledge check to unlock Module 4.
              </span>
            )}
          </div>
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
            {stocks.map((stock, i) => {
              const pick = isTopPick(stock, lens);
              return (
              <motion.div
                key={stock.ticker}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border p-5 transition-all ${
                  pick ? "border-warm/50 bg-warm/5 shadow-md shadow-warm/10" : "border-border bg-gradient-card opacity-80"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-mono text-sm text-foreground font-medium">{stock.ticker}</span>
                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                  </div>
                  {pick && (
                    <span className="flex items-center gap-1 text-xs font-medium text-warm bg-warm/10 px-2 py-0.5 rounded-full shrink-0">
                      <Star className="h-3 w-3 fill-warm" /> Top pick
                    </span>
                  )}
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
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Knowledge Check */}
        <div className="mt-12">
          <KnowledgeCheck
            questions={quiz}
            locked={!allLensesSeen}
            lockedHint={`👆 View all three strategy lenses to see how the same stocks get re-labelled — then the knowledge check unlocks. ${viewedLenses.length}/3 seen.`}
            onResult={({ allAnswered }) => setQuizPassed(allAnswered)}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-8 mt-12">
          <Link to="/module/2" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Module 2
          </Link>
          <Link
            to="/module/4"
            className={`group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
              allLensesSeen && quizPassed ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
            onClick={(e) => { if (!(allLensesSeen && quizPassed)) { e.preventDefault(); } else { (markComplete("module_complete", "module-3"), completeModule("module-3", 5, 5)); } }}
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
