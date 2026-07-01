export interface TimePeriod {
  key: 'bull' | 'bear' | 'recovery';
  label: string;
  subtitle: string;
  start: string;
  end: string;
  riskFreeAnnual: number;
  description: string;
}

export const TIME_PERIODS: TimePeriod[] = [
  {
    key: 'bull',
    label: 'Bull Run',
    subtitle: '2019–2021',
    start: '2019-01-01',
    end: '2021-01-01',
    riskFreeAnnual: 0.022,
    description: 'Strong equity rally with low rates. Growth strategies shine; bonds lag.',
  },
  {
    key: 'bear',
    label: 'Rate Hike Bear',
    subtitle: '2021–2023',
    start: '2021-01-01',
    end: '2023-01-01',
    riskFreeAnnual: 0.02,
    description: 'Fed raised rates aggressively. Bonds and growth stocks both struggled.',
  },
  {
    key: 'recovery',
    label: 'AI Recovery',
    subtitle: '2023–2025',
    start: '2023-01-01',
    end: '2025-01-01',
    riskFreeAnnual: 0.05,
    description: 'Post-rate-peak rebound led by AI/tech. High risk-free rate raises the Sharpe bar.',
  },
];

export const DEFAULT_PERIOD: TimePeriod = TIME_PERIODS[1];
