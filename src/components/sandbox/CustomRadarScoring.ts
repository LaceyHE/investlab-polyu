// Diversification-aware radar scoring for custom portfolios.
// Return / Risk / Efficiency are scored RELATIVE TO THE MARKET (SPY total return)
// over the same date window — not relative to the portfolio's own buy-and-hold.
import type { BacktestResult, DailyPrice } from "@/hooks/useStrategyBacktest";
import type { RadarScore } from "./RadarScoring";
import type { PortfolioAsset } from "@/data/portfolio-assets";

function clamp(v: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, v));
}

// Compute CAGR / volatility / max-drawdown / Sharpe from a value series.
// Same methodology used for the portfolio itself, so comparisons are apples-to-apples.
function metricsFromValues(values: number[], riskFreeAnnual: number) {
  const n = values.length;
  const returns = values.slice(1).map((p, i) => (p - values[i]) / values[i]);
  const avgRet = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avgRet) ** 2, 0) / returns.length;
  const vol = Math.sqrt(variance * 252) * 100;

  const years = n / 252;
  const cagr = years > 0 ? (Math.pow(values[n - 1] / values[0], 1 / years) - 1) * 100 : 0;

  let peak = values[0];
  let maxDD = 0;
  values.forEach((v) => {
    peak = Math.max(peak, v);
    maxDD = Math.min(maxDD, ((v - peak) / peak) * 100);
  });

  const dailyRF = riskFreeAnnual / 252;
  const excess = returns.map((r) => r - dailyRF);
  const avgExcess = excess.reduce((a, b) => a + b, 0) / excess.length;
  const excessStd = Math.sqrt(excess.reduce((s, r) => s + (r - avgExcess) ** 2, 0) / excess.length);
  const sharpe = excessStd > 0 ? (avgExcess * 252) / (excessStd * Math.sqrt(252)) : 0;

  return { cagr, vol, maxDD, sharpe };
}

export function computeCustomRadarScores(
  result: BacktestResult,
  assets: { ticker: string; weight: number }[],
  assetUniverse: PortfolioAsset[],
  spyPrices?: DailyPrice[],
  riskFreeAnnual = 0.02,
): RadarScore[] {
  // ── Market benchmark = SPY total return over the SAME window as the portfolio ──
  let market: { cagr: number; vol: number; maxDD: number; sharpe: number };
  if (spyPrices?.length) {
    const spyMap = new Map(spyPrices.map((d) => [d.date, d.close]));
    const spyVals = result.dates
      .map((d) => spyMap.get(d))
      .filter((v): v is number => v != null);
    market = spyVals.length > 20
      ? metricsFromValues(spyVals, riskFreeAnnual)
      // Fallback: portfolio's own buy-and-hold line (only if SPY is unavailable)
      : metricsFromValues(result.benchmarkValues, riskFreeAnnual);
  } else {
    market = metricsFromValues(result.benchmarkValues, riskFreeAnnual);
  }

  // Return: portfolio CAGR vs market CAGR (market = 5).
  const returnScore = clamp(5 + (result.cagr - market.cagr));

  // Risk: lower volatility & shallower drawdown than the market score above 5.
  const volScore = clamp(5 + (market.vol - result.volatility) * 0.5);
  const ddScore = clamp(5 + (result.maxDrawdown - market.maxDD) * 0.2);
  const riskScore = clamp((volScore + ddScore) / 2);

  // Stability: absolute volatility level (lower = steadier).
  const stabilityScore = clamp(10 - result.volatility / 3);

  // Diversification: sector & asset-class variety + a small size bonus.
  const selectedAssets = assets
    .map((a) => assetUniverse.find((u) => u.ticker === a.ticker))
    .filter(Boolean) as PortfolioAsset[];
  const uniqueSectors = new Set(selectedAssets.map((a) => a.sector)).size;
  const uniqueCategories = new Set(selectedAssets.map((a) => a.category)).size;
  const sectorScore = Math.min(uniqueSectors, 4);
  const categoryScore = Math.min(uniqueCategories, 4);
  const countBonus = Math.min(assets.length - 1, 2);
  const divScore = clamp(sectorScore + categoryScore + countBonus);

  // Consistency: smoothness of returns (worst quarter, closer to 0 = steadier).
  const consistencyScore = clamp(10 + result.worstQuarter / 3);

  // Efficiency: portfolio Sharpe vs market Sharpe — both computed the SAME way.
  const efficiencyScore = clamp(5 + (result.sharpeRatio - market.sharpe) * 3);

  return [
    { dimension: 'Return', score: Math.round(returnScore * 10) / 10, fullMark: 10 },
    { dimension: 'Risk', score: Math.round(riskScore * 10) / 10, fullMark: 10 },
    { dimension: 'Stability', score: Math.round(stabilityScore * 10) / 10, fullMark: 10 },
    { dimension: 'Diversification', score: Math.round(divScore * 10) / 10, fullMark: 10 },
    { dimension: 'Consistency', score: Math.round(consistencyScore * 10) / 10, fullMark: 10 },
    { dimension: 'Efficiency', score: Math.round(efficiencyScore * 10) / 10, fullMark: 10 },
  ];
}
