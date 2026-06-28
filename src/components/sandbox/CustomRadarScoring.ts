// Diversification-aware radar scoring for custom portfolios — benchmark-relative
import type { BacktestResult } from "@/hooks/useStrategyBacktest";
import type { RadarScore } from "./RadarScoring";
import type { PortfolioAsset } from "@/data/portfolio-assets";

function clamp(v: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, v));
}

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

export function computeCustomRadarScores(
  result: BacktestResult,
  assets: { ticker: string; weight: number }[],
  assetUniverse: PortfolioAsset[],
): RadarScore[] {
  const bm = benchmarkMetrics(result);

  // Return: vs SPY CAGR. SPY = 5.
  const cagrDiff = result.cagr - bm.cagr;
  const returnScore = clamp(5 + cagrDiff);

  // Risk: vol and drawdown vs SPY
  const volDiff = bm.vol - result.volatility;
  const volScore = clamp(5 + volDiff * 0.5);
  const ddDiff = result.maxDrawdown - bm.maxDD;
  const ddScore = clamp(5 + ddDiff * 0.2);
  const riskScore = clamp((volScore + ddScore) / 2);

  // Stability: absolute vol level
  const stabilityScore = clamp(10 - (result.volatility / 3));

  // Diversification: sector & asset class variety
  const selectedAssets = assets
    .map(a => assetUniverse.find(u => u.ticker === a.ticker))
    .filter(Boolean) as PortfolioAsset[];
  const uniqueSectors = new Set(selectedAssets.map(a => a.sector)).size;
  const uniqueCategories = new Set(selectedAssets.map(a => a.category)).size;
  const assetCount = assets.length;
  const sectorScore = Math.min(uniqueSectors, 4);
  const categoryScore = Math.min(uniqueCategories, 4);
  const countBonus = Math.min(assetCount - 1, 2);
  const divScore = clamp(sectorScore + categoryScore + countBonus);

  // Consistency: smoothness of returns
  const consistencyScore = clamp(10 + result.worstQuarter / 3);

  // Efficiency: Sharpe vs SPY Sharpe approximation
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
