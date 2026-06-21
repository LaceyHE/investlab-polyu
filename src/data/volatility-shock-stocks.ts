import type { RiskCategory } from './dotcom-stocks';

export interface VolatilityShockStock {
  ticker: string;
  name: string;
  industry: string;
  riskCategory: RiskCategory;
  peakReturn: number;
  peakPSRatio: number;
  beta: number;
  narrative: string;
}

export const volatilityShockStocks: VolatilityShockStock[] = [
  // --- High-vol stocks (amplify the shock) ---
  {
    ticker: 'TSLA',
    name: 'Tesla',
    industry: 'Electric Vehicles',
    riskCategory: 'failed',
    peakReturn: 200,
    peakPSRatio: 8,
    beta: 2.5,
    narrative: 'One of the highest-beta S&P 500 stocks. When realized vol spikes, systematic strategies sell the most volatile names first. Tesla is always at the top of that list.',
  },
  {
    ticker: 'RIVN',
    name: 'Rivian Automotive',
    industry: 'Electric Vehicles',
    riskCategory: 'failed',
    peakReturn: 50,
    peakPSRatio: 6,
    beta: 3.2,
    narrative: 'Pre-profit EV maker with extreme sensitivity to sentiment and liquidity conditions. A vol shock dries up the risk appetite that sustains its valuation.',
  },
  {
    ticker: 'UPST',
    name: 'Upstart Holdings',
    industry: 'Fintech / AI Lending',
    riskCategory: 'failed',
    peakReturn: 120,
    peakPSRatio: 8,
    beta: 3.5,
    narrative: 'AI-driven lending platform with highly volatile fundamentals. Rate sensitivity + vol shock = compounded drawdown. Has previously fallen 90% in a single cycle.',
  },
  {
    ticker: 'SQ',
    name: 'Block Inc.',
    industry: 'Payments / Fintech',
    riskCategory: 'failed',
    peakReturn: 80,
    peakPSRatio: 3,
    beta: 2.3,
    narrative: 'High-beta fintech with crypto exposure (Cash App / Bitcoin). Vol shocks hit crypto-adjacent stocks disproportionately as liquidity retreats.',
  },
  {
    ticker: 'ABNB',
    name: 'Airbnb',
    industry: 'Travel Technology',
    riskCategory: 'moderate',
    peakReturn: 70,
    peakPSRatio: 9,
    beta: 2.0,
    narrative: 'Consumer discretionary + platform business with no tangible assets. In a vol regime shift, capital flows away from asset-light, high-multiple names.',
  },
  {
    ticker: 'COIN',
    name: 'Coinbase',
    industry: 'Crypto Exchange',
    riskCategory: 'failed',
    peakReturn: 300,
    peakPSRatio: 12,
    beta: 3.8,
    narrative: 'Effectively a leveraged bet on crypto volatility. When equity vol spikes, crypto vol spikes more — creating a compounding negative effect on COIN.',
  },
  {
    ticker: 'MSTR',
    name: 'MicroStrategy',
    industry: 'Crypto / Software',
    riskCategory: 'failed',
    peakReturn: 800,
    peakPSRatio: 40,
    beta: 4.5,
    narrative: 'Essentially a leveraged Bitcoin ETF wrapped in a software company. The highest beta in this basket — extreme amplifier of any market vol shock.',
  },
  {
    ticker: 'ROKU',
    name: 'Roku Inc.',
    industry: 'Streaming Platforms',
    riskCategory: 'failed',
    peakReturn: 60,
    peakPSRatio: 4,
    beta: 2.8,
    narrative: 'Ad-supported streaming with inconsistent profitability. High volatility stock that has repeatedly fallen 60–70% in vol regime shifts since its IPO.',
  },

  // --- Financials (vol-sellers, face losses from vol shock exposure) ---
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase',
    industry: 'Banking',
    riskCategory: 'moderate',
    peakReturn: 55,
    peakPSRatio: 3,
    beta: 1.1,
    narrative: 'Major dealer in volatility products. When vol spikes, derivatives desks face mark-to-market losses. Also faces credit concerns if the vol shock triggers a recession.',
  },
  {
    ticker: 'BAC',
    name: 'Bank of America',
    industry: 'Banking',
    riskCategory: 'moderate',
    peakReturn: 50,
    peakPSRatio: 2.5,
    beta: 1.3,
    narrative: 'Higher duration risk than JPM. Marked-to-market bond losses and loan-loss provisioning make it more exposed in a vol-driven credit scare.',
  },
  {
    ticker: 'GS',
    name: 'Goldman Sachs',
    industry: 'Investment Banking',
    riskCategory: 'moderate',
    peakReturn: 60,
    peakPSRatio: 2,
    beta: 1.2,
    narrative: 'Trading revenues are actually boosted by vol — but prop risk positions face P&L swings. Net effect: underperforms during the shock, outperforms in recovery.',
  },

  // --- Flight-to-safety (low or negative correlation to vol shock) ---
  {
    ticker: 'GLD',
    name: 'SPDR Gold ETF',
    industry: 'Commodities / Hedge',
    riskCategory: 'resilient',
    peakReturn: 25,
    peakPSRatio: 0,
    beta: 0.15,
    narrative: 'Gold is the canonical flight-to-safety asset. In vol shocks, institutional allocators move to gold as a zero-counterparty-risk store of value.',
  },
  {
    ticker: 'XOM',
    name: 'Exxon Mobil',
    industry: 'Energy',
    riskCategory: 'resilient',
    peakReturn: 20,
    peakPSRatio: 1.5,
    beta: 0.50,
    narrative: 'Hard-asset energy business with stable cash flows. Vol shocks don\'t typically affect oil demand in the short run, limiting the drawdown.',
  },
  {
    ticker: 'WMT',
    name: 'Walmart',
    industry: 'Consumer Staples',
    riskCategory: 'resilient',
    peakReturn: 30,
    peakPSRatio: 0.9,
    beta: 0.30,
    narrative: 'Counter-cyclical retail — consumers trade down to Walmart during economic stress. One of the most defensive names in the S&P 500.',
  },
  {
    ticker: 'VZ',
    name: 'Verizon Communications',
    industry: 'Telecom',
    riskCategory: 'resilient',
    peakReturn: 5,
    peakPSRatio: 1.8,
    beta: 0.25,
    narrative: 'Bond-like utility characteristics. High dividend yield makes it attractive to investors fleeing risk assets. Minimal sensitivity to equity vol.',
  },
];

export const volatilityShockIndustries = [...new Set(volatilityShockStocks.map(s => s.industry))];
