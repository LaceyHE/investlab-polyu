import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid, Line
} from "recharts";
import { PricePoint, aggregateData, computeDrawdown, computeRollingVolatility, suggestAggregation, TimeAggregation } from "@/hooks/useMarketData";
import type { ScenarioEvent } from "@/data/scenario-presets";

interface MarketChartProps {
  indexData: PricePoint[];
  navHistory: { date: string; value: number }[];
  events: ScenarioEvent[];
  currentDate: string;
  aggregationOverride?: TimeAggregation | null;
  onAggregationChange: (agg: TimeAggregation) => void;
  showDrawdown: boolean;
  showVolatility: boolean;
  showSharpe?: boolean;
  onToggleDrawdown: () => void;
  onToggleVolatility: () => void;
  onToggleSharpe?: () => void;
  rollingSharpe?: number[];
  portfolioDrawdown?: number[];
}

const MarketChart = ({
  indexData,
  navHistory,
  events,
  currentDate,
  aggregationOverride,
  onAggregationChange,
  showDrawdown,
  showVolatility,
  showSharpe = false,
  onToggleDrawdown,
  onToggleVolatility,
  onToggleSharpe,
  rollingSharpe = [],
  portfolioDrawdown = [],
}: MarketChartProps) => {
  const volatility = useMemo(() => computeRollingVolatility(indexData), [indexData]);
  const suggestedAgg = useMemo(() => suggestAggregation(volatility), [volatility]);
  const aggregation = aggregationOverride || suggestedAgg;

  const aggregatedData = useMemo(() => aggregateData(indexData, aggregation), [indexData, aggregation]);
  const drawdown = useMemo(() => computeDrawdown(aggregatedData), [aggregatedData]);

  const visibleData = useMemo(() => {
    return aggregatedData
      .filter(d => d.date <= currentDate)
      .map((d, i) => {
        const navPoint = navHistory.find(n => n.date === d.date);
        return {
          date: d.date,
          index: d.close,
          nav: navPoint?.value,
          drawdown: drawdown[i] || 0,
          vol: volatility[i] || 0,
          sharpe: rollingSharpe[i] ?? null,
          portfolioDD: portfolioDrawdown[i] ?? null,
        };
      });
  }, [aggregatedData, currentDate, navHistory, drawdown, volatility, rollingSharpe, portfolioDrawdown]);

  const visibleEvents = useMemo(() => events.filter(e => e.date <= currentDate), [events, currentDate]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const eventColors: Record<string, string> = {
    crash: 'hsl(0 55% 50%)',
    fed: 'hsl(220 70% 55%)',
    earnings: 'hsl(38 90% 55%)',
    policy: 'hsl(270 50% 55%)',
    recovery: 'hsl(152 55% 42%)',
  };

  if (visibleData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(['daily', 'weekly', 'monthly'] as TimeAggregation[]).map(agg => (
            <button
              key={agg}
              onClick={() => onAggregationChange(agg)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                aggregation === agg ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {agg.charAt(0).toUpperCase() + agg.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleDrawdown}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              showDrawdown ? 'bg-destructive/20 text-destructive' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Drawdown
          </button>
          <button
            onClick={onToggleVolatility}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              showVolatility ? 'bg-warm/20 text-warm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Volatility
          </button>
          {onToggleSharpe && (
            <button
              onClick={onToggleSharpe}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                showSharpe ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sharpe
            </button>
          )}
        </div>
      </div>

      <div className="h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visibleData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--teal))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--teal))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="portfolioDDGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--warm))" stopOpacity={0} />
                <stop offset="100%" stopColor="hsl(var(--warm))" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="price"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              tickFormatter={v => v.toLocaleString()}
            />
            {(showDrawdown || (showSharpe && rollingSharpe.length > 0)) && (
              <YAxis
                yAxisId="dd"
                orientation="right"
                tick={{ fontSize: 10, fill: showSharpe ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}
                stroke={showSharpe ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                tickFormatter={v => showSharpe ? v.toFixed(1) : `${v.toFixed(0)}%`}
                domain={showSharpe ? ['auto', 'auto'] : ['dataMin', 0]}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'index') return [value.toLocaleString(undefined, { maximumFractionDigits: 0 }), 'Index'];
                if (name === 'nav') return [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Portfolio'];
                if (name === 'drawdown') return [`${value.toFixed(1)}%`, 'Index Drawdown'];
                if (name === 'portfolioDD') return [`${value.toFixed(1)}%`, 'Portfolio DD'];
                if (name === 'sharpe') return [value.toFixed(2), 'Rolling Sharpe'];
                return [value.toFixed(2), name];
              }}
              labelFormatter={formatDate}
            />

            <Area yAxisId="price" type="monotone" dataKey="index" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#indexGradient)" />

            {navHistory.length > 0 && (
              <Area yAxisId="price" type="monotone" dataKey="nav" stroke="hsl(var(--teal))" strokeWidth={2} fill="url(#navGradient)" connectNulls />
            )}

            {showDrawdown && (
              <Area yAxisId="dd" type="monotone" dataKey="drawdown" stroke="hsl(var(--destructive))" strokeWidth={1} fill="url(#drawdownGradient)" />
            )}

            {/* Portfolio drawdown shading */}
            {showDrawdown && portfolioDrawdown.length > 0 && (
              <Area yAxisId="dd" type="monotone" dataKey="portfolioDD" stroke="hsl(var(--warm))" strokeWidth={1} fill="url(#portfolioDDGradient)" connectNulls />
            )}

            {/* Rolling Sharpe overlay */}
            {showSharpe && rollingSharpe.length > 0 && (
              <Line yAxisId="dd" type="monotone" dataKey="sharpe" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} connectNulls />
            )}

            {visibleEvents.map((event, i) => (
              <ReferenceLine
                key={i}
                yAxisId="price"
                x={event.date}
                stroke={eventColors[event.type] || 'hsl(var(--muted-foreground))'}
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{ value: '●', position: 'top', fill: eventColors[event.type], fontSize: 10 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {visibleEvents.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleEvents.slice(-3).map((event, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: eventColors[event.type] }} />
              <span>{event.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketChart;
