import type { ScenarioStock } from './scenario-stocks';

export const gfcStocks: ScenarioStock[] = [
  // --- Failed (collapsed >80% or needed bailout) ---
  { ticker: 'C', name: 'Citigroup', industry: 'Banking', riskCategory: 'failed', peakReturn: 40, peakPSRatio: 3, narrative: 'Massive subprime exposure led to a 97% decline and government bailout. The poster child of overleveraged banking.' },
  { ticker: 'BAC', name: 'Bank of America', industry: 'Banking', riskCategory: 'failed', peakReturn: 30, peakPSRatio: 2.5, narrative: 'Acquired Countrywide and Merrill Lynch at the worst possible time, compounding losses.' },
  { ticker: 'AIG', name: 'AIG', industry: 'Insurance', riskCategory: 'failed', peakReturn: 20, peakPSRatio: 1.2, narrative: 'Sold massive credit default swaps without adequate reserves. Required the largest government bailout in history.' },
  { ticker: 'GS', name: 'Goldman Sachs', industry: 'Investment Banking', riskCategory: 'failed', peakReturn: 60, peakPSRatio: 2.8, narrative: 'Premier investment bank that fell 70%+ before converting to a bank holding company for Fed access.' },
  { ticker: 'MS', name: 'Morgan Stanley', industry: 'Investment Banking', riskCategory: 'failed', peakReturn: 50, peakPSRatio: 2.5, narrative: 'Faced a near-fatal run on its prime brokerage. Survived via Japanese investment and Fed backstop.' },

  // --- Moderate (fell 40–70%, recovered over time) ---
  { ticker: 'JPM', name: 'JPMorgan Chase', industry: 'Banking', riskCategory: 'moderate', peakReturn: 25, peakPSRatio: 2, narrative: 'Best-managed big bank. Still fell 60% but emerged stronger by acquiring Bear Stearns and WaMu.' },
  { ticker: 'WFC', name: 'Wells Fargo', industry: 'Banking', riskCategory: 'moderate', peakReturn: 20, peakPSRatio: 3, narrative: 'Conservative lending model limited losses relative to peers. Acquired Wachovia at a discount.' },
  { ticker: 'GE', name: 'General Electric', industry: 'Industrial', riskCategory: 'moderate', peakReturn: 30, peakPSRatio: 1.8, narrative: 'GE Capital\'s exposure to commercial paper markets nearly sank the entire conglomerate.' },
  { ticker: 'AAPL', name: 'Apple', industry: 'Technology', riskCategory: 'moderate', peakReturn: 80, peakPSRatio: 5, narrative: 'iPhone momentum cushioned the fall. Declined ~55% but recovered fastest among large-caps.' },
  { ticker: 'MSFT', name: 'Microsoft', industry: 'Technology', riskCategory: 'moderate', peakReturn: 30, peakPSRatio: 5, narrative: 'Stable enterprise business provided ballast. Fell ~45% but maintained dividends throughout.' },

  // --- Resilient (fell <40%, stable cash flows) ---
  { ticker: 'XOM', name: 'Exxon Mobil', industry: 'Energy', riskCategory: 'resilient', peakReturn: 25, peakPSRatio: 1.5, narrative: 'Oil prices initially spiked to $140 before crashing. XOM\'s integrated model limited downside.' },
  { ticker: 'PG', name: 'Procter & Gamble', industry: 'Consumer Staples', riskCategory: 'resilient', peakReturn: 15, peakPSRatio: 3, narrative: 'Consumer staples demand is recession-resistant. P&G was a classic flight-to-quality holding.' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', industry: 'Healthcare', riskCategory: 'resilient', peakReturn: 10, peakPSRatio: 3.5, narrative: 'Healthcare conglomerate with diversified revenue streams. One of the few stocks to hold near highs.' },
  { ticker: 'KO', name: 'Coca-Cola', industry: 'Consumer Staples', riskCategory: 'resilient', peakReturn: 15, peakPSRatio: 5, narrative: 'Defensive stalwart. People buy Coca-Cola in recessions too.' },
  { ticker: 'WMT', name: 'Walmart', industry: 'Retail', riskCategory: 'resilient', peakReturn: 20, peakPSRatio: 0.6, narrative: 'Actually gained value during the crisis as consumers traded down to discount retailers.' },
];

export const gfcIndustries = [...new Set(gfcStocks.map(s => s.industry))];
