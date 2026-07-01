import type { BacktestResult, StrategyType } from "@/hooks/useStrategyBacktest";

export interface RadarScore {
  dimension: string;
  score: number;
  fullMark: 10;
}

function clamp(v: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, v));
}

// Derive SPY (benchmark) metrics from the result's benchmarkValues
function benchmarkMetrics(result: BacktestResult) {
  const bv = result.benchmarkValues;
  const n = bv.length;
  const returns = bv.slice(1).map((p, i) => (p - bv[i]) / bv[i]);
  const avgRet = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avgRet) ** 2, 0) / returns.length;
  const vol = Math.sqrt(variance * 252) * 100;
  const years = n / 252;
  const cagr = years > 0 ? (Math.pow(bv[n - 1] / bv[0], 1 / years) - 1) * 100 : 0;
  let peak = bv[0];
  let maxDD = 0;
  bv.forEach(v => { peak = Math.max(peak, v); maxDD = Math.min(maxDD, ((v - peak) / peak) * 100); });
  return { cagr, vol, maxDD };
}

export function computeRadarScores(
  result: BacktestResult,
  strategy: StrategyType,
  param: number,
): RadarScore[] {
  const bm = benchmarkMetrics(result);

  // Return: score vs SPY CAGR. SPY = 5. +5% over SPY → 10, -5% → 0
  const cagrDiff = result.cagr - bm.cagr;
  const returnScore = clamp(5 + cagrDiff);

  // Risk: lower vol than SPY → higher score. SPY vol = 5.
  const volDiff = bm.vol - result.volatility;
  const volScore = clamp(5 + volDiff * 0.5);
  // Drawdown: better (less negative) drawdown than SPY → bonus
  const ddDiff = result.maxDrawdown - bm.maxDD; // positive = portfolio had smaller drawdown
  const ddScore = clamp(5 + ddDiff * 0.2);
  const riskScore = clamp((volScore + ddScore) / 2);

  // Stability: relative to benchmark volatility. At par with SPY → 5; lower vol → higher score.
  // Multiplier 0.3 means ±10% vol difference moves score by 3 points.
  const stabilityScore = clamp(5 + (bm.vol - result.volatility) * 0.3);

  // Diversification: depends on strategy & param (unchanged — not market-dependent)
  let divScore: number;
  if (strategy === 'allocation') {
    const balance = 1 - Math.abs(param - 0.5) * 2;
    divScore = clamp(balance * 10);
  } else if (strategy === 'income') {
    const balance = 1 - Math.abs(param - 0.5) * 2;
    divScore = clamp(balance * 8 + 2);
  } else if (strategy === 'momentum') {
    divScore = clamp(6);
  } else {
    divScore = clamp(3);
  }

  // Consistency: smoothness of returns vs SPY worst quarter baseline
  const consistencyScore = clamp(10 + result.worstQuarter / 3);

  // Efficiency: Sharpe ratio vs SPY Sharpe. SPY Sharpe ≈ score 5
  // Rough SPY sharpe from cagr/vol approximation
  const spySharpe = bm.vol > 0 ? (bm.cagr / bm.vol) * 0.7 : 0.5;
  const sharpeDiff = result.sharpeRatio - spySharpe;
  const efficiencyScore = clamp(5 + sharpeDiff * 3);

  return [
    { dimension: 'Return', score: Math.round(returnScore * 10) / 10, fullMark: 10 },
    { dimension: 'Risk', score: Math.round(riskScore * 10) / 10, fullMark: 10 },
    { dimension: 'Stability', score: Math.round(stabilityScore * 10) / 10, fullMark: 10 },
    { dimension: 'Diversification', score: Math.round(divScore * 10) / 10, fullMark: 10 },
    { dimension: 'Consistency', score: Math.round(consistencyScore * 10) / 10, fullMark: 10 },
    { dimension: 'Efficiency', score: Math.round(efficiencyScore * 10) / 10, fullMark: 10 },
  ];
}
