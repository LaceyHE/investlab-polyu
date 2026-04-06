import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Plus, X, DollarSign, Briefcase, LayoutGrid } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dotcomStocks, industries, type DotComStock } from "@/data/dotcom-stocks";
import type { PricePoint } from "@/hooks/useMarketData";
import type { Position } from "@/hooks/useScenarioSimulation";

interface DotComSidePanelProps {
  positions: Position[];
  cashWeight: number;
  marketData: Record<string, PricePoint[]> | undefined;
  currentDate: string;
  onUpdatePosition: (ticker: string, weight: number) => void;
}

const DotComSidePanel = ({
  positions,
  cashWeight,
  marketData,
  currentDate,
  onUpdatePosition,
}: DotComSidePanelProps) => {
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null);
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

  const getTickerReturn = (pos: Position): number => {
    const currentPrice = getTickerPrice(pos.ticker);
    if (pos.entryPrice <= 0) return 0;
    return ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
  };

  const sectorExposure = useMemo(() => {
    const map: Record<string, number> = {};
    positions.forEach(pos => {
      const stock = dotcomStocks.find(s => s.ticker === pos.ticker);
      if (stock) {
        map[stock.industry] = (map[stock.industry] || 0) + pos.weight;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [positions]);

  const filteredStocks = useMemo(() => {
    if (!filterIndustry) return dotcomStocks;
    return dotcomStocks.filter(s => s.industry === filterIndustry);
  }, [filterIndustry]);

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col h-full min-h-0 overflow-hidden">
      {/* Always-visible allocation bar */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
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
          <div className="h-full bg-muted-foreground/20" style={{ width: `${cashWeight}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Invested: {totalAllocated.toFixed(0)}%</span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Cash: {cashWeight.toFixed(0)}%
          </span>
        </div>
      </div>

      <Tabs defaultValue="universe" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 grid grid-cols-2 flex-shrink-0">
          <TabsTrigger value="universe" className="text-xs gap-1.5">
            <LayoutGrid className="h-3 w-3" />
            Stocks
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs gap-1.5">
            <Briefcase className="h-3 w-3" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 relative">
          {/* Stock Universe Tab */}
          <TabsContent value="universe" className="absolute inset-0 overflow-y-auto px-4 pb-4">
            {/* Sticky industry filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap mb-3 mt-1 sticky top-0 bg-card z-10 py-1">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <button
                onClick={() => setFilterIndustry(null)}
                className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                  !filterIndustry ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {industries.map(ind => (
                <button
                  key={ind}
                  onClick={() => setFilterIndustry(ind === filterIndustry ? null : ind)}
                  className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                    filterIndustry === ind ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredStocks.map(stock => (
                <StockUniverseTile
                  key={stock.ticker}
                  stock={stock}
                  marketData={marketData?.[stock.ticker]}
                  currentDate={currentDate}
                  positionWeight={positions.find(p => p.ticker === stock.ticker)?.weight || 0}
                  canBuy={totalAllocated < 100}
                  onBuy={() => onUpdatePosition(stock.ticker, Math.min(10, 100 - totalAllocated))}
                />
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="absolute inset-0 overflow-y-auto px-4 pb-4">
              {/* Sector exposure bar */}
              {sectorExposure.length > 0 && (
                <div className="mb-3 mt-1">
                  <p className="text-[10px] text-muted-foreground mb-1.5">Sector Exposure</p>
                  <div className="space-y-1">
                    {sectorExposure.map(([sector, weight]) => (
                      <div key={sector} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-20 truncate">{sector}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${(weight / Math.max(totalAllocated, 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{weight.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Position cards */}
              <div className="space-y-2">
                {positions.map((pos, i) => {
                  const pnl = getTickerReturn(pos);
                  const maxWeight = Math.min(100, pos.weight + cashWeight);
                  const stock = dotcomStocks.find(s => s.ticker === pos.ticker);

                  return (
                    <motion.div
                      key={pos.ticker}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: `hsl(${(i * 47 + 180) % 360} 50% 45%)` }}
                          />
                          <span className="text-sm font-medium text-foreground">{pos.ticker}</span>
                          {stock && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">
                              {stock.industry}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono ${pnl >= 0 ? 'text-teal' : 'text-destructive'}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                          </span>
                          <button
                            onClick={() => onUpdatePosition(pos.ticker, 0)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[pos.weight]}
                          min={1}
                          max={maxWeight}
                          step={1}
                          onValueChange={([v]) => onUpdatePosition(pos.ticker, v)}
                          className="flex-1"
                        />
                        <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                          {pos.weight}%
                        </span>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>${getTickerPrice(pos.ticker).toFixed(2)}</span>
                        <span>Entry: ${pos.entryPrice.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {positions.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Switch to Stocks tab to add positions
                </div>
              )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Compact stock tile for sidebar
const StockUniverseTile = ({
  stock,
  marketData,
  currentDate,
  positionWeight,
  canBuy,
  onBuy,
}: {
  stock: DotComStock;
  marketData: PricePoint[] | undefined;
  currentDate: string;
  positionWeight: number;
  canBuy: boolean;
  onBuy: () => void;
}) => {
  const visibleData = useMemo(() => {
    if (!marketData) return [];
    return marketData.filter(d => d.date <= currentDate);
  }, [marketData, currentDate]);

  const currentPrice = visibleData.length > 0 ? visibleData[visibleData.length - 1].close : 0;
  const startPrice = visibleData.length > 0 ? visibleData[0].close : 0;
  const returnPct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
  const isPositive = returnPct >= 0;

  const sparkData = useMemo(() => {
    if (visibleData.length === 0) return [];
    const step = Math.max(1, Math.floor(visibleData.length / 20));
    return visibleData.filter((_, i) => i % step === 0).map(d => ({ v: d.close }));
  }, [visibleData]);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`rounded-lg border p-2.5 transition-all ${
              positionWeight > 0 ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-foreground text-xs">{stock.ticker}</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">
                  {stock.industry}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono ${isPositive ? 'text-teal' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{returnPct.toFixed(1)}%
                </span>
                {positionWeight === 0 ? (
                  <button
                    onClick={onBuy}
                    disabled={!canBuy}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-30"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="text-[9px] font-mono text-primary">{positionWeight}%</span>
                )}
              </div>
            </div>
            {/* Mini sparkline */}
            <div className="h-6 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Line type="monotone" dataKey="v" stroke={isPositive ? 'hsl(var(--teal))' : 'hsl(var(--destructive))'} strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[220px] p-3">
          <p className="font-medium text-xs text-foreground mb-1">{stock.name}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] mb-1.5">
            <div>
              <span className="text-muted-foreground">Peak Return</span>
              <span className="block text-foreground font-medium">+{stock.peakReturn}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Peak P/S</span>
              <span className="block text-foreground font-medium">{stock.peakPSRatio}x</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">{stock.narrative}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DotComSidePanel;
