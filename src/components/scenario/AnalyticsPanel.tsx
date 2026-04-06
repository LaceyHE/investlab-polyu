import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, BarChart3, Activity, Percent, PieChart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PortfolioMetrics, Position } from "@/hooks/useScenarioSimulation";
import { dotcomStocks } from "@/data/dotcom-stocks";

interface AnalyticsPanelProps {
  metrics: PortfolioMetrics;
  positions?: Position[];
}

const tooltipTexts: Record<string, string> = {
  'Total Return': 'The total percentage gain or loss since the portfolio was created.',
  'CAGR': 'Compound Annual Growth Rate — the smoothed annual return over the entire period.',
  'Max Drawdown': 'The largest peak-to-trough decline. Measures worst-case loss experience.',
  'Worst Quarter': 'The worst rolling 63-trading-day return. Shows downside tail risk.',
  'Sharpe Ratio': 'Risk-adjusted return. Above 1.0 is good; below 0.5 suggests excessive risk for the returns achieved.',
  'Volatility': 'Annualized standard deviation of returns. Higher = more unpredictable price swings.',
  'Net Exposure': 'Percentage of capital invested in stocks (vs. cash).',
};

const AnalyticsPanel = ({ metrics, positions = [] }: AnalyticsPanelProps) => {
  // Sector concentration
  const sectorWeights = positions.reduce((acc, pos) => {
    const stock = dotcomStocks.find(s => s.ticker === pos.ticker);
    if (stock) acc[stock.industry] = (acc[stock.industry] || 0) + pos.weight;
    return acc;
  }, {} as Record<string, number>);
  const sectorEntries = Object.entries(sectorWeights).sort((a, b) => b[1] - a[1]);
  const totalAllocated = positions.reduce((s, p) => s + p.weight, 0);

  const getColor = (label: string, value: number): string => {
    switch (label) {
      case 'Total Return':
      case 'CAGR':
        return value >= 0 ? 'text-teal' : 'text-destructive';
      case 'Max Drawdown':
      case 'Worst Quarter':
        return value < -25 ? 'text-destructive' : value < -10 ? 'text-warm' : 'text-muted-foreground';
      case 'Sharpe Ratio':
        return value > 1 ? 'text-teal' : value > 0.5 ? 'text-foreground' : 'text-warm';
      case 'Volatility':
        return value > 30 ? 'text-destructive' : value > 20 ? 'text-warm' : 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  const items = [
    { label: 'Total Return', value: `${metrics.totalReturn >= 0 ? '+' : ''}${metrics.totalReturn.toFixed(1)}%`, raw: metrics.totalReturn, icon: metrics.totalReturn >= 0 ? TrendingUp : TrendingDown },
    { label: 'CAGR', value: `${metrics.cagr >= 0 ? '+' : ''}${metrics.cagr.toFixed(1)}%`, raw: metrics.cagr, icon: Percent },
    { label: 'Max Drawdown', value: `${metrics.maxDrawdown.toFixed(1)}%`, raw: metrics.maxDrawdown, icon: TrendingDown },
    { label: 'Worst Quarter', value: `${metrics.worstQuarter.toFixed(1)}%`, raw: metrics.worstQuarter, icon: BarChart3 },
    { label: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2), raw: metrics.sharpeRatio, icon: Activity },
    { label: 'Volatility', value: `${metrics.volatility.toFixed(1)}%`, raw: metrics.volatility, icon: Activity },
    { label: 'Net Exposure', value: `${metrics.netExposure.toFixed(0)}%`, raw: metrics.netExposure, icon: PieChart },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-serif text-base text-foreground mb-3">Analytics</h3>
      <TooltipProvider delayDuration={300}>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item, i) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg bg-secondary/50 p-3 cursor-help"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <p className={`text-sm font-mono font-medium ${getColor(item.label, item.raw)}`}>
                    {item.value}
                  </p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">
                <p className="text-xs">{tooltipTexts[item.label]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Sector concentration breakdown */}
      {sectorEntries.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-2">Sector Concentration</p>
          <div className="space-y-1.5">
            {sectorEntries.slice(0, 4).map(([sector, weight]) => (
              <div key={sector} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16 truncate">{sector}</span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      weight / Math.max(totalAllocated, 1) > 0.5 ? 'bg-warm' : 'bg-primary/60'
                    }`}
                    style={{ width: `${(weight / Math.max(totalAllocated, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{weight.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
