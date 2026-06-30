// Backtesting engine — uses static JSON price data (real Yahoo Finance historical prices)

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TimePeriod } from "@/data/time-periods";
import { DEFAULT_PERIOD } from "@/data/time-periods";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DailyPrice {
  date: string;
  close: number;
}

export interface IndicatorSeries {
  label: string;
  color: string;
  dashed?: boolean;
  values: (number | null)[]; // aligned with dates[], normalized to $10,000 start
}

export interface HoldingSegment {
  fromDate: string;
  toDate: string;
  ticker: string;
  color: string;
}

export interface BacktestResult {
  dates: string[];
  portfolioValues: number[];      // $ from $10,000 (with dividend reinvestment)
  benchmarkValues: number[];      // benchmark from $10,000
  noReinvestValues?: number[];    // $ from $10,000 (dividends taken as cash, not reinvested)
  benchmarkLabel?: string;
  signals?: SignalMarker[];
  indicators?: IndicatorSeries[];
  currentHolding?: string;        // ticker held at end of period (momentum strategy)
  holdingHistory?: HoldingSegment[]; // timeline of which asset was held when
  totalReturn: number;
  cagr: number;
  volatility: number;
  maxDrawdown: number;
  worstQuarter: number;
  sharpeRatio: number;
  totalDividendsReceived?: number;
}

export interface SignalMarker {
  date: string;
  type: 'buy' | 'sell';
  price: number;
}

const INITIAL_CAPITAL = 10000;

// ── Static Data Loading ────────────────────────────────────────────────────

async function loadPeriodData(periodKey: string): Promise<Record<string, DailyPrice[]>> {
  const mod = await import(`../data/prices/${periodKey}.json`);
  return mod.default as Record<string, DailyPrice[]>;
}

export function useMarketPrices(period: TimePeriod = DEFAULT_PERIOD) {
  return useQuery({
    queryKey: ['sandbox-market-data', period.key],
    queryFn: async () => {
      const [data, divData] = await Promise.all([
        loadPeriodData(period.key),
        import('../data/dividends.json').then(m => m.default as Record<string, Record<string, {date: string; amount: number}[]>>),
      ]);
      return {
        spy: data['SPY'] ?? [],
        agg: data['AGG'] ?? [],
        qqq: data['QQQ'] ?? [],
        gld: data['GLD'] ?? [],
        dvy: data['DVY'] ?? [],
        dvyPrice: data['DVY_PRICE'] ?? [],
        spyPrice: data['SPY_PRICE'] ?? [],
        dividends: divData[period.key] ?? {},
      };
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

// ── Utility Functions ──────────────────────────────────────────────────────

function computeReturns(prices: number[]): number[] {
  return prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
}

function movingAverage(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function computeMetrics(
  portfolioValues: number[],
  riskFreeAnnual: number,
): Omit<BacktestResult, 'dates' | 'portfolioValues' | 'benchmarkValues' | 'signals'> {
  const n = portfolioValues.length;
  const totalReturn = ((portfolioValues[n - 1] - portfolioValues[0]) / portfolioValues[0]) * 100;

  const years = n / 252;
  const cagr = years > 0 ? (Math.pow(portfolioValues[n - 1] / portfolioValues[0], 1 / years) - 1) * 100 : 0;

  const returns = computeReturns(portfolioValues);
  const avgRet = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avgRet) ** 2, 0) / returns.length;
  const volatility = Math.sqrt(variance * 252) * 100;

  const dailyRF = riskFreeAnnual / 252;
  const excessReturns = returns.map(r => r - dailyRF);
  const avgExcess = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const excessStd = Math.sqrt(excessReturns.reduce((s, r) => s + (r - avgExcess) ** 2, 0) / excessReturns.length);
  const sharpeRatio = excessStd > 0 ? (avgExcess * 252) / (excessStd * Math.sqrt(252)) : 0;

  let peak = portfolioValues[0];
  let maxDD = 0;
  portfolioValues.forEach(v => {
    peak = Math.max(peak, v);
    const dd = ((v - peak) / peak) * 100;
    maxDD = Math.min(maxDD, dd);
  });

  let worstQ = 0;
  for (let i = 63; i < n; i++) {
    const qRet = ((portfolioValues[i] - portfolioValues[i - 63]) / portfolioValues[i - 63]) * 100;
    worstQ = Math.min(worstQ, qRet);
  }

  return { totalReturn, cagr, volatility, maxDrawdown: maxDD, worstQuarter: worstQ, sharpeRatio };
}

// ── Strategy 1: 60/40 Classic ──────────────────────────────────────────────

function backtest6040(spy: DailyPrice[], agg: DailyPrice[], stockPct: number, rf: number): BacktestResult {
  const aggMap = new Map(agg.map(d => [d.date, d.close]));
  const aligned = spy.filter(d => aggMap.has(d.date)).map(d => ({
    date: d.date,
    spyClose: d.close,
    aggClose: aggMap.get(d.date)!,
  }));

  const bondPct = 100 - stockPct;

  // Strategy: rebalance monthly to target allocation
  let stockShares = (INITIAL_CAPITAL * stockPct / 100) / aligned[0].spyClose;
  let bondShares = (INITIAL_CAPITAL * bondPct / 100) / aligned[0].aggClose;

  // Benchmark: same initial allocation, buy-and-hold (no rebalancing)
  // This isolates the value of rebalancing vs passive holding
  const bmStockShares = (INITIAL_CAPITAL * stockPct / 100) / aligned[0].spyClose;
  const bmBondShares = (INITIAL_CAPITAL * bondPct / 100) / aligned[0].aggClose;

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];
  let lastRebalanceMonth = -1;

  aligned.forEach((d, i) => {
    const month = new Date(d.date).getMonth();
    const portfolioVal = stockShares * d.spyClose + bondShares * d.aggClose;

    if (i > 0 && month !== lastRebalanceMonth) {
      stockShares = (portfolioVal * stockPct / 100) / d.spyClose;
      bondShares = (portfolioVal * bondPct / 100) / d.aggClose;
    }
    lastRebalanceMonth = month;

    portfolioValues.push(portfolioVal);
    // Benchmark = same weights, never rebalanced
    benchmarkValues.push(bmStockShares * d.spyClose + bmBondShares * d.aggClose);
    dates.push(d.date);
  });

  return { dates, portfolioValues, benchmarkValues, ...computeMetrics(portfolioValues, rf) };
}

// ── Optimal-Sharpe scan for the allocation strategy ─────────────────────────
// Sweeps every stock/bond mix (0–100% stocks) over the chosen period and
// returns the mix that maximised the (risk-adjusted) Sharpe ratio. Used to show
// learners that the Sharpe-optimal split is data-dependent and almost never 60/40.

export interface AllocationSharpePoint {
  stockPct: number; // 0–100
  sharpe: number;
}

export interface AllocationSharpeScan {
  points: AllocationSharpePoint[];
  bestStockPct: number;
  bestSharpe: number;
}

export function scanAllocationSharpe(
  spy: DailyPrice[],
  agg: DailyPrice[],
  rf: number,
  step = 5,
): AllocationSharpeScan | null {
  if (!spy?.length || !agg?.length) return null;
  const points: AllocationSharpePoint[] = [];
  for (let pct = 0; pct <= 100; pct += step) {
    const { sharpeRatio } = backtest6040(spy, agg, pct, rf);
    points.push({ stockPct: pct, sharpe: sharpeRatio });
  }
  const best = points.reduce((a, b) => (b.sharpe > a.sharpe ? b : a), points[0]);
  return { points, bestStockPct: best.stockPct, bestSharpe: best.sharpe };
}

// ── Strategy 2: Trend Follower ─────────────────────────────────────────────

function backtestTrend(spy: DailyPrice[], speed: number, rf: number): BacktestResult {
  const shortPeriod = Math.round(50 - speed * 40);
  const longPeriod = Math.round(200 - speed * 170);

  const closes = spy.map(d => d.close);
  const shortMA = movingAverage(closes, shortPeriod);
  const longMA = movingAverage(closes, longPeriod);

  let cash = INITIAL_CAPITAL;
  let shares = 0;
  let invested = false;
  const dailyRF = rf / 252; // cash earns risk-free rate when out of market

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];
  const signals: SignalMarker[] = [];

  spy.forEach((d, i) => {
    const s = shortMA[i];
    const l = longMA[i];

    // Cash compounds daily at the risk-free rate when not invested
    if (!invested) cash *= (1 + dailyRF);

    if (s !== null && l !== null) {
      if (s > l && !invested) {
        shares = cash / d.close;
        cash = 0;
        invested = true;
        signals.push({ date: d.date, type: 'buy', price: d.close });
      } else if (s <= l && invested) {
        cash = shares * d.close;
        shares = 0;
        invested = false;
        signals.push({ date: d.date, type: 'sell', price: d.close });
      }
    }

    const val = invested ? shares * d.close : cash;
    portfolioValues.push(val);
    benchmarkValues.push((INITIAL_CAPITAL / spy[0].close) * d.close);
    dates.push(d.date);
  });

  // Normalize MA lines to $10,000 base so they overlay on the SPY price panel
  const spyStart = spy[0].close;
  const indicators: IndicatorSeries[] = [
    {
      label: `Short MA (${shortPeriod})`,
      color: 'hsl(38 92% 50%)',
      values: shortMA.map(v => v !== null ? (v / spyStart) * 10000 : null),
    },
    {
      label: `Long MA (${longPeriod})`,
      color: 'hsl(270 60% 55%)',
      dashed: true,
      values: longMA.map(v => v !== null ? (v / spyStart) * 10000 : null),
    },
  ];

  return { dates, portfolioValues, benchmarkValues, signals, indicators, ...computeMetrics(portfolioValues, rf) };
}

// ── Strategy 3: Income Machine ─────────────────────────────────────────────

function backtestIncome(
  spy: DailyPrice[],
  dvy: DailyPrice[],
  dvyPrice: DailyPrice[],
  spyPrice: DailyPrice[],
  incomeWeight: number,
  rf: number,
  dividendEvents: Record<string, { date: string; amount: number }[]>,
): BacktestResult {
  // Align SPY adjclose + DVY adjclose on common dates
  const dvyAdjMap = new Map(dvy.map(d => [d.date, d.close]));
  const dvyPriceMap = new Map(dvyPrice.map(d => [d.date, d.close]));
  const spyPriceMap = new Map(spyPrice.map(d => [d.date, d.close]));

  const aligned = spy.filter(d => dvyAdjMap.has(d.date)).map(d => ({
    date: d.date,
    spyAdj: d.close,
    spyUnadj: spyPriceMap.get(d.date) ?? d.close,
    dvyAdj: dvyAdjMap.get(d.date)!,
    dvyUnadj: dvyPriceMap.get(d.date) ?? dvyAdjMap.get(d.date)!,
  }));

  const growthPct = (1 - incomeWeight) * 100;
  const incomePct = incomeWeight * 100;

  // ── WITH reinvestment (adjclose tracks reinvested dividends automatically) ──
  let growthShares = (INITIAL_CAPITAL * growthPct / 100) / aligned[0].spyAdj;
  let incomeShares = (INITIAL_CAPITAL * incomePct / 100) / aligned[0].dvyAdj;

  // ── WITHOUT reinvestment (unadjusted prices + cash pocket for dividends) ──
  let growthSharesNR = (INITIAL_CAPITAL * growthPct / 100) / aligned[0].spyUnadj;
  let incomeSharesNR = (INITIAL_CAPITAL * incomePct / 100) / aligned[0].dvyUnadj;
  let cashNR = 0; // dividends collected but not reinvested

  const spyDivMap = new Map((dividendEvents['SPY'] ?? []).map(e => [e.date, e.amount]));
  const dvyDivMap = new Map((dividendEvents['DVY'] ?? []).map(e => [e.date, e.amount]));

  const portfolioValues: number[] = [];
  const noReinvestValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];
  let lastRebalanceMonth = -1;
  let totalDividendsReceived = 0;

  const spyAdjStart = aligned[0].spyAdj;

  aligned.forEach((d, i) => {
    // Dividend events: accumulate cash (no reinvest path) and track total income
    const spyDiv = spyDivMap.get(d.date) ?? 0;
    const dvyDiv = dvyDivMap.get(d.date) ?? 0;
    if (spyDiv > 0) {
      totalDividendsReceived += growthSharesNR * spyDiv;
      cashNR += growthSharesNR * spyDiv;
    }
    if (dvyDiv > 0) {
      totalDividendsReceived += incomeSharesNR * dvyDiv;
      cashNR += incomeSharesNR * dvyDiv;
    }

    // With-reinvestment portfolio value (adjclose embeds reinvested dividends)
    const portVal = growthShares * d.spyAdj + incomeShares * d.dvyAdj;

    // No-reinvestment portfolio value (unadjusted price + idle cash)
    const portValNR = growthSharesNR * d.spyUnadj + incomeSharesNR * d.dvyUnadj + cashNR;

    // Monthly rebalance the WITH-reinvestment portfolio only
    const month = new Date(d.date).getMonth();
    if (i > 0 && month !== lastRebalanceMonth) {
      growthShares = (portVal * growthPct / 100) / d.spyAdj;
      incomeShares = (portVal * incomePct / 100) / d.dvyAdj;
    }
    lastRebalanceMonth = month;

    portfolioValues.push(portVal);
    noReinvestValues.push(portValNR);
    // Benchmark uses SPY adjusted close (with dividend reinvestment) — same basis as main portfolio
    benchmarkValues.push((INITIAL_CAPITAL / spyAdjStart) * d.spyAdj);
    dates.push(d.date);
  });

  return {
    dates,
    portfolioValues,
    noReinvestValues,
    benchmarkValues,
    benchmarkLabel: 'SPY Total Return (with dividends)',
    totalDividendsReceived: Math.round(totalDividendsReceived),
    ...computeMetrics(portfolioValues, rf),
  };
}

// ── Strategy 4: Speed Racer (Cross-Asset Momentum) ─────────────────────────

const MOMENTUM_ASSETS = [
  { ticker: 'SPY', color: 'hsl(210 60% 55%)' },
  { ticker: 'QQQ', color: 'hsl(180 55% 45%)' },
  { ticker: 'AGG', color: 'hsl(100 40% 50%)' },
  { ticker: 'GLD', color: 'hsl(48 85% 55%)' },
];

const CASH_SEGMENT = { ticker: 'CASH', color: 'hsl(0 0% 60%)' };

function backtestMomentum(
  spy: DailyPrice[],
  qqq: DailyPrice[],
  agg: DailyPrice[],
  gld: DailyPrice[],
  horizon: number,
  rf: number,
): BacktestResult {
  // Max lookback capped at 126 days (6 months)
  const lookbackDays = Math.round(21 + horizon * 105);
  const dailyRF = rf / 252;

  const priceMaps = [spy, qqq, agg, gld].map(
    prices => new Map(prices.map(d => [d.date, d.close]))
  );

  const allDates = spy
    .map(d => d.date)
    .filter(date => priceMaps.every(m => m.has(date)));

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];
  const signals: SignalMarker[] = [];
  const holdingHistory: HoldingSegment[] = [];

  let currentAssetIdx = 0;
  let shares = INITIAL_CAPITAL / priceMaps[0].get(allDates[0])!;
  let cash = 0;
  let inCash = false;
  let lastRebalanceMonth = -1;
  let segmentStart = allDates[0];

  allDates.forEach((date, i) => {
    const month = new Date(date).getMonth();

    // Cash earns risk-free rate each day when in defensive mode
    if (inCash) cash *= (1 + dailyRF);

    if (i > 0 && month !== lastRebalanceMonth && i >= lookbackDays) {
      const lookbackDate = allDates[i - lookbackDays];
      let bestIdx = 0;
      let bestMomentum = -Infinity;

      priceMaps.forEach((pm, idx) => {
        const pastPrice = pm.get(lookbackDate);
        const nowPrice = pm.get(date);
        if (pastPrice && nowPrice) {
          const mom = (nowPrice - pastPrice) / pastPrice;
          if (mom > bestMomentum) { bestMomentum = mom; bestIdx = idx; }
        }
      });

      if (bestMomentum < 0) {
        // ── Absolute momentum filter: ALL assets negative → go defensive (cash) ──
        if (!inCash) {
          const exitPrice = priceMaps[currentAssetIdx].get(date)!;
          cash = shares * exitPrice;
          shares = 0;
          inCash = true;
          signals.push({ date, type: 'sell', price: exitPrice });
          holdingHistory.push({
            fromDate: segmentStart, toDate: date,
            ticker: MOMENTUM_ASSETS[currentAssetIdx].ticker,
            color: MOMENTUM_ASSETS[currentAssetIdx].color,
          });
          segmentStart = date;
        }
        // Already in cash → stay, no action needed
      } else {
        // ── At least one asset has positive momentum → invest in the best one ──
        if (inCash) {
          // Coming out of cash → buy best asset
          const entryPrice = priceMaps[bestIdx].get(date)!;
          shares = cash / entryPrice;
          cash = 0;
          inCash = false;
          currentAssetIdx = bestIdx;
          signals.push({ date, type: 'buy', price: entryPrice });
          holdingHistory.push({
            fromDate: segmentStart, toDate: date,
            ticker: CASH_SEGMENT.ticker, color: CASH_SEGMENT.color,
          });
          segmentStart = date;
        } else if (bestIdx !== currentAssetIdx) {
          // Rotate to a better asset
          const exitPrice = priceMaps[currentAssetIdx].get(date)!;
          const portVal = shares * exitPrice;
          signals.push({ date, type: 'sell', price: exitPrice });
          holdingHistory.push({
            fromDate: segmentStart, toDate: date,
            ticker: MOMENTUM_ASSETS[currentAssetIdx].ticker,
            color: MOMENTUM_ASSETS[currentAssetIdx].color,
          });
          segmentStart = date;
          const entryPrice = priceMaps[bestIdx].get(date)!;
          shares = portVal / entryPrice;
          currentAssetIdx = bestIdx;
          signals.push({ date, type: 'buy', price: entryPrice });
        }
      }
    }
    lastRebalanceMonth = month;

    const val = inCash ? cash : shares * priceMaps[currentAssetIdx].get(date)!;
    portfolioValues.push(val);

    // Benchmark: equal-weight buy-and-hold of all 4 assets (25% each, never rebalanced)
    // Shows: does momentum rotation beat simply holding all 4 equally?
    const bmVal = priceMaps.reduce((sum, pm, idx) => {
      const startPrice = pm.get(allDates[0])!;
      const nowPrice = pm.get(date)!;
      return sum + (INITIAL_CAPITAL * 0.25 / startPrice) * nowPrice;
    }, 0);
    benchmarkValues.push(bmVal);
    dates.push(date);
  });

  // Close final segment
  const finalAsset = inCash ? CASH_SEGMENT : MOMENTUM_ASSETS[currentAssetIdx];
  holdingHistory.push({
    fromDate: segmentStart,
    toDate: allDates[allDates.length - 1],
    ticker: finalAsset.ticker,
    color: finalAsset.color,
  });

  return {
    dates,
    portfolioValues,
    benchmarkValues,
    benchmarkLabel: 'Equal-Weight (25% SPY + QQQ + AGG + GLD)',
    signals,
    currentHolding: finalAsset.ticker,
    holdingHistory,
    ...computeMetrics(portfolioValues, rf),
  };
}

// ── Main Hook ──────────────────────────────────────────────────────────────

export type StrategyType = 'allocation' | 'trend' | 'income' | 'momentum' | 'custom';

export function useStrategyBacktest(
  strategy: StrategyType,
  param: number,
  spy: DailyPrice[] | undefined,
  agg: DailyPrice[] | undefined,
  qqq?: DailyPrice[],
  gld?: DailyPrice[],
  period: TimePeriod = DEFAULT_PERIOD,
  dvy?: DailyPrice[],
  dvyPrice?: DailyPrice[],
  spyPrice?: DailyPrice[],
  dividends?: Record<string, { date: string; amount: number }[]>,
) {
  return useMemo<BacktestResult | null>(() => {
    if (!spy || spy.length === 0) return null;
    const rf = period.riskFreeAnnual;

    switch (strategy) {
      case 'allocation': {
        if (!agg || agg.length === 0) return null;
        return backtest6040(spy, agg, Math.round(param * 100), rf);
      }
      case 'trend':
        return backtestTrend(spy, param, rf);
      case 'income': {
        if (!dvy || dvy.length === 0) return null;
        return backtestIncome(spy, dvy, dvyPrice ?? dvy, spyPrice ?? spy, param, rf, dividends ?? {});
      }
      case 'momentum': {
        if (!qqq || !agg || !gld) return null;
        return backtestMomentum(spy, qqq, agg, gld, param, rf);
      }
      default:
        return null;
    }
  }, [strategy, param, spy, agg, qqq, gld, period, dvy, dvyPrice, spyPrice, dividends]);
}
