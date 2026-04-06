import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceDot, CartesianGrid, Legend,
} from "recharts";
import type { BacktestResult } from "@/hooks/useStrategyBacktest";

interface Props {
  result: BacktestResult;
  strategyColor: string;
  showSignals?: boolean;
}

const StrategyChart = ({ result, strategyColor, showSignals }: Props) => {
  const chartData = useMemo(() => {
    // Sample ~200 points for performance
    const step = Math.max(1, Math.floor(result.dates.length / 200));
    return result.dates
      .filter((_, i) => i % step === 0 || i === result.dates.length - 1)
      .map((date, idx) => {
        const i = Math.min(idx * step, result.dates.length - 1);
        return {
          date,
          portfolio: result.portfolioValues[i],
          benchmark: result.benchmarkValues[i],
        };
      });
  }, [result]);

  const signalPoints = useMemo(() => {
    if (!showSignals || !result.signals) return [];
    return result.signals.map(s => ({
      date: s.date,
      price: result.portfolioValues[result.dates.indexOf(s.date)] || 0,
      type: s.type,
    }));
  }, [result, showSignals]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Portfolio vs Benchmark (100% SPY)</h3>
        <span className="text-xs text-muted-foreground">Starting: $10,000</span>
      </div>
      <div className="h-[280px] md:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strategyColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={strategyColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                name === 'portfolio' ? 'Strategy' : 'Benchmark (SPY)',
              ]}
              labelFormatter={formatDate}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value) => value === 'portfolio' ? 'Strategy' : 'Benchmark'}
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#benchGrad)"
            />
            <Area
              type="monotone"
              dataKey="portfolio"
              stroke={strategyColor}
              strokeWidth={2}
              fill="url(#portfolioGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Signal legend */}
      {showSignals && result.signals && result.signals.length > 0 && (
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>▲ Buy signals: {result.signals.filter(s => s.type === 'buy').length}</span>
          <span>▼ Sell signals: {result.signals.filter(s => s.type === 'sell').length}</span>
        </div>
      )}
    </div>
  );
};

export default StrategyChart;
