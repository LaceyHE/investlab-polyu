// Backtesting engine for Sandbox strategies using real Yahoo Finance data (SPY, AGG)
// Falls back to simulated data if API is unavailable

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DailyPrice {
  date: string;
  close: number;
}

export interface BacktestResult {
  dates: string[];
  portfolioValues: number[];   // $ from $10,000
  benchmarkValues: number[];   // 100% SPY from $10,000
  signals?: SignalMarker[];
  totalReturn: number;         // %
  cagr: number;                // %
  volatility: number;          // annualized %
  maxDrawdown: number;         // %
  worstQuarter: number;        // %
  sharpeRatio: number;
}

export interface SignalMarker {
  date: string;
  type: 'buy' | 'sell';
  price: number;
}

// ── Data Fetching ──────────────────────────────────────────────────────────

const START = '2021-01-01';
const END = '2023-01-01';
const INITIAL_CAPITAL = 10000;
const RISK_FREE = 0.02 / 252; // daily risk-free rate (2% annual)

async function fetchYahooData(ticker: string): Promise<DailyPrice[]> {
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
    return generateFallbackData(ticker);
  }
}

// Deterministic fallback mimicking SPY and AGG behavior in 2021-2022
function generateFallbackData(ticker: string): DailyPrice[] {
  const points: DailyPrice[] = [];
  const start = new Date(START);
  const end = new Date(END);

  const isSPY = ticker === 'SPY';
  // Realistic 2021-2022: SPY ~380→475→380, AGG ~115→114→97
  let price = isSPY ? 380 : 115;

  let seed = ticker.charCodeAt(0) * 137;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

  const cur = new Date(start);
  while (cur <= end) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) {
      const year = cur.getFullYear();
      const month = cur.getMonth();
      let drift: number;
      if (isSPY) {
        // 2021: strong rally (~+27%), 2022: bear market (~-19%)
        if (year === 2021) {
          drift = 0.0009; // ~+25% annualized
        } else {
          drift = -0.0008; // ~-18% annualized
        }
      } else {
        // AGG: 2021 flat/slight decline, 2022 significant drop (-13%)
        if (year === 2021) {
          drift = -0.00005; // ~-1% annualized
        } else {
          drift = -0.0006; // ~-13% annualized
        }
      }
      const vol = isSPY ? 0.011 : 0.003;
      price *= 1 + drift + (rand() - 0.5) * vol * 2;
      price = Math.max(price, isSPY ? 300 : 85);
      points.push({ date: cur.toISOString().split('T')[0], close: price });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return points;
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ['sandbox-market-data', START, END],
    queryFn: async () => {
      const [spy, agg] = await Promise.all([
        fetchYahooData('SPY'),
        fetchYahooData('AGG'),
      ]);
      return { spy, agg };
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
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

function computeMetrics(portfolioValues: number[], dates: string[]): Omit<BacktestResult, 'dates' | 'portfolioValues' | 'benchmarkValues' | 'signals'> {
  const n = portfolioValues.length;
  const totalReturn = ((portfolioValues[n - 1] - portfolioValues[0]) / portfolioValues[0]) * 100;

  // CAGR
  const years = n / 252;
  const cagr = years > 0 ? (Math.pow(portfolioValues[n - 1] / portfolioValues[0], 1 / years) - 1) * 100 : 0;

  // Daily returns
  const returns = computeReturns(portfolioValues);

  // Volatility (annualized)
  const avgRet = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avgRet) ** 2, 0) / returns.length;
  const volatility = Math.sqrt(variance * 252) * 100;

  // Sharpe Ratio: (annualized excess return) / (annualized std dev)
  const excessReturns = returns.map(r => r - RISK_FREE);
  const avgExcess = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const excessStd = Math.sqrt(excessReturns.reduce((s, r) => s + (r - avgExcess) ** 2, 0) / excessReturns.length);
  const sharpe = excessStd > 0 ? (avgExcess * Math.sqrt(252)) / (excessStd * Math.sqrt(252)) : 0;

  // Max Drawdown
  let peak = portfolioValues[0];
  let maxDD = 0;
  portfolioValues.forEach(v => {
    peak = Math.max(peak, v);
    const dd = ((v - peak) / peak) * 100;
    maxDD = Math.min(maxDD, dd);
  });

  // Worst Quarter (~63 trading days)
  let worstQ = 0;
  for (let i = 63; i < n; i++) {
    const qRet = ((portfolioValues[i] - portfolioValues[i - 63]) / portfolioValues[i - 63]) * 100;
    worstQ = Math.min(worstQ, qRet);
  }

  return { totalReturn, cagr, volatility, maxDrawdown: maxDD, worstQuarter: worstQ, sharpeRatio: sharpe };
}

// ── Strategy 1: 60/40 Classic ──────────────────────────────────────────────

function backtest6040(spy: DailyPrice[], agg: DailyPrice[], stockPct: number): BacktestResult {
  // Align dates
  const aggMap = new Map(agg.map(d => [d.date, d.close]));
  const aligned = spy.filter(d => aggMap.has(d.date)).map(d => ({
    date: d.date,
    spyClose: d.close,
    aggClose: aggMap.get(d.date)!,
  }));

  const bondPct = 100 - stockPct;
  let stockShares = (INITIAL_CAPITAL * stockPct / 100) / aligned[0].spyClose;
  let bondShares = (INITIAL_CAPITAL * bondPct / 100) / aligned[0].aggClose;

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];
  let lastRebalanceMonth = -1;

  aligned.forEach((d, i) => {
    const month = new Date(d.date).getMonth();
    const portfolioVal = stockShares * d.spyClose + bondShares * d.aggClose;

    // Monthly rebalancing
    if (i > 0 && month !== lastRebalanceMonth) {
      stockShares = (portfolioVal * stockPct / 100) / d.spyClose;
      bondShares = (portfolioVal * bondPct / 100) / d.aggClose;
    }
    lastRebalanceMonth = month;

    portfolioValues.push(portfolioVal);
    benchmarkValues.push((INITIAL_CAPITAL / aligned[0].spyClose) * d.spyClose);
    dates.push(d.date);
  });

  return { dates, portfolioValues, benchmarkValues, ...computeMetrics(portfolioValues, dates) };
}

// ── Strategy 2: Trend Follower ─────────────────────────────────────────────

function backtestTrend(spy: DailyPrice[], speed: number): BacktestResult {
  // speed: 0=slow, 0.5=medium, 1=fast
  const shortPeriod = Math.round(50 - speed * 40); // 50→10
  const longPeriod = Math.round(200 - speed * 170); // 200→30

  const closes = spy.map(d => d.close);
  const shortMA = movingAverage(closes, shortPeriod);
  const longMA = movingAverage(closes, longPeriod);

  let cash = INITIAL_CAPITAL;
  let shares = 0;
  let invested = false;

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];
  const signals: SignalMarker[] = [];

  spy.forEach((d, i) => {
    const s = shortMA[i];
    const l = longMA[i];

    if (s !== null && l !== null) {
      if (s > l && !invested) {
        // Buy
        shares = cash / d.close;
        cash = 0;
        invested = true;
        signals.push({ date: d.date, type: 'buy', price: d.close });
      } else if (s <= l && invested) {
        // Sell
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

  return { dates, portfolioValues, benchmarkValues, signals, ...computeMetrics(portfolioValues, dates) };
}

// ── Strategy 3: Income Machine ─────────────────────────────────────────────

function backtestIncome(spy: DailyPrice[], agg: DailyPrice[], incomeWeight: number): BacktestResult {
  // incomeWeight: 0=all growth, 1=all income
  // Income proxy = AGG (lower vol, lower return)
  // Growth proxy = SPY (higher vol, higher return)
  // We add a small synthetic dividend yield to the income portion

  const aggMap = new Map(agg.map(d => [d.date, d.close]));
  const aligned = spy.filter(d => aggMap.has(d.date)).map(d => ({
    date: d.date,
    growthClose: d.close,
    incomeClose: aggMap.get(d.date)!,
  }));

  const growthPct = (1 - incomeWeight) * 100;
  const incomePct = incomeWeight * 100;

  let growthShares = (INITIAL_CAPITAL * growthPct / 100) / aligned[0].growthClose;
  let incomeShares = (INITIAL_CAPITAL * incomePct / 100) / aligned[0].incomeClose;

  // Simulate quarterly dividend reinvestment for income portion (3% annual yield proxy)
  const dailyDivYield = 0.03 / 252;

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];

  aligned.forEach((d) => {
    // Reinvest dividends on income portion
    incomeShares += (incomeShares * d.incomeClose * dailyDivYield) / d.incomeClose;

    const val = growthShares * d.growthClose + incomeShares * d.incomeClose;
    portfolioValues.push(val);
    benchmarkValues.push((INITIAL_CAPITAL / aligned[0].growthClose) * d.growthClose);
    dates.push(d.date);
  });

  return { dates, portfolioValues, benchmarkValues, ...computeMetrics(portfolioValues, dates) };
}

// ── Strategy 4: Speed Racer (Momentum) ─────────────────────────────────────

function backtestMomentum(spy: DailyPrice[], horizon: number): BacktestResult {
  // horizon: 0=short-term (1 month lookback), 1=long-term (12 month lookback)
  const lookbackDays = Math.round(21 + horizon * 231); // 21 days (1mo) to 252 days (12mo)

  let cash = INITIAL_CAPITAL;
  let shares = 0;
  let invested = false;

  const portfolioValues: number[] = [];
  const benchmarkValues: number[] = [];
  const dates: string[] = [];
  const signals: SignalMarker[] = [];

  spy.forEach((d, i) => {
    if (i >= lookbackDays) {
      const pastPrice = spy[i - lookbackDays].close;
      const momentum = (d.close - pastPrice) / pastPrice;

      if (momentum > 0 && !invested) {
        shares = cash / d.close;
        cash = 0;
        invested = true;
        signals.push({ date: d.date, type: 'buy', price: d.close });
      } else if (momentum <= 0 && invested) {
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

  return { dates, portfolioValues, benchmarkValues, signals, ...computeMetrics(portfolioValues, dates) };
}

// ── Main Hook ──────────────────────────────────────────────────────────────

export type StrategyType = 'allocation' | 'trend' | 'income' | 'momentum';

export function useStrategyBacktest(
  strategy: StrategyType,
  param: number, // 0-1 normalized slider value
  spy: DailyPrice[] | undefined,
  agg: DailyPrice[] | undefined,
) {
  return useMemo<BacktestResult | null>(() => {
    if (!spy || spy.length === 0) return null;

    switch (strategy) {
      case 'allocation': {
        if (!agg || agg.length === 0) return null;
        const stockPct = Math.round(param * 100);
        return backtest6040(spy, agg, stockPct);
      }
      case 'trend':
        return backtestTrend(spy, param);
      case 'income': {
        if (!agg || agg.length === 0) return null;
        return backtestIncome(spy, agg, param);
      }
      case 'momentum':
        return backtestMomentum(spy, param);
      default:
        return null;
    }
  }, [strategy, param, spy, agg]);
}
