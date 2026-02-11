import { useState, useMemo, useCallback } from 'react';
import {
  STOCKS, NASDAQ_MONTHLY, TECH_PE, SENTIMENT, BUBBLE_LEVEL, IPO_ACTIVITY,
  MONTH_LABELS, DECISION_EVENTS, getNewsForMonth, generateStockPrices,
  getStockPE, getTrend,
  type StockDef, type Sentiment, type DecisionEvent,
} from '@/data/dotcom-data';

export interface Holding {
  ticker: string;
  shares: number;
  avgCost: number;
}

export interface TradeEntry {
  month: number;
  date: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  value: number;
}

export interface StockSnapshot {
  def: StockDef;
  price: number;
  prevPrice: number;
  monthlyChange: number;
  return20d: number;
  pe: string;
  trend: 'Up' | 'Flat' | 'Down';
  priceHistory: number[];
  isBankrupt: boolean;
}

export interface MonthSnapshot {
  month: number;
  date: string;
  nasdaq: number;
  nasdaqPrev: number;
  ytdReturn: number;
  techPE: number;
  ipoActivity: string;
  sentiment: Sentiment;
  bubbleLevel: number;
  news: string[];
}

export function useDotcomSimulation() {
  const [month, setMonth] = useState(0);
  const [portfolio, setPortfolio] = useState<{ cash: number; holdings: Holding[] }>({
    cash: 1_000_000,
    holdings: [],
  });
  const [tradeLog, setTradeLog] = useState<TradeEntry[]>([]);
  const [activeDecision, setActiveDecision] = useState<DecisionEvent | null>(null);
  const [monthSummary, setMonthSummary] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  // Precompute all stock prices
  const allPrices = useMemo(() => {
    const map: Record<string, number[]> = {};
    STOCKS.forEach(s => { map[s.ticker] = generateStockPrices(s); });
    return map;
  }, []);

  // Current stock snapshots
  const stocks: StockSnapshot[] = useMemo(() => {
    return STOCKS.map(def => {
      const prices = allPrices[def.ticker];
      const price = prices[month];
      const prevPrice = month > 0 ? prices[month - 1] : price;
      const isBankrupt = def.bankruptMonth !== undefined && month >= def.bankruptMonth;
      const monthlyChange = prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;
      const m20 = Math.max(0, month - 1);
      const p20 = prices[m20];
      const return20d = p20 > 0 ? ((price - p20) / p20) * 100 : 0;
      const histStart = Math.max(0, month - 5);
      const priceHistory = prices.slice(histStart, month + 1);

      return {
        def,
        price,
        prevPrice,
        monthlyChange,
        return20d,
        pe: getStockPE(def, month, price),
        trend: getTrend(prices, month),
        priceHistory,
        isBankrupt,
      };
    }).filter(s => !s.isBankrupt);
  }, [month, allPrices]);

  // Month data
  const monthData: MonthSnapshot = useMemo(() => {
    const jan1999Nasdaq = NASDAQ_MONTHLY[0];
    const janThisYear = NASDAQ_MONTHLY[Math.floor(month / 12) * 12] || jan1999Nasdaq;
    return {
      month,
      date: MONTH_LABELS[month],
      nasdaq: NASDAQ_MONTHLY[month],
      nasdaqPrev: month > 0 ? NASDAQ_MONTHLY[month - 1] : NASDAQ_MONTHLY[0],
      ytdReturn: +((NASDAQ_MONTHLY[month] - janThisYear) / janThisYear * 100).toFixed(1),
      techPE: TECH_PE[month],
      ipoActivity: IPO_ACTIVITY[month],
      sentiment: SENTIMENT[month],
      bubbleLevel: BUBBLE_LEVEL[month],
      news: getNewsForMonth(month),
    };
  }, [month]);

  // NAV calculation
  const nav = useMemo(() => {
    return portfolio.cash + portfolio.holdings.reduce((sum, h) => {
      const price = allPrices[h.ticker]?.[month] ?? 0;
      return sum + h.shares * price;
    }, 0);
  }, [portfolio, month, allPrices]);

  const totalReturn = ((nav - 1_000_000) / 1_000_000) * 100;

  // Risk level (0-10) based on volatility exposure
  const riskLevel = useMemo(() => {
    if (portfolio.holdings.length === 0) return 0;
    const totalValue = nav - portfolio.cash;
    if (totalValue <= 0) return 0;
    let weighted = 0;
    portfolio.holdings.forEach(h => {
      const def = STOCKS.find(s => s.ticker === h.ticker);
      const price = allPrices[h.ticker]?.[month] ?? 0;
      const posValue = h.shares * price;
      const volScore = def?.volatility === 'High' ? 3 : def?.volatility === 'Medium' ? 2 : 1;
      weighted += (posValue / totalValue) * volScore;
    });
    return Math.min(10, Math.round((weighted / 3) * 10));
  }, [portfolio, nav, month, allPrices]);

  // Holdings count
  const holdingsCount = portfolio.holdings.filter(h => {
    const price = allPrices[h.ticker]?.[month] ?? 0;
    return h.shares > 0 && price > 0;
  }).length;

  // Buy stock (10% of current NAV)
  const buyStock = useCallback((ticker: string) => {
    const price = allPrices[ticker]?.[month];
    if (!price || price <= 0) return;
    const buyValue = nav * 0.1;
    if (buyValue > portfolio.cash) return; // not enough cash
    const shares = Math.floor(buyValue / price);
    if (shares <= 0) return;

    setPortfolio(prev => {
      const existing = prev.holdings.find(h => h.ticker === ticker);
      // Check 30% max
      const currentValue = existing ? existing.shares * price : 0;
      const newValue = currentValue + shares * price;
      if (newValue / nav > 0.30 && !existing) return prev; // would exceed 30%

      let newHoldings: Holding[];
      if (existing) {
        const totalShares = existing.shares + shares;
        const totalCost = existing.avgCost * existing.shares + price * shares;
        newHoldings = prev.holdings.map(h =>
          h.ticker === ticker ? { ...h, shares: totalShares, avgCost: totalCost / totalShares } : h
        );
      } else {
        newHoldings = [...prev.holdings, { ticker, shares, avgCost: price }];
      }
      return { cash: prev.cash - shares * price, holdings: newHoldings };
    });

    setTradeLog(prev => [...prev, {
      month, date: MONTH_LABELS[month], ticker, action: 'BUY', shares, price, value: shares * price,
    }]);
  }, [month, nav, portfolio.cash, allPrices]);

  // Sell stock (full position)
  const sellStock = useCallback((ticker: string) => {
    const price = allPrices[ticker]?.[month];
    if (!price) return;
    const holding = portfolio.holdings.find(h => h.ticker === ticker);
    if (!holding || holding.shares <= 0) return;

    const value = holding.shares * price;
    setPortfolio(prev => ({
      cash: prev.cash + value,
      holdings: prev.holdings.filter(h => h.ticker !== ticker),
    }));

    setTradeLog(prev => [...prev, {
      month, date: MONTH_LABELS[month], ticker, action: 'SELL', shares: holding.shares, price, value,
    }]);
  }, [month, portfolio.holdings, allPrices]);

  // Advance month
  const advanceMonth = useCallback(() => {
    if (month >= 45) return;
    const nextMonth = month + 1;

    // Wipe out bankrupt holdings
    setPortfolio(prev => {
      const surviving = prev.holdings.filter(h => {
        const def = STOCKS.find(s => s.ticker === h.ticker);
        return !(def?.bankruptMonth !== undefined && nextMonth >= def.bankruptMonth);
      });
      return { ...prev, holdings: surviving };
    });

    setMonth(nextMonth);
    setMonthSummary(generateMonthSummary(nextMonth));

    // Check for decision events
    const event = DECISION_EVENTS.find(e => e.month === nextMonth);
    if (event) {
      setTimeout(() => setActiveDecision(event), 800);
    }
  }, [month]);

  // Handle decision event choice
  const handleDecision = useCallback((action: string) => {
    // Decisions are experiential—they affect how the user feels, not hard portfolio changes
    // But we can auto-execute some moves
    if (action === 'cash_all') {
      // Sell all holdings
      setPortfolio(prev => {
        const totalValue = prev.holdings.reduce((sum, h) => {
          const price = allPrices[h.ticker]?.[month] ?? 0;
          return sum + h.shares * price;
        }, 0);
        return { cash: prev.cash + totalValue, holdings: [] };
      });
    } else if (action === 'reduce') {
      // Sell half of each position
      setPortfolio(prev => {
        let cashGained = 0;
        const newHoldings = prev.holdings.map(h => {
          const price = allPrices[h.ticker]?.[month] ?? 0;
          const sellShares = Math.floor(h.shares / 2);
          cashGained += sellShares * price;
          return { ...h, shares: h.shares - sellShares };
        }).filter(h => h.shares > 0);
        return { cash: prev.cash + cashGained, holdings: newHoldings };
      });
    }
    // 'hold' and 'buy_more' don't auto-execute—user does it manually
    setActiveDecision(null);
  }, [month, allPrices]);

  const dismissSummary = useCallback(() => setMonthSummary(null), []);
  const startSimulation = useCallback(() => setIsStarted(true), []);
  const isComplete = month >= 45;

  // Get position % for a ticker
  const getPositionPct = useCallback((ticker: string) => {
    const holding = portfolio.holdings.find(h => h.ticker === ticker);
    if (!holding || nav <= 0) return 0;
    const price = allPrices[ticker]?.[month] ?? 0;
    return +((holding.shares * price / nav) * 100).toFixed(1);
  }, [portfolio.holdings, nav, month, allPrices]);

  const getHolding = useCallback((ticker: string) => {
    return portfolio.holdings.find(h => h.ticker === ticker);
  }, [portfolio.holdings]);

  return {
    isStarted, startSimulation,
    month, monthData, stocks, nav, totalReturn, riskLevel,
    portfolio, holdingsCount, tradeLog, monthSummary, dismissSummary,
    activeDecision, handleDecision,
    buyStock, sellStock, advanceMonth, isComplete,
    getPositionPct, getHolding,
  };
}

function generateMonthSummary(month: number): string {
  const sentiment = SENTIMENT[month];
  const nasdaqChange = ((NASDAQ_MONTHLY[month] - NASDAQ_MONTHLY[month - 1]) / NASDAQ_MONTHLY[month - 1] * 100).toFixed(1);
  const direction = +nasdaqChange > 0 ? 'rose' : 'fell';

  const summaries: Record<Sentiment, string[]> = {
    'Optimistic': ["Tech continues to rally", "IPO market strong", "Investor confidence high"],
    'Euphoria': ["Euphoria grips the market", "New highs across tech", "Everyone is a genius"],
    'Concern': ["Cracks appearing in tech", "Volatility picks up", "Some investors take profits"],
    'Stress': ["Selling pressure mounts", "Layoffs begin in tech sector", "Cash is king mentality grows"],
    'Panic': ["Liquidation across the board", "Investor panic widespread", "No bottom in sight"],
  };

  const bullets = summaries[sentiment];
  return `Nasdaq ${direction} ${Math.abs(+nasdaqChange)}% · ${bullets[month % bullets.length]}`;
}
