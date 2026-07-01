import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, TrendingUp, TrendingDown, Lightbulb, SlidersHorizontal, AlertCircle, GraduationCap, ChevronDown } from "lucide-react";
import type { StrategyType } from "@/hooks/useStrategyBacktest";

interface StrategyEducationProps {
  strategy: StrategyType;
}

interface ConclusionPoint {
  label: string;
  text: string;
}

interface StrategyContent {
  summary: string;        // one sentence shown by default
  quickTip: string;       // one-line slider hint shown by default
  explanation: string;
  worksWell: string[];
  struggles: string[];
  adjustments: string[];
  proTip: string;
  mechanismNote?: string;
  conclusion?: ConclusionPoint[];
}

export const strategyContent: Record<StrategyType, StrategyContent> = {
  allocation: {
    summary: "Split your money between stocks and bonds — more stocks means higher potential returns but bigger swings.",
    quickTip: "Slide right for more growth, left for more stability. Watch how Max Drawdown changes as you adjust.",
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
    summary: "Follow the market's direction — buy when prices trend up, move to cash when they trend down.",
    quickTip: "Slow = fewer, more reliable signals. Fast = reacts quickly but may trigger on short-term noise. Watch the MA panel below the chart.",
    explanation:
      "This strategy uses two moving averages (MAs) — a short-term and a long-term — to detect market direction. The short-term MA tracks recent prices closely; the long-term MA reflects the bigger trend. When the short MA crosses above the long MA, it signals upward momentum: the strategy buys in 100%. When the short MA falls below the long MA, it signals a downturn: the strategy sells everything and holds cash until the next buy signal.",
    worksWell: [
      "Markets with clear, sustained trends (e.g. a multi-month bull run or a prolonged bear market)",
      "Major crashes — the sell signal often triggers before the worst of the decline, protecting your capital",
      "Volatile periods with strong directional moves, where staying invested would cause large drawdowns",
    ],
    struggles: [
      "Choppy, sideways markets — prices cross the MA repeatedly, triggering false buy/sell signals and eating into returns",
      "Sudden V-shaped recoveries — the strategy may exit on a dip and miss the fast rebound",
      "Strong, uninterrupted bull markets — cash periods mean you miss gains the buy-and-hold investor keeps",
    ],
    adjustments: [
      "Slow (MA 50/200): Classic 'Golden Cross / Death Cross'. Fewer signals, less noise — but reacts slowly. Best for patient, long-term investors",
      "Medium (MA 20/60): A balance between responsiveness and stability. Good starting point for most scenarios",
      "Fast (MA 10/30): Reacts quickly to price changes — catches short-term trends but triggers more trades and more false signals",
    ],
    mechanismNote:
      "Why can't the slider make the portfolio match the benchmark? The benchmark (SPY) is 100% invested every single day. This strategy holds cash whenever the short MA is below the long MA — those cash periods earn 0%, while SPY keeps compounding. The long MA also needs ~200 trading days of data before the first signal fires, so the strategy starts in cash for nearly a year. Trend following can only outperform buy-and-hold when it avoids a significant market crash — in rising markets, the cash periods will always cause it to lag.",
    proTip:
      "Trend following is not about maximising returns — it's about avoiding catastrophic losses. The goal is to stay out of the worst drawdowns, even if it means missing some of the upside.",
    conclusion: [
      {
        label: "Short MA vs Long MA",
        text: "The short MA (e.g. 50-day) tracks recent price momentum and reacts quickly. The long MA (e.g. 200-day) smooths out noise and reflects the bigger trend. The gap between them tells you whether the market is accelerating or slowing down.",
      },
      {
        label: "Golden Cross & Death Cross",
        text: "When the short MA crosses above the long MA, it's called a Golden Cross — a classic buy signal. When it crosses below, it's a Death Cross — a sell signal. These are some of the most widely watched signals in financial markets.",
      },
      {
        label: "Best market environment",
        text: "Trend following works best in markets with strong, sustained directional moves — like a prolonged bull run or a deep bear market. It struggles in choppy, sideways markets where prices oscillate without committing to a direction.",
      },
      {
        label: "Slow vs Fast: the core trade-off",
        text: "A slow MA (50/200) generates fewer signals and filters out noise, but reacts late — you may miss the first 10–20% of a move. A fast MA (10/30) catches moves earlier but fires many false signals in volatile markets, leading to unnecessary trades that eat into returns.",
      },
      {
        label: "The structural limitation",
        text: "In a steady bull market, trend following will almost always underperform buy-and-hold — cash periods are a drag on returns. Its edge only appears when it successfully sidesteps a major crash. This is why it's valued as a risk management tool, not a return maximiser.",
      },
    ],
  },
  income: {
    summary: "Mix growth stocks (SPY) with high-dividend stocks (DVY) — earn steady cash income while your portfolio still grows.",
    quickTip: "Slide right for more dividends and stability. Slide left for more growth. Compare the chart's green vs orange lines to see the power of reinvesting dividends.",
    explanation:
      "This strategy mixes two types of equity: growth stocks (SPY — broad market) and high-dividend stocks (DVY — companies that pay large, regular dividends). Unlike the 60/40 strategy which uses bonds to reduce risk, Income Machine stays fully in stocks but shifts between those that grow fast and those that pay you while you hold. The key idea: dividends reinvested over time compound like interest — your shares generate cash, that cash buys more shares, which generate more cash.",
    worksWell: [
      "Stable or slowly rising markets where dividends accumulate steadily without large price swings",
      "Periods when growth stocks are expensive or uncertain — high-dividend companies tend to be more defensive",
      "Long investment horizons where dividend compounding has time to build momentum",
    ],
    struggles: [
      "Strong tech-led bull markets — high-dividend stocks (utilities, consumer staples) typically lag behind growth stocks",
      "Rising interest rate environments — higher rates make dividend yields less attractive relative to bonds",
      "Short time horizons — reinvestment compounding needs years to show a meaningful gap",
    ],
    adjustments: [
      "Slide toward Income (DVY) for more cash flow and lower volatility — better for conservative investors or those needing regular income",
      "Slide toward Growth (SPY) for higher long-term appreciation but less dividend income — better for younger investors with time on their side",
      "The middle is where both effects coexist: moderate dividends plus reasonable growth exposure",
    ],
    mechanismNote:
      "How does reinvestment show up in the chart? The green strategy line uses adjclose prices, which already embed dividend reinvestment — each dividend payment is assumed to immediately buy more shares. The orange dashed line shows the same portfolio but dividends are taken as cash and not reinvested. The gap between these two lines is the compounding effect of reinvestment. The grey dashed benchmark is SPY price return only (no dividends at all) — the lowest of the three, showing the full cost of ignoring income.",
    proTip:
      "The real power of income investing isn't the dividend itself — it's reinvesting it. A 3.5% yield sounds modest, but compounded over 10–20 years it can add tens of thousands to a portfolio.",
    conclusion: [
      {
        label: "Income Machine vs 60/40 Classic — what's the difference?",
        text: "60/40 uses bonds (AGG) to offset stock risk — it's about asset class diversification. Income Machine uses high-dividend stocks (DVY) instead of bonds — it's still all-equity, but tilted toward companies that share profits regularly. The risk profile is different: 60/40 gets the bond buffer in crashes; Income Machine gets the dividend cash flow but stays more exposed to equity downturns.",
      },
      {
        label: "What dividend reinvestment actually does",
        text: "Every quarter, DVY pays a dividend per share. If you reinvest it, you buy fractional shares — next quarter, those extra shares also earn dividends. Over time this compounds. The chart's orange vs green gap shows you exactly how much this compounding adds. In a 2-year window the gap is small; over 10+ years it becomes dramatic.",
      },
      {
        label: "Best environment: stable, slow-growth markets",
        text: "Income Machine shines when markets are range-bound or mildly positive. Dividend yields of 3–4% become very attractive when capital gains are hard to come by. In a raging bull market (like 2023–2024), pure growth strategies will almost always win on total return — but Income Machine offers a smoother, more predictable ride.",
      },
      {
        label: "Worst environment: tech bull markets and rising rates",
        text: "In 2023–2024 (Recovery period), QQQ returned ~96% while DVY returned only ~17%. High-dividend companies (utilities, consumer staples, financials) are often 'boring' — they don't benefit much from AI booms or rapid growth cycles. Rising interest rates also compress dividend stock valuations, since bonds start offering comparable yields with less risk.",
      },
      {
        label: "Key takeaway",
        text: "Income investing is a long-term strategy. Its edge isn't beating the market in any single year — it's generating reliable cash flow that compounds over decades. It suits investors who want their portfolio to 'pay them' while they wait, rather than betting entirely on price appreciation.",
      },
    ],
  },
  momentum: {
    summary: "Every month, rotate 100% into whichever of 4 assets — stocks, tech, bonds, gold — has risen the most recently.",
    quickTip: "Short lookback = reacts fast, more switches. Long lookback = more stable. Try the Bear period (2021–2023) with a 4-month lookback to see the defensive cash feature in action.",
    explanation:
      "Each month, this strategy measures the recent performance of four very different assets — stocks (SPY), tech stocks (QQQ), bonds (AGG), and gold (GLD) — and puts everything into whichever one has risen the most over the lookback period. If all four have fallen, it steps entirely into cash and earns the risk-free rate until one recovers. The core idea: money flows toward whatever is working right now, and away from whatever isn't.",
    worksWell: [
      "Trending markets with clear leadership — e.g. tech dominance in 2020–2021, or gold outperforming during inflation spikes",
      "Bear markets with a defensive cash filter — when everything falls together, moving to cash and earning risk-free rate beats staying invested",
      "Longer lookback periods (3–6 months) in volatile environments — stable signals avoid costly whipsawing",
    ],
    struggles: [
      "Choppy, sideways markets where the leading asset changes every few weeks — the strategy keeps switching and pays the price",
      "Sudden V-shaped recoveries — the strategy may sell into a dip and miss the fast rebound",
      "Steady bull markets where simply holding SPY or QQQ never gets beaten — active rotation adds complexity without reward",
    ],
    adjustments: [
      "1–2 month lookback (slider left): reacts quickly, catches short bursts of momentum — but generates more switches and false signals",
      "4–6 month lookback (slider right): smoother, more stable signals — better at identifying genuine sustained trends and triggering the defensive cash filter at the right time",
      "Try Bear period (2021–2023) with a 4–5 month lookback — this is where the strategy shines most visibly",
    ],
    mechanismNote:
      "Why does a longer lookback sometimes outperform a shorter one in bear markets? A 1-month lookback sees too much noise — an asset that bounced for three weeks looks like the leader, but reverses the next month. A 4–6 month lookback filters that noise and identifies assets with genuine sustained momentum. More importantly, the defensive cash trigger is more reliable: when a 4-month trend turns negative, it's a real signal — not just a bad week. In 2022, with the Fed raising rates aggressively, all 4 assets had sustained negative 4-month momentum, the strategy moved to cash earning ~4% annual risk-free rate, while the equal-weight benchmark kept losing ground in AGG (-14%) and QQQ (-13%).",
    proTip:
      "The benchmark here is equal-weight buy-and-hold of all 4 assets — not SPY. The real question is: does actively rotating beat passively holding everything? Try different periods and lookbacks to find out.",
    conclusion: [
      {
        label: "Why 4 assets? What each one represents",
        text: "SPY covers broad US equities (the 'default' growth engine). QQQ focuses on high-growth tech. AGG represents the bond market — tends to rise when rates fall and investors seek safety. GLD (gold) is an inflation and crisis hedge — often rallies when stocks and bonds both struggle. These four cover very different economic environments, which is what makes rotation between them meaningful.",
      },
      {
        label: "The defensive cash mechanism — Speed Racer's hidden advantage",
        text: "Most momentum strategies stay invested at all times. Speed Racer's absolute momentum filter is different: if the best available asset still has negative momentum (i.e. everything is falling), the strategy moves to cash entirely. This matters most in environments like 2022 — when stocks, bonds, and gold all fell simultaneously. Passive strategies were stuck losing ground; Speed Racer stepped aside and earned the risk-free rate (which hit 5%+ in 2022–2023).",
      },
      {
        label: "Best scenario: sustained bear markets with rising rates",
        text: "The strategy's biggest edge appears when markets trend clearly downward over multiple months — especially when short-term rates are high (cash pays well). In the Bear period (2021–2023), a 4–6 month lookback could significantly outperform the equal-weight benchmark by avoiding prolonged drawdowns in AGG and QQQ. Try the Bear period with a 4-month lookback and watch the Holdings Timeline — you'll likely see extended grey (cash) segments during the worst of 2022.",
      },
      {
        label: "Worst scenario: steady bull markets",
        text: "In the Bull period (2019–2021) or Recovery (2023–2025), the strategy struggles to beat the equal-weight benchmark. When every asset is rising, rotating between them adds friction — you might switch from SPY to QQQ just as QQQ pauses, or miss a multi-month SPY run. The defensive cash filter also fires less often, so that advantage disappears. In bull markets, doing less — just holding everything — often wins.",
      },
      {
        label: "Speed Racer vs Trend Follower — what's the difference?",
        text: "Both are trend-based strategies that move to cash when conditions deteriorate. The key difference: Trend Follower tracks a single asset (SPY) using moving average crossovers — it's in or out of one thing. Speed Racer rotates across four assets and picks the current winner. In a bull market, Trend Follower's weakness is cash drag; Speed Racer's weakness is noisy rotation. In a bear market, both can outperform buy-and-hold — but Speed Racer has more tools (4 assets + cash), while Trend Follower's signal is simpler and more transparent.",
      },
      {
        label: "How to read the Holdings Timeline",
        text: "Blue = SPY, teal = QQQ, green = AGG, gold = GLD, grey = Cash. Long grey segments are the strategy's defensive periods — they appear when all 4 assets had negative momentum over your chosen lookback window. If you see grey segments during the worst of 2022, that's the strategy working as intended. If you see frequent short bursts of colour with many switches, try moving the slider to a longer lookback.",
      },
    ],
  },
  custom: {
    summary: "Build your own portfolio — choose any combination of assets and decide how much to put in each.",
    quickTip: "Pick assets from different categories (stocks, bonds, gold) for better diversification. Watch for the yellow correlation warning.",
    explanation: "You're building your own portfolio by selecting individual assets and choosing how much to invest in each one. This teaches you how diversification works in practice.",
    worksWell: [
      "When you spread investments across different sectors and asset classes",
      "When you include bonds or gold alongside stocks to cushion downturns",
      "When no single asset dominates your portfolio",
    ],
    struggles: [
      "Concentrated portfolios with too much in one sector",
      "All-stock portfolios in bear markets",
      "Ignoring alternative assets like bonds or commodities",
    ],
    adjustments: [
      "Add assets from different categories (stocks, bonds, gold) for better diversification",
      "Keep individual weights balanced — avoid putting 80%+ into a single asset",
      "Compare your results against the SPY benchmark to see if diversification helped",
    ],
    proTip: "True diversification means owning assets that don't all move in the same direction at the same time.",
  },
};

const StrategyEducation = ({ strategy }: StrategyEducationProps) => {
  const c = strategyContent[strategy];
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* ── Always visible: summary + quick tip ── */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <h3 className="font-serif text-lg text-foreground">How This Strategy Works</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{c.summary}</p>

        {/* Learn more toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          {expanded ? 'Show less' : 'Learn more →'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── Expandable: full content ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">

              {/* Explanation */}
              <p className="text-sm text-muted-foreground leading-relaxed">{c.explanation}</p>

              {/* Works well / Struggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-teal/20 bg-teal/5 p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-teal" />
                    <span className="text-xs font-semibold text-teal">Works well in</span>
                  </div>
                  <ul className="space-y-1.5">
                    {c.worksWell.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                        <span className="text-teal mt-0.5">•</span>{item}
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
                        <span className="text-warm mt-0.5">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Slider detail */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">How to adjust the slider</span>
                </div>
                <ul className="space-y-1.5">
                  {c.adjustments.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">→</span>{item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mechanism note */}
              {c.mechanismNote && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-3">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-amber-500">How it works under the hood: </span>
                    {c.mechanismNote}
                  </p>
                </div>
              )}

              {/* Pro tip */}
              <div className="flex items-start gap-2 rounded-lg bg-secondary/60 px-3.5 py-3">
                <Lightbulb className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-foreground font-medium leading-relaxed">
                  <span className="text-primary">Pro Tip:</span> {c.proTip}
                </p>
              </div>

              {/* Takeaway */}
              {c.conclusion && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">Takeaway</h4>
                  </div>
                  <div className="space-y-2">
                    {c.conclusion.map((point, i) => (
                      <div key={i} className="rounded-lg border border-border bg-secondary/30 px-3.5 py-3">
                        <p className="text-xs font-semibold text-foreground mb-1">{point.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{point.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StrategyEducation;
