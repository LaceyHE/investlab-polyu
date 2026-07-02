import { useMemo } from "react";
import type { HoldingSegment } from "@/hooks/useStrategyBacktest";

interface Props {
  currentHolding: string;
  holdingHistory: HoldingSegment[];
  startDate: string;
  endDate: string;
}

const ASSET_LABELS: Record<string, string> = {
  SPY:  'S&P 500',
  QQQ:  'NASDAQ',
  AGG:  'Bonds',
  GLD:  'Gold',
  CASH: 'Defensive Cash',
};

const HoldingTimeline = ({ currentHolding, holdingHistory, startDate, endDate }: Props) => {
  const totalMs = new Date(endDate).getTime() - new Date(startDate).getTime();

  const segments = useMemo(() =>
    holdingHistory.map(seg => {
      const from = new Date(seg.fromDate).getTime();
      const to = new Date(seg.toDate).getTime();
      const left = ((from - new Date(startDate).getTime()) / totalMs) * 100;
      const width = ((to - from) / totalMs) * 100;
      return { ...seg, left, width };
    }),
    [holdingHistory, startDate, totalMs],
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

  // Count time in each asset
  const timeByAsset = useMemo(() => {
    const totals: Record<string, number> = {};
    holdingHistory.forEach(seg => {
      const days = (new Date(seg.toDate).getTime() - new Date(seg.fromDate).getTime()) / (1000 * 60 * 60 * 24);
      totals[seg.ticker] = (totals[seg.ticker] ?? 0) + days;
    });
    return totals;
  }, [holdingHistory]);

  const totalDays = Object.values(timeByAsset).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-none border-2 border-foreground bg-card p-4 space-y-3">
      {/* Current holding badge */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">Holdings Timeline</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Currently holding:</span>
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: holdingHistory[holdingHistory.length - 1]?.color + '30',
              color: holdingHistory[holdingHistory.length - 1]?.color,
            }}
          >
            {currentHolding} — {ASSET_LABELS[currentHolding] ?? currentHolding}
          </span>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="relative h-8 rounded-none overflow-hidden bg-secondary flex">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="absolute top-0 h-full transition-all"
            style={{
              left: `${seg.left}%`,
              width: `${seg.width}%`,
              backgroundColor: seg.color,
              opacity: 0.85,
            }}
            title={`${seg.ticker}: ${formatDate(seg.fromDate)} → ${formatDate(seg.toDate)}`}
          />
        ))}
      </div>

      {/* Date labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{formatDate(startDate)}</span>
        <span>{formatDate(endDate)}</span>
      </div>

      {/* Asset legend + time allocation */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(timeByAsset)
          .sort((a, b) => b[1] - a[1])
          .map(([ticker, days]) => {
            const seg = holdingHistory.find(s => s.ticker === ticker);
            const pct = Math.round((days / totalDays) * 100);
            return (
              <div key={ticker} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg?.color }} />
                <span className="font-mono font-medium text-foreground">{ticker}</span>
                <span className="text-muted-foreground">{ASSET_LABELS[ticker]}</span>
                <span className="text-muted-foreground font-mono">{pct}%</span>
              </div>
            );
          })}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Each colour shows which asset the strategy held during that period. Grey segments indicate <span className="font-medium">Defensive Cash</span> — all 4 assets had negative momentum, so the strategy stepped aside and earned the risk-free rate instead.
      </p>
    </div>
  );
};

export default HoldingTimeline;
