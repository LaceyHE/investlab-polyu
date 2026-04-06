import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import { dotcomStocks, industries, type DotComStock } from "@/data/dotcom-stocks";
import type { PricePoint } from "@/hooks/useMarketData";
import type { Position } from "@/hooks/useScenarioSimulation";
import DotComStockTile from "./DotComStockTile";

interface Props {
  marketData: Record<string, PricePoint[]> | undefined;
  currentDate: string;
  positions: Position[];
  cashWeight: number;
  onUpdatePosition: (ticker: string, weight: number) => void;
}

const DotComStockGrid = ({ marketData, currentDate, positions, cashWeight, onUpdatePosition }: Props) => {
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!filterIndustry) return dotcomStocks;
    return dotcomStocks.filter(s => s.industry === filterIndustry);
  }, [filterIndustry]);

  const totalAllocated = positions.reduce((s, p) => s + p.weight, 0);

  return (
    <div className="space-y-3">
      {/* Industry filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <button
          onClick={() => setFilterIndustry(null)}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            !filterIndustry ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {industries.map(ind => (
          <button
            key={ind}
            onClick={() => setFilterIndustry(ind === filterIndustry ? null : ind)}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              filterIndustry === ind ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Stock grid */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((stock) => {
            const pos = positions.find(p => p.ticker === stock.ticker);
            return (
              <DotComStockTile
                key={stock.ticker}
                stock={stock}
                marketData={marketData?.[stock.ticker]}
                currentDate={currentDate}
                positionWeight={pos?.weight || 0}
                canBuy={totalAllocated < 100}
                onBuy={() => onUpdatePosition(stock.ticker, Math.min(10, 100 - totalAllocated))}
                onSell={() => onUpdatePosition(stock.ticker, 0)}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DotComStockGrid;
