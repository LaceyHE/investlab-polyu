import { motion } from "framer-motion";
import { BookOpen, TrendingUp, TrendingDown, Lightbulb, SlidersHorizontal } from "lucide-react";
import type { StrategyType } from "@/hooks/useStrategyBacktest";

interface StrategyEducationProps {
  strategy: StrategyType;
}

interface StrategyContent {
  explanation: string;
  worksWell: string[];
  struggles: string[];
  adjustments: string[];
  proTip: string;
}

const content: Record<StrategyType, StrategyContent> = {
  allocation: {
    explanation:
      "This strategy splits your money between stocks (SPY) and bonds (AGG). Stocks offer higher growth potential but swing more in value, while bonds are steadier but grow slower. By choosing a mix, you control the balance between growth and stability.",
    worksWell: [
      "Steady markets where both stocks and bonds perform reasonably",
      "Long-term investing where you want predictable, balanced growth",
      "Uncertain times when you're not sure which direction markets will go",
    ],
    struggles: [
      "Sharp market crashes where even bonds may lose value temporarily",
      "Strong bull markets — too many bonds will hold you back from gains",
      "High-inflation periods where bond returns can't keep up",
    ],
    adjustments: [
      "Move the slider right (more stocks) for higher potential returns — but expect bigger ups and downs",
      "Move the slider left (more bonds) for a smoother ride with lower returns",
      "A 60/40 split is a classic starting point — adjust based on how much risk feels comfortable",
    ],
    proTip:
      "There's no perfect allocation — the best mix is one you can stick with when markets get rough.",
  },
  trend: {
    explanation:
      "This strategy watches whether prices are trending up or down by comparing short-term and long-term price averages. When the short-term average crosses above the long-term one, it buys in. When it crosses below, it moves to safety. The idea is to ride trends and avoid big drops.",
    worksWell: [
      "Markets with clear, sustained trends (either up or down)",
      "Major crashes — it often gets you out before the worst of the decline",
      "Volatile periods with distinct directional moves",
    ],
    struggles: [
      "Choppy, sideways markets where prices bounce around without a clear direction",
      "Sudden V-shaped recoveries — it may get you out but re-enter too late",
      "Calm bull markets where it generates unnecessary trades",
    ],
    adjustments: [
      "Faster reaction speed detects trends earlier but may overreact to short-term noise",
      "Slower reaction speed is more stable and avoids false signals, but reacts later to real changes",
      "Start with medium speed and adjust based on whether you see too many trades or too-slow responses",
    ],
    proTip:
      "Trend following works best when you're patient — it won't catch the exact top or bottom, and that's okay.",
  },
  income: {
    explanation:
      "This strategy balances two goals: generating steady income (like dividends from bonds) and growing your money over time (through stocks). More income means more stability; more growth means higher potential returns but a bumpier ride.",
    worksWell: [
      "Retirement or conservative portfolios where steady cash flow matters",
      "Falling interest rate environments where bonds tend to gain value",
      "Markets where stock growth is uncertain and income provides a floor",
    ],
    struggles: [
      "Strong bull markets where growth stocks surge and income assets lag behind",
      "Rising interest rate periods where bond values decline",
      "High-inflation environments where income yields can't keep pace",
    ],
    adjustments: [
      "Slide toward income for a calmer portfolio with more predictable returns",
      "Slide toward growth for higher long-term returns, but prepare for more volatility",
      "A balanced middle position gives you the benefits of both without extreme trade-offs",
    ],
    proTip:
      "Income isn't just about returns — it's about sleeping well at night knowing your portfolio is working steadily.",
  },
  momentum: {
    explanation:
      "This strategy bets on recent winners. It looks at which assets have performed best over a recent period and invests more heavily in them. The logic is simple: assets that have been going up tend to keep going up — at least for a while.",
    worksWell: [
      "Strong trending markets where winners keep winning",
      "Bull markets with clear sector leadership",
      "Periods where one asset class significantly outperforms the other",
    ],
    struggles: [
      "Market reversals where yesterday's winners suddenly become losers",
      "Choppy sideways markets with no clear momentum",
      "Crash recoveries where beaten-down assets bounce back fastest",
    ],
    adjustments: [
      "Short-term lookback (slider left) is more aggressive — it chases recent moves but can whipsaw in volatile markets",
      "Long-term lookback (slider right) is more stable — it follows bigger trends and avoids noise",
      "If you see too many trades and inconsistent results, try a longer lookback period",
    ],
    proTip:
      "Momentum works until it doesn't — always consider what happens when the trend reverses.",
  },
};

const StrategyEducation = ({ strategy }: StrategyEducationProps) => {
  const c = content[strategy];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border bg-card p-5 space-y-5"
    >
      <div className="flex items-center gap-2">
        <BookOpen className="h-4.5 w-4.5 text-primary" />
        <h3 className="font-serif text-lg text-foreground">How This Strategy Works</h3>
      </div>

      {/* Explanation */}
      <p className="text-sm text-muted-foreground leading-relaxed">{c.explanation}</p>

      {/* When it works / struggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-teal/20 bg-teal/5 p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs font-semibold text-teal">Works well in</span>
          </div>
          <ul className="space-y-1.5">
            {c.worksWell.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                <span className="text-teal mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-warm/20 bg-warm/5 p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="h-3.5 w-3.5 text-warm" />
            <span className="text-xs font-semibold text-warm">Struggles in</span>
          </div>
          <ul className="space-y-1.5">
            {c.struggles.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                <span className="text-warm mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* How to adjust */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">How to adjust the slider</span>
        </div>
        <ul className="space-y-1.5">
          {c.adjustments.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
              <span className="text-primary mt-0.5">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Pro tip */}
      <div className="flex items-start gap-2 rounded-lg bg-secondary/60 px-3.5 py-3">
        <Lightbulb className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-foreground font-medium leading-relaxed">
          <span className="text-primary">Pro Tip:</span> {c.proTip}
        </p>
      </div>
    </motion.div>
  );
};

export default StrategyEducation;
