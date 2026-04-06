import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { PricePoint } from "./useMarketData";

export interface Position {
  ticker: string;
  weight: number; // 0-100
  entryDate: string;
  entryPrice: number;
}

export interface TradeMarker {
  date: string;
  ticker: string;
  action: 'buy' | 'sell';
  price: number;
  weight: number;
}

export interface PortfolioMetrics {
  totalReturn: number;
  cagr: number;
  maxDrawdown: number;
  worstQuarter: number;
  sharpeRatio: number;
  volatility: number;
  netExposure: number;
}

export interface SimulationState {
  currentDateIndex: number;
  positions: Position[];
  cashWeight: number;
  navHistory: { date: string; value: number }[];
  tradeHistory: TradeMarker[];
  initialCapital: number;
  currentNav: number;
}

export function useScenarioSimulation(
  marketData: Record<string, PricePoint[]> | undefined,
  allDates: string[]
) {
  const [state, setState] = useState<SimulationState>({
    currentDateIndex: 0,
    positions: [],
    cashWeight: 100,
    navHistory: [],
    tradeHistory: [],
    initialCapital: 1000000,
    currentNav: 1000000,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const intervalRef = useRef<number | null>(null);

  const currentDate = allDates[state.currentDateIndex] || allDates[0] || '';

  // Calculate NAV at current date
  const calculateNav = useCallback((positions: Position[], dateIndex: number): number => {
    if (!marketData || allDates.length === 0) return state.initialCapital;
    
    const cashValue = (state.initialCapital * (100 - positions.reduce((s, p) => s + p.weight, 0))) / 100;
    
    let positionValue = 0;
    positions.forEach(pos => {
      const tickerData = marketData[pos.ticker];
      if (!tickerData) return;
      
      const currentPrice = getTickerPriceAtDate(tickerData, allDates[dateIndex]);
      const entryPrice = pos.entryPrice || currentPrice;
      
      if (entryPrice > 0) {
        const shares = (state.initialCapital * pos.weight / 100) / entryPrice;
        positionValue += shares * currentPrice;
      }
    });
    
    return cashValue + positionValue;
  }, [marketData, allDates, state.initialCapital]);

  // Scrub timeline
  const setDateIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, allDates.length - 1));
    setState(prev => {
      const nav = prev.positions.length > 0 ? calculateNav(prev.positions, clamped) : prev.initialCapital;
      const newHistory = [...prev.navHistory];
      
      // Fill in history up to this point
      if (clamped > prev.currentDateIndex) {
        for (let i = prev.currentDateIndex + 1; i <= clamped; i++) {
          const dateNav = prev.positions.length > 0 ? calculateNav(prev.positions, i) : prev.initialCapital;
          const existing = newHistory.findIndex(h => h.date === allDates[i]);
          if (existing === -1) {
            newHistory.push({ date: allDates[i], value: dateNav });
          }
        }
      }
      
      return {
        ...prev,
        currentDateIndex: clamped,
        currentNav: nav,
        navHistory: newHistory,
      };
    });
  }, [allDates, calculateNav]);

  // Update position weight
  const updatePosition = useCallback((ticker: string, weight: number) => {
    setState(prev => {
      const existing = prev.positions.find(p => p.ticker === ticker);
      let newPositions: Position[];
      
      if (weight <= 0) {
        newPositions = prev.positions.filter(p => p.ticker !== ticker);
        // Record sell trade
        const tickerData = marketData?.[ticker];
        if (tickerData && existing) {
          const price = getTickerPriceAtDate(tickerData, allDates[prev.currentDateIndex]);
          return {
            ...prev,
            positions: newPositions,
            cashWeight: 100 - newPositions.reduce((s, p) => s + p.weight, 0),
            tradeHistory: [...prev.tradeHistory, { date: allDates[prev.currentDateIndex], ticker, action: 'sell' as const, price, weight: 0 }],
          };
        }
      } else if (existing) {
        newPositions = prev.positions.map(p => p.ticker === ticker ? { ...p, weight } : p);
      } else {
        const tickerData = marketData?.[ticker];
        const price = tickerData ? getTickerPriceAtDate(tickerData, allDates[prev.currentDateIndex]) : 0;
        newPositions = [...prev.positions, { ticker, weight, entryDate: allDates[prev.currentDateIndex], entryPrice: price }];
        
        return {
          ...prev,
          positions: newPositions,
          cashWeight: 100 - newPositions.reduce((s, p) => s + p.weight, 0),
          tradeHistory: [...prev.tradeHistory, { date: allDates[prev.currentDateIndex], ticker, action: 'buy' as const, price, weight }],
        };
      }
      
      return {
        ...prev,
        positions: newPositions,
        cashWeight: 100 - newPositions.reduce((s, p) => s + p.weight, 0),
      };
    });
  }, [marketData, allDates]);

  // Playback controls
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.currentDateIndex >= allDates.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev.currentDateIndex + 1;
          const nav = prev.positions.length > 0 ? calculateNav(prev.positions, next) : prev.initialCapital;
          return {
            ...prev,
            currentDateIndex: next,
            currentNav: nav,
            navHistory: [...prev.navHistory, { date: allDates[next], value: nav }],
          };
        });
      }, 1000 / playSpeed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playSpeed, allDates, calculateNav]);

  // Compute metrics
  const metrics: PortfolioMetrics = useMemo(() => {
    const navHist = state.navHistory;
    if (navHist.length < 2) {
      return { totalReturn: 0, cagr: 0, maxDrawdown: 0, worstQuarter: 0, sharpeRatio: 0, volatility: 0, netExposure: 100 - state.cashWeight };
    }

    const initial = state.initialCapital;
    const current = state.currentNav;
    const totalReturn = ((current - initial) / initial) * 100;

    const years = navHist.length / 252;
    const cagr = years > 0 ? (Math.pow(current / initial, 1 / Math.max(years, 0.01)) - 1) * 100 : 0;

    let peak = initial;
    let maxDD = 0;
    navHist.forEach(h => {
      peak = Math.max(peak, h.value);
      const dd = ((h.value - peak) / peak) * 100;
      maxDD = Math.min(maxDD, dd);
    });

    // Rolling returns for worst quarter & sharpe
    const returns = navHist.slice(1).map((h, i) => (h.value - navHist[i].value) / navHist[i].value);
    const avgReturn = returns.reduce((s, r) => s + r, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length);
    const annualizedVol = stdDev * Math.sqrt(252) * 100;
    const sharpe = stdDev > 0 ? (avgReturn * 252) / (stdDev * Math.sqrt(252)) : 0;

    // Worst quarter (63 trading days)
    let worstQ = 0;
    for (let i = 63; i < navHist.length; i++) {
      const qReturn = ((navHist[i].value - navHist[i - 63].value) / navHist[i - 63].value) * 100;
      worstQ = Math.min(worstQ, qReturn);
    }

    return {
      totalReturn,
      cagr,
      maxDrawdown: maxDD,
      worstQuarter: worstQ,
      sharpeRatio: sharpe,
      volatility: annualizedVol,
      netExposure: 100 - state.cashWeight,
    };
  }, [state.navHistory, state.currentNav, state.initialCapital, state.cashWeight]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setState({
      currentDateIndex: 0,
      positions: [],
      cashWeight: 100,
      navHistory: [],
      tradeHistory: [],
      initialCapital: 1000000,
      currentNav: 1000000,
    });
  }, []);

  return {
    state,
    currentDate,
    metrics,
    isPlaying,
    playSpeed,
    setDateIndex,
    updatePosition,
    setIsPlaying,
    setPlaySpeed,
    reset,
  };
}

function getTickerPriceAtDate(data: PricePoint[], date: string): number {
  // Find exact or nearest earlier date
  let closest = data[0];
  for (const p of data) {
    if (p.date <= date) closest = p;
    else break;
  }
  return closest?.close || 0;
}
