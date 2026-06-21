import { useMemo } from 'react';
import type { ScenarioPreset } from '@/data/scenario-presets';
import type { PricePoint } from '@/hooks/useMarketData';
import { generateSyntheticMarketData } from '@/utils/syntheticPricePath';

export function useSyntheticMarketData(
  scenario: ScenarioPreset | null,
  tickers: string[],
): { data: Record<string, PricePoint[]> | undefined; isLoading: false } {
  const data = useMemo(() => {
    if (!scenario?.isFuture || !scenario.quantMethodology || tickers.length === 0) {
      return undefined;
    }
    const { annualizedVol, drawdownStartMonth, drawdownDurationMonths } = scenario.quantMethodology;
    const peakDrawdown = parseFloat(scenario.peakDrawdown.replace('–', '-').replace('%', '')) / 100;

    return generateSyntheticMarketData(
      tickers,
      scenario.id,
      scenario.startDate,
      scenario.endDate,
      peakDrawdown,
      annualizedVol,
      drawdownStartMonth,
      drawdownDurationMonths,
    );
  }, [scenario?.id, tickers.join(',')]);

  return { data, isLoading: false };
}
