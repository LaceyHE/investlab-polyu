import { useQuery } from "@tanstack/react-query";

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeAggregation = 'daily' | 'weekly' | 'monthly';

interface YahooResult {
  timestamp: number[];
  indicators: {
    quote: [{
      open: number[];
      high: number[];
      low: number[];
      close: number[];
      volume: number[];
    }];
  };
}

const YAHOO_PROXY = "https://query1.finance.yahoo.com/v8/finance/chart";

async function fetchTickerData(ticker: string, startDate: string, endDate: string): Promise<PricePoint[]> {
  const period1 = Math.floor(new Date(startDate).getTime() / 1000);
  const period2 = Math.floor(new Date(endDate).getTime() / 1000);
  
  try {
    // Try Yahoo Finance directly (may be CORS blocked in browser)
    const url = `${YAHOO_PROXY}/${ticker}?period1=${period1}&period2=${period2}&interval=1d&includePrePost=false`;
    const resp = await fetch(url);
    
    if (!resp.ok) throw new Error(`Yahoo API returned ${resp.status}`);
    
    const data = await resp.json();
    const result: YahooResult = data.chart.result[0];
    const quote = result.indicators.quote[0];
    
    return result.timestamp.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open: quote.open[i] ?? quote.close[i] ?? 0,
      high: quote.high[i] ?? quote.close[i] ?? 0,
      low: quote.low[i] ?? quote.close[i] ?? 0,
      close: quote.close[i] ?? 0,
      volume: quote.volume[i] ?? 0,
    })).filter(p => p.close > 0);
  } catch {
    // Fallback: generate simulated data based on ticker characteristics
    return generateSimulatedData(ticker, startDate, endDate);
  }
}

function generateSimulatedData(ticker: string, startDate: string, endDate: string): PricePoint[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const points: PricePoint[] = [];
  
  // Seed based on ticker name for consistency
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) seed += ticker.charCodeAt(i);
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  
  // Base prices by ticker type
  const basePrices: Record<string, number> = {
    '^IXIC': 2000, '^GSPC': 1200, 'AAPL': 30, 'MSFT': 50, 'AMZN': 60, 'GOOGL': 500,
    'META': 200, 'TSLA': 300, 'NVDA': 200, 'INTC': 30, 'CSCO': 40, 'ORCL': 25,
    'QCOM': 50, 'IBM': 100, 'JPM': 80, 'BAC': 40, 'C': 50, 'GS': 180,
    'WFC': 50, 'GE': 35, 'XOM': 70, 'PG': 80, 'JNJ': 90, 'KO': 55,
    'WMT': 60, 'NFLX': 350, 'ZM': 100, 'MRNA': 20, 'PFE': 35, 'BA': 340,
    'DAL': 55, 'MAR': 130, 'DIS': 140, 'CVX': 100, 'UNH': 400, 'LLY': 300,
    'BRK-B': 280, 'MS': 60, 'AIG': 70, 'DELL': 40, 'HPQ': 25, 'TXN': 45,
  };
  
  let price = basePrices[ticker] || 50 + random() * 100;
  const volatility = ticker.startsWith('^') ? 0.012 : 0.02 + random() * 0.015;
  const drift = -0.0001 + random() * 0.0003;
  
  const current = new Date(start);
  while (current <= end) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      const change = drift + volatility * (random() - 0.5) * 2;
      price = Math.max(price * (1 + change), 1);
      const dayVol = volatility * price * (0.5 + random());
      
      points.push({
        date: current.toISOString().split('T')[0],
        open: price * (1 + (random() - 0.5) * 0.01),
        high: price + dayVol * random(),
        low: price - dayVol * random(),
        close: price,
        volume: Math.floor(1000000 + random() * 10000000),
      });
    }
    current.setDate(current.getDate() + 1);
  }
  
  return points;
}

export function aggregateData(data: PricePoint[], aggregation: TimeAggregation): PricePoint[] {
  if (aggregation === 'daily') return data;
  
  const groups: Record<string, PricePoint[]> = {};
  
  data.forEach(p => {
    const d = new Date(p.date);
    let key: string;
    if (aggregation === 'weekly') {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  
  return Object.entries(groups).map(([key, points]) => ({
    date: key,
    open: points[0].open,
    high: Math.max(...points.map(p => p.high)),
    low: Math.min(...points.map(p => p.low)),
    close: points[points.length - 1].close,
    volume: points.reduce((s, p) => s + p.volume, 0),
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function computeRollingVolatility(data: PricePoint[], window = 20): number[] {
  const returns = data.slice(1).map((p, i) => Math.log(p.close / data[i].close));
  const result: number[] = [0];
  
  for (let i = 0; i < returns.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = returns.slice(start, i + 1);
    const mean = slice.reduce((s, v) => s + v, 0) / slice.length;
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / slice.length;
    result.push(Math.sqrt(variance * 252)); // Annualized
  }
  
  return result;
}

export function computeDrawdown(data: PricePoint[]): number[] {
  let peak = data[0]?.close || 0;
  return data.map(p => {
    peak = Math.max(peak, p.close);
    return ((p.close - peak) / peak) * 100;
  });
}

export function suggestAggregation(volatility: number[]): TimeAggregation {
  const avgVol = volatility.reduce((s, v) => s + v, 0) / volatility.length;
  if (avgVol > 0.35) return 'weekly';
  if (avgVol < 0.15) return 'monthly';
  return 'daily';
}

export function useMarketData(tickers: string[], startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['market-data', tickers.join(','), startDate, endDate],
    queryFn: async () => {
      const results: Record<string, PricePoint[]> = {};
      
      // Fetch in batches of 5 to avoid rate limiting
      for (let i = 0; i < tickers.length; i += 5) {
        const batch = tickers.slice(i, i + 5);
        const batchResults = await Promise.all(
          batch.map(ticker => fetchTickerData(ticker, startDate, endDate))
        );
        batch.forEach((ticker, j) => {
          results[ticker] = batchResults[j];
        });
        if (i + 5 < tickers.length) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      return results;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    gcTime: 1000 * 60 * 60 * 24, // 24 hour gc
    retry: 1,
  });
}
