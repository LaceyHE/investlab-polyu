import { motion } from 'framer-motion';
import { TrendingDown, Trophy, AlertTriangle, BarChart3, ArrowLeft } from 'lucide-react';
import type { Holding, TradeEntry } from '@/hooks/useDotcomSimulation';
import { STOCKS, NASDAQ_MONTHLY } from '@/data/dotcom-data';

interface Props {
  nav: number;
  totalReturn: number;
  holdings: Holding[];
  tradeLog: TradeEntry[];
  allPrices: Record<string, number[]>;
  onBack: () => void;
}

export default function DotComSummary({ nav, totalReturn, holdings, tradeLog, allPrices, onBack }: Props) {
  const nasdaqReturn = ((NASDAQ_MONTHLY[45] - NASDAQ_MONTHLY[14]) / NASDAQ_MONTHLY[14] * 100).toFixed(0);

  // Find best/worst holdings from trade log
  const tickerReturns: Record<string, { invested: number; finalValue: number }> = {};
  tradeLog.forEach(t => {
    if (!tickerReturns[t.ticker]) tickerReturns[t.ticker] = { invested: 0, finalValue: 0 };
    if (t.action === 'BUY') tickerReturns[t.ticker].invested += t.value;
    if (t.action === 'SELL') tickerReturns[t.ticker].finalValue += t.value;
  });
  // Add remaining holdings value
  holdings.forEach(h => {
    const price = allPrices[h.ticker]?.[45] ?? 0;
    if (!tickerReturns[h.ticker]) tickerReturns[h.ticker] = { invested: 0, finalValue: 0 };
    tickerReturns[h.ticker].finalValue += h.shares * price;
  });

  const sorted = Object.entries(tickerReturns)
    .map(([ticker, { invested, finalValue }]) => ({
      ticker,
      return: invested > 0 ? ((finalValue - invested) / invested * 100) : 0,
    }))
    .sort((a, b) => b.return - a.return);

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Concentration: max single position
  const maxPosName = holdings.reduce((max, h) => {
    const val = h.shares * (allPrices[h.ticker]?.[45] ?? 0);
    return val > (max.val || 0) ? { ticker: h.ticker, val } : max;
  }, { ticker: '', val: 0 });

  const survivalScore = totalReturn > -30 ? 'Excellent' : totalReturn > -50 ? 'Good' : totalReturn > -70 ? 'Poor' : 'Devastating';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to scenarios
      </button>

      <div className="text-center py-8">
        <h2 className="font-serif text-3xl text-foreground mb-2">Simulation Complete</h2>
        <p className="text-muted-foreground">January 1999 – October 2002</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <TrendingDown className="h-5 w-5 text-red-500 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-1">Nasdaq Peak to Trough</p>
          <p className="text-2xl font-mono font-bold text-red-500">{nasdaqReturn}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <BarChart3 className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-1">Your Portfolio</p>
          <p className={`text-2xl font-mono font-bold ${totalReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Final NAV</p>
          <p className="text-xl font-mono font-bold text-foreground">${nav.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Survival Score</p>
          <p className={`text-xl font-bold ${survivalScore === 'Excellent' ? 'text-emerald-500' : survivalScore === 'Good' ? 'text-amber-500' : 'text-red-500'}`}>
            {survivalScore}
          </p>
        </div>
      </div>

      {/* Best / Worst */}
      {best && worst && sorted.length > 1 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <Trophy className="h-4 w-4 text-emerald-500 mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Best Holding</p>
            <p className="font-mono font-bold text-foreground">{best.ticker}</p>
            <p className={`text-sm font-mono ${best.return >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {best.return >= 0 ? '+' : ''}{best.return.toFixed(0)}%
            </p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <AlertTriangle className="h-4 w-4 text-red-500 mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Worst Holding</p>
            <p className="font-mono font-bold text-foreground">{worst.ticker}</p>
            <p className="text-sm font-mono text-red-500">
              {worst.return >= 0 ? '+' : ''}{worst.return.toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {/* Reflection */}
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <blockquote className="font-serif text-lg text-foreground italic leading-relaxed">
          "Even profitable companies fell—not because they stopped earning,<br />
          but because the price investors were willing to pay collapsed."
        </blockquote>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Multiple compression destroyed more wealth than actual business failure.
          Understanding valuation environments matters more than picking winners.
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Total trades: {tradeLog.length} · Months simulated: 46
        </p>
        <p className="font-serif text-foreground">
          "Failure did not come from stock selection.<br />
          It came from strategy–environment mismatch."
        </p>
      </div>
    </motion.div>
  );
}
