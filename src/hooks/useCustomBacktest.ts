// Custom portfolio backtest hook — uses static JSON price data
import { useQuery } from "@tanstack/react-query";
import type { DailyPrice, BacktestResult } from "./useStrategyBacktest";
import type { TimePeriod } from "@/data/time-periods";
import { DEFAULT_PERIOD } from "@/data/time-periods";

const INITIAL_CAPITAL = 10000;

// ── Static Data Loading ────────────────────────────────────────────────────

async function loadPeriodData(periodKey: string): Promise<Record<string, DailyPrice[]>> {
  const mod = await import(`../data/prices/${periodKey}.json`);
  return mod.default as Record<string, DailyPrice[]>;
}

// ── Data Hook ──────────────────────────────────────────────────────────────

export interface SelectedAsset {
  ticker: string;
  weight: number; // 0-100
}

export function useMultiTickerData(tickers: string[], period: TimePeriod = DEFAULT_PERIOD) {
  return useQuery({
    queryKey: ['custom-portfolio-data', period.key],
    // Load the entire period JSON once — all 22 tickers cached together.
    // This avoids stale cache hits when the user adds a new ticker mid-session.
    queryFn: () => loadPeriodData(period.key),
    enabled: tickers.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

// ── Backtest Engine ────────────────────────────────────────────────────────

export type RebalanceFrequency = 'none' | 'monthly' | 'quarterly' | 'annual';

export function computeCustomBacktest(
  assets: SelectedAsset[],
  priceData: Record<string, DailyPrice[]>,
  riskFreeAnnual = 0.02,
  rebalanceFreq: RebalanceFrequency = 'monthly',
): BacktestResult | null {
  if (assets.length === 0) return null;

  const tickerMaps = assets.map(a => {
    const map = new Map<string, number>();
    (priceData[a.ticker] || []).forEach(d => map.set(d.date, d.close));
    return { ticker: a.ticker, weight: a.weight / 100, map };
  });

  // Build date set from selected tickers only (priceData may contain all 22 tickers)
  const allDates = new Set<string>();
  tickerMaps.forEach(tm => tm.map.forEach((_, date) => allDates.add(date)));
  const commonDates = Array.from(allDates)
    .filter(date => tickerMaps.every(tm => tm.map.has(date)))
    .sort();

  if (commonDates.length < 20) return null;

  const startDate = commonDates[0];

  // Strategy: rebalance at chosen frequency
  let portfolioValue = INITIAL_CAPITAL;
  let shares = tickerMaps.map(tm => ({
    ticker: tm.ticker,
    shares: (INITIAL_CAPITAL * tm.weight) / tm.map.get(startDate)!,
  }));

  // Benchmark: same initial weights, buy-and-hold (never rebalanced)
  const bmShares = tickerMaps.map(tm => ({
    shares: (INITIAL_CAPITAL * tm.weight) / tm.map.get(startDate)!,
  }));

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];

  let lastRebalanceMonth = -1;
  let lastRebalanceQuarter = -1;
  let lastRebalanceYear = -1;

  const shouldRebalance = (date: string, i: number): boolean => {
    if (rebalanceFreq === 'none' || i === 0) return false;
    const d = new Date(date);
    const month = d.getMonth();
    const quarter = Math.floor(month / 3);
    const year = d.getFullYear();
    if (rebalanceFreq === 'monthly' && month !== lastRebalanceMonth) return true;
    if (rebalanceFreq === 'quarterly' && quarter !== lastRebalanceQuarter) return true;
    if (rebalanceFreq === 'annual' && year !== lastRebalanceYear) return true;
    return false;
  };

  commonDates.forEach((date, i) => {
    portfolioValue = shares.reduce((sum, s, idx) => {
      return sum + s.shares * tickerMaps[idx].map.get(date)!;
    }, 0);

    if (shouldRebalance(date, i)) {
      shares = tickerMaps.map(tm => ({
        ticker: tm.ticker,
        shares: (portfolioValue * tm.weight) / tm.map.get(date)!,
      }));
    }

    const d = new Date(date);
    lastRebalanceMonth   = d.getMonth();
    lastRebalanceQuarter = Math.floor(d.getMonth() / 3);
    lastRebalanceYear    = d.getFullYear();

    // Benchmark: same weights, buy-and-hold
    const bmVal = bmShares.reduce((sum, s, idx) => {
      return sum + s.shares * tickerMaps[idx].map.get(date)!;
    }, 0);

    portfolioValues.push(portfolioValue);
    benchmarkValues.push(bmVal);
    dates.push(date);
  });

  const n = portfolioValues.length;
  const totalReturn = ((portfolioValues[n - 1] - portfolioValues[0]) / portfolioValues[0]) * 100;
  const years = n / 252;
  const cagr = years > 0 ? (Math.pow(portfolioValues[n - 1] / portfolioValues[0], 1 / years) - 1) * 100 : 0;

  const returns = portfolioValues.slice(1).map((p, i) => (p - portfolioValues[i]) / portfolioValues[i]);
  const avgRet = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avgRet) ** 2, 0) / returns.length;
  const volatility = Math.sqrt(variance * 252) * 100;

  const dailyRF = riskFreeAnnual / 252;
  const excessReturns = returns.map(r => r - dailyRF);
  const avgExcess = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const excessStd = Math.sqrt(excessReturns.reduce((s, r) => s + (r - avgExcess) ** 2, 0) / excessReturns.length);
  const sharpeRatio = excessStd > 0 ? (avgExcess * 252) / (excessStd * Math.sqrt(252)) : 0;

  let peak = portfolioValues[0];
  let maxDrawdown = 0;
  portfolioValues.forEach(v => {
    peak = Math.max(peak, v);
    const dd = ((v - peak) / peak) * 100;
    maxDrawdown = Math.min(maxDrawdown, dd);
  });

  let worstQuarter = 0;
  for (let i = 63; i < n; i++) {
    const qRet = ((portfolioValues[i] - portfolioValues[i - 63]) / portfolioValues[i - 63]) * 100;
    worstQuarter = Math.min(worstQuarter, qRet);
  }

  return { dates, portfolioValues, benchmarkValues, totalReturn, cagr, volatility, maxDrawdown, worstQuarter, sharpeRatio };
}
