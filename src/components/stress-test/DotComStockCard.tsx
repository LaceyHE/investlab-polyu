import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import type { StockSnapshot } from '@/hooks/useDotcomSimulation';

interface Props {
  stock: StockSnapshot;
  positionPct: number;
  onBuy: () => void;
  onSell: () => void;
  canBuy: boolean;
}

const trendIcon = {
  Up: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />,
  Down: <TrendingDown className="h-3.5 w-3.5 text-red-500" />,
  Flat: <Minus className="h-3.5 w-3.5 text-muted-foreground" />,
};

const volColor = {
  Low: 'text-emerald-500',
  Medium: 'text-amber-500',
  High: 'text-red-500',
};

export default function DotComStockCard({ stock, positionPct, onBuy, onSell, canBuy }: Props) {
  const chartData = stock.priceHistory.map((p, i) => ({ v: p }));
  const isPositive = stock.monthlyChange >= 0;

  return (
    <motion.div
      layout
      className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground text-sm">{stock.def.ticker}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {stock.def.sector}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{stock.def.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-foreground">${stock.price.toFixed(2)}</p>
          <p className={`text-xs font-mono ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{stock.monthlyChange.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Mini chart */}
      <div className="h-12 w-full mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-1 text-[10px] mb-3">
        <div>
          <span className="text-muted-foreground block">P/E</span>
          <span className="text-foreground font-medium">{stock.pe}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Rev Growth</span>
          <span className="text-foreground font-medium">{stock.def.revenueGrowth}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Volatility</span>
          <span className={`font-medium ${volColor[stock.def.volatility]}`}>{stock.def.volatility}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Trend</span>
          <span className="flex items-center gap-0.5 mt-0.5">{trendIcon[stock.trend]}</span>
        </div>
      </div>

      {/* Narrative tag */}
      <p className="text-[10px] text-muted-foreground italic mb-3">{stock.def.narrativeTag}</p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onBuy}
          disabled={!canBuy}
          className="flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold py-2 hover:bg-emerald-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Buy 10%
        </button>
        <button
          onClick={onSell}
          disabled={positionPct === 0}
          className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold py-2 hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Sell
        </button>
      </div>

      {/* Position badge */}
      <AnimatePresence>
        {positionPct > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-center text-[10px] font-medium text-primary bg-primary/5 rounded-md py-1"
          >
            Position: {positionPct.toFixed(1)}% of portfolio
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
