import type { BacktestResult, StrategyType } from "@/hooks/useStrategyBacktest";

export interface RadarScore {
  dimension: string;
  score: number;
  fullMark: 10;
}

function clamp(v: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, v));
}

export function computeRadarScores(
  result: BacktestResult,
  strategy: StrategyType,
  param: number,
): RadarScore[] {
  // Return: CAGR 0%→0, 10%→5, 20%→10
  const returnScore = clamp((result.cagr / 20) * 10);

  // Risk: Volatility inverted — 0%→10, 20%→5, 40%→0
  const riskScore = clamp(10 - (result.volatility / 40) * 10);

  // Stability: Max Drawdown inverted — 0%→10, -20%→5, -40%→0
  const stabilityScore = clamp(10 + (result.maxDrawdown / 40) * 10);

  // Diversification: strategy & param based (unchanged logic)
  let divScore: number;
  if (strategy === 'allocation') {
    const balance = 1 - Math.abs(param - 0.5) * 2;
    divScore = clamp(balance * 10);
  } else if (strategy === 'income') {
    const balance = 1 - Math.abs(param - 0.5) * 2;
    divScore = clamp(balance * 8 + 2);
  } else {
    divScore = clamp(3);
  }

  // Consistency: Worst Quarter inverted — 0%→10, -15%→5, -30%→0
  const consistencyScore = clamp(10 + (result.worstQuarter / 30) * 10);

  // Efficiency: Sharpe 0→0, 1→5, 2→10
  const efficiencyScore = clamp((result.sharpeRatio / 2) * 10);

  return [
    { dimension: 'Return', score: Math.round(returnScore * 10) / 10, fullMark: 10 },
    { dimension: 'Risk', score: Math.round(riskScore * 10) / 10, fullMark: 10 },
    { dimension: 'Stability', score: Math.round(stabilityScore * 10) / 10, fullMark: 10 },
    { dimension: 'Diversification', score: Math.round(divScore * 10) / 10, fullMark: 10 },
    { dimension: 'Consistency', score: Math.round(consistencyScore * 10) / 10, fullMark: 10 },
    { dimension: 'Efficiency', score: Math.round(efficiencyScore * 10) / 10, fullMark: 10 },
  ];
}
