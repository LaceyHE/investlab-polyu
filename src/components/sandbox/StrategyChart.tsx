import { useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, ReferenceDot,
} from "recharts";
import type { BacktestResult } from "@/hooks/useStrategyBacktest";

interface Props {
  result: BacktestResult;
  strategyColor: string;
  showSignals?: boolean;
  benchmarkLabel?: string;
}

const BuyDot = (props: any) => {
  const { cx, cy } = props;
  const s = 7;
  return <polygon points={`${cx},${cy - s} ${cx - s},${cy + s * 0.6} ${cx + s},${cy + s * 0.6}`} fill="hsl(152 55% 45%)" stroke="white" strokeWidth={1} />;
};

const SellDot = (props: any) => {
  const { cx, cy } = props;
  const s = 7;
  return <polygon points={`${cx},${cy + s} ${cx - s},${cy - s * 0.6} ${cx + s},${cy - s * 0.6}`} fill="hsl(0 65% 55%)" stroke="white" strokeWidth={1} />;
};

const StrategyChart = ({ result, strategyColor, showSignals, benchmarkLabel = 'Benchmark (SPY)' }: Props) => {
  const signalDates = useMemo(
    () => new Set(result.signals?.map(s => s.date) ?? []),
    [result.signals],
  );

  // Main portfolio chart data
  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(result.dates.length / 200));
    return result.dates
      .filter((date, i) => i % step === 0 || i === result.dates.length - 1 || signalDates.has(date))
      .map((date) => {
        const i = result.dates.indexOf(date);
        return {
          date,
          portfolio: result.portfolioValues[i],
          benchmark: result.benchmarkValues[i],
          noReinvest: result.noReinvestValues?.[i],
        };
      });
  }, [result, signalDates]);

  // MA indicator panel data (SPY price + MA lines, all normalized to $10k)
  const maChartData = useMemo(() => {
    if (!result.indicators || !showSignals) return [];
    const step = Math.max(1, Math.floor(result.dates.length / 200));
    return result.dates
      .filter((date, i) => i % step === 0 || i === result.dates.length - 1 || signalDates.has(date))
      .map((date) => {
        const i = result.dates.indexOf(date);
        const row: Record<string, number | null | string> = {
          date,
          spyPrice: result.benchmarkValues[i], // benchmark IS normalized SPY ($10k base)
        };
        result.indicators!.forEach(ind => {
          row[ind.label] = ind.values[i];
        });
        return row;
      });
  }, [result, showSignals, signalDates]);

  const yDomain = useMemo(() => {
    const allValues = chartData.flatMap(d =>
      [d.portfolio, d.benchmark, d.noReinvest].filter((v): v is number => v !== undefined)
    );
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const pad = (max - min) * 0.08;
    return [Math.floor(min - pad), Math.ceil(max + pad)] as [number, number];
  }, [chartData]);

  const maYDomain = useMemo(() => {
    if (!maChartData.length) return [0, 20000] as [number, number];
    const vals = maChartData.flatMap(d =>
      ['spyPrice', ...(result.indicators?.map(i => i.label) ?? [])].map(k => d[k] as number | null).filter((v): v is number => v !== null)
    );
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.08;
    return [Math.floor(min - pad), Math.ceil(max + pad)] as [number, number];
  }, [maChartData, result.indicators]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

  const buySignals = result.signals?.filter(s => s.type === 'buy') ?? [];
  const sellSignals = result.signals?.filter(s => s.type === 'sell') ?? [];
  const hasMA = showSignals && result.indicators && result.indicators.length > 0;

  return (
    <div className="rounded-none border-2 border-foreground bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Portfolio Performance</h3>
        <span className="text-xs text-muted-foreground">Starting: $10,000</span>
      </div>

      {/* Main portfolio chart */}
      <div className="h-[220px] md:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strategyColor} stopOpacity={0.45} />
                <stop offset="100%" stopColor={strategyColor} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.18} />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="noReinvestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" interval="preserveStartEnd" />
            <YAxis domain={yDomain} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                name === 'portfolio' ? 'With Reinvestment' : name === 'noReinvest' ? 'No Reinvestment' : benchmarkLabel,
              ]}
              labelFormatter={formatDate}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) =>
              v === 'portfolio' ? 'With Reinvestment' : v === 'noReinvest' ? 'No Reinvestment (dividends as cash)' : benchmarkLabel
            } />
            <Area type="monotone" dataKey="benchmark" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 4" fill="url(#benchGrad)" />
            {result.noReinvestValues && (
              <Area type="monotone" dataKey="noReinvest" stroke="hsl(38 92% 50%)" strokeWidth={2} strokeDasharray="6 3" fill="url(#noReinvestGrad)" connectNulls />
            )}
            <Area type="monotone" dataKey="portfolio" stroke={strategyColor} strokeWidth={2.5} fill="url(#portfolioGrad)" />
            {showSignals && buySignals.map((signal, i) => {
              const idx = result.dates.indexOf(signal.date);
              return idx >= 0 ? <ReferenceDot key={`buy-${i}`} x={signal.date} y={result.portfolioValues[idx]} shape={<BuyDot />} /> : null;
            })}
            {showSignals && sellSignals.map((signal, i) => {
              const idx = result.dates.indexOf(signal.date);
              return idx >= 0 ? <ReferenceDot key={`sell-${i}`} x={signal.date} y={result.portfolioValues[idx]} shape={<SellDot />} /> : null;
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* MA indicator panel */}
      {hasMA && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">
            SPY Price + Moving Averages — signals fire where the two MA lines cross
          </p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maChartData} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" interval="preserveStartEnd" />
                <YAxis domain={maYDomain} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`]}
                  labelFormatter={formatDate}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {/* SPY price line */}
                <Line type="monotone" dataKey="spyPrice" name="SPY Price" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} dot={false} />
                {/* MA lines */}
                {result.indicators!.map(ind => (
                  <Line
                    key={ind.label}
                    type="monotone"
                    dataKey={ind.label}
                    name={ind.label}
                    stroke={ind.color}
                    strokeWidth={1.5}
                    strokeDasharray={ind.dashed ? '5 3' : undefined}
                    dot={false}
                    connectNulls={false}
                  />
                ))}
                {/* Buy signals on MA panel */}
                {buySignals.map((signal, i) => {
                  const idx = result.dates.indexOf(signal.date);
                  return idx >= 0 ? <ReferenceDot key={`ma-buy-${i}`} x={signal.date} y={result.benchmarkValues[idx]} shape={<BuyDot />} /> : null;
                })}
                {/* Sell signals on MA panel */}
                {sellSignals.map((signal, i) => {
                  const idx = result.dates.indexOf(signal.date);
                  return idx >= 0 ? <ReferenceDot key={`ma-sell-${i}`} x={signal.date} y={result.benchmarkValues[idx]} shape={<SellDot />} /> : null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Signal legend */}
      {showSignals && result.signals && result.signals.length > 0 && (
        <div className="rounded-none border-2 border-foreground bg-secondary/40 p-3 space-y-2">
          <p className="text-xs font-medium text-foreground">Trading Signals</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <polygon points="7,1 1,13 13,13" fill="hsl(152 55% 45%)" />
              </svg>
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Buy ({buySignals.length})</span>
                {' '}— Short MA crossed above Long MA. Strategy enters 100% SPY.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <polygon points="7,13 1,1 13,1" fill="hsl(0 65% 55%)" />
              </svg>
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Sell ({sellSignals.length})</span>
                {' '}— Short MA dropped below Long MA. Strategy exits to cash.
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Fewer signals (slow slider) = less noise, bigger moves. More signals (fast slider) = reacts faster but risks false triggers.
          </p>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-right">
        Source: Yahoo Finance (adjusted close prices)
      </p>
    </div>
  );
};

export default StrategyChart;
