import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Play, Loader2, Brain, RefreshCw, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import ReactMarkdown from "react-markdown";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import MetricsPanel from "./MetricsPanel";
import StrategyChart from "./StrategyChart";
import { ASSET_UNIVERSE, ASSET_CATEGORIES, MAX_PORTFOLIO_ASSETS, type PortfolioAsset } from "@/data/portfolio-assets";
import { useMultiTickerData, computeCustomBacktest, type SelectedAsset } from "@/hooks/useCustomBacktest";
import { computeCustomRadarScores } from "./CustomRadarScoring";
import type { BacktestResult } from "@/hooks/useStrategyBacktest";

const CustomPortfolioBuilder = () => {
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [hasRun, setHasRun] = useState(false);

  // Always include SPY for benchmark
  const tickersToFetch = useMemo(() => {
    const tickers = selectedAssets.map(a => a.ticker);
    if (!tickers.includes('SPY')) tickers.push('SPY');
    return tickers;
  }, [selectedAssets]);

  const { data: priceData, isLoading: isLoadingData } = useMultiTickerData(
    tickersToFetch.length > 1 || (tickersToFetch.length === 1 && selectedAssets.length > 0) ? tickersToFetch : []
  );

  // Add asset
  const addAsset = useCallback((ticker: string) => {
    if (selectedAssets.length >= MAX_PORTFOLIO_ASSETS) return;
    if (selectedAssets.some(a => a.ticker === ticker)) return;

    const newAssets = [...selectedAssets, { ticker, weight: 0 }];
    // Distribute weights equally
    const equalWeight = Math.floor(100 / newAssets.length);
    const adjusted = newAssets.map((a, i) => ({
      ...a,
      weight: i === newAssets.length - 1 ? 100 - equalWeight * (newAssets.length - 1) : equalWeight,
    }));
    setSelectedAssets(adjusted);
    setHasRun(false);
  }, [selectedAssets]);

  // Remove asset
  const removeAsset = useCallback((ticker: string) => {
    const remaining = selectedAssets.filter(a => a.ticker !== ticker);
    if (remaining.length === 0) {
      setSelectedAssets([]);
    } else {
      const equalWeight = Math.floor(100 / remaining.length);
      const adjusted = remaining.map((a, i) => ({
        ...a,
        weight: i === remaining.length - 1 ? 100 - equalWeight * (remaining.length - 1) : equalWeight,
      }));
      setSelectedAssets(adjusted);
    }
    setHasRun(false);
  }, [selectedAssets]);

  // Change weight with auto-normalization
  const changeWeight = useCallback((ticker: string, newWeight: number) => {
    const idx = selectedAssets.findIndex(a => a.ticker === ticker);
    if (idx === -1) return;

    const others = selectedAssets.filter(a => a.ticker !== ticker);
    const othersTotal = others.reduce((s, a) => s + a.weight, 0);
    const remaining = 100 - newWeight;

    let updated: SelectedAsset[];
    if (othersTotal === 0 || others.length === 0) {
      updated = selectedAssets.map(a => a.ticker === ticker ? { ...a, weight: 100 } : a);
    } else {
      const scale = remaining / othersTotal;
      updated = selectedAssets.map(a => {
        if (a.ticker === ticker) return { ...a, weight: Math.round(newWeight) };
        return { ...a, weight: Math.max(0, Math.round(a.weight * scale)) };
      });
      // Fix rounding
      const total = updated.reduce((s, a) => s + a.weight, 0);
      if (total !== 100 && updated.length > 0) {
        const last = updated.find(a => a.ticker !== ticker);
        if (last) last.weight += 100 - total;
      }
    }
    setSelectedAssets(updated);
    setHasRun(false);
  }, [selectedAssets]);

  // Run backtest
  const runBacktest = useCallback(() => {
    if (!priceData || selectedAssets.length === 0) return;
    const result = computeCustomBacktest(selectedAssets, priceData);
    setBacktestResult(result);
    setHasRun(true);
  }, [priceData, selectedAssets]);

  const totalWeight = selectedAssets.reduce((s, a) => s + a.weight, 0);
  const isValid = selectedAssets.length > 0 && totalWeight === 100;

  return (
    <div className="space-y-5">
      {/* Asset Selection */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Select Assets <span className="text-muted-foreground">({selectedAssets.length}/{MAX_PORTFOLIO_ASSETS})</span>
        </h3>
        <div className="space-y-4">
          {ASSET_CATEGORIES.map(cat => {
            const assets = ASSET_UNIVERSE.filter(a => a.category === cat.key);
            return (
              <div key={cat.key}>
                <p className="text-xs text-muted-foreground mb-2">{cat.icon} {cat.label}</p>
                <div className="flex flex-wrap gap-2">
                  {assets.map(asset => {
                    const isSelected = selectedAssets.some(a => a.ticker === asset.ticker);
                    const isFull = selectedAssets.length >= MAX_PORTFOLIO_ASSETS && !isSelected;
                    return (
                      <button
                        key={asset.ticker}
                        onClick={() => isSelected ? removeAsset(asset.ticker) : addAsset(asset.ticker)}
                        disabled={isFull}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-foreground'
                            : isFull
                              ? 'border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                              : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        <span className="font-mono font-medium">{asset.ticker}</span>
                        <span className="hidden sm:inline">{asset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weight Sliders */}
      <AnimatePresence>
        {selectedAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-border bg-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Allocate Weights</h3>
              <span className={`text-xs font-mono ${totalWeight === 100 ? 'text-teal' : 'text-destructive'}`}>
                {totalWeight}% / 100%
              </span>
            </div>

            {selectedAssets.map(asset => {
              const info = ASSET_UNIVERSE.find(a => a.ticker === asset.ticker);
              return (
                <div key={asset.ticker} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: info?.color }} />
                      <span className="text-xs font-mono font-medium text-foreground">{asset.ticker}</span>
                      <span className="text-xs text-muted-foreground">{info?.name}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{asset.weight}%</span>
                  </div>
                  <Slider
                    value={[asset.weight]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([v]) => changeWeight(asset.ticker, v)}
                  />
                </div>
              );
            })}

            {/* Allocation Bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-secondary">
              {selectedAssets.map(asset => {
                const info = ASSET_UNIVERSE.find(a => a.ticker === asset.ticker);
                return (
                  <div
                    key={asset.ticker}
                    className="h-full transition-all duration-300"
                    style={{ width: `${asset.weight}%`, backgroundColor: info?.color }}
                  />
                );
              })}
            </div>

            {/* Run button */}
            <button
              onClick={runBacktest}
              disabled={!isValid || isLoadingData}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingData ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading market data...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Backtest
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {hasRun && backtestResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <MetricsPanel result={backtestResult} />

            <StrategyChart
              result={backtestResult}
              strategyColor="hsl(var(--primary))"
              showSignals={false}
            />

            {/* Custom Radar + AI Evaluation */}
            <CustomEvaluation
              result={backtestResult}
              assets={selectedAssets}
            />

            {/* Learning takeaway */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-secondary/50 p-5"
            >
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Key Takeaway</p>
                  <p className="text-sm text-muted-foreground italic">
                    "Building a diversified portfolio across different sectors and asset classes helps reduce risk without necessarily sacrificing returns."
                  </p>
                </div>
              </div>
            </motion.div>

            <p className="text-[10px] text-muted-foreground text-center">
              This simulation uses historical data from Yahoo Finance (2021–2023) and is for educational purposes only.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Custom Evaluation (Radar + AI) ─────────────────────────────────────────

function CustomEvaluation({ result, assets }: { result: BacktestResult; assets: SelectedAsset[] }) {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const radarScores = useMemo(
    () => computeCustomRadarScores(result, assets, ASSET_UNIVERSE),
    [result, assets],
  );

  const avg = useMemo(
    () => (radarScores.reduce((s, d) => s + d.score, 0) / radarScores.length).toFixed(1),
    [radarScores],
  );

  const fetchEvaluation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const assetDetails = assets.map(a => {
        const info = ASSET_UNIVERSE.find(u => u.ticker === a.ticker);
        return `${a.ticker} (${info?.name}, ${info?.sector}) — ${a.weight}%`;
      });

      const response = await supabase.functions.invoke('sandbox-evaluate', {
        body: {
          strategyName: 'Custom Portfolio',
          param: assetDetails.join(', '),
          assets: assets.map(a => ({ ticker: a.ticker, weight: a.weight })),
          metrics: {
            totalReturn: result.totalReturn.toFixed(1),
            cagr: result.cagr.toFixed(1),
            volatility: result.volatility.toFixed(1),
            maxDrawdown: result.maxDrawdown.toFixed(1),
            worstQuarter: result.worstQuarter.toFixed(1),
            sharpe: result.sharpeRatio.toFixed(2),
          },
          radarScores: radarScores.reduce((acc, s) => {
            acc[s.dimension] = s.score;
            return acc;
          }, {} as Record<string, number>),
        },
      });

      if (response.error) throw new Error(response.error.message);
      setFeedback(response.data?.evaluation || 'No evaluation available.');
    } catch (err: any) {
      if (err.message?.includes('429')) setError('Rate limit reached. Try again in a moment.');
      else if (err.message?.includes('402')) setError('AI credits exhausted.');
      else setError('Unable to generate evaluation.');
    } finally {
      setIsLoading(false);
    }
  }, [result, assets, radarScores]);

  // Auto-fetch on mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchEvaluation();
    }
  }, [fetchEvaluation]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="font-serif text-lg text-foreground">Portfolio Evaluation</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground">Portfolio Profile</h3>
            <span className="text-xs font-mono text-muted-foreground">Avg Score: {avg}/10</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarScores}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} tickCount={6} />
              <Radar name="Portfolio" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3">
            {radarScores.map((s) => (
              <div key={s.dimension} className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1">
                <span className="text-[10px] text-muted-foreground">{s.dimension}</span>
                <span className={`text-[11px] font-mono font-bold ${s.score >= 7 ? 'text-teal' : s.score >= 4 ? 'text-foreground' : 'text-destructive'}`}>
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Feedback */}
        <div className="rounded-xl border border-border bg-card p-5 min-h-[320px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">AI Insights</span>
            <button onClick={fetchEvaluation} disabled={isLoading} className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isLoading && !feedback && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 py-8 text-sm text-muted-foreground justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" /> Evaluating portfolio...
                </motion.div>
              )}
              {error && !feedback && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error} <button onClick={fetchEvaluation} className="ml-2 underline hover:no-underline">Retry</button>
                </motion.div>
              )}
              {feedback && (
                <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`prose prose-sm max-w-none ${isLoading ? 'opacity-50' : ''}`}>
                  <ReactMarkdown components={{
                    p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
                    strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
                    ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4 mb-2">{children}</ul>,
                    h3: ({ children }) => <h4 className="text-xs font-semibold text-foreground mt-3 mb-1 uppercase tracking-wide">{children}</h4>,
                  }}>
                    {feedback}
                  </ReactMarkdown>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CustomPortfolioBuilder;
