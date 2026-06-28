// Curated asset universe for the Portfolio Builder module

export type AssetTag =
  | 'Growth' | 'Value' | 'Defensive' | 'Dividend'
  | 'High Vol' | 'Low Vol'
  | 'Broad Market' | 'Tech' | 'Cyclical'
  | 'Inflation Hedge' | 'Safe Haven';

export interface PortfolioAsset {
  ticker: string;
  name: string;
  category: 'stock' | 'etf' | 'bond' | 'alternative';
  sector: string;
  color: string;
  description: string;        // one-line plain-English description
  tags: AssetTag[];
  correlationGroup: string;   // assets sharing a group are highly correlated
}

export const ASSET_UNIVERSE: PortfolioAsset[] = [
  // Technology
  {
    ticker: 'AAPL', name: 'Apple', category: 'stock', sector: 'Technology',
    color: 'hsl(220 70% 55%)',
    description: 'Consumer electronics & services giant. Strong brand, high margins, but moves with tech sentiment.',
    tags: ['Growth', 'High Vol', 'Tech'],
    correlationGroup: 'tech-growth',
  },
  {
    ticker: 'MSFT', name: 'Microsoft', category: 'stock', sector: 'Technology',
    color: 'hsl(200 65% 50%)',
    description: 'Cloud & enterprise software leader. Stable recurring revenue, less volatile than peers.',
    tags: ['Growth', 'High Vol', 'Tech'],
    correlationGroup: 'tech-growth',
  },
  // Finance
  {
    ticker: 'JPM', name: 'JPMorgan', category: 'stock', sector: 'Finance',
    color: 'hsl(35 80% 50%)',
    description: 'Largest US bank. Benefits from rising interest rates; sensitive to economic cycles.',
    tags: ['Value', 'Dividend', 'Cyclical'],
    correlationGroup: 'financials-cyclical',
  },
  // Healthcare
  {
    ticker: 'JNJ', name: 'Johnson & Johnson', category: 'stock', sector: 'Healthcare',
    color: 'hsl(150 55% 45%)',
    description: 'Healthcare products & pharma. Consistent dividend payer, holds up well in recessions.',
    tags: ['Defensive', 'Dividend', 'Low Vol'],
    correlationGroup: 'defensive-dividend',
  },
  // Consumer
  {
    ticker: 'PG', name: 'Procter & Gamble', category: 'stock', sector: 'Consumer',
    color: 'hsl(270 50% 55%)',
    description: 'Everyday consumer staples (Tide, Pampers). Slow but steady — people buy these in any economy.',
    tags: ['Defensive', 'Dividend', 'Low Vol'],
    correlationGroup: 'defensive-dividend',
  },
  {
    ticker: 'KO', name: 'Coca-Cola', category: 'stock', sector: 'Consumer',
    color: 'hsl(0 65% 50%)',
    description: 'Classic dividend payer with a global brand. Very low volatility, valued for income not growth.',
    tags: ['Defensive', 'Dividend', 'Low Vol'],
    correlationGroup: 'defensive-dividend',
  },
  // Energy
  {
    ticker: 'XOM', name: 'ExxonMobil', category: 'stock', sector: 'Energy',
    color: 'hsl(45 75% 50%)',
    description: 'Largest US oil company. Surges when oil prices rise — a natural inflation hedge.',
    tags: ['Value', 'Dividend', 'High Vol'],
    correlationGroup: 'energy',
  },
  // Industrials
  {
    ticker: 'CAT', name: 'Caterpillar', category: 'stock', sector: 'Industrials',
    color: 'hsl(55 70% 48%)',
    description: 'Heavy machinery for construction & mining. A barometer of global economic activity.',
    tags: ['Value', 'Cyclical', 'High Vol'],
    correlationGroup: 'financials-cyclical',
  },
  // Tech Giants
  {
    ticker: 'NVDA', name: 'Nvidia', category: 'stock', sector: 'Technology',
    color: 'hsl(145 60% 45%)',
    description: 'Dominant AI chip maker. Extraordinary growth in 2023–2024, but extreme volatility.',
    tags: ['Growth', 'High Vol', 'Tech'],
    correlationGroup: 'tech-growth',
  },
  {
    ticker: 'AMZN', name: 'Amazon', category: 'stock', sector: 'Technology',
    color: 'hsl(28 90% 52%)',
    description: 'E-commerce + cloud (AWS). Revenue streams are diverse, less pure-tech than AAPL/MSFT.',
    tags: ['Growth', 'High Vol'],
    correlationGroup: 'tech-growth',
  },
  {
    ticker: 'GOOGL', name: 'Alphabet (Google)', category: 'stock', sector: 'Technology',
    color: 'hsl(210 80% 55%)',
    description: 'Search, YouTube, and Google Cloud. Advertising revenue makes it sensitive to economic cycles.',
    tags: ['Growth', 'High Vol', 'Tech'],
    correlationGroup: 'tech-growth',
  },
  // Value / Defensive
  {
    ticker: 'BRKB', name: 'Berkshire Hathaway', category: 'stock', sector: 'Finance',
    color: 'hsl(30 60% 45%)',
    description: "Buffett's diversified conglomerate. Value investing benchmark — steady, low-drama returns.",
    tags: ['Value', 'Defensive'],
    correlationGroup: 'broad-equity',
  },
  {
    ticker: 'NEE', name: 'NextEra Energy', category: 'stock', sector: 'Utilities',
    color: 'hsl(165 50% 45%)',
    description: 'Largest US utility + clean energy. Pays steady dividends; falls when interest rates rise.',
    tags: ['Defensive', 'Dividend', 'Low Vol'],
    correlationGroup: 'defensive-dividend',
  },
  // ETFs
  {
    ticker: 'SPY', name: 'S&P 500 ETF', category: 'etf', sector: 'Broad Market',
    color: 'hsl(210 60% 50%)',
    description: 'Tracks the 500 largest US companies. The most diversified single asset on this list.',
    tags: ['Broad Market', 'Growth'],
    correlationGroup: 'broad-equity',
  },
  {
    ticker: 'QQQ', name: 'NASDAQ ETF', category: 'etf', sector: 'Tech-Heavy',
    color: 'hsl(180 55% 45%)',
    description: 'Top 100 non-financial NASDAQ stocks — heavily weighted to Apple, Microsoft, Nvidia.',
    tags: ['Tech', 'Growth', 'High Vol'],
    correlationGroup: 'tech-growth',
  },
  {
    ticker: 'IWM', name: 'Small-Cap ETF', category: 'etf', sector: 'Small Cap',
    color: 'hsl(300 45% 55%)',
    description: 'Russell 2000 small-cap stocks. Higher growth potential but more volatile than SPY.',
    tags: ['Growth', 'High Vol'],
    correlationGroup: 'broad-equity',
  },
  {
    ticker: 'EFA', name: 'International ETF', category: 'etf', sector: 'International',
    color: 'hsl(240 50% 60%)',
    description: 'Developed markets outside the US (Europe, Japan, Australia). Geographic diversification.',
    tags: ['Broad Market', 'Defensive'],
    correlationGroup: 'international',
  },
  {
    ticker: 'VNQ', name: 'Real Estate ETF', category: 'etf', sector: 'Real Estate',
    color: 'hsl(15 70% 50%)',
    description: 'US Real Estate Investment Trusts (REITs). Income from rent, sensitive to interest rates.',
    tags: ['Dividend', 'Inflation Hedge'],
    correlationGroup: 'real-estate',
  },
  // Bonds
  {
    ticker: 'AGG', name: 'Bond ETF', category: 'bond', sector: 'Bonds',
    color: 'hsl(100 40% 50%)',
    description: 'Broad US bond market (Treasuries + corporate bonds). Cushions stock drawdowns but hurt by rising rates.',
    tags: ['Defensive', 'Low Vol', 'Safe Haven'],
    correlationGroup: 'bonds',
  },
  {
    ticker: 'TLT', name: 'Long-Term Treasury', category: 'bond', sector: 'Bonds',
    color: 'hsl(120 35% 48%)',
    description: '20+ year US Treasury bonds. Maximum interest rate sensitivity — big swings when rates change.',
    tags: ['Safe Haven', 'High Vol', 'Low Vol'],
    correlationGroup: 'bonds',
  },
  {
    ticker: 'HYG', name: 'High-Yield Bond ETF', category: 'bond', sector: 'Bonds',
    color: 'hsl(80 45% 48%)',
    description: 'Corporate "junk" bonds. Higher yield than AGG but behaves more like stocks in a downturn.',
    tags: ['Dividend', 'High Vol'],
    correlationGroup: 'high-yield',
  },
  // Alternatives
  {
    ticker: 'GLD', name: 'Gold ETF', category: 'alternative', sector: 'Commodities',
    color: 'hsl(48 85% 55%)',
    description: 'Tracks physical gold. Rises during inflation and crises. Low correlation to stocks and bonds.',
    tags: ['Inflation Hedge', 'Safe Haven'],
    correlationGroup: 'gold',
  },
];

export const ASSET_CATEGORIES = [
  { key: 'stock', label: 'Stocks', icon: '📊' },
  { key: 'etf',   label: 'ETFs',   icon: '📈' },
  { key: 'bond',  label: 'Bonds',  icon: '🟢' },
  { key: 'alternative', label: 'Alternatives', icon: '🟡' },
] as const;

export const MAX_PORTFOLIO_ASSETS = 6;

// Correlation warnings: shown when ≥2 assets from same group are selected
export const CORRELATION_WARNINGS: Record<string, string> = {
  'tech-growth':
    'Several of your selected assets are technology-heavy (AAPL, MSFT, NVDA, AMZN, GOOGL, QQQ). They tend to rise and fall together — holding multiple tech assets reduces actual diversification. Consider balancing with a bond, gold, or defensive stock.',
  'defensive-dividend':
    'JNJ, PG, KO, and NEE are all defensive/dividend stocks with similar risk profiles. They behave similarly in most markets — you may not gain much diversification from holding more than one.',
  'financials-cyclical':
    'JPM and CAT are both cyclical stocks that track the economic cycle. They often move in the same direction, especially during recessions or recoveries.',
  'bonds':
    'AGG and TLT are both bond assets highly sensitive to interest rates — they tend to move together. TLT has more extreme swings due to its longer duration.',
  'broad-equity':
    'SPY, IWM, and BRK-B all broadly track the US equity market. Their returns are fairly correlated — consider adding international (EFA) or non-equity assets for genuine diversification.',
};

// Tag colours for display
export const TAG_STYLES: Record<AssetTag, string> = {
  'Growth':          'bg-blue-500/10 text-blue-400',
  'Value':           'bg-amber-500/10 text-amber-400',
  'Defensive':       'bg-green-500/10 text-green-500',
  'Dividend':        'bg-teal-500/10 text-teal-400',
  'High Vol':        'bg-red-500/10 text-red-400',
  'Low Vol':         'bg-emerald-500/10 text-emerald-500',
  'Broad Market':    'bg-purple-500/10 text-purple-400',
  'Tech':            'bg-cyan-500/10 text-cyan-400',
  'Cyclical':        'bg-orange-500/10 text-orange-400',
  'Inflation Hedge': 'bg-yellow-500/10 text-yellow-500',
  'Safe Haven':      'bg-slate-500/10 text-slate-400',
};
