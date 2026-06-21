export interface ScenarioEvent {
  date: string; // YYYY-MM-DD
  label: string;
  description: string;
  type: 'crash' | 'fed' | 'earnings' | 'policy' | 'recovery' | 'geopolitical';
}

export interface QuantMethodology {
  concept: 'mean-reversion' | 'volatility-shock' | 'valuation-correction';
  driverLabel: string;
  formula: string;
  keyInputs: Array<{ label: string; value: string; source: string }>;
  drawdownStartMonth: number;
  drawdownDurationMonths: number;
  annualizedVol: number;
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
  isFuture?: boolean;
  quantMethodology?: QuantMethodology;
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

  // ── Hypothetical future downside scenarios ──────────────────────────────────

  {
    id: 'mean-reversion',
    name: 'Mean Reversion',
    subtitle: 'What happens when prices overshoot their long-run average?',
    description: 'Prices that rise 2–3× above their 3-year moving average have historically reverted. This scenario models a Nasdaq drawdown of –45% driven entirely by mean reversion math, with no catalyst other than valuation gravity.',
    startDate: '2025-01-01',
    endDate: '2027-06-30',
    peakDrawdown: '–45%',
    indexTicker: '^IXIC',
    tickers: ['NVDA', 'META', 'AMZN', 'GOOGL', 'MSFT', 'AMD', 'TSLA', 'NFLX', 'SNOW', 'PLTR', 'KO', 'JNJ', 'PG', 'WMT', 'XOM'],
    events: [
      { date: '2025-04-01', label: 'Price-to-Mean Ratio Hits 3×', description: 'Nasdaq trades at 3× its 3-year moving average. Historically rare — prior instances: 1929, 2000, 2021. Each ended with a reversion of 40–80%.', type: 'earnings' },
      { date: '2025-06-01', label: 'First Reversion Signal', description: '50-day moving average crosses below 200-day MA (death cross). Systematic trend-following funds begin selling.', type: 'crash' },
      { date: '2025-09-01', label: 'Price Returns to 2-Year Mean', description: 'Nasdaq down –25% from peak. Price reaches its 2-year average. Long-term investors begin tentative buying.', type: 'crash' },
      { date: '2026-01-01', label: 'Overshoot Below Mean', description: 'Classic reversion overshoot — price dips below the 3-year average before stabilizing. Fear drives over-correction.', type: 'crash' },
      { date: '2026-04-01', label: '3-Year Mean Begins Declining', description: 'As recent high prices roll off the 3-year window, the mean itself falls — providing no floor. Double compression.', type: 'policy' },
      { date: '2026-07-01', label: 'Stabilization at New Mean', description: 'Price and 3-year average converge at –45% from the 2025 peak. Mean reversion is mathematically complete.', type: 'recovery' },
    ],
    learningOutcomes: {
      whatHappened: 'Mean reversion is one of the most robust phenomena in financial markets. When an asset trades far above its long-run average, the expected future return is negative — not because of any specific event, but because price and value must eventually converge. This scenario shows what happens when that reversion is the only story.',
      portfolioBehavior: 'Stocks trading 2–3× above their 3-year mean fell hardest. Defensive stocks near or below their mean provided relative protection. The lesson: a stock\'s current price is not its fair value — the gap between price and mean is a hidden risk.',
      keyTakeaways: [
        'Mean reversion is not a prediction of timing — it is a statement about long-run probability.',
        'The further a price is above its mean, the more energy is "stored" for the reversion.',
        'Even during reversion, defensive stocks near their historical averages preserve capital.',
        'The 3-year mean itself can decline as recent highs age out — extending the bear market.',
      ],
      reflectionQuestion: 'If you knew the Nasdaq was trading 3× above its 3-year average, what would that change about your portfolio allocation?',
    },
    isFuture: true,
    quantMethodology: {
      concept: 'mean-reversion',
      driverLabel: '3-Year Moving Average Reversion',
      formula: 'Drawdown = 1 − (3yr Mean / Current Price)\nExample: Price = 3× Mean → Drawdown = 1 − (1/3) = −67%\nWith earnings growth offset: implied drawdown ≈ −45%',
      keyInputs: [
        { label: 'Current Price / 3yr Mean', value: '3.0×', source: 'Nasdaq composite, Jan 2025' },
        { label: 'Historical reversion depth', value: '−45% to −78%', source: 'Dot-com (2000), 2021 speculative names' },
        { label: 'Annualized volatility (crash regime)', value: '39% (28% × 1.4)', source: 'Nasdaq 2022 realized vol' },
      ],
      drawdownStartMonth: 3,
      drawdownDurationMonths: 12,
      annualizedVol: 0.28,
    },
  },

  {
    id: 'volatility-shock',
    name: 'Historical Volatility Shock',
    subtitle: 'When realized volatility spikes, markets enter regime-shift drawdowns',
    description: 'Realized volatility (measured over the prior 252 trading days) is the market\'s risk speedometer. When it spikes from 15% to 48%, systematic funds must de-lever. This scenario shows how vol itself becomes the crash mechanism — without any fundamental catalyst.',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    peakDrawdown: '–38%',
    indexTicker: '^GSPC',
    tickers: ['TSLA', 'RIVN', 'UPST', 'SQ', 'ABNB', 'COIN', 'MSTR', 'ROKU', 'JPM', 'BAC', 'GS', 'GLD', 'XOM', 'WMT', 'VZ'],
    events: [
      { date: '2025-03-01', label: 'Vol Regime Shift', description: 'Realized 30-day vol spikes from 15% to 45%. Risk-parity funds using vol-targeting algorithms are forced to sell equities to keep portfolio vol constant.', type: 'crash' },
      { date: '2025-04-01', label: 'Vol-Targeting Funds De-lever', description: 'Systematic strategies (risk parity, vol-target, CTAs) mechanically reduce equity exposure as vol rises. Estimated $2T+ of AUM is managed this way.', type: 'crash' },
      { date: '2025-06-01', label: 'Correlation Spike', description: 'Cross-asset correlations move toward 1.0. Stocks, bonds, and commodities fall together. Diversification fails in the short run — exactly when you need it most.', type: 'crash' },
      { date: '2025-08-01', label: 'Vol Feedback Loop', description: 'Selling causes higher volatility. Higher volatility forces more selling. The feedback loop amplifies the initial shock by 2–3×. S&P down –25% from peak.', type: 'crash' },
      { date: '2025-11-01', label: 'Vol Begins Normalizing', description: 'Realized vol drops from 48% to 30% as forced sellers exhaust their selling programs. Buyers cautiously return.', type: 'recovery' },
      { date: '2026-03-01', label: 'New Volatility Regime', description: 'Vol settles at 22–25% (elevated but stable). A new regime: higher baseline risk, lower multiples. Recovery begins but markets do not return to prior highs quickly.', type: 'recovery' },
    ],
    learningOutcomes: {
      whatHappened: 'Modern markets are dominated by systematic, rules-based strategies that react to volatility itself — not to fundamentals. When vol spikes, trillions of dollars are automatically sold. This creates a feedback loop where the vol shock IS the crash mechanism. No earnings miss, no recession, no geopolitical event needed.',
      portfolioBehavior: 'High-vol stocks (TSLA, COIN, RIVN) fell 2–3× more than the index. Gold and defensive staples provided ballast. Financial stocks (JPM, GS) sold off as they are often the vol-sellers who must unwind..',
      keyTakeaways: [
        'Realized volatility is both a measure of risk and a cause of it — via systematic selling.',
        'Expected maximum drawdown scales with volatility: σ × √T × Z (where Z≈2.5 for 99th pct).',
        'Correlation spikes in a vol shock make traditional diversification temporarily ineffective.',
        'The fastest recoveries come when vol normalizes — not when fundamentals improve.',
      ],
      reflectionQuestion: 'If your portfolio\'s volatility doubled in one month, would your risk management rules force you to sell at the worst moment?',
    },
    isFuture: true,
    quantMethodology: {
      concept: 'volatility-shock',
      driverLabel: 'Realized Volatility Regime Shift (15% → 48%)',
      formula: 'Expected Max Drawdown ≈ σ × √T × Z\nσ = 0.48 (peak realized vol), T = 0.5yr, Z = 2.5 (99th pct)\n→ 0.48 × √0.5 × 2.5 ≈ −85% theoretical max\nWith mean-reversion dampening: realized ≈ −38%',
      keyInputs: [
        { label: 'Baseline realized vol (calm regime)', value: '15%', source: 'S&P 500, 2024 realized vol' },
        { label: 'Peak realized vol (shock)', value: '48%', source: 'COVID March 2020: 58%; GFC: 52%' },
        { label: 'Vol-targeted AUM (estimated)', value: '$2T+', source: 'Risk parity + vol-target strategies, 2024' },
      ],
      drawdownStartMonth: 2,
      drawdownDurationMonths: 10,
      annualizedVol: 0.15,
    },
  },

  {
    id: 'valuation-correction',
    name: 'Valuation Correction',
    subtitle: 'What Shiller CAPE predicts about long-run expected returns',
    description: 'The Shiller CAPE ratio (Cyclically Adjusted P/E, using 10-year average earnings) has a 130-year track record of predicting long-run returns. At CAPE 35, the historical implied 10-year real return is near zero. This scenario shows what happens when CAPE reverts toward its long-run mean of 17.',
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    peakDrawdown: '–40%',
    indexTicker: '^GSPC',
    tickers: ['NVDA', 'MSFT', 'AAPL', 'META', 'GOOGL', 'AMZN', 'LLY', 'V', 'MA', 'COST', 'XOM', 'CVX', 'JPM', 'BRK-B', 'VZ'],
    events: [
      { date: '2025-07-01', label: 'Earnings Growth Slows', description: 'Revenue growth decelerates for the Magnificent 7. High-multiple stocks require perfect execution — any miss triggers outsized selloffs. P/E compression begins at 28×.', type: 'earnings' },
      { date: '2025-10-01', label: 'CAPE Warning Cited', description: 'Multiple research papers and Fed economists reference elevated Shiller CAPE. Media coverage increases. Institutional investors begin reducing forward P/E targets.', type: 'policy' },
      { date: '2026-01-01', label: 'Multiple Compression Accelerates', description: 'P/E moves from 28× to 22× as risk-free rates remain elevated. Growth stocks require higher discount rates, compressing fair value mechanically.', type: 'crash' },
      { date: '2026-04-01', label: 'S&P Down –20%', description: 'Value investors outperform growth for the first time in years. Energy, financials, and consumer staples hold up. Rotation accelerates the growth selloff.', type: 'crash' },
      { date: '2026-07-01', label: 'Trough Valuation Zone', description: 'CAPE approaches 20×. Forward P/E ~16×. S&P down –40% from peak. Historically, returns from these levels over the next decade have been above average.', type: 'crash' },
      { date: '2027-01-01', label: 'CAPE Settles at Fair Value', description: 'CAPE at ~20×, near its post-1990 average. Investors who held through the correction are still down –25–30%, but forward expected returns have normalized.', type: 'recovery' },
    ],
    learningOutcomes: {
      whatHappened: 'Valuation is not a timing tool — but it is a return predictor. At CAPE 35 (Jan 2025), the historical regression implies near-zero real 10-year returns. This scenario shows the mechanism: as earnings grow modestly but P/E contracts from 35× to 17×, the price must fall roughly 50% just to reach fair value. Earnings growth offsets some of this, resulting in a –40% drawdown.',
      portfolioBehavior: 'High-CAPE stocks (NVDA, MSFT, LLY, COST) fell most as their premium multiples compressed. Low-P/E value stocks (XOM, CVX, BRK-B, VZ) held up and outperformed. The portfolio lesson: mixing "expensive" and "cheap" stocks provides a natural hedge against valuation compression.',
      keyTakeaways: [
        'CAPE is a 10-year return predictor, not a 1-year market timer — but the correction eventually comes.',
        'Fair Value = EPS × Target P/E. When P/E compresses, price falls even if earnings grow.',
        'Value stocks outperform during valuation corrections because their P/E has less room to compress.',
        'The best time to buy historically has been when CAPE is below 15× — the inverse of this scenario.',
      ],
      reflectionQuestion: 'If you knew the S&P 500\'s CAPE was 35× (twice its historical mean), would that change how much you allocated to equities vs. alternatives?',
    },
    isFuture: true,
    quantMethodology: {
      concept: 'valuation-correction',
      driverLabel: 'Shiller CAPE Mean Reversion (35× → 17×)',
      formula: 'Fair Value = EPS × Target P/E\nΔPrice/Price = (Target CAPE / Current CAPE) − 1\n= (17 / 35) − 1 = −51%\nWith ~18% earnings growth offset over 3 years: net ≈ −40%',
      keyInputs: [
        { label: 'Shiller CAPE (Jan 2025)', value: '~35×', source: 'Yale/Shiller CAPE data, Jan 2025' },
        { label: 'Long-run CAPE mean (since 1881)', value: '~17×', source: 'Shiller, "Irrational Exuberance" (2000/2015)' },
        { label: 'Implied 10yr real return at CAPE 35', value: '~0.5%/yr', source: 'Shiller CAPE regression, R²≈0.4' },
      ],
      drawdownStartMonth: 6,
      drawdownDurationMonths: 15,
      annualizedVol: 0.22,
    },
  },
];
