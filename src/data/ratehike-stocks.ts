import type { ScenarioStock } from './scenario-stocks';

export const ratehikeStocks: ScenarioStock[] = [
  // --- Failed (fell >50% during rate hike cycle) ---
  { ticker: 'TSLA', name: 'Tesla', industry: 'Electric Vehicles', riskCategory: 'failed', peakReturn: 60, peakPSRatio: 18, narrative: 'Fell 70% from peak as rising rates crushed high-duration growth stocks. Margins compressed from price cuts.' },
  { ticker: 'META', name: 'Meta Platforms', industry: 'Social Media', riskCategory: 'failed', peakReturn: 40, peakPSRatio: 6, narrative: 'Lost 77% on metaverse spending concerns before staging "Year of Efficiency" recovery.' },
  { ticker: 'AMZN', name: 'Amazon.com', industry: 'E-Commerce', riskCategory: 'failed', peakReturn: 30, peakPSRatio: 3, narrative: 'Post-COVID hangover hit e-commerce. Overhiring and warehouse overexpansion compressed margins.' },
  { ticker: 'GOOGL', name: 'Alphabet', industry: 'Technology', riskCategory: 'failed', peakReturn: 25, peakPSRatio: 6, narrative: 'Ad revenue slowed as companies cut marketing budgets. AI competition fears added pressure.' },

  // --- Moderate (fell 20–40%, recovered with AI narrative) ---
  { ticker: 'AAPL', name: 'Apple', industry: 'Technology', riskCategory: 'moderate', peakReturn: 20, peakPSRatio: 7, narrative: 'Hardware cycle slowdown hit iPhone revenue. Services growth provided cushion.' },
  { ticker: 'MSFT', name: 'Microsoft', industry: 'Technology', riskCategory: 'moderate', peakReturn: 30, peakPSRatio: 12, narrative: 'Azure growth slowed but OpenAI partnership reignited investor enthusiasm in 2023.' },
  { ticker: 'NVDA', name: 'NVIDIA', industry: 'Semiconductors', riskCategory: 'moderate', peakReturn: 800, peakPSRatio: 40, narrative: 'Fell 65% in 2022 on crypto/gaming bust, then surged 800%+ as AI demand exploded.' },
  { ticker: 'JPM', name: 'JPMorgan Chase', industry: 'Banking', riskCategory: 'moderate', peakReturn: 30, peakPSRatio: 3, narrative: 'Higher rates boosted net interest income but SVB crisis caused regional bank contagion fears.' },
  { ticker: 'UNH', name: 'UnitedHealth', industry: 'Healthcare', riskCategory: 'moderate', peakReturn: 25, peakPSRatio: 1.5, narrative: 'Defensive healthcare giant. Steady earnings growth insulated from rate sensitivity.' },
  { ticker: 'LLY', name: 'Eli Lilly', industry: 'Pharma', riskCategory: 'moderate', peakReturn: 200, peakPSRatio: 20, narrative: 'GLP-1 obesity drug pipeline drove massive re-rating. One of few stocks to hit all-time highs in 2022.' },

  // --- Resilient (positive returns through the cycle) ---
  { ticker: 'XOM', name: 'Exxon Mobil', industry: 'Energy', riskCategory: 'resilient', peakReturn: 80, peakPSRatio: 1.5, narrative: 'Energy was the top-performing sector in 2022. Ukraine conflict and supply constraints boosted prices.' },
  { ticker: 'CVX', name: 'Chevron', industry: 'Energy', riskCategory: 'resilient', peakReturn: 60, peakPSRatio: 1.3, narrative: 'Record free cash flow from high oil prices. Returned capital aggressively via buybacks.' },
  { ticker: 'PG', name: 'Procter & Gamble', industry: 'Consumer Staples', riskCategory: 'resilient', peakReturn: 15, peakPSRatio: 5, narrative: 'Pricing power allowed P&G to pass through inflation. Classic defensive holding.' },
  { ticker: 'KO', name: 'Coca-Cola', industry: 'Consumer Staples', riskCategory: 'resilient', peakReturn: 10, peakPSRatio: 7, narrative: 'Buffett\'s favorite. Steady dividends and brand moat provided ballast in a volatile market.' },
  { ticker: 'BRK-B', name: 'Berkshire Hathaway', industry: 'Conglomerate', riskCategory: 'resilient', peakReturn: 35, peakPSRatio: 2, narrative: 'Buffett\'s cash pile became an asset as rates rose. Insurance and energy holdings thrived.' },
];

export const ratehikeIndustries = [...new Set(ratehikeStocks.map(s => s.industry))];
