import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Play, Loader2, Brain, RefreshCw, Info, Layers, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import ReactMarkdown from "react-markdown";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import MetricsPanel from "./MetricsPanel";
import StrategyChart from "./StrategyChart";
import { ASSET_UNIVERSE, ASSET_CATEGORIES, MAX_PORTFOLIO_ASSETS, CORRELATION_WARNINGS, TAG_STYLES, type PortfolioAsset } from "@/data/portfolio-assets";
import { useMultiTickerData, computeCustomBacktest, type SelectedAsset, type RebalanceFrequency } from "@/hooks/useCustomBacktest";
import { computeCustomRadarScores } from "./CustomRadarScoring";
import type { BacktestResult } from "@/hooks/useStrategyBacktest";
import type { TimePeriod } from "@/data/time-periods";
import { DEFAULT_PERIOD } from "@/data/time-periods";

// ── Preset Templates ───────────────────────────────────────────────────────

const PRESET_TEMPLATES: { name: string; icon: string; assets: SelectedAsset[] }[] = [
  {
    name: 'Classic 60/40',
    icon: '⚖️',
    assets: [
      { ticker: 'SPY', weight: 60 },
      { ticker: 'AGG', weight: 40 },
    ],
  },
  {
    name: 'AI Growth',
    icon: '🚀',
    assets: [
      { ticker: 'QQQ', weight: 35 },
      { ticker: 'NVDA', weight: 25 },
      { ticker: 'AMZN', weight: 20 },
      { ticker: 'GOOGL', weight: 20 },
    ],
  },
  {
    name: 'Defensive',
    icon: '🛡️',
    assets: [
      { ticker: 'AGG', weight: 35 },
      { ticker: 'TLT', weight: 20 },
      { ticker: 'GLD', weight: 20 },
      { ticker: 'JNJ', weight: 15 },
      { ticker: 'KO', weight: 10 },
    ],
  },
  {
    name: 'Global Mix',
    icon: '🌍',
    assets: [
      { ticker: 'SPY', weight: 30 },
      { ticker: 'EFA', weight: 20 },
      { ticker: 'IWM', weight: 15 },
      { ticker: 'AGG', weight: 20 },
      { ticker: 'GLD', weight: 15 },
    ],
  },
  {
    name: 'Value & Income',
    icon: '💰',
    assets: [
      { ticker: 'BRKB', weight: 30 },
      { ticker: 'VNQ', weight: 25 },
      { ticker: 'HYG', weight: 20 },
      { ticker: 'XOM', weight: 15 },
      { ticker: 'NEE', weight: 10 },
    ],
  },
];


const CustomPortfolioBuilder = ({ period = DEFAULT_PERIOD }: { period?: TimePeriod }) => {
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [rebalanceFreq, setRebalanceFreq] = useState<RebalanceFrequency>('monthly');

  const tickersToFetch = useMemo(() => selectedAssets.map(a => a.ticker), [selectedAssets]);

  const { data: priceData, isLoading: isLoadingData } = useMultiTickerData(
    tickersToFetch,
    period,
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
    const result = computeCustomBacktest(selectedAssets, priceData, period.riskFreeAnnual, rebalanceFreq);
    setBacktestResult(result);
    setHasRun(true);
  }, [priceData, selectedAssets, period, rebalanceFreq]);

  const totalWeight = selectedAssets.reduce((s, a) => s + a.weight, 0);
  const isValid = selectedAssets.length > 0 && totalWeight === 100;

  // Detect correlated asset groups in the current selection
  const correlationWarnings = useMemo(() => {
    const groupCounts: Record<string, string[]> = {};
    selectedAssets.forEach(a => {
      const info = ASSET_UNIVERSE.find(u => u.ticker === a.ticker);
      if (!info) return;
      if (!groupCounts[info.correlationGroup]) groupCounts[info.correlationGroup] = [];
      groupCounts[info.correlationGroup].push(a.ticker);
    });
    return Object.entries(groupCounts)
      .filter(([group, tickers]) => tickers.length >= 2 && CORRELATION_WARNINGS[group])
      .map(([group, tickers]) => ({ group, tickers, message: CORRELATION_WARNINGS[group] }));
  }, [selectedAssets]);

  const loadPreset = useCallback((preset: typeof PRESET_TEMPLATES[number]) => {
    setSelectedAssets(preset.assets);
    setHasRun(false);
  }, []);

  return (
    <div className="space-y-5">
      {/* Preset Templates */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Start from a Preset</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_TEMPLATES.map(preset => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="flex flex-col items-start rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-left hover:border-muted-foreground/40 hover:bg-accent transition-all"
            >
              <span className="text-base mb-1">{preset.icon}</span>
              <span className="text-xs font-medium text-foreground">{preset.name}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {preset.assets.map(a => `${a.ticker} ${a.weight}%`).join(' · ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Asset Selection */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Customize Assets <span className="text-muted-foreground">({selectedAssets.length}/{MAX_PORTFOLIO_ASSETS})</span>
        </h3>
        <div className="space-y-5">
          {ASSET_CATEGORIES.map(cat => {
            const assets = ASSET_UNIVERSE.filter(a => a.category === cat.key);
            return (
              <div key={cat.key}>
                <p className="text-xs text-muted-foreground mb-2">{cat.icon} {cat.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assets.map(asset => {
                    const isSelected = selectedAssets.some(a => a.ticker === asset.ticker);
                    const isFull = selectedAssets.length >= MAX_PORTFOLIO_ASSETS && !isSelected;
                    return (
                      <button
                        key={asset.ticker}
                        onClick={() => isSelected ? removeAsset(asset.ticker) : addAsset(asset.ticker)}
                        disabled={isFull}
                        className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : isFull
                              ? 'border-border bg-muted opacity-50 cursor-not-allowed'
                              : 'border-border bg-card hover:border-muted-foreground/40 hover:bg-secondary/50'
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: asset.color }} />
                            <span className="text-xs font-mono font-bold text-foreground">{asset.ticker}</span>
                            <span className="text-xs text-muted-foreground">{asset.name}</span>
                          </div>
                          {isSelected
                            ? <X className="h-3 w-3 text-primary shrink-0" />
                            : <Plus className="h-3 w-3 text-muted-foreground shrink-0" />
                          }
                        </div>
                        {/* Description */}
                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                          {asset.description}
                        </p>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {asset.tags.map(tag => (
                            <span
                              key={tag}
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_STYLES[tag]}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Correlation Warning */}
      <AnimatePresence>
        {correlationWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            {correlationWarnings.map(w => (
              <div key={w.group} className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-500 mb-0.5">
                    High Correlation: {w.tickers.join(' + ')}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.message}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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

            {/* Rebalancing toggle — cards are the buttons */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">Rebalancing Strategy</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Card A */}
                <button
                  onClick={() => { setRebalanceFreq('monthly'); setHasRun(false); }}
                  className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                    rebalanceFreq === 'monthly'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                      : 'border-border bg-secondary/40 hover:border-muted-foreground/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <p className="text-xs font-semibold text-foreground">📅 Rebalance Monthly</p>
                    {rebalanceFreq === 'monthly' && (
                      <span className="text-[10px] font-medium text-primary">Selected</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sell a bit of what grew, buy more of what lagged — restoring your target weights every month.
                    Automatically "sell high, buy low." Works best in volatile or range-bound markets.
                  </p>
                </button>

                {/* Card B */}
                <button
                  onClick={() => { setRebalanceFreq('none'); setHasRun(false); }}
                  className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                    rebalanceFreq === 'none'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                      : 'border-border bg-secondary/40 hover:border-muted-foreground/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <p className="text-xs font-semibold text-foreground">📌 Buy-and-Hold</p>
                    {rebalanceFreq === 'none' && (
                      <span className="text-[10px] font-medium text-primary">Selected</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Buy once, never adjust. Winners compound freely without being trimmed.
                    Simpler, and often outperforms rebalancing in a strong one-directional bull market.
                  </p>
                </button>
              </div>

              {/* Context note */}
              <p className="text-[11px] text-muted-foreground">
                The chart always shows <span className="font-medium text-foreground">both lines</span> — your chosen strategy vs buy-and-hold — so you can directly compare whether rebalancing helped or hurt in that period.
              </p>
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
              benchmarkLabel="Buy-and-Hold (no rebalancing)"
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
              This simulation uses historical data from Yahoo Finance ({period.subtitle}) and is for educational purposes only.
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
