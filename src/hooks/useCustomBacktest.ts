// Custom portfolio backtest hook — fetches multi-ticker data, computes weighted portfolio
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DailyPrice, BacktestResult } from "./useStrategyBacktest";

const START = '2021-01-01';
const END = '2023-01-01';
const INITIAL_CAPITAL = 10000;
const RISK_FREE = 0.02 / 252;

// ── Fetch / Fallback ───────────────────────────────────────────────────────

async function fetchTickerData(ticker: string): Promise<DailyPrice[]> {
  const p1 = Math.floor(new Date(START).getTime() / 1000);
  const p2 = Math.floor(new Date(END).getTime() / 1000);
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${p1}&period2=${p2}&interval=1d`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('API error');
    const json = await resp.json();
    const result = json.chart.result[0];
    const ts = result.timestamp;
    const closes = result.indicators.quote[0].close;
    return ts.map((t: number, i: number) => ({
      date: new Date(t * 1000).toISOString().split('T')[0],
      close: closes[i] ?? 0,
    })).filter((d: DailyPrice) => d.close > 0);
  } catch {
    return generateFallback(ticker);
  }
}

// Deterministic fallback per ticker
function generateFallback(ticker: string): DailyPrice[] {
  const points: DailyPrice[] = [];
  const start = new Date(START);
  const end = new Date(END);

  // Seed from ticker for determinism
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) seed += ticker.charCodeAt(i) * (i + 1) * 137;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

  // Base prices & characteristics by ticker
  const configs: Record<string, { base: number; drift2021: number; drift2022: number; vol: number }> = {
    AAPL: { base: 130, drift2021: 0.0008, drift2022: -0.0003, vol: 0.018 },
    MSFT: { base: 220, drift2021: 0.0009, drift2022: -0.0002, vol: 0.016 },
    JPM:  { base: 130, drift2021: 0.0007, drift2022: -0.0004, vol: 0.017 },
    JNJ:  { base: 165, drift2021: 0.0003, drift2022: -0.0001, vol: 0.010 },
    PG:   { base: 135, drift2021: 0.0004, drift2022: 0.0001, vol: 0.009 },
    KO:   { base: 50,  drift2021: 0.0003, drift2022: 0.0000, vol: 0.009 },
    XOM:  { base: 42,  drift2021: 0.0006, drift2022: 0.0010, vol: 0.020 },
    CAT:  { base: 190, drift2021: 0.0005, drift2022: 0.0002, vol: 0.016 },
    SPY:  { base: 380, drift2021: 0.0006, drift2022: -0.0004, vol: 0.012 },
    QQQ:  { base: 310, drift2021: 0.0008, drift2022: -0.0006, vol: 0.016 },
    AGG:  { base: 115, drift2021: -0.0001, drift2022: -0.0003, vol: 0.004 },
    GLD:  { base: 170, drift2021: -0.0002, drift2022: 0.0001, vol: 0.008 },
  };

  const cfg = configs[ticker] || { base: 100, drift2021: 0.0003, drift2022: -0.0002, vol: 0.015 };
  let price = cfg.base;

  const cur = new Date(start);
  while (cur <= end) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) {
      const drift = cur.getFullYear() === 2022 ? cfg.drift2022 : cfg.drift2021;
      price *= 1 + drift + (rand() - 0.5) * cfg.vol * 2;
      price = Math.max(price, cfg.base * 0.5);
      points.push({ date: cur.toISOString().split('T')[0], close: price });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return points;
}

// ── Data Hook ──────────────────────────────────────────────────────────────

export interface SelectedAsset {
  ticker: string;
  weight: number; // 0-100
}

export function useMultiTickerData(tickers: string[]) {
  return useQuery({
    queryKey: ['custom-portfolio-data', ...tickers.sort()],
    queryFn: async () => {
      const results = await Promise.all(tickers.map(fetchTickerData));
      const map: Record<string, DailyPrice[]> = {};
      tickers.forEach((t, i) => { map[t] = results[i]; });
      return map;
    },
    enabled: tickers.length > 0,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}

// ── Backtest Engine ────────────────────────────────────────────────────────

export function computeCustomBacktest(
  assets: SelectedAsset[],
  priceData: Record<string, DailyPrice[]>,
): BacktestResult | null {
  if (assets.length === 0) return null;

  // Build date-aligned price maps
  const tickerMaps = assets.map(a => {
    const map = new Map<string, number>();
    (priceData[a.ticker] || []).forEach(d => map.set(d.date, d.close));
    return { ticker: a.ticker, weight: a.weight / 100, map };
  });

  // Get SPY for benchmark
  const spyData = priceData['SPY'] || [];
  const spyMap = new Map<string, number>();
  spyData.forEach(d => spyMap.set(d.date, d.close));

  // Find common dates (all tickers + SPY must have data)
  const allDates = new Set<string>();
  Object.values(priceData).forEach(prices => prices.forEach(d => allDates.add(d.date)));
  const commonDates = Array.from(allDates)
    .filter(date => {
      if (!spyMap.has(date)) return false;
      return tickerMaps.every(tm => tm.map.has(date));
    })
    .sort();

  if (commonDates.length < 20) return null;

  // Compute portfolio with monthly rebalancing
  let portfolioValue = INITIAL_CAPITAL;
  // Track shares per asset
  let shares = tickerMaps.map(tm => ({
    ticker: tm.ticker,
    shares: (INITIAL_CAPITAL * tm.weight) / tm.map.get(commonDates[0])!,
  }));

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];
  const spyStart = spyMap.get(commonDates[0])!;
  let lastRebalanceMonth = -1;

  commonDates.forEach((date, i) => {
    // Current portfolio value
    portfolioValue = shares.reduce((sum, s, idx) => {
      return sum + s.shares * tickerMaps[idx].map.get(date)!;
    }, 0);

    // Monthly rebalance
    const month = new Date(date).getMonth();
    if (i > 0 && month !== lastRebalanceMonth) {
      shares = tickerMaps.map(tm => ({
        ticker: tm.ticker,
        shares: (portfolioValue * tm.weight) / tm.map.get(date)!,
      }));
    }
    lastRebalanceMonth = month;

    portfolioValues.push(portfolioValue);
    benchmarkValues.push((INITIAL_CAPITAL / spyStart) * spyMap.get(date)!);
    dates.push(date);
  });

  // Compute metrics
  const n = portfolioValues.length;
  const totalReturn = ((portfolioValues[n - 1] - portfolioValues[0]) / portfolioValues[0]) * 100;
  const years = n / 252;
  const cagr = years > 0 ? (Math.pow(portfolioValues[n - 1] / portfolioValues[0], 1 / years) - 1) * 100 : 0;

  const returns = portfolioValues.slice(1).map((p, i) => (p - portfolioValues[i]) / portfolioValues[i]);
  const avgRet = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avgRet) ** 2, 0) / returns.length;
  const volatility = Math.sqrt(variance * 252) * 100;

  const excessReturns = returns.map(r => r - RISK_FREE);
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

  return {
    dates,
    portfolioValues,
    benchmarkValues,
    totalReturn,
    cagr,
    volatility,
    maxDrawdown,
    worstQuarter,
    sharpeRatio,
  };
}
