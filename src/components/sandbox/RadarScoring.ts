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
  // Return: CAGR mapped to 0-10 (–20% → 0, +20% → 10)
  const returnScore = clamp(((result.cagr + 20) / 40) * 10);

  // Risk: lower vol + lower drawdown = higher score
  const volScore = clamp(10 - (result.volatility / 4));       // 40% vol → 0
  const ddScore = clamp(10 + result.maxDrawdown / 4);          // –40% dd → 0
  const riskScore = clamp((volScore + ddScore) / 2);

  // Stability: inverse of volatility (0–30% range)
  const stabilityScore = clamp(10 - (result.volatility / 3));

  // Diversification: depends on strategy & param
  let divScore: number;
  if (strategy === 'allocation') {
    // Balanced allocation scores higher
    const balance = 1 - Math.abs(param - 0.5) * 2; // 0.5 → 1, 0 or 1 → 0
    divScore = clamp(balance * 10);
  } else if (strategy === 'income') {
    const balance = 1 - Math.abs(param - 0.5) * 2;
    divScore = clamp(balance * 8 + 2);
  } else {
    // Trend / momentum: single asset, lower diversification
    divScore = clamp(3);
  }

  // Consistency: smoothness of returns (low worst quarter deviation)
  const consistencyScore = clamp(10 + result.worstQuarter / 3); // –30% worst → 0

  // Efficiency: Sharpe ratio mapped (–1 → 0, 2 → 10)
  const efficiencyScore = clamp(((result.sharpeRatio + 1) / 3) * 10);

  return [
    { dimension: 'Return', score: Math.round(returnScore * 10) / 10, fullMark: 10 },
    { dimension: 'Risk', score: Math.round(riskScore * 10) / 10, fullMark: 10 },
    { dimension: 'Stability', score: Math.round(stabilityScore * 10) / 10, fullMark: 10 },
    { dimension: 'Diversification', score: Math.round(divScore * 10) / 10, fullMark: 10 },
    { dimension: 'Consistency', score: Math.round(consistencyScore * 10) / 10, fullMark: 10 },
    { dimension: 'Efficiency', score: Math.round(efficiencyScore * 10) / 10, fullMark: 10 },
  ];
}
