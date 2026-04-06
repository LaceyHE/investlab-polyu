// Diversification-aware radar scoring for custom portfolios
import type { BacktestResult } from "@/hooks/useStrategyBacktest";
import type { RadarScore } from "./RadarScoring";
import type { PortfolioAsset } from "@/data/portfolio-assets";

function clamp(v: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, v));
}

export function computeCustomRadarScores(
  result: BacktestResult,
  assets: { ticker: string; weight: number }[],
  assetUniverse: PortfolioAsset[],
): RadarScore[] {
  // Return: CAGR mapped to 0-10 (–20% → 0, +20% → 10)
  const returnScore = clamp(((result.cagr + 20) / 40) * 10);

  // Risk: lower vol + lower drawdown = higher score
  const volScore = clamp(10 - (result.volatility / 4));
  const ddScore = clamp(10 + result.maxDrawdown / 4);
  const riskScore = clamp((volScore + ddScore) / 2);

  // Stability: inverse of volatility (0–30% range)
  const stabilityScore = clamp(10 - (result.volatility / 3));

  // Diversification: based on sector & asset class variety
  const selectedAssets = assets.map(a => assetUniverse.find(u => u.ticker === a.ticker)).filter(Boolean) as PortfolioAsset[];
  const uniqueSectors = new Set(selectedAssets.map(a => a.sector)).size;
  const uniqueCategories = new Set(selectedAssets.map(a => a.category)).size;
  const assetCount = assets.length;

  // Score components: sector diversity (0-4), category diversity (0-4), count bonus (0-2)
  const sectorScore = Math.min(uniqueSectors, 4);
  const categoryScore = Math.min(uniqueCategories, 4);
  const countBonus = Math.min(assetCount - 1, 2);
  const divScore = clamp(sectorScore + categoryScore + countBonus);

  // Consistency: smoothness of returns
  const consistencyScore = clamp(10 + result.worstQuarter / 3);

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
