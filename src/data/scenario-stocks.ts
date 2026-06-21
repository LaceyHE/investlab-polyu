import type { RiskCategory } from './dotcom-stocks';
import { dotcomStocks, industries as dotcomIndustries } from './dotcom-stocks';
import { gfcStocks, gfcIndustries } from './gfc-stocks';
import { covidStocks, covidIndustries } from './covid-stocks';
import { ratehikeStocks, ratehikeIndustries } from './ratehike-stocks';
import { meanReversionStocks, meanReversionIndustries } from './mean-reversion-stocks';
import { volatilityShockStocks, volatilityShockIndustries } from './volatility-shock-stocks';
import { valuationCorrectionStocks, valuationCorrectionIndustries } from './valuation-correction-stocks';

export interface ScenarioStock {
  ticker: string;
  name: string;
  industry: string;
  riskCategory: RiskCategory;
  peakReturn: number;
  peakPSRatio: number;
  beta?: number;
  narrative: string;
}

const stockMap: Record<string, ScenarioStock[]> = {
  dotcom: dotcomStocks,
  gfc: gfcStocks,
  covid: covidStocks,
  'rate-hike': ratehikeStocks,
  'mean-reversion': meanReversionStocks,
  'volatility-shock': volatilityShockStocks,
  'valuation-correction': valuationCorrectionStocks,
};

const industryMap: Record<string, string[]> = {
  dotcom: dotcomIndustries,
  gfc: gfcIndustries,
  covid: covidIndustries,
  'rate-hike': ratehikeIndustries,
  'mean-reversion': meanReversionIndustries,
  'volatility-shock': volatilityShockIndustries,
  'valuation-correction': valuationCorrectionIndustries,
};

export const getStocksForScenario = (scenarioId: string): ScenarioStock[] =>
  stockMap[scenarioId] || [];

export const getIndustriesForScenario = (scenarioId: string): string[] =>
  industryMap[scenarioId] || [];
