import { useMemo } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { computeRadarScores } from "./RadarScoring";
import type { BacktestResult, StrategyType } from "@/hooks/useStrategyBacktest";

interface Props {
  result: BacktestResult;
  strategy: StrategyType;
  param: number;
  strategyColor?: string;
}

const PortfolioRadarChart = ({ result, strategy, param, strategyColor }: Props) => {
  const scores = useMemo(
    () => computeRadarScores(result, strategy, param),
    [result, strategy, param],
  );

  const avg = useMemo(
    () => scores.reduce((s, d) => s + d.score, 0) / scores.length,
    [scores],
  );

  const avgColor = avg >= 7 ? 'text-teal' : avg >= 4 ? 'text-foreground' : 'text-destructive';
  const avgBg    = avg >= 7 ? 'bg-teal/5 border-teal/20' : avg >= 4 ? 'bg-secondary/50 border-border' : 'bg-destructive/5 border-destructive/20';
  const radarColor = strategyColor || 'hsl(var(--primary))';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5 flex flex-col h-full"
    >
      {/* Header: title + big avg score */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Portfolio Profile</h3>
        <div className={`flex items-baseline gap-1 rounded-lg border px-3 py-1.5 ${avgBg}`}>
          <span className={`font-serif text-2xl font-bold leading-none ${avgColor}`}>
            {avg.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">/10</span>
        </div>
      </div>

      {/* Radar — flex-1 fills remaining height */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={scores}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              tickCount={6}
            />
            <Radar
              name="Portfolio"
              dataKey="score"
              stroke={radarColor}
              fill={radarColor}
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PortfolioRadarChart;
