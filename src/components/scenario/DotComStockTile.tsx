import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { DotComStock } from "@/data/dotcom-stocks";
import type { PricePoint } from "@/hooks/useMarketData";

interface Props {
  stock: DotComStock;
  marketData: PricePoint[] | undefined;
  currentDate: string;
  positionWeight: number;
  canBuy: boolean;
  onBuy: () => void;
  onSell: () => void;
}

const DotComStockTile = ({ stock, marketData, currentDate, positionWeight, canBuy, onBuy, onSell }: Props) => {
  const [hovered, setHovered] = useState(false);

  const visibleData = useMemo(() => {
    if (!marketData) return [];
    return marketData.filter(d => d.date <= currentDate);
  }, [marketData, currentDate]);

  const currentPrice = visibleData.length > 0 ? visibleData[visibleData.length - 1].close : 0;
  const startPrice = visibleData.length > 0 ? visibleData[0].close : 0;
  const returnPct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
  const isPositive = returnPct >= 0;

  const sparkData = useMemo(() => {
    // Sample ~30 points for sparkline
    if (visibleData.length === 0) return [];
    const step = Math.max(1, Math.floor(visibleData.length / 30));
    return visibleData.filter((_, i) => i % step === 0).map(d => ({ v: d.close }));
  }, [visibleData]);

  const avgVolume = useMemo(() => {
    if (visibleData.length === 0) return 0;
    const recent = visibleData.slice(-20);
    return recent.reduce((s, d) => s + d.volume, 0) / recent.length;
  }, [visibleData]);

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return v.toFixed(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-xl border bg-card p-3 transition-all cursor-pointer ${
        positionWeight > 0 ? 'border-primary/40 shadow-sm' : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground text-sm">{stock.ticker}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {stock.industry}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-foreground text-sm">${currentPrice.toFixed(2)}</p>
          <p className={`text-xs font-mono ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{returnPct.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-10 w-full mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line
              type="monotone"
              dataKey="v"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hover tooltip overlay */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 -bottom-1 translate-y-full z-20 rounded-lg border border-border bg-card shadow-lg p-3 mx-1"
        >
          <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
            <div>
              <span className="text-muted-foreground block">Peak Return</span>
              <span className="text-foreground font-medium">+{stock.peakReturn}%</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Peak P/S</span>
              <span className="text-foreground font-medium">{stock.peakPSRatio}x</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Avg Volume</span>
              <span className="text-foreground font-medium">{formatVolume(avgVolume)}</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">{stock.narrative}</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onBuy(); }}
          disabled={!canBuy}
          className="flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold py-1.5 hover:bg-emerald-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Buy 10%
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSell(); }}
          disabled={positionWeight === 0}
          className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold py-1.5 hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Sell
        </button>
      </div>

      {/* Position badge */}
      {positionWeight > 0 && (
        <div className="mt-1.5 text-center text-[10px] font-medium text-primary bg-primary/5 rounded-md py-0.5">
          Position: {positionWeight.toFixed(0)}% of portfolio
        </div>
      )}
    </motion.div>
  );
};

export default DotComStockTile;
