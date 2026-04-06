export interface ScenarioEvent {
  date: string; // YYYY-MM-DD
  label: string;
  description: string;
  type: 'crash' | 'fed' | 'earnings' | 'policy' | 'recovery';
}

export interface ScenarioPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  peakDrawdown: string;
  indexTicker: string;
  tickers: string[];
  events: ScenarioEvent[];
  learningOutcomes: {
    whatHappened: string;
    portfolioBehavior: string;
    keyTakeaways: string[];
    reflectionQuestion: string;
  };
}

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: 'dotcom',
    name: 'Dot-Com Bubble',
    subtitle: 'Explore the rise and collapse of tech euphoria',
    description: 'From 1998 to 2002, tech stocks surged on internet hype before collapsing. The Nasdaq fell 78% from its peak.',
    startDate: '1998-01-01',
    endDate: '2002-12-31',
    peakDrawdown: '–78%',
    indexTicker: '^IXIC',
    tickers: ['CSCO', 'INTC', 'ORCL', 'QCOM', 'DELL', 'MSFT', 'AMZN', 'IBM', 'HPQ', 'TXN', 'KO', 'PG', 'XOM', 'WMT', 'JNJ'],
    events: [
      { date: '1999-01-05', label: 'Tech Rally Accelerates', description: 'Nasdaq begins its most aggressive rally, driven by internet IPO mania.', type: 'earnings' },
      { date: '1999-11-01', label: 'Y2K Spending Surge', description: 'Companies accelerate tech spending ahead of Y2K, boosting revenues artificially.', type: 'policy' },
      { date: '2000-03-10', label: 'Nasdaq Peaks at 5,048', description: 'The Nasdaq Composite hits its all-time high. P/E ratios exceed 100x for many tech stocks.', type: 'crash' },
      { date: '2000-04-14', label: 'Tax Selling Triggers Crash', description: 'Tax-related selling triggers a 25% drop in two weeks. First sign of vulnerability.', type: 'crash' },
      { date: '2000-10-01', label: 'Dot-Coms Begin Failing', description: 'Multiple high-profile internet companies run out of cash and shut down.', type: 'crash' },
      { date: '2001-01-03', label: 'Fed Cuts Rates', description: 'The Federal Reserve begins emergency rate cuts as the economy slows sharply.', type: 'fed' },
      { date: '2001-09-17', label: 'Markets Reopen After 9/11', description: 'NYSE reopens after September 11 attacks. Markets plunge further.', type: 'crash' },
      { date: '2002-07-23', label: 'WorldCom Bankruptcy', description: 'WorldCom files for bankruptcy in the largest corporate fraud scandal at the time.', type: 'crash' },
      { date: '2002-10-09', label: 'Nasdaq Bottoms', description: 'The Nasdaq hits its bear market low of 1,114, down 78% from the peak.', type: 'recovery' },
    ],
    learningOutcomes: {
      whatHappened: 'The dot-com bubble was fueled by speculative investment in internet companies, many with no profits. When sentiment shifted, valuations collapsed — even profitable tech companies lost 60-80% of their value due to multiple compression.',
      portfolioBehavior: 'Concentrated tech portfolios suffered catastrophic losses. Diversified portfolios with defensive holdings (consumer staples, energy) preserved significantly more capital. The crash taught that correlation spikes during panics.',
      keyTakeaways: [
        'Valuation multiples can expand far beyond fundamentals — and compress just as violently.',
        'Diversification across sectors matters most when you think it matters least.',
        'The speed of a crash often exceeds the speed at which investors can react.',
        'Profitable companies can still lose 70%+ if the entire sector de-rates.',
      ],
      reflectionQuestion: 'If every headline in 1999 told you tech was the future, what would have convinced you to diversify?',
    },
  },
  {
    id: 'gfc',
    name: '2008 Financial Crisis',
    subtitle: 'Understand systemic collapse and contagion',
    description: 'The collapse of the housing market triggered a global financial crisis. The S&P 500 fell 57% from its peak.',
    startDate: '2007-01-01',
    endDate: '2009-12-31',
    peakDrawdown: '–57%',
    indexTicker: '^GSPC',
    tickers: ['JPM', 'BAC', 'C', 'GS', 'MS', 'WFC', 'AIG', 'GE', 'AAPL', 'MSFT', 'XOM', 'PG', 'JNJ', 'KO', 'WMT'],
    events: [
      { date: '2007-06-01', label: 'Bear Stearns Hedge Funds Fail', description: 'Two Bear Stearns hedge funds collapse due to subprime mortgage exposure.', type: 'crash' },
      { date: '2007-09-18', label: 'Fed Begins Cutting Rates', description: 'The Federal Reserve cuts rates by 50 bps, signaling economic concern.', type: 'fed' },
      { date: '2008-03-16', label: 'Bear Stearns Rescued', description: 'JPMorgan acquires Bear Stearns in an emergency deal backed by the Fed.', type: 'crash' },
      { date: '2008-09-15', label: 'Lehman Brothers Collapses', description: 'Lehman Brothers files for bankruptcy. Global financial panic begins.', type: 'crash' },
      { date: '2008-10-03', label: 'TARP Bailout Signed', description: 'Congress passes the $700 billion Troubled Asset Relief Program.', type: 'policy' },
      { date: '2008-11-25', label: 'Fed Launches QE1', description: 'The Federal Reserve announces $600B in mortgage-backed security purchases.', type: 'fed' },
      { date: '2009-03-09', label: 'Market Bottom', description: 'S&P 500 hits 666, the bear market low. One of the greatest buying opportunities in history.', type: 'recovery' },
      { date: '2009-06-01', label: 'Recovery Begins', description: 'Markets begin sustained recovery as bank stress tests restore confidence.', type: 'recovery' },
    ],
    learningOutcomes: {
      whatHappened: 'The 2008 crisis was driven by systemic risk in the banking sector. Overleveraged financial institutions, complex derivatives, and interconnected counterparty risk created a cascade that affected every asset class.',
      portfolioBehavior: 'Correlations spiked to near 1.0 during the crisis — even "safe" assets fell. Portfolios heavy in financials were devastated. Defensive holdings and cash provided the only real protection.',
      keyTakeaways: [
        'Systemic risk cannot be diversified away within equities alone.',
        'Leverage amplifies losses in ways that are hard to predict.',
        'Government intervention can stabilize markets but creates moral hazard.',
        'The best buying opportunities occur when fear is at its peak.',
      ],
      reflectionQuestion: 'When correlations spike to 1.0, what does "diversification" actually mean?',
    },
  },
  {
    id: 'covid',
    name: 'COVID Crash',
    subtitle: 'Experience the fastest bear market in history',
    description: 'The COVID-19 pandemic caused the S&P 500 to fall 34% in just 23 trading days before a historic recovery.',
    startDate: '2019-10-01',
    endDate: '2020-12-31',
    peakDrawdown: '–34%',
    indexTicker: '^GSPC',
    tickers: ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NFLX', 'ZM', 'MRNA', 'PFE', 'XOM', 'BA', 'DAL', 'MAR', 'DIS'],
    events: [
      { date: '2020-01-20', label: 'First US COVID Case', description: 'The first confirmed COVID-19 case is reported in the United States.', type: 'crash' },
      { date: '2020-02-24', label: 'Markets Begin Falling', description: 'Major indices start declining as COVID fears spread globally.', type: 'crash' },
      { date: '2020-03-09', label: 'Oil Price War + Crash', description: 'Oil prices collapse alongside equities. Circuit breakers trigger for the first time since 1997.', type: 'crash' },
      { date: '2020-03-15', label: 'Fed Emergency Cut to 0%', description: 'The Fed cuts rates to near-zero and announces $700B in QE.', type: 'fed' },
      { date: '2020-03-23', label: 'S&P 500 Bottoms', description: 'The S&P hits its low of 2,237. The fastest bear market in history is complete.', type: 'recovery' },
      { date: '2020-03-27', label: 'CARES Act Signed', description: '$2.2 trillion stimulus package is signed into law.', type: 'policy' },
      { date: '2020-08-18', label: 'S&P 500 New High', description: 'The S&P recovers to a new all-time high just 5 months after the bottom.', type: 'recovery' },
      { date: '2020-11-09', label: 'Vaccine Breakthrough', description: 'Pfizer announces successful COVID vaccine trial. Value stocks surge.', type: 'recovery' },
    ],
    learningOutcomes: {
      whatHappened: 'The COVID crash was unprecedented in speed — 34% in 23 days. But the recovery was equally historic, driven by the largest fiscal and monetary stimulus in history.',
      portfolioBehavior: 'Stay-at-home stocks (tech, streaming, e-commerce) dramatically outperformed. Travel, energy, and hospitality were devastated. The V-shaped recovery rewarded those who held or bought the dip.',
      keyTakeaways: [
        'The speed of crashes can make reactive selling almost impossible.',
        'Government response speed dramatically affects recovery trajectories.',
        'Sector rotation can be violent and unpredictable during crises.',
        'Time in the market often beats timing the market.',
      ],
      reflectionQuestion: 'If the market fell 34% in three weeks, would you have the conviction to hold — or buy more?',
    },
  },
  {
    id: 'rate-hike',
    name: 'Recent Volatility',
    subtitle: 'Navigate inflation, rate hikes, and regime change',
    description: 'From 2022 to 2024, markets faced 40-year high inflation, aggressive rate hikes, and a fundamental regime shift away from growth stocks.',
    startDate: '2022-01-01',
    endDate: '2024-12-31',
    peakDrawdown: '–25%',
    indexTicker: '^GSPC',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'XOM', 'CVX', 'JPM', 'UNH', 'PG', 'KO', 'LLY', 'BRK-B'],
    events: [
      { date: '2022-01-26', label: 'Fed Signals Aggressive Hikes', description: 'Federal Reserve signals faster-than-expected rate hikes to combat inflation.', type: 'fed' },
      { date: '2022-03-16', label: 'First Rate Hike', description: 'Fed raises rates by 25 bps, beginning the most aggressive hiking cycle since the 1980s.', type: 'fed' },
      { date: '2022-06-13', label: 'Bear Market Official', description: 'S&P 500 enters bear market territory, down 20% from January highs.', type: 'crash' },
      { date: '2022-09-21', label: '75 bps Hike #3', description: 'The Fed raises rates by 75 bps for the third consecutive time.', type: 'fed' },
      { date: '2022-10-12', label: 'S&P 500 Bottom', description: 'Markets find a floor as inflation shows first signs of cooling.', type: 'recovery' },
      { date: '2023-03-10', label: 'SVB Collapse', description: 'Silicon Valley Bank fails, triggering fears of a banking crisis.', type: 'crash' },
      { date: '2023-07-26', label: 'Final Rate Hike', description: 'Fed raises rates to 5.25-5.50%, likely the peak of the cycle.', type: 'fed' },
      { date: '2024-01-02', label: 'AI Rally Begins', description: 'NVIDIA and AI-related stocks drive the market to new highs.', type: 'recovery' },
      { date: '2024-09-18', label: 'Fed Begins Cutting', description: 'The Federal Reserve cuts rates by 50 bps, pivoting to easing.', type: 'fed' },
    ],
    learningOutcomes: {
      whatHappened: 'The 2022-2024 period was defined by a regime shift. After a decade of low rates and growth stock dominance, rising inflation forced the Fed to hike aggressively, punishing high-duration assets.',
      portfolioBehavior: 'Growth stocks fell sharply as discount rates rose. Energy and value stocks outperformed significantly. The traditional 60/40 portfolio failed as bonds fell alongside stocks.',
      keyTakeaways: [
        'Interest rate environments fundamentally change which strategies work.',
        'What outperformed in the last cycle may underperform in the next.',
        'Regime awareness is more important than stock selection.',
        'Concentration risk in "winners" creates hidden fragility.',
      ],
      reflectionQuestion: 'How would you recognize a regime shift in real time, when all recent data supports the old regime?',
    },
  },
];
