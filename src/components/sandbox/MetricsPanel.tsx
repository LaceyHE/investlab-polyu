import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Percent, BarChart3, DollarSign } from "lucide-react";
import type { BacktestResult } from "@/hooks/useStrategyBacktest";

interface Props {
  result: BacktestResult;
}

const MetricsPanel = ({ result }: Props) => {
  const isPositive = result.totalReturn >= 0;

  const secondaryMetrics = [
    {
      label: 'CAGR',
      value: `${result.cagr >= 0 ? '+' : ''}${result.cagr.toFixed(1)}%`,
      color: result.cagr >= 0 ? 'text-teal' : 'text-destructive',
    },
    {
      label: 'Volatility',
      value: `${result.volatility.toFixed(1)}%`,
      color: result.volatility > 20 ? 'text-warm' : 'text-foreground',
    },
    {
      label: 'Max Drawdown',
      value: `${result.maxDrawdown.toFixed(1)}%`,
      color: 'text-destructive',
    },
    {
      label: 'Worst Quarter',
      value: `${result.worstQuarter.toFixed(1)}%`,
      color: 'text-destructive',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-none border-2 border-foreground bg-card overflow-hidden"
    >
      {/* Hero metrics */}
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
        {/* Total Return */}
        <div className={`px-4 py-3 transition-colors ${isPositive ? 'bg-teal/5' : 'bg-destructive/5'}`}>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Return</p>
          <div className="flex items-end gap-2 flex-wrap">
            <span className={`font-serif text-3xl font-bold leading-none ${isPositive ? 'text-teal' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{result.totalReturn.toFixed(1)}%
            </span>
            <span className={`text-xs mb-0.5 flex items-center gap-1 ${isPositive ? 'text-teal' : 'text-destructive'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              on $10,000
            </span>
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className={`px-4 py-3 transition-colors ${
          result.sharpeRatio > 0 ? 'bg-teal/5' : 'bg-destructive/5'
        }`}>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Sharpe Ratio</p>
          <div className="flex items-end gap-2 flex-wrap">
            <span className={`font-serif text-3xl font-bold leading-none ${
              result.sharpeRatio > 0 ? 'text-teal' : 'text-destructive'
            }`}>
              {result.sharpeRatio.toFixed(2)}
            </span>
            <span className="text-xs mb-0.5 text-muted-foreground">
              {result.sharpeRatio > 1 ? 'good' : result.sharpeRatio > 0.5 ? 'fair' : result.sharpeRatio > 0 ? 'poor' : 'negative'}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">return per unit of risk</p>
        </div>
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-5 divide-x divide-border">
        {secondaryMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            className="px-3 py-2 flex flex-col items-center text-center"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{m.label}</p>
            <p className={`text-sm font-mono font-bold ${m.color}`}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Dividends received — income strategy only */}
      {result.totalDividendsReceived !== undefined && result.totalDividendsReceived > 0 && (
        <div className="border-t border-border px-6 py-3 flex items-center gap-3">
          <DollarSign className="h-4 w-4 text-teal shrink-0" />
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] text-muted-foreground">Dividends received:</span>
            <span className="text-sm font-mono font-bold text-teal">
              +${result.totalDividendsReceived.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground">in cash income from SPY + DVY</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MetricsPanel;
