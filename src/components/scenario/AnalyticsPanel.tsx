import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, BarChart3, Activity, Percent, PieChart } from "lucide-react";
import type { PortfolioMetrics } from "@/hooks/useScenarioSimulation";

interface AnalyticsPanelProps {
  metrics: PortfolioMetrics;
}

const AnalyticsPanel = ({ metrics }: AnalyticsPanelProps) => {
  const items = [
    {
      label: 'Total Return',
      value: `${metrics.totalReturn >= 0 ? '+' : ''}${metrics.totalReturn.toFixed(1)}%`,
      icon: metrics.totalReturn >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalReturn >= 0 ? 'text-teal' : 'text-destructive',
    },
    {
      label: 'CAGR',
      value: `${metrics.cagr >= 0 ? '+' : ''}${metrics.cagr.toFixed(1)}%`,
      icon: Percent,
      color: metrics.cagr >= 0 ? 'text-teal' : 'text-destructive',
    },
    {
      label: 'Max Drawdown',
      value: `${metrics.maxDrawdown.toFixed(1)}%`,
      icon: TrendingDown,
      color: 'text-destructive',
    },
    {
      label: 'Worst Quarter',
      value: `${metrics.worstQuarter.toFixed(1)}%`,
      icon: BarChart3,
      color: 'text-destructive',
    },
    {
      label: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2),
      icon: Activity,
      color: metrics.sharpeRatio > 0.5 ? 'text-teal' : 'text-muted-foreground',
    },
    {
      label: 'Volatility',
      value: `${metrics.volatility.toFixed(1)}%`,
      icon: Activity,
      color: metrics.volatility > 25 ? 'text-warm' : 'text-muted-foreground',
    },
    {
      label: 'Net Exposure',
      value: `${metrics.netExposure.toFixed(0)}%`,
      icon: PieChart,
      color: 'text-foreground',
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-serif text-base text-foreground mb-3">Analytics</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg bg-secondary/50 p-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <p className={`text-sm font-mono font-medium ${item.color}`}>
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsPanel;
