import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { PricePoint } from "@/hooks/useMarketData";
import type { Position } from "@/hooks/useScenarioSimulation";

interface PortfolioBuilderProps {
  availableTickers: string[];
  positions: Position[];
  cashWeight: number;
  marketData: Record<string, PricePoint[]> | undefined;
  currentDate: string;
  onUpdatePosition: (ticker: string, weight: number) => void;
}

const PortfolioBuilder = ({
  availableTickers,
  positions,
  cashWeight,
  marketData,
  currentDate,
  onUpdatePosition,
}: PortfolioBuilderProps) => {
  const [showAddTicker, setShowAddTicker] = useState(false);

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

  const unusedTickers = availableTickers.filter(
    t => !positions.find(p => p.ticker === t)
  );

  const totalAllocated = positions.reduce((s, p) => s + p.weight, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-base text-foreground">Portfolio</h3>
        <button
          onClick={() => setShowAddTicker(!showAddTicker)}
          className="flex items-center gap-1 text-xs text-primary hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {/* Allocation bar */}
      <div className="mb-4">
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
          <div
            className="h-full bg-muted-foreground/20"
            style={{ width: `${cashWeight}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Invested: {totalAllocated.toFixed(0)}%</span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Cash: {cashWeight.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Add ticker dropdown */}
      <AnimatePresence>
        {showAddTicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="grid grid-cols-3 gap-1 p-2 rounded-lg bg-secondary/50">
              {unusedTickers.map(ticker => (
                <button
                  key={ticker}
                  onClick={() => {
                    onUpdatePosition(ticker, Math.min(10, 100 - totalAllocated));
                    setShowAddTicker(false);
                  }}
                  disabled={totalAllocated >= 100}
                  className="px-2 py-1.5 text-xs rounded-lg bg-card hover:bg-accent text-foreground transition-colors disabled:opacity-50"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Position cards */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {positions.map((pos, i) => {
          const pnl = getTickerReturn(pos);
          const maxWeight = Math.min(100, pos.weight + cashWeight);
          
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
        <div className="text-center py-6 text-sm text-muted-foreground">
          Add stocks to build your portfolio
        </div>
      )}
    </div>
  );
};

export default PortfolioBuilder;
