import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  ChevronRight,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Zap,
  Target,
  Scale,
  Crosshair,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────
type InvestmentStyle =
  | "growth"
  | "momentum"
  | "defensive"
  | "balanced"
  | "opportunistic";

interface StockData {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  dailyChange: number;
  return20d: number;
  volatility: "Low" | "Medium" | "High";
  trend: "Up" | "Flat" | "Down";
  history: number[]; // 90 data points
  ma50: number[];
}

interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
  allocation: number; // percentage
}

interface TradeEntry {
  week: number;
  ticker: string;
  action: "buy" | "sell";
  price: number;
  allocation: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const generateHistory = (base: number, vol: number): number[] => {
  const pts: number[] = [base * (0.85 + Math.random() * 0.1)];
  for (let i = 1; i < 90; i++) {
    const drift = 0.0005;
    const shock = (Math.random() - 0.48) * vol;
    pts.push(Math.max(pts[i - 1] * (1 + drift + shock), base * 0.5));
  }
  return pts;
};

const computeMA = (data: number[], period: number): number[] =>
  data.map((_, i) => {
    if (i < period - 1) return data[i];
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });

const fmt = (n: number) => n.toFixed(2);
const fmtPct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";

const styleConfig: Record<
  InvestmentStyle,
  { label: string; icon: React.ReactNode; accent: string; hint: string }
> = {
  growth: {
    label: "Long-Term Growth",
    icon: <TrendingUp className="h-4 w-4" />,
    accent: "hsl(var(--teal))",
    hint: "Focus on strong uptrends and compounding over time.",
  },
  momentum: {
    label: "Momentum",
    icon: <Zap className="h-4 w-4" />,
    accent: "hsl(var(--warm))",
    hint: "Ride price persistence — follow the trend.",
  },
  defensive: {
    label: "Defensive",
    icon: <ShieldCheck className="h-4 w-4" />,
    accent: "hsl(152 55% 42%)",
    hint: "Prioritise low volatility and capital preservation.",
  },
  balanced: {
    label: "Balanced",
    icon: <Scale className="h-4 w-4" />,
    accent: "hsl(var(--primary))",
    hint: "Diversify across risk levels for stability.",
  },
  opportunistic: {
    label: "Opportunistic",
    icon: <Crosshair className="h-4 w-4" />,
    accent: "hsl(280 60% 55%)",
    hint: "Look for dislocations and deep pullbacks.",
  },
};

const moods = ["Risk-On", "Risk-Off", "Cautious", "Euphoric", "Neutral"] as const;
const weeklySummaries = [
  ["Tech rallied strongly", "Energy weakened", "Volatility slightly increased"],
  ["Broad market recovery", "Small caps outperformed", "Credit spreads tightened"],
  ["Sector rotation into defensives", "Growth stocks pulled back", "VIX spiked briefly"],
  ["Momentum continued in megacaps", "Financials flat", "Commodities dipped"],
  ["Mixed signals across sectors", "Healthcare gained", "Volatility declined"],
];

// ── Initial Stocks ─────────────────────────────────────────────────────────
const createInitialStocks = (): StockData[] => {
  const raw = [
    { ticker: "AAPL", name: "Apple Inc.", sector: "Tech", base: 189, vol: 0.018 },
    { ticker: "MSFT", name: "Microsoft", sector: "Tech", base: 415, vol: 0.015 },
    { ticker: "NVDA", name: "NVIDIA", sector: "Tech", base: 875, vol: 0.035 },
    { ticker: "JPM", name: "JPMorgan", sector: "Finance", base: 198, vol: 0.014 },
    { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", base: 156, vol: 0.008 },
    { ticker: "XOM", name: "Exxon Mobil", sector: "Energy", base: 105, vol: 0.02 },
    { ticker: "AMZN", name: "Amazon", sector: "Tech", base: 185, vol: 0.022 },
    { ticker: "PG", name: "Procter & Gamble", sector: "Consumer", base: 162, vol: 0.007 },
  ];

  return raw.map((s) => {
    const history = generateHistory(s.base, s.vol);
    const price = history[history.length - 1];
    const prev = history[history.length - 2];
    const d20 = history[history.length - 21] ?? history[0];
    const volLevel: StockData["volatility"] =
      s.vol < 0.012 ? "Low" : s.vol < 0.025 ? "Medium" : "High";
    const trendSlope =
      (history[history.length - 1] - history[history.length - 20]) /
      history[history.length - 20];
    const trend: StockData["trend"] =
      trendSlope > 0.02 ? "Up" : trendSlope < -0.02 ? "Down" : "Flat";

    return {
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      price,
      dailyChange: ((price - prev) / prev) * 100,
      return20d: ((price - d20) / d20) * 100,
      volatility: volLevel,
      trend,
      history,
      ma50: computeMA(history, 50),
    };
  });
};

// ── Component ──────────────────────────────────────────────────────────────
const ModuleSandbox = () => {
  const [stocks, setStocks] = useState<StockData[]>(createInitialStocks);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [style, setStyle] = useState<InvestmentStyle>("balanced");
  const [week, setWeek] = useState(1);
  const [marketMood, setMarketMood] = useState<string>("Risk-On");
  const [weeklySummary, setWeeklySummary] = useState<string[] | null>(null);
  const [flashTicker, setFlashTicker] = useState<string | null>(null);
  const [navHistory, setNavHistory] = useState<number[]>([10000]);

  const INITIAL_CASH = 10000;

  // Compute NAV
  const nav = useMemo(() => {
    const invested = positions.reduce((sum, p) => {
      const stock = stocks.find((s) => s.ticker === p.ticker);
      return sum + (stock ? stock.price * p.shares : 0);
    }, 0);
    const allocatedPct = positions.reduce((s, p) => s + p.allocation, 0);
    const cashPct = 100 - allocatedPct;
    const cashValue = (cashPct / 100) * INITIAL_CASH;
    return invested + cashValue;
  }, [positions, stocks]);

  const totalReturn = ((nav - INITIAL_CASH) / INITIAL_CASH) * 100;
  const dailyChange = useMemo(() => {
    if (navHistory.length < 2) return 0;
    const prev = navHistory[navHistory.length - 1];
    return prev ? ((nav - prev) / prev) * 100 : 0;
  }, [nav, navHistory]);

  // Risk level 0-100
  const riskLevel = useMemo(() => {
    const totalAlloc = positions.reduce((s, p) => s + p.allocation, 0);
    const highVolCount = positions.filter((p) => {
      const st = stocks.find((s) => s.ticker === p.ticker);
      return st?.volatility === "High";
    }).length;
    return Math.min(
      100,
      totalAlloc * 0.6 + highVolCount * 15
    );
  }, [positions, stocks]);

  const riskLabel =
    riskLevel < 25
      ? "Low"
      : riskLevel < 50
      ? "Medium"
      : riskLevel < 75
      ? "High"
      : "Very High";

  // ── Trade ──
  const executeTrade = useCallback(
    (ticker: string, action: "buy" | "sell") => {
      const stock = stocks.find((s) => s.ticker === ticker);
      if (!stock) return;

      setFlashTicker(ticker);
      setTimeout(() => setFlashTicker(null), 1200);

      if (action === "buy") {
        const existing = positions.find((p) => p.ticker === ticker);
        const totalAlloc = positions.reduce((s, p) => s + p.allocation, 0);
        if (totalAlloc >= 100) return;
        const addAlloc = 10;

        if (existing) {
          setPositions((prev) =>
            prev.map((p) =>
              p.ticker === ticker
                ? {
                    ...p,
                    shares: p.shares + (addAlloc / 100) * INITIAL_CASH / stock.price,
                    avgCost:
                      (p.avgCost * p.shares +
                        stock.price *
                          ((addAlloc / 100) * INITIAL_CASH / stock.price)) /
                      (p.shares + (addAlloc / 100) * INITIAL_CASH / stock.price),
                    allocation: p.allocation + addAlloc,
                  }
                : p
            )
          );
        } else {
          const shares = (addAlloc / 100) * INITIAL_CASH / stock.price;
          setPositions((prev) => [
            ...prev,
            { ticker, shares, avgCost: stock.price, allocation: addAlloc },
          ]);
        }

        setTrades((prev) => [
          { week, ticker, action: "buy", price: stock.price, allocation: 10 },
          ...prev,
        ]);
      } else {
        // sell
        const existing = positions.find((p) => p.ticker === ticker);
        if (!existing) return;
        if (existing.allocation <= 10) {
          setPositions((prev) => prev.filter((p) => p.ticker !== ticker));
        } else {
          setPositions((prev) =>
            prev.map((p) =>
              p.ticker === ticker
                ? {
                    ...p,
                    shares: p.shares - (10 / 100) * INITIAL_CASH / stock.price,
                    allocation: p.allocation - 10,
                  }
                : p
            )
          );
        }
        setTrades((prev) => [
          { week, ticker, action: "sell", price: stock.price, allocation: 10 },
          ...prev,
        ]);
      }
    },
    [stocks, positions, week]
  );

  // ── Next Week ──
  const advanceWeek = useCallback(() => {
    setNavHistory((prev) => [...prev, nav]);

    setStocks((prev) =>
      prev.map((stock) => {
        const moodFactor =
          marketMood === "Risk-On"
            ? 0.002
            : marketMood === "Risk-Off"
            ? -0.003
            : marketMood === "Euphoric"
            ? 0.004
            : marketMood === "Cautious"
            ? -0.001
            : 0;

        const newPts: number[] = [];
        let last = stock.history[stock.history.length - 1];
        for (let d = 0; d < 5; d++) {
          const vol =
            stock.volatility === "High"
              ? 0.03
              : stock.volatility === "Medium"
              ? 0.015
              : 0.008;
          last = last * (1 + moodFactor + (Math.random() - 0.48) * vol);
          newPts.push(last);
        }
        const history = [...stock.history.slice(5), ...newPts];
        const price = history[history.length - 1];
        const prev = history[history.length - 2];
        const d20 = history[history.length - 21] ?? history[0];
        const trendSlope =
          (history[history.length - 1] - history[history.length - 20]) /
          history[history.length - 20];
        const trend: StockData["trend"] =
          trendSlope > 0.02 ? "Up" : trendSlope < -0.02 ? "Down" : "Flat";

        return {
          ...stock,
          history,
          ma50: computeMA(history, 50),
          price,
          dailyChange: ((price - prev) / prev) * 100,
          return20d: ((price - d20) / d20) * 100,
          trend,
        };
      })
    );

    setWeek((w) => w + 1);
    setMarketMood(moods[Math.floor(Math.random() * moods.length)]);
    setWeeklySummary(
      weeklySummaries[Math.floor(Math.random() * weeklySummaries.length)]
    );
    setTimeout(() => setWeeklySummary(null), 5000);
  }, [nav, marketMood]);

  // ── Style hint for current view ──
  const currentStyleHint = useMemo(() => {
    const cfg = styleConfig[style];
    return cfg.hint;
  }, [style]);

  const totalAlloc = positions.reduce((s, p) => s + p.allocation, 0);

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8 md:py-14">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            to="/learning-path"
            className="hover:text-foreground transition-colors"
          >
            Learning Path
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Sandbox</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary">
              <FlaskConical className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-foreground">
                Sandbox Portfolio
              </h1>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Experiment Mode · Week {week}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Portfolio Overview ────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {/* NAV */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Portfolio Value
            </p>
            <motion.p
              key={nav.toFixed(0)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-2xl font-bold text-foreground"
            >
              ${fmt(nav)}
            </motion.p>
          </div>
          {/* Total Return */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Total Return
            </p>
            <motion.p
              key={totalReturn.toFixed(2)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-mono text-2xl font-bold ${
                totalReturn >= 0 ? "text-teal" : "text-destructive"
              }`}
            >
              {fmtPct(totalReturn)}
            </motion.p>
          </div>
          {/* Risk Level */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Risk Level
            </p>
            <p className="text-sm font-medium text-foreground mb-2">{riskLabel}</p>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    riskLevel < 40
                      ? "hsl(var(--teal))"
                      : riskLevel < 70
                      ? "hsl(var(--warm))"
                      : "hsl(var(--destructive))",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${riskLevel}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
          </div>
          {/* Market Mood */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Market Mood
            </p>
            <motion.p
              key={marketMood}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`font-mono text-lg font-bold ${
                marketMood === "Risk-On" || marketMood === "Euphoric"
                  ? "text-teal"
                  : marketMood === "Risk-Off"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {marketMood}
            </motion.p>
          </div>
        </div>

        {/* Weekly Summary Banner */}
        <AnimatePresence>
          {weeklySummary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-xl border border-border bg-secondary p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Week {week} Summary
              </p>
              <ul className="space-y-1">
                {weeklySummary.map((line, i) => (
                  <li key={i} className="text-sm text-foreground flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-foreground" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Investment Style Selector ──────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Investment Style
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {(Object.keys(styleConfig) as InvestmentStyle[]).map((s) => {
              const cfg = styleConfig[s];
              const active = style === s;
              return (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {cfg.icon}
                  {cfg.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground italic">
            {currentStyleHint}
          </p>
        </div>

        {/* ── Next Week Button ──────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={advanceWeek}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-foreground bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Play className="h-4 w-4" />
            Next Week
          </button>
          <span className="text-sm text-muted-foreground">
            Advance simulation by one trading week
          </span>
        </div>

        {/* ── Stock Cards ──────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stocks.map((stock) => {
            const pos = positions.find((p) => p.ticker === stock.ticker);
            const isFlash = flashTicker === stock.ticker;
            const chartData = stock.history.map((price, i) => ({
              price,
              ma: stock.ma50[i],
            }));

            return (
              <motion.div
                key={stock.ticker}
                layout
                animate={
                  isFlash
                    ? { scale: [1, 1.02, 1], borderColor: "hsl(var(--teal))" }
                    : { scale: 1 }
                }
                transition={{ duration: 0.4 }}
                className={`rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm ${
                  pos ? "border-foreground" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {stock.ticker}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {stock.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium text-foreground">
                      ${fmt(stock.price)}
                    </p>
                    <p
                      className={`font-mono text-xs ${
                        stock.dailyChange >= 0
                          ? "text-teal"
                          : "text-destructive"
                      }`}
                    >
                      {fmtPct(stock.dailyChange)}
                    </p>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-16 w-full my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <YAxis domain={["auto", "auto"]} hide />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="ma"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-1 text-[11px] mb-3">
                  <div>
                    <span className="text-muted-foreground block">20D</span>
                    <span
                      className={`font-mono font-medium ${
                        stock.return20d >= 0
                          ? "text-teal"
                          : "text-destructive"
                      }`}
                    >
                      {fmtPct(stock.return20d)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Vol</span>
                    <span className="font-medium text-foreground">
                      {stock.volatility}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Trend</span>
                    <span className="flex items-center gap-0.5 font-medium text-foreground">
                      {stock.trend === "Up" ? (
                        <TrendingUp className="h-3 w-3 text-teal" />
                      ) : stock.trend === "Down" ? (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      ) : (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                      )}
                      {stock.trend}
                    </span>
                  </div>
                </div>

                {/* Position badge */}
                <AnimatePresence>
                  {pos && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-2 rounded-lg bg-secondary px-3 py-1.5 text-xs text-foreground font-medium text-center"
                    >
                      You hold {pos.allocation}% in {stock.ticker}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buy / Sell */}
                <div className="flex gap-2">
                  <button
                    onClick={() => executeTrade(stock.ticker, "buy")}
                    disabled={totalAlloc >= 100}
                    className="flex-1 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => executeTrade(stock.ticker, "sell")}
                    disabled={!pos}
                    className="flex-1 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                  >
                    Sell
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Trade Log ───────────────────────────────────────────── */}
        {trades.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Trade Log
            </h3>
            <div className="space-y-0">
              {trades.slice(0, 15).map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono w-10">
                      W{t.week}
                    </span>
                    <span
                      className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        t.action === "buy"
                          ? "border-teal text-teal"
                          : "border-destructive text-destructive"
                      }`}
                    >
                      {t.action}
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {t.ticker}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>${fmt(t.price)}</span>
                    <span>{t.allocation}% alloc</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {positions.length === 0 && trades.length === 0 && (
          <div className="rounded-xl border border-border bg-secondary p-8 text-center">
            <Target className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Choose your investment style and start building your portfolio.
              <br />
              Click <strong>Buy</strong> on any stock to allocate 10%.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ModuleSandbox;
