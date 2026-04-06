import type { ScenarioStock } from './scenario-stocks';

export const covidStocks: ScenarioStock[] = [
  // --- Failed (collapsed >60% during crash, slow recovery) ---
  { ticker: 'BA', name: 'Boeing', industry: 'Aerospace', riskCategory: 'failed', peakReturn: 30, peakPSRatio: 2.5, narrative: '737 MAX crisis compounded by COVID travel shutdown. Revenue collapsed and debt ballooned.' },
  { ticker: 'DAL', name: 'Delta Air Lines', industry: 'Airlines', riskCategory: 'failed', peakReturn: 25, peakPSRatio: 1, narrative: 'Air travel demand went to near-zero overnight. Required government payroll support to survive.' },
  { ticker: 'MAR', name: 'Marriott International', industry: 'Hospitality', riskCategory: 'failed', peakReturn: 20, peakPSRatio: 3, narrative: 'Hotel occupancy plunged to single digits. Revenue fell 75% in Q2 2020.' },
  { ticker: 'DIS', name: 'Walt Disney', industry: 'Entertainment', riskCategory: 'failed', peakReturn: 35, peakPSRatio: 4, narrative: 'Theme parks and movie theaters closed simultaneously. Disney+ launch was the silver lining.' },
  { ticker: 'XOM', name: 'Exxon Mobil', industry: 'Energy', riskCategory: 'failed', peakReturn: 15, peakPSRatio: 1, narrative: 'Oil prices briefly went negative. Exxon was removed from the Dow Jones after 92 years.' },

  // --- Moderate (V-shaped recovery, mixed during crash) ---
  { ticker: 'AAPL', name: 'Apple', industry: 'Technology', riskCategory: 'moderate', peakReturn: 80, peakPSRatio: 8, narrative: 'Fell 30% in the crash but recovered to new highs within months. Work-from-home boosted hardware sales.' },
  { ticker: 'MSFT', name: 'Microsoft', industry: 'Technology', riskCategory: 'moderate', peakReturn: 60, peakPSRatio: 12, narrative: 'Cloud computing (Azure) and Teams adoption accelerated. One of the fastest recoverers.' },
  { ticker: 'GOOGL', name: 'Alphabet', industry: 'Technology', riskCategory: 'moderate', peakReturn: 50, peakPSRatio: 7, narrative: 'Ad revenue dipped briefly but digital transformation accelerated long-term demand.' },
  { ticker: 'META', name: 'Meta Platforms', industry: 'Social Media', riskCategory: 'moderate', peakReturn: 40, peakPSRatio: 10, narrative: 'Social media usage surged during lockdowns. Ad revenue recovered by Q3 2020.' },
  { ticker: 'PFE', name: 'Pfizer', industry: 'Pharma', riskCategory: 'moderate', peakReturn: 15, peakPSRatio: 4, narrative: 'Initially flat, then surged on vaccine development partnership with BioNTech.' },

  // --- Resilient (thrived during COVID) ---
  { ticker: 'AMZN', name: 'Amazon.com', industry: 'E-Commerce', riskCategory: 'resilient', peakReturn: 110, peakPSRatio: 5, narrative: 'The ultimate COVID winner. E-commerce demand exploded and AWS usage surged with remote work.' },
  { ticker: 'NFLX', name: 'Netflix', industry: 'Streaming', riskCategory: 'resilient', peakReturn: 70, peakPSRatio: 10, narrative: 'Lockdowns created a captive audience. Added 26 million subscribers in H1 2020 alone.' },
  { ticker: 'TSLA', name: 'Tesla', industry: 'Electric Vehicles', riskCategory: 'resilient', peakReturn: 740, peakPSRatio: 25, narrative: 'Rose 740% in 2020. S&P 500 inclusion and EV enthusiasm created a speculative frenzy.' },
  { ticker: 'ZM', name: 'Zoom Video', industry: 'Software', riskCategory: 'resilient', peakReturn: 560, peakPSRatio: 120, narrative: 'Revenue grew 326% in a single quarter. The defining stock of the remote work era.' },
  { ticker: 'MRNA', name: 'Moderna', industry: 'Biotech', riskCategory: 'resilient', peakReturn: 450, peakPSRatio: 50, narrative: 'mRNA vaccine development turned a pre-revenue biotech into a household name overnight.' },
];

export const covidIndustries = [...new Set(covidStocks.map(s => s.industry))];
