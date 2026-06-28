import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Slider } from "@/components/ui/slider";
import StrategySelector, { strategies, type StrategyDef } from "@/components/sandbox/StrategySelector";
import StrategyChart from "@/components/sandbox/StrategyChart";
import MetricsPanel from "@/components/sandbox/MetricsPanel";
import PortfolioEvaluation from "@/components/sandbox/PortfolioEvaluation";
import PortfolioRadarChart from "@/components/sandbox/PortfolioRadarChart";
import StrategyEducation, { strategyContent } from "@/components/sandbox/StrategyEducation";
import CustomPortfolioBuilder from "@/components/sandbox/CustomPortfolioBuilder";
import TimePeriodSelector from "@/components/sandbox/TimePeriodSelector";
import StrategyCompare from "@/components/sandbox/StrategyCompare";
import HoldingTimeline from "@/components/sandbox/HoldingTimeline";
import { useMarketPrices, useStrategyBacktest, type StrategyType } from "@/hooks/useStrategyBacktest";
import { computeRadarScores } from "@/components/sandbox/RadarScoring";
import { useUserProgress } from "@/hooks/useUserProgress";
import { DEFAULT_PERIOD, type TimePeriod } from "@/data/time-periods";

// ── Slider config per strategy ──────────────────────────────────────────────

interface SliderConfig {
  label: string;
  leftLabel: string;
  rightLabel: string;
  defaultValue: number;
  formatValue: (v: number) => string;
}

const sliderConfigs: Record<StrategyType, SliderConfig> = {
  allocation: {
    label: 'Stock Allocation',
    leftLabel: '0% Stocks',
    rightLabel: '100% Stocks',
    defaultValue: 0.6,
    formatValue: (v) => `${Math.round(v * 100)}% Stocks / ${Math.round((1 - v) * 100)}% Bonds`,
  },
  trend: {
    label: 'Reaction Speed',
    leftLabel: 'Slow',
    rightLabel: 'Fast',
    defaultValue: 0.5,
    formatValue: (v) => {
      if (v < 0.33) return 'Slow (MA 50/200)';
      if (v < 0.66) return 'Medium (MA 20/60)';
      return 'Fast (MA 10/30)';
    },
  },
  income: {
    label: 'Income vs Growth',
    leftLabel: 'All Growth',
    rightLabel: 'All Income',
    defaultValue: 0.5,
    formatValue: (v) => `${Math.round((1 - v) * 100)}% Growth / ${Math.round(v * 100)}% Income`,
  },
  momentum: {
    label: 'Lookback Period',
    leftLabel: '1 month',
    rightLabel: '6 months',
    defaultValue: 0.5,
    formatValue: (v) => {
      const months = Math.round(1 + v * 5);
      return `${months}-month lookback`;
    },
  },
  custom: {
    label: 'Portfolio',
    leftLabel: '',
    rightLabel: '',
    defaultValue: 0,
    formatValue: () => 'Custom',
  },
};

// ── Main Component ──────────────────────────────────────────────────────────

const Sandbox = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType | null>(null);
  const [params, setParams] = useState<Record<StrategyType, number>>({
    allocation: 0.6,
    trend: 0.5,
    income: 0.5,
    momentum: 0.5,
    custom: 0,
  });
  const [period, setPeriod] = useState<TimePeriod>(DEFAULT_PERIOD);
  const { markComplete } = useUserProgress();
  const trackedStrategy = useRef<string | null>(null);

  const { data: marketData, isLoading } = useMarketPrices(period);

  const currentParam = selectedStrategy ? params[selectedStrategy] : 0;
  const result = useStrategyBacktest(
    selectedStrategy || 'allocation',
    currentParam,
    marketData?.spy,
    marketData?.agg,
    marketData?.qqq,
    marketData?.gld,
    period,
    marketData?.dvy,
    marketData?.dvyPrice,
    marketData?.spyPrice,
    marketData?.dividends,
  );

  const strategyDef = useMemo(
    () => strategies.find(s => s.id === selectedStrategy),
    [selectedStrategy]
  );

  const radarScores = useMemo(
    () => result && selectedStrategy && selectedStrategy !== 'custom'
      ? computeRadarScores(result, selectedStrategy, currentParam)
      : null,
    [result, selectedStrategy, currentParam],
  );

  const sliderConfig = selectedStrategy ? sliderConfigs[selectedStrategy] : null;

  // Track backtest runs
  useEffect(() => {
    if (selectedStrategy && selectedStrategy !== 'custom' && result && trackedStrategy.current !== selectedStrategy) {
      trackedStrategy.current = selectedStrategy;
      markComplete("sandbox_backtest", selectedStrategy, {
        strategy: strategyDef?.name || selectedStrategy,
        param: currentParam,
      });
    }
  }, [selectedStrategy, result, markComplete, strategyDef, currentParam]);

  const handleParamChange = (value: number[]) => {
    if (!selectedStrategy) return;
    setParams(prev => ({ ...prev, [selectedStrategy]: value[0] }));
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl py-8 md:py-14">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Sandbox</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary">
              <FlaskConical className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-foreground">Investment Sandbox</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Experiment · Learn · Understand
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mt-3">
            Explore how different investment strategies behave using real historical data. Adjust parameters with sliders and watch the results update in real time.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedStrategy ? (
            /* Strategy Selection */
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <TimePeriodSelector selected={period} onChange={setPeriod} />
              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">Choose a Strategy</h2>
                <StrategySelector selected={selectedStrategy} onSelect={setSelectedStrategy} />
              </div>
            </motion.div>
          ) : (
            /* Strategy Detail View */
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => setSelectedStrategy(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to strategies
              </button>

              {/* Strategy header */}
              <div className="mb-6 space-y-4">
                {/* Title row */}
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shrink-0"
                    style={{ backgroundColor: `${strategyDef?.color}15` }}
                  >
                    {strategyDef?.icon}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
                      {strategyDef?.subtitle}
                    </p>
                    <h2 className="font-serif text-3xl text-foreground leading-tight">
                      {strategyDef?.name}
                    </h2>
                  </div>
                </div>

                {/* Try this — right below title */}
                {selectedStrategy && selectedStrategy !== 'custom' && strategyContent[selectedStrategy] && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <span className="text-primary text-sm shrink-0 mt-0.5">💡</span>
                    <p className="text-sm text-foreground leading-relaxed">
                      <span className="font-semibold text-primary">Try this: </span>
                      {strategyContent[selectedStrategy].quickTip}
                    </p>
                  </div>
                )}
              </div>

              {/* Custom Portfolio Builder — independent module */}
              {selectedStrategy === 'custom' ? (
                <CustomPortfolioBuilder period={period} />
              ) : isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading market data...</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-5">
                  {/* Period selector in detail view */}
                  <TimePeriodSelector selected={period} onChange={setPeriod} />

                  {/* Slider Control */}
                  {sliderConfig && (
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-foreground">{sliderConfig.label}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {sliderConfig.formatValue(currentParam)}
                        </span>
                      </div>
                      <Slider
                        value={[currentParam]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={handleParamChange}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{sliderConfig.leftLabel}</span>
                        <span>{sliderConfig.rightLabel}</span>
                      </div>
                    </div>
                  )}

                  {/* Chart — moved above metrics */}
                  <StrategyChart
                    result={result}
                    strategyColor={strategyDef?.color || 'hsl(var(--primary))'}
                    showSignals={selectedStrategy === 'trend' || selectedStrategy === 'momentum'}
                    benchmarkLabel={
                      result.benchmarkLabel
                        ?? (selectedStrategy === 'allocation' ? 'Buy-and-Hold (no rebalancing)' : 'Benchmark (SPY)')
                    }
                  />

                  {/* Metrics + Radar side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {/* Left column: metrics + dimension scores */}
                    <div className="flex flex-col gap-4">
                      <MetricsPanel result={result} />
                      {radarScores && (
                        <div className="rounded-xl border border-border bg-card px-5 py-4 flex-1">
                          <p className="text-sm font-semibold text-foreground mb-3">Dimension Scores</p>
                          <div className="flex flex-col gap-2.5">
                            {radarScores.map((s) => (
                              <div key={s.dimension} className="flex items-center justify-between">
                                <span className="text-sm text-foreground">{s.dimension}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        s.score >= 7 ? 'bg-teal' : s.score >= 4 ? 'bg-foreground/50' : 'bg-destructive'
                                      }`}
                                      style={{ width: `${s.score * 10}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-mono font-bold w-6 text-right ${
                                    s.score >= 7 ? 'text-teal' : s.score >= 4 ? 'text-foreground' : 'text-destructive'
                                  }`}>
                                    {s.score}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Right column: radar chart */}
                    <PortfolioRadarChart
                      result={result}
                      strategy={selectedStrategy}
                      param={currentParam}
                      strategyColor={strategyDef?.color}
                    />
                  </div>

                  {/* Holdings Timeline — momentum strategy only */}
                  {selectedStrategy === 'momentum' && result.holdingHistory && result.currentHolding && (
                    <HoldingTimeline
                      currentHolding={result.currentHolding}
                      holdingHistory={result.holdingHistory}
                      startDate={result.dates[0]}
                      endDate={result.dates[result.dates.length - 1]}
                    />
                  )}

                  {/* Portfolio Evaluation: Radar + AI */}
                  <PortfolioEvaluation
                    result={result}
                    strategy={selectedStrategy}
                    strategyName={strategyDef?.name || ''}
                    param={currentParam}
                    paramLabel={sliderConfig?.formatValue(currentParam) || ''}
                  />

                  {/* Strategy Comparison */}
                  {marketData && (
                    <StrategyCompare
                      primaryResult={result}
                      primaryName={strategyDef?.name || selectedStrategy}
                      primaryColor={strategyDef?.color || 'hsl(var(--primary))'}
                      spy={marketData.spy}
                      agg={marketData.agg}
                      qqq={marketData.qqq}
                      gld={marketData.gld}
                      period={period}
                      currentStrategy={selectedStrategy}
                      dvy={marketData.dvy}
                      dvyPrice={marketData.dvyPrice}
                      spyPrice={marketData.spyPrice}
                      dividends={marketData.dividends}
                    />
                  )}

                  {/* Strategy Education */}
                  <StrategyEducation strategy={selectedStrategy} />

                  {/* Transparency note */}
                  <p className="text-[10px] text-muted-foreground text-center">
                    This simulation uses historical data from Yahoo Finance ({period.subtitle}) and is for learning purposes only.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Unable to compute strategy results.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Sandbox;
