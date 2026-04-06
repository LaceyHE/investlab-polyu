import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronRight, ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Slider } from "@/components/ui/slider";
import StrategySelector, { strategies, type StrategyDef } from "@/components/sandbox/StrategySelector";
import StrategyChart from "@/components/sandbox/StrategyChart";
import MetricsPanel from "@/components/sandbox/MetricsPanel";
import PortfolioEvaluation from "@/components/sandbox/PortfolioEvaluation";
import { useMarketPrices, useStrategyBacktest, type StrategyType } from "@/hooks/useStrategyBacktest";

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
    label: 'Investment Horizon',
    leftLabel: 'Short-term',
    rightLabel: 'Long-term',
    defaultValue: 0.5,
    formatValue: (v) => {
      const months = Math.round(1 + v * 11);
      return `${months}-month lookback`;
    },
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
  });

  const { data: marketData, isLoading } = useMarketPrices();

  const currentParam = selectedStrategy ? params[selectedStrategy] : 0;
  const result = useStrategyBacktest(
    selectedStrategy || 'allocation',
    currentParam,
    marketData?.spy,
    marketData?.agg,
  );

  const strategyDef = useMemo(
    () => strategies.find(s => s.id === selectedStrategy),
    [selectedStrategy]
  );

  const sliderConfig = selectedStrategy ? sliderConfigs[selectedStrategy] : null;

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
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-xl text-foreground mb-4">Choose a Strategy</h2>
              <StrategySelector selected={selectedStrategy} onSelect={setSelectedStrategy} />
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
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{strategyDef?.icon}</span>
                <div>
                  <h2 className="font-serif text-2xl text-foreground">{strategyDef?.name}</h2>
                  <p className="text-sm text-muted-foreground">{strategyDef?.subtitle}</p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading market data...</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-5">
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

                  {/* Metrics */}
                  <MetricsPanel result={result} />

                  {/* Chart */}
                  <StrategyChart
                    result={result}
                    strategyColor={strategyDef?.color || 'hsl(var(--primary))'}
                    showSignals={selectedStrategy === 'trend' || selectedStrategy === 'momentum'}
                  />

                  {/* Portfolio Evaluation: Radar + AI */}
                  <PortfolioEvaluation
                    result={result}
                    strategy={selectedStrategy}
                    strategyName={strategyDef?.name || ''}
                    param={currentParam}
                    paramLabel={sliderConfig?.formatValue(currentParam) || ''}
                  />

                  {/* Learning Takeaway */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-secondary/50 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Key Takeaway</p>
                        <p className="text-sm text-muted-foreground italic">"{strategyDef?.takeaway}"</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Transparency note */}
                  <p className="text-[10px] text-muted-foreground text-center">
                    This simulation uses historical data from Yahoo Finance (SPY, AGG, 2021–2023) and is for learning purposes only.
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
