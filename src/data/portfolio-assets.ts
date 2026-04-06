// Curated asset universe for the Portfolio Builder module

export interface PortfolioAsset {
  ticker: string;
  name: string;
  category: 'stock' | 'etf' | 'bond' | 'alternative';
  sector: string;
  color: string; // HSL for allocation bar
}

export const ASSET_UNIVERSE: PortfolioAsset[] = [
  // Technology
  { ticker: 'AAPL', name: 'Apple', category: 'stock', sector: 'Technology', color: 'hsl(220 70% 55%)' },
  { ticker: 'MSFT', name: 'Microsoft', category: 'stock', sector: 'Technology', color: 'hsl(200 65% 50%)' },
  // Finance
  { ticker: 'JPM', name: 'JPMorgan', category: 'stock', sector: 'Finance', color: 'hsl(35 80% 50%)' },
  // Healthcare
  { ticker: 'JNJ', name: 'Johnson & Johnson', category: 'stock', sector: 'Healthcare', color: 'hsl(150 55% 45%)' },
  // Consumer
  { ticker: 'PG', name: 'Procter & Gamble', category: 'stock', sector: 'Consumer', color: 'hsl(270 50% 55%)' },
  { ticker: 'KO', name: 'Coca-Cola', category: 'stock', sector: 'Consumer', color: 'hsl(0 65% 50%)' },
  // Energy
  { ticker: 'XOM', name: 'ExxonMobil', category: 'stock', sector: 'Energy', color: 'hsl(45 75% 50%)' },
  // Industrials
  { ticker: 'CAT', name: 'Caterpillar', category: 'stock', sector: 'Industrials', color: 'hsl(55 70% 48%)' },
  // ETFs
  { ticker: 'SPY', name: 'S&P 500 ETF', category: 'etf', sector: 'Broad Market', color: 'hsl(210 60% 50%)' },
  { ticker: 'QQQ', name: 'NASDAQ ETF', category: 'etf', sector: 'Tech-Heavy', color: 'hsl(180 55% 45%)' },
  // Bonds
  { ticker: 'AGG', name: 'Bond ETF', category: 'bond', sector: 'Bonds', color: 'hsl(100 40% 50%)' },
  // Alternatives
  { ticker: 'GLD', name: 'Gold ETF', category: 'alternative', sector: 'Commodities', color: 'hsl(48 85% 55%)' },
];

export const ASSET_CATEGORIES = [
  { key: 'stock', label: 'Stocks', icon: '📊' },
  { key: 'etf', label: 'ETFs', icon: '📈' },
  { key: 'bond', label: 'Bonds', icon: '🟢' },
  { key: 'alternative', label: 'Alternatives', icon: '🟡' },
] as const;

export const MAX_PORTFOLIO_ASSETS = 5;
