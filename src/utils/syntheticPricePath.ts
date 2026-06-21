import type { PricePoint } from '@/hooks/useMarketData';

// Base prices for 2025-era tickers used in hypothetical scenarios
const BASE_PRICES_2025: Record<string, number> = {
  // Mean reversion stocks
  NVDA: 140, META: 580, AMZN: 220, GOOGL: 185, MSFT: 415,
  AMD: 125, TSLA: 390, NFLX: 870, SNOW: 145, PLTR: 65,
  // Vol shock stocks
  RIVN: 14, UPST: 50, SQ: 75, ABNB: 135, COIN: 250,
  MSTR: 350, ROKU: 80,
  JPM: 230, BAC: 45, GS: 550,
  GLD: 240,
  VZ: 40,
  // Valuation correction stocks
  AAPL: 240, LLY: 780, V: 315, MA: 525, COST: 950,
  CVX: 155, 'BRK-B': 450,
  // Shared
  KO: 62, JNJ: 155, PG: 165, WMT: 90, XOM: 110,
  // Index prices
  '^IXIC': 19500,
  '^GSPC': 5900,
};

// Beta per ticker per scenario — controls each stock's drawdown relative to the index.
// beta > 1 = falls more than index; beta < 1 = falls less.
const SCENARIO_BETAS: Record<string, Record<string, number>> = {
  'mean-reversion': {
    NVDA: 2.0, META: 1.6, AMZN: 1.5, GOOGL: 1.3, MSFT: 1.2,
    AMD: 1.8, TSLA: 2.1, NFLX: 1.4, SNOW: 2.2, PLTR: 2.3,
    KO: 0.35, JNJ: 0.30, PG: 0.32, WMT: 0.40, XOM: 0.45,
  },
  'volatility-shock': {
    TSLA: 2.5, RIVN: 3.2, UPST: 3.5, SQ: 2.3, ABNB: 2.0,
    COIN: 3.8, MSTR: 4.5, ROKU: 2.8,
    JPM: 1.1, BAC: 1.3, GS: 1.2,
    GLD: 0.15, XOM: 0.50, WMT: 0.30, VZ: 0.25,
  },
  'valuation-correction': {
    NVDA: 1.9, MSFT: 1.3, AAPL: 1.1, META: 1.5, GOOGL: 1.2,
    AMZN: 1.4, LLY: 1.6, V: 1.0, MA: 1.0, COST: 1.2,
    XOM: 0.50, CVX: 0.55, JPM: 0.90, 'BRK-B': 0.65, VZ: 0.28,
  },
};

// Deterministic PRNG — same algorithm as useMarketData.ts generateSimulatedData
function makePrng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Box-Muller transform: uniform → standard normal
function boxMuller(u1: number, u2: number): number {
  return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
}

// Count trading days in a date range (Mon–Fri only)
function countTradingDays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// Add N calendar months to a date
function addMonths(d: Date, months: number): Date {
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  return result;
}

interface SyntheticPathParams {
  startDate: string;
  endDate: string;
  startPrice: number;
  peakDrawdown: number;       // e.g. -0.45
  annualizedVol: number;      // base annualized vol (crash phase multiplied ×1.4)
  drawdownStartMonth: number;
  drawdownDurationMonths: number;
  seed: number;
}

function generatePath(params: SyntheticPathParams): PricePoint[] {
  const { startDate, endDate, startPrice, peakDrawdown, annualizedVol,
    drawdownStartMonth, drawdownDurationMonths, seed } = params;

  const random = makePrng(seed);
  const start = new Date(startDate);
  const end = new Date(endDate);
  const crashStart = addMonths(start, drawdownStartMonth);
  const crashEnd = addMonths(crashStart, drawdownDurationMonths);

  const floor = startPrice * (1 + peakDrawdown);
  const dt = 1 / 252; // daily time step in years

  // Determine phase for a given date
  const phase = (d: Date): 'top' | 'crash' | 'stable' => {
    if (d < crashStart) return 'top';
    if (d <= crashEnd) return 'crash';
    return 'stable';
  };

  // Calculate crash drift so GBM expected value reaches peakDrawdown at crash end
  const crashTradingDays = countTradingDays(crashStart, crashEnd);
  const volCrash = annualizedVol * 1.4;
  // Solve: log(1 + peakDrawdown) = (μ_crash - σ²/2) × T_crash × 252 × dt
  const logTarget = Math.log(1 + peakDrawdown);
  const driftCrash = (logTarget / Math.max(crashTradingDays, 1)) + (volCrash * volCrash / 2) * dt;

  const points: PricePoint[] = [];
  let price = startPrice;
  const cur = new Date(start);

  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) {
      const p = phase(cur);
      let vol: number;
      let drift: number;

      if (p === 'top') {
        vol = annualizedVol * 0.8;
        drift = 0.0002; // slight positive drift
      } else if (p === 'crash') {
        vol = volCrash;
        drift = driftCrash;
      } else {
        vol = annualizedVol;
        drift = 0.0001; // slow stabilization
      }

      const u1 = Math.max(random(), 1e-10);
      const u2 = random();
      const z = boxMuller(u1, u2);
      const dailyReturn = (drift - (vol * vol) / 2) * dt + vol * Math.sqrt(dt) * z;
      price = Math.max(price * Math.exp(dailyReturn), p === 'crash' ? floor : 1);

      const dayVol = price * vol * Math.sqrt(dt) * (0.5 + random() * 0.5);

      points.push({
        date: cur.toISOString().split('T')[0],
        open: price * (1 + (random() - 0.5) * 0.005),
        high: price + dayVol * random(),
        low: Math.max(price - dayVol * random(), 1),
        close: price,
        volume: Math.floor(500000 + random() * 20000000),
      });
    }
    cur.setDate(cur.getDate() + 1);
  }

  return points;
}

// Hash a string to a numeric seed
function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0x7fffffff;
  return Math.max(h, 1);
}

/**
 * Generate synthetic market data for all tickers in a hypothetical scenario.
 * Returns the same shape as useMarketData — Record<ticker, PricePoint[]>.
 */
export function generateSyntheticMarketData(
  tickers: string[],
  scenarioId: string,
  startDate: string,
  endDate: string,
  peakDrawdown: number,
  annualizedVol: number,
  drawdownStartMonth: number,
  drawdownDurationMonths: number,
): Record<string, PricePoint[]> {
  const betas = SCENARIO_BETAS[scenarioId] ?? {};
  const result: Record<string, PricePoint[]> = {};

  for (const ticker of tickers) {
    const beta = betas[ticker] ?? 1.0;
    const startPrice = BASE_PRICES_2025[ticker] ?? 50 + hashSeed(ticker) % 150;
    const tickerDrawdown = Math.max(peakDrawdown * beta, -0.95); // cap at -95%
    // Index tickers are not beta-scaled (they ARE the reference)
    const effectiveDrawdown = ticker.startsWith('^') ? peakDrawdown : tickerDrawdown;

    result[ticker] = generatePath({
      startDate,
      endDate,
      startPrice,
      peakDrawdown: effectiveDrawdown,
      annualizedVol: ticker.startsWith('^') ? annualizedVol : annualizedVol * (0.7 + beta * 0.3),
      drawdownStartMonth,
      drawdownDurationMonths,
      seed: hashSeed(ticker + scenarioId),
    });
  }

  return result;
}
