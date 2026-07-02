import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, ChevronDown, Info } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { BacktestResult, StrategyType } from "@/hooks/useStrategyBacktest";
import { useStrategyBacktest } from "@/hooks/useStrategyBacktest";
import { strategies } from "./StrategySelector";
import type { TimePeriod } from "@/data/time-periods";
import type { DailyPrice } from "@/hooks/useStrategyBacktest";

interface Props {
  primaryResult: BacktestResult;
  primaryName: string;
  primaryColor: string;
  spy: DailyPrice[];
  agg: DailyPrice[];
  qqq: DailyPrice[];
  gld: DailyPrice[];
  period: TimePeriod;
  currentStrategy: StrategyType;
  dvy?: DailyPrice[];
  dvyPrice?: DailyPrice[];
  spyPrice?: DailyPrice[];
  dividends?: Record<string, { date: string; amount: number }[]>;
}

// Period-aware compare params: pick the most representative setting for each strategy
// given the market environment, so users see a meaningful scenario-based comparison.
interface ComparePreset {
  param: number;
  label: string; // explains why this param was chosen
}

const COMPARE_PRESETS: Record<string, Record<StrategyType, ComparePreset>> = {
  bull: {
    // Bull 2019–2021: strong uptrend, low rates, equities dominate
    allocation: { param: 0.8,  label: '80% stocks — bull markets reward equity-heavy portfolios' },
    trend:      { param: 0.8,  label: 'Fast MA (10/30) — clear uptrend makes quick signals reliable' },
    income:     { param: 0.2,  label: '80% growth — bull market favours capital gains over dividends' },
    momentum:   { param: 0.2,  label: '2-month lookback — short window captures fast-moving trends' },
    custom:     { param: 0,    label: '' },
  },
  bear: {
    // Bear 2021–2023: rate hikes, stocks & bonds both fall, protection matters
    allocation: { param: 0.4,  label: '40% stocks — lower equity exposure cushions drawdowns' },
    trend:      { param: 0.0,  label: 'Slow MA (50/200) — filters noise, helps avoid major crashes' },
    income:     { param: 0.7,  label: '70% income (DVY) — defensive dividend stocks hold up better' },
    momentum:   { param: 0.5,  label: '3-month lookback — rotates into gold or bonds during stress' },
    custom:     { param: 0,    label: '' },
  },
  recovery: {
    // Recovery 2023–2025: AI boom, QQQ leads, high risk-free rate
    allocation: { param: 0.7,  label: '70% stocks — tech-led recovery rewards equity tilt' },
    trend:      { param: 0.5,  label: 'Medium MA (20/60) — balanced for post-bear recovery volatility' },
    income:     { param: 0.3,  label: '70% growth — AI boom rewards growth stocks over dividend payers' },
    momentum:   { param: 0.2,  label: '2-month lookback — catches QQQ momentum early in the rebound' },
    custom:     { param: 0,    label: '' },
  },
};

const COMPARE_COLORS: Record<StrategyType, string> = {
  allocation: 'hsl(220 70% 55%)',
  trend:      'hsl(150 55% 45%)',
  income:     'hsl(35 80% 50%)',
  momentum:   'hsl(280 60% 55%)',
  custom:     'hsl(0 65% 55%)',
};

const StrategyCompare = ({
  primaryResult, primaryName, primaryColor,
  spy, agg, qqq, gld, period, currentStrategy,
  dvy, dvyPrice, spyPrice, dividends,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [compareStrategy, setCompareStrategy] = useState<StrategyType | null>(null);

  const presets = COMPARE_PRESETS[period.key] ?? COMPARE_PRESETS.bear;
  const activePreset = compareStrategy ? presets[compareStrategy] : null;
  const compareParam = activePreset?.param ?? 0;

  const compareResult = useStrategyBacktest(
    compareStrategy || 'allocation',
    compareParam,
    spy, agg, qqq, gld, period,
    dvy, dvyPrice, spyPrice, dividends,
  );

  const compareDef = strategies.find(s => s.id === compareStrategy);
  const compareColor = compareStrategy ? COMPARE_COLORS[compareStrategy] : 'hsl(var(--muted-foreground))';

  const chartData = useMemo(() => {
    if (!compareStrategy || !compareResult) return [];
    const step = Math.max(1, Math.floor(primaryResult.dates.length / 200));
    return primaryResult.dates
      .filter((_, i) => i % step === 0 || i === primaryResult.dates.length - 1)
      .map((date, idx) => {
        const i = Math.min(idx * step, primaryResult.dates.length - 1);
        const cIdx = compareResult.dates.indexOf(date);
        return {
          date,
          primary: primaryResult.portfolioValues[i],
          compare: cIdx >= 0 ? compareResult.portfolioValues[cIdx] : null,
          benchmark: primaryResult.benchmarkValues[i],
        };
      });
  }, [primaryResult, compareResult, compareStrategy]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

  const availableStrategies = strategies.filter(s => s.id !== 'custom' && s.id !== currentStrategy);

  return (
    <div className="rounded-none border-2 border-foreground bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Compare with Another Strategy</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">

              {/* Period context hint */}
              <p className="text-[11px] text-muted-foreground">
                Comparing in the <span className="font-medium text-foreground">{period.label} ({period.subtitle})</span> scenario.
                Each strategy below uses the most representative setting for this market environment.
              </p>

              {/* Strategy picker */}
              <div className="flex flex-wrap gap-2">
                {availableStrategies.map(s => {
                  const preset = presets[s.id as StrategyType];
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCompareStrategy(s.id as StrategyType)}
                      className={`flex items-center gap-1.5 rounded-none border px-3 py-1.5 text-xs transition-all ${
                        compareStrategy === s.id
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                      }`}
                    >
                      <span>{s.icon}</span>
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preset rationale */}
              {compareStrategy && activePreset?.label && (
                <div className="flex items-start gap-2 rounded-none bg-secondary/50 px-3 py-2">
                  <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{compareDef?.name}</span>
                    {' '}is shown with: <span className="italic">{activePreset.label}</span>
                  </p>
                </div>
              )}

              {compareStrategy && compareResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Overlay chart */}
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
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
                            fontSize: '11px',
                          }}
                          formatter={(value: number, name: string) => [
                            `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                            name,
                          ]}
                          labelFormatter={formatDate}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="benchmark" name="SPY (Benchmark)"
                          stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                        <Line type="monotone" dataKey="primary" name={primaryName}
                          stroke={primaryColor} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="compare" name={compareDef?.name || ''}
                          stroke={compareColor} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Metrics table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-muted-foreground font-normal pb-2">Metric</th>
                          <th className="text-right pb-2" style={{ color: primaryColor }}>{primaryName}</th>
                          <th className="text-right pb-2" style={{ color: compareColor }}>{compareDef?.name}</th>
                          <th className="text-right text-muted-foreground font-normal pb-2">SPY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          {
                            label: 'Total Return',
                            a: `${primaryResult.totalReturn >= 0 ? '+' : ''}${primaryResult.totalReturn.toFixed(1)}%`,
                            b: `${compareResult.totalReturn >= 0 ? '+' : ''}${compareResult.totalReturn.toFixed(1)}%`,
                            spy: `${(((primaryResult.benchmarkValues[primaryResult.benchmarkValues.length - 1] - 10000) / 10000) * 100).toFixed(1)}%`,
                          },
                          {
                            label: 'CAGR',
                            a: `${primaryResult.cagr >= 0 ? '+' : ''}${primaryResult.cagr.toFixed(1)}%`,
                            b: `${compareResult.cagr >= 0 ? '+' : ''}${compareResult.cagr.toFixed(1)}%`,
                            spy: '—',
                          },
                          {
                            label: 'Volatility',
                            a: `${primaryResult.volatility.toFixed(1)}%`,
                            b: `${compareResult.volatility.toFixed(1)}%`,
                            spy: '—',
                          },
                          {
                            label: 'Max Drawdown',
                            a: `${primaryResult.maxDrawdown.toFixed(1)}%`,
                            b: `${compareResult.maxDrawdown.toFixed(1)}%`,
                            spy: '—',
                          },
                          {
                            label: 'Sharpe Ratio',
                            a: primaryResult.sharpeRatio.toFixed(2),
                            b: compareResult.sharpeRatio.toFixed(2),
                            spy: '—',
                          },
                        ].map(row => (
                          <tr key={row.label}>
                            <td className="py-2 text-muted-foreground">{row.label}</td>
                            <td className="py-2 text-right font-mono font-medium text-foreground">{row.a}</td>
                            <td className="py-2 text-right font-mono font-medium text-foreground">{row.b}</td>
                            <td className="py-2 text-right font-mono text-muted-foreground">{row.spy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StrategyCompare;
