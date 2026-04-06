// Dot-Com Bubble stock universe (1998–2002)
// Industry = user-facing label, riskCategory = internal for AI commentary only

export type RiskCategory = 'failed' | 'moderate' | 'resilient';

export interface DotComStock {
  ticker: string;
  name: string;
  industry: string;         // Shown to users
  riskCategory: RiskCategory; // Internal only — never displayed
  peakReturn: number;       // % from start to peak
  peakPSRatio: number;      // Price-to-Sales at peak
  narrative: string;        // Short educational note
}

export const dotcomStocks: DotComStock[] = [
  // --- Failed (collapsed >80%) ---
  {
    ticker: 'CSCO',
    name: 'Cisco Systems',
    industry: 'Networking',
    riskCategory: 'failed',
    peakReturn: 320,
    peakPSRatio: 38,
    narrative: 'Dominated networking infrastructure. Revenue was real, but valuation assumed decades of hypergrowth.',
  },
  {
    ticker: 'INTC',
    name: 'Intel Corporation',
    industry: 'Semiconductors',
    riskCategory: 'failed',
    peakReturn: 180,
    peakPSRatio: 14,
    narrative: 'Core chip maker whose P/E expanded far beyond earnings growth — a classic multiple compression victim.',
  },
  {
    ticker: 'ORCL',
    name: 'Oracle Corporation',
    industry: 'Enterprise Software',
    riskCategory: 'failed',
    peakReturn: 250,
    peakPSRatio: 25,
    narrative: 'Enterprise database leader. Strong product, but the stock priced in perfection that couldn\'t last.',
  },
  {
    ticker: 'QCOM',
    name: 'Qualcomm',
    industry: 'Telecom Equipment',
    riskCategory: 'failed',
    peakReturn: 2600,
    peakPSRatio: 58,
    narrative: 'One of the most extreme bubble stocks — 2,600% gain followed by an 88% decline.',
  },
  {
    ticker: 'DELL',
    name: 'Dell Technologies',
    industry: 'Hardware',
    riskCategory: 'failed',
    peakReturn: 150,
    peakPSRatio: 6,
    narrative: 'Direct-to-consumer PC pioneer. Revenue was solid but margins compressed as growth slowed.',
  },

  // --- Moderate (fell 40–70%, recovered partially) ---
  {
    ticker: 'MSFT',
    name: 'Microsoft',
    industry: 'Software',
    riskCategory: 'moderate',
    peakReturn: 120,
    peakPSRatio: 22,
    narrative: 'Dominant platform, real profits — but still lost 60% from peak as the entire sector de-rated.',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com',
    industry: 'E-Commerce',
    riskCategory: 'moderate',
    peakReturn: 400,
    peakPSRatio: 45,
    narrative: 'No profits but massive revenue growth. Fell 93% peak-to-trough yet survived to dominate.',
  },
  {
    ticker: 'IBM',
    name: 'IBM',
    industry: 'IT Services',
    riskCategory: 'moderate',
    peakReturn: 60,
    peakPSRatio: 3,
    narrative: 'Old-guard tech with stable revenue. Declined less but also missed the upside wave.',
  },
  {
    ticker: 'HPQ',
    name: 'Hewlett-Packard',
    industry: 'Hardware',
    riskCategory: 'moderate',
    peakReturn: 80,
    peakPSRatio: 2.5,
    narrative: 'Diversified hardware maker. Moderate valuation limited downside but also capped upside.',
  },
  {
    ticker: 'TXN',
    name: 'Texas Instruments',
    industry: 'Semiconductors',
    riskCategory: 'moderate',
    peakReturn: 200,
    peakPSRatio: 12,
    narrative: 'Analog chip leader with diversified end-markets that cushioned the tech selloff.',
  },

  // --- Resilient (fell <40%, stable cash flows) ---
  {
    ticker: 'KO',
    name: 'Coca-Cola',
    industry: 'Consumer Staples',
    riskCategory: 'resilient',
    peakReturn: 15,
    peakPSRatio: 8,
    narrative: 'Defensive stalwart. Boring during the bubble, protective during the crash.',
  },
  {
    ticker: 'PG',
    name: 'Procter & Gamble',
    industry: 'Consumer Staples',
    riskCategory: 'resilient',
    peakReturn: 20,
    peakPSRatio: 5,
    narrative: 'Consumer goods giant. Steady dividends and low volatility provided ballast in 2001–02.',
  },
  {
    ticker: 'XOM',
    name: 'Exxon Mobil',
    industry: 'Energy',
    riskCategory: 'resilient',
    peakReturn: 25,
    peakPSRatio: 1.5,
    narrative: 'Oil major uncorrelated to tech. Positive returns while the Nasdaq fell 78%.',
  },
  {
    ticker: 'WMT',
    name: 'Walmart',
    industry: 'Retail',
    riskCategory: 'resilient',
    peakReturn: 30,
    peakPSRatio: 1.2,
    narrative: 'Defensive retail giant. Actually gained value during the tech crash.',
  },
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    industry: 'Healthcare',
    riskCategory: 'resilient',
    peakReturn: 35,
    peakPSRatio: 6,
    narrative: 'Healthcare conglomerate. Minimal drawdown through the entire dot-com cycle.',
  },
];

// Helpers — never expose riskCategory to UI
export const getStocksByIndustry = () => {
  const map: Record<string, DotComStock[]> = {};
  dotcomStocks.forEach(s => {
    if (!map[s.industry]) map[s.industry] = [];
    map[s.industry].push(s);
  });
  return map;
};

export const industries = [...new Set(dotcomStocks.map(s => s.industry))];
