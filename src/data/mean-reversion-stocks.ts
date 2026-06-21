import type { RiskCategory } from './dotcom-stocks';

export interface MeanReversionStock {
  ticker: string;
  name: string;
  industry: string;
  riskCategory: RiskCategory;
  peakReturn: number;
  peakPSRatio: number;
  beta: number;
  narrative: string;
}

export const meanReversionStocks: MeanReversionStock[] = [
  // --- High above 3yr mean (deep reversion risk) ---
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    industry: 'AI Semiconductors',
    riskCategory: 'failed',
    peakReturn: 800,
    peakPSRatio: 35,
    beta: 2.0,
    narrative: 'Traded at 35× P/S and ~3× its 3-year average by Jan 2025. AI capex expectations embedded in price are unprecedented — reversion risk is extreme.',
  },
  {
    ticker: 'META',
    name: 'Meta Platforms',
    industry: 'Social Media',
    riskCategory: 'failed',
    peakReturn: 500,
    peakPSRatio: 9,
    beta: 1.6,
    narrative: 'Rose from $90 (2022 trough) to $600+ (2025). Now trading 2.5× above its 3-year moving average. AI pivot re-rated the stock sharply above fundamentals.',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com',
    industry: 'E-Commerce / Cloud',
    riskCategory: 'failed',
    peakReturn: 160,
    peakPSRatio: 4,
    beta: 1.5,
    narrative: 'AWS growth and margin expansion drove a re-rating to 2× above the 3-year mean. Any slowdown in cloud spend triggers a sharp price-to-mean compression.',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet',
    industry: 'Digital Advertising',
    riskCategory: 'moderate',
    peakReturn: 90,
    peakPSRatio: 7,
    beta: 1.3,
    narrative: 'Search ad dominance + YouTube + Cloud put it 1.8× above its 3-year mean. More diversified than pure-AI plays, so reversion is less severe.',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft',
    industry: 'Cloud / Software',
    riskCategory: 'moderate',
    peakReturn: 85,
    peakPSRatio: 13,
    beta: 1.2,
    narrative: 'Azure + Copilot monetization drove premium valuation. Trading ~1.7× above its 3-year mean. Enterprise durability dampens the reversion.',
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    industry: 'Semiconductors',
    riskCategory: 'failed',
    peakReturn: 250,
    peakPSRatio: 12,
    beta: 1.8,
    narrative: 'Benefited from NVIDIA supply constraints and AI chip demand. High beta to the AI cycle means it reverts faster and harder than the index.',
  },
  {
    ticker: 'TSLA',
    name: 'Tesla',
    industry: 'Electric Vehicles',
    riskCategory: 'failed',
    peakReturn: 180,
    peakPSRatio: 8,
    beta: 2.1,
    narrative: 'Highest beta in the basket. Automotive margins compressing while stock still prices in robotaxi optionality. 3-year mean significantly below current price.',
  },
  {
    ticker: 'NFLX',
    name: 'Netflix',
    industry: 'Streaming',
    riskCategory: 'moderate',
    peakReturn: 180,
    peakPSRatio: 10,
    beta: 1.4,
    narrative: 'Ad-supported tier and password-sharing crackdown drove a re-rating from $160 to $900+. Now trading well above its 3-year mean on subscriber optimism.',
  },
  {
    ticker: 'SNOW',
    name: 'Snowflake',
    industry: 'Cloud Data',
    riskCategory: 'failed',
    peakReturn: 120,
    peakPSRatio: 18,
    beta: 2.2,
    narrative: 'Still trades at 15–20× revenue despite slowing growth. One of the most extreme valuation-vs-mean gaps in enterprise software.',
  },
  {
    ticker: 'PLTR',
    name: 'Palantir Technologies',
    industry: 'AI / Data Analytics',
    riskCategory: 'failed',
    peakReturn: 350,
    peakPSRatio: 30,
    beta: 2.3,
    narrative: 'Entered the S&P 500 in 2024 and was re-rated on AI narrative. P/S ratio of 30× implies decades of perfect execution — far above its 3-year average.',
  },

  // --- Near or below 3-year mean (resilient) ---
  {
    ticker: 'KO',
    name: 'Coca-Cola',
    industry: 'Consumer Staples',
    riskCategory: 'resilient',
    peakReturn: 8,
    peakPSRatio: 7,
    beta: 0.35,
    narrative: 'Trades near its 5-year average. Pricing power in inflation offset by volume slowdown. Low beta means it barely participates in the reversion.',
  },
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    industry: 'Healthcare',
    riskCategory: 'resilient',
    peakReturn: 5,
    peakPSRatio: 5,
    beta: 0.30,
    narrative: 'Litigation overhangs and a pharma pipeline keep the stock near fair value. One of the lowest-beta names in this basket — the ideal hedge.',
  },
  {
    ticker: 'PG',
    name: 'Procter & Gamble',
    industry: 'Consumer Staples',
    riskCategory: 'resilient',
    peakReturn: 12,
    peakPSRatio: 5,
    beta: 0.32,
    narrative: 'Stable free cash flow and dividends keep price close to intrinsic value. Barely moved above its 3-year mean — minimal reversion exposure.',
  },
  {
    ticker: 'WMT',
    name: 'Walmart',
    industry: 'Retail',
    riskCategory: 'resilient',
    peakReturn: 40,
    peakPSRatio: 0.9,
    beta: 0.40,
    narrative: 'Grocery dominance and e-commerce growth pushed Walmart above its mean, but low P/S limits the reversion. A relative safe haven.',
  },
  {
    ticker: 'XOM',
    name: 'Exxon Mobil',
    industry: 'Energy',
    riskCategory: 'resilient',
    peakReturn: 20,
    peakPSRatio: 1.5,
    beta: 0.45,
    narrative: 'Commodity price exposure makes it uncorrelated to the tech-led mean reversion. Oil earnings buffer any equity selloff in the growth basket.',
  },
];

export const meanReversionIndustries = [...new Set(meanReversionStocks.map(s => s.industry))];
