import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Percent, BarChart3 } from "lucide-react";
import type { BacktestResult } from "@/hooks/useStrategyBacktest";

interface Props {
  result: BacktestResult;
}

const MetricsPanel = ({ result }: Props) => {
  const metrics = [
    {
      label: 'Total Return',
      value: `${result.totalReturn >= 0 ? '+' : ''}${result.totalReturn.toFixed(1)}%`,
      icon: result.totalReturn >= 0 ? TrendingUp : TrendingDown,
      color: result.totalReturn >= 0 ? 'text-teal' : 'text-destructive',
    },
    {
      label: 'CAGR',
      value: `${result.cagr >= 0 ? '+' : ''}${result.cagr.toFixed(1)}%`,
      icon: Percent,
      color: result.cagr >= 0 ? 'text-teal' : 'text-destructive',
    },
    {
      label: 'Volatility',
      value: `${result.volatility.toFixed(1)}%`,
      icon: Activity,
      color: result.volatility > 20 ? 'text-warm' : 'text-muted-foreground',
    },
    {
      label: 'Max Drawdown',
      value: `${result.maxDrawdown.toFixed(1)}%`,
      icon: TrendingDown,
      color: 'text-destructive',
    },
    {
      label: 'Worst Quarter',
      value: `${result.worstQuarter.toFixed(1)}%`,
      icon: BarChart3,
      color: 'text-destructive',
    },
    {
      label: 'Sharpe Ratio',
      value: result.sharpeRatio.toFixed(2),
      icon: Activity,
      color: result.sharpeRatio > 0.5 ? 'text-teal' : result.sharpeRatio > 0 ? 'text-muted-foreground' : 'text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-lg border border-border bg-card p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <m.icon className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">{m.label}</span>
          </div>
          <p className={`text-sm font-mono font-bold ${m.color}`}>{m.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default MetricsPanel;
