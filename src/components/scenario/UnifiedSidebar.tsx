import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Plus, X, DollarSign, TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Slider } from "@/components/ui/slider";
import { dotcomStocks, industries, type DotComStock } from "@/data/dotcom-stocks";
import type { PricePoint } from "@/hooks/useMarketData";
import type { Position } from "@/hooks/useScenarioSimulation";

interface Props {
  isDotCom: boolean;
  availableTickers: string[];
  positions: Position[];
  cashWeight: number;
  marketData: Record<string, PricePoint[]> | undefined;
  currentDate: string;
  onUpdatePosition: (ticker: string, weight: number) => void;
}

const UnifiedSidebar = ({
  isDotCom,
  availableTickers,
  positions,
  cashWeight,
  marketData,
  currentDate,
  onUpdatePosition,
}: Props) => {
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null);
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'universe'>('portfolio');

  const totalAllocated = positions.reduce((s, p) => s + p.weight, 0);

  const getTickerPrice = (ticker: string): number => {
    const data = marketData?.[ticker];
    if (!data) return 0;
    let closest = data[0];
    for (const p of data) {
      if (p.date <= currentDate) closest = p;
      else break;
    }
    return closest?.close || 0;
  };

  const getTickerReturn = (ticker: string, entryPrice?: number): number => {
    const currentPrice = getTickerPrice(ticker);
    const base = entryPrice || (marketData?.[ticker]?.[0]?.close || 0);
    if (base <= 0) return 0;
    return ((currentPrice - base) / base) * 100;
  };

  const getSparkData = (ticker: string) => {
    const data = marketData?.[ticker];
    if (!data) return [];
    const visible = data.filter(d => d.date <= currentDate);
    const step = Math.max(1, Math.floor(visible.length / 25));
    return visible.filter((_, i) => i % step === 0).map(d => ({ v: d.close }));
  };

  const getAvgVolume = (ticker: string) => {
    const data = marketData?.[ticker];
    if (!data) return 0;
    const visible = data.filter(d => d.date <= currentDate);
    const recent = visible.slice(-20);
    return recent.reduce((s, d) => s + d.volume, 0) / Math.max(recent.length, 1);
  };

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return v.toFixed(0);
  };

  const stocksForUniverse = useMemo(() => {
    if (isDotCom) {
      const list = filterIndustry
        ? dotcomStocks.filter(s => s.industry === filterIndustry)
        : dotcomStocks;
      return list;
    }
    return null;
  }, [isDotCom, filterIndustry]);

  const unusedTickers = availableTickers.filter(t => !positions.find(p => p.ticker === t));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col max-h-[680px]">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'portfolio' ? 'text-foreground bg-secondary/50' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Portfolio ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab('universe')}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'universe' ? 'text-foreground bg-secondary/50' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Stock Universe
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          {activeTab === 'portfolio' ? (
            <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Allocation bar */}
              <div className="mb-3">
                <div className="flex h-2.5 rounded-full overflow-hidden bg-secondary">
                  {positions.map((pos, i) => (
                    <div
                      key={pos.ticker}
                      className="h-full transition-all"
                      style={{
                        width: `${pos.weight}%`,
                        backgroundColor: `hsl(${(i * 47 + 180) % 360} 50% 45%)`,
                      }}
                    />
                  ))}
                  <div className="h-full bg-muted-foreground/15" style={{ width: `${cashWeight}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>Invested: {totalAllocated.toFixed(0)}%</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-2.5 w-2.5" />
                    Cash: {cashWeight.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Positions */}
              <div className="space-y-2">
                {positions.map((pos, i) => {
                  const pnl = getTickerReturn(pos.ticker, pos.entryPrice);
                  const maxWeight = Math.min(100, pos.weight + cashWeight);
                  const sparkData = getSparkData(pos.ticker);

                  return (
                    <motion.div
                      key={pos.ticker}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border border-border p-2.5"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: `hsl(${(i * 47 + 180) % 360} 50% 45%)` }}
                          />
                          <span className="text-xs font-mono font-bold text-foreground">{pos.ticker}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono ${pnl >= 0 ? 'text-teal' : 'text-destructive'}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                          </span>
                          <button onClick={() => onUpdatePosition(pos.ticker, 0)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Mini sparkline */}
                      <div className="h-6 w-full mb-1.5">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparkData}>
                            <YAxis domain={['dataMin', 'dataMax']} hide />
                            <Line type="monotone" dataKey="v" stroke={pnl >= 0 ? 'hsl(var(--teal))' : 'hsl(var(--destructive))'} strokeWidth={1} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex items-center gap-2">
                        <Slider
                          value={[pos.weight]}
                          min={1}
                          max={maxWeight}
                          step={1}
                          onValueChange={([v]) => onUpdatePosition(pos.ticker, v)}
                          className="flex-1"
                        />
                        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{pos.weight}%</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {positions.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Switch to Stock Universe to add positions
                </div>
              )}

              {/* Quick add for non-dotcom */}
              {!isDotCom && unusedTickers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground mb-2">Quick Add</p>
                  <div className="flex flex-wrap gap-1">
                    {unusedTickers.slice(0, 8).map(ticker => (
                      <button
                        key={ticker}
                        onClick={() => onUpdatePosition(ticker, Math.min(10, 100 - totalAllocated))}
                        disabled={totalAllocated >= 100}
                        className="px-2 py-1 text-[10px] rounded-md bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                      >
                        <Plus className="h-2.5 w-2.5 inline mr-0.5" />{ticker}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="universe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Industry filters (dot-com) */}
              {isDotCom && (
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <Filter className="h-3 w-3 text-muted-foreground" />
                  <button
                    onClick={() => setFilterIndustry(null)}
                    className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                      !filterIndustry ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    All
                  </button>
                  {industries.map(ind => (
                    <button
                      key={ind}
                      onClick={() => setFilterIndustry(ind === filterIndustry ? null : ind)}
                      className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                        filterIndustry === ind ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              )}

              {/* Stock tiles */}
              <div className="space-y-1.5">
                {(isDotCom ? (stocksForUniverse || []) : unusedTickers.map(t => ({ ticker: t }))).map((item) => {
                  const ticker = 'ticker' in item ? item.ticker : (item as any);
                  const stock = isDotCom ? (item as DotComStock) : null;
                  const inPortfolio = positions.some(p => p.ticker === ticker);
                  const returnPct = getTickerReturn(ticker);
                  const isPositive = returnPct >= 0;
                  const sparkData = getSparkData(ticker);
                  const isHovered = hoveredTicker === ticker;

                  return (
                    <motion.div
                      key={ticker}
                      layout
                      onMouseEnter={() => setHoveredTicker(ticker)}
                      onMouseLeave={() => setHoveredTicker(null)}
                      className={`relative rounded-lg border p-2.5 transition-all cursor-pointer ${
                        inPortfolio ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-muted-foreground/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground">{ticker}</span>
                          {stock && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                              {stock.industry}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-foreground">${getTickerPrice(ticker).toFixed(2)}</span>
                          <span className={`text-[10px] font-mono ${isPositive ? 'text-teal' : 'text-destructive'}`}>
                            {isPositive ? '+' : ''}{returnPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Sparkline row */}
                      <div className="h-6 w-full mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparkData}>
                            <YAxis domain={['dataMin', 'dataMax']} hide />
                            <Line type="monotone" dataKey="v" stroke={isPositive ? 'hsl(var(--teal))' : 'hsl(var(--destructive))'} strokeWidth={1} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Hover details */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className="grid grid-cols-3 gap-1.5 text-[9px] mb-2">
                                {stock && (
                                  <>
                                    <div>
                                      <span className="text-muted-foreground block">Peak Return</span>
                                      <span className="text-foreground font-medium">+{stock.peakReturn}%</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Peak P/S</span>
                                      <span className="text-foreground font-medium">{stock.peakPSRatio}x</span>
                                    </div>
                                  </>
                                )}
                                <div>
                                  <span className="text-muted-foreground block">Avg Volume</span>
                                  <span className="text-foreground font-medium">{formatVolume(getAvgVolume(ticker))}</span>
                                </div>
                              </div>

                              {/* Buy/Sell actions */}
                              <div className="flex gap-1.5">
                                {!inPortfolio ? (
                                  <button
                                    onClick={() => onUpdatePosition(ticker, Math.min(10, 100 - totalAllocated))}
                                    disabled={totalAllocated >= 100}
                                    className="flex-1 rounded-md bg-teal/10 border border-teal/20 text-teal text-[10px] font-medium py-1.5 hover:bg-teal/20 transition-colors disabled:opacity-30"
                                  >
                                    <Plus className="h-2.5 w-2.5 inline mr-0.5" />Buy 10%
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onUpdatePosition(ticker, 0)}
                                    className="flex-1 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-medium py-1.5 hover:bg-destructive/20 transition-colors"
                                  >
                                    <X className="h-2.5 w-2.5 inline mr-0.5" />Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {inPortfolio && (
                        <div className="mt-1 text-center text-[9px] font-medium text-primary">
                          In portfolio: {positions.find(p => p.ticker === ticker)?.weight}%
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnifiedSidebar;
