import type { RiskCategory } from './dotcom-stocks';

export interface ValuationCorrectionStock {
  ticker: string;
  name: string;
  industry: string;
  riskCategory: RiskCategory;
  peakReturn: number;
  peakPSRatio: number;
  beta: number;
  narrative: string;
}

export const valuationCorrectionStocks: ValuationCorrectionStock[] = [
  // --- High CAPE / high P/E (most exposed to multiple compression) ---
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    industry: 'AI Semiconductors',
    riskCategory: 'failed',
    peakReturn: 800,
    peakPSRatio: 35,
    beta: 1.9,
    narrative: 'At 60× forward P/E and 35× P/S in Jan 2025, NVIDIA embeds decades of AI growth perfection into its price. CAPE-driven compression is most severe for the highest-multiple stocks.',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft',
    industry: 'Cloud / Software',
    riskCategory: 'moderate',
    peakReturn: 85,
    peakPSRatio: 13,
    beta: 1.3,
    narrative: 'Trading at ~35× earnings in a world where the risk-free rate is 4.5%. Gordon Growth Model fair value suggests 20–22× is more appropriate. Durable franchise limits the downside.',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    industry: 'Consumer Technology',
    riskCategory: 'moderate',
    peakReturn: 45,
    peakPSRatio: 8,
    beta: 1.1,
    narrative: 'At 30× P/E for a single-digit EPS grower, Apple\'s premium is justified by buyback yield and brand moat — but CAPE correction still compresses it meaningfully.',
  },
  {
    ticker: 'META',
    name: 'Meta Platforms',
    industry: 'Social Media / AI',
    riskCategory: 'failed',
    peakReturn: 500,
    peakPSRatio: 9,
    beta: 1.5,
    narrative: 'AI and ad-tech investments re-rated Meta from a "value trap" to a premium multiple. The re-rating could unwind as quickly as it arrived if ad revenue disappoints.',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet',
    industry: 'Digital Advertising',
    riskCategory: 'moderate',
    peakReturn: 90,
    peakPSRatio: 7,
    beta: 1.2,
    narrative: 'Search remains structurally dominant but AI disruption risk is priced in via the multiple. At 25× P/E, any loss of search market share triggers outsized P/E compression.',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com',
    industry: 'E-Commerce / Cloud',
    riskCategory: 'moderate',
    peakReturn: 160,
    peakPSRatio: 4,
    beta: 1.4,
    narrative: 'AWS margins and retail profitability drove a re-rating to 45× P/E. Justified if AWS keeps growing 20%+ — but high earnings multiple means the margin for error is small.',
  },
  {
    ticker: 'LLY',
    name: 'Eli Lilly',
    industry: 'Pharmaceuticals',
    riskCategory: 'failed',
    peakReturn: 400,
    peakPSRatio: 22,
    beta: 1.6,
    narrative: 'GLP-1 drugs (Mounjaro, Zepbound) drove Lilly to 60× P/E on peak earnings expectations. Highest CAPE exposure in healthcare — pricing in years of unchallenged blockbuster growth.',
  },
  {
    ticker: 'V',
    name: 'Visa Inc.',
    industry: 'Payments',
    riskCategory: 'moderate',
    peakReturn: 55,
    peakPSRatio: 16,
    beta: 1.0,
    narrative: 'Payments duopoly with 50%+ net margins. Trades at 30× P/E. Durable moat limits CAPE compression, but it\'s not immune when the entire market de-rates.',
  },
  {
    ticker: 'MA',
    name: 'Mastercard',
    industry: 'Payments',
    riskCategory: 'moderate',
    peakReturn: 60,
    peakPSRatio: 17,
    beta: 1.0,
    narrative: 'Twin to Visa. At 35× P/E, still more expensive than the S&P average. De-rates alongside the broad market but less than hypergrowth tech.',
  },
  {
    ticker: 'COST',
    name: 'Costco Wholesale',
    industry: 'Retail',
    riskCategory: 'failed',
    peakReturn: 110,
    peakPSRatio: 1.4,
    beta: 1.2,
    narrative: 'Costco is a great business trading at a historically extreme P/E (~55×). Membership model is durable but the multiple has priced in near-perfection. CAPE analysis strongly implies compression.',
  },

  // --- Low P/E / value stocks (beneficiaries of valuation rotation) ---
  {
    ticker: 'XOM',
    name: 'Exxon Mobil',
    industry: 'Energy',
    riskCategory: 'resilient',
    peakReturn: 20,
    peakPSRatio: 1.5,
    beta: 0.50,
    narrative: 'Trades at 12× P/E — well below the CAPE mean. Oil earnings provide a fundamental floor. When growth de-rates, value rotates in. Exxon is a CAPE hedge.',
  },
  {
    ticker: 'CVX',
    name: 'Chevron Corporation',
    industry: 'Energy',
    riskCategory: 'resilient',
    peakReturn: 15,
    peakPSRatio: 1.4,
    beta: 0.55,
    narrative: 'Low P/E, high dividend yield. Historically outperforms during periods of P/E compression as investors chase yield and tangible earnings.',
  },
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase',
    industry: 'Banking',
    riskCategory: 'resilient',
    peakReturn: 55,
    peakPSRatio: 3,
    beta: 0.90,
    narrative: 'At 12× P/E and strong earnings quality, JPM is relatively cheap vs. the market CAPE. Benefits from rate environment that penalizes growth stocks.',
  },
  {
    ticker: 'BRK-B',
    name: 'Berkshire Hathaway B',
    industry: 'Diversified Conglomerate',
    riskCategory: 'resilient',
    peakReturn: 30,
    peakPSRatio: 2,
    beta: 0.65,
    narrative: 'Buffett\'s fortress. Berkshire\'s massive cash pile ($160B+) and value-oriented portfolio is tailor-made for a CAPE correction. Historically outperforms when expensive stocks compress.',
  },
  {
    ticker: 'VZ',
    name: 'Verizon Communications',
    industry: 'Telecom',
    riskCategory: 'resilient',
    peakReturn: 5,
    peakPSRatio: 1.8,
    beta: 0.28,
    narrative: 'Trades at 8× P/E with a 7% dividend yield. The textbook opposite of the CAPE-exposed stocks. Rarely falls in a multiple-compression environment because it\'s already cheap.',
  },
];

export const valuationCorrectionIndustries = [...new Set(valuationCorrectionStocks.map(s => s.industry))];
