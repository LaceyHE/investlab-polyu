import { useMemo } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { computeRadarScores, type RadarScore } from "./RadarScoring";
import type { BacktestResult, StrategyType } from "@/hooks/useStrategyBacktest";

interface Props {
  result: BacktestResult;
  strategy: StrategyType;
  param: number;
}

const PortfolioRadarChart = ({ result, strategy, param }: Props) => {
  const scores = useMemo(
    () => computeRadarScores(result, strategy, param),
    [result, strategy, param],
  );

  const avg = useMemo(
    () => (scores.reduce((s, d) => s + d.score, 0) / scores.length).toFixed(1),
    [scores],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground">Portfolio Profile</h3>
        <span className="text-xs font-mono text-muted-foreground">
          Avg Score: {avg}/10
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={scores}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
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
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Score pills */}
      <div className="flex flex-wrap gap-2 mt-3">
        {scores.map((s) => (
          <div
            key={s.dimension}
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1"
          >
            <span className="text-[10px] text-muted-foreground">{s.dimension}</span>
            <span className={`text-[11px] font-mono font-bold ${
              s.score >= 7 ? 'text-teal' : s.score >= 4 ? 'text-foreground' : 'text-destructive'
            }`}>
              {s.score}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PortfolioRadarChart;
