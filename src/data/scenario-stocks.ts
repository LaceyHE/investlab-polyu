import type { RiskCategory } from './dotcom-stocks';
import { dotcomStocks, industries as dotcomIndustries } from './dotcom-stocks';
import { gfcStocks, gfcIndustries } from './gfc-stocks';
import { covidStocks, covidIndustries } from './covid-stocks';
import { ratehikeStocks, ratehikeIndustries } from './ratehike-stocks';

export interface ScenarioStock {
  ticker: string;
  name: string;
  industry: string;
  riskCategory: RiskCategory;
  peakReturn: number;
  peakPSRatio: number;
  narrative: string;
}

const stockMap: Record<string, ScenarioStock[]> = {
  dotcom: dotcomStocks,
  gfc: gfcStocks,
  covid: covidStocks,
  'rate-hike': ratehikeStocks,
};

const industryMap: Record<string, string[]> = {
  dotcom: dotcomIndustries,
  gfc: gfcIndustries,
  covid: covidIndustries,
  'rate-hike': ratehikeIndustries,
};

export const getStocksForScenario = (scenarioId: string): ScenarioStock[] =>
  stockMap[scenarioId] || [];

export const getIndustriesForScenario = (scenarioId: string): string[] =>
  industryMap[scenarioId] || [];
