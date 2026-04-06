

# Add "Portfolio Builder" Module to Sandbox

## Overview
Add a fifth option card "Build Your Own Portfolio" to the Sandbox strategy selector. Users pick up to 5 assets from a curated list (~15 tickers across stocks, ETFs, bonds, gold), assign weights via sliders (must total 100%), then see a backtest with chart, metrics, radar chart, and AI evaluation — all reusing existing components and patterns.

## Architecture

```text
Sandbox.tsx
├── StrategySelector (existing 4 + new "custom" card)
├── [if custom selected]
│   ├── CustomPortfolioBuilder (NEW) — asset picker + weight sliders
│   ├── useCustomBacktest (NEW hook) — fetch multi-ticker data, compute portfolio
│   ├── MetricsPanel (REUSED)
│   ├── StrategyChart (REUSED)
│   ├── CustomRadarChart (NEW) — diversification-aware scoring
│   ├── PortfolioEvaluation variant (REUSED edge function)
│   └── Transparency note
```

## Files to Create

### 1. `src/data/portfolio-assets.ts`
Curated asset universe with metadata:
- ~15 assets grouped by category: Technology (AAPL, MSFT), Finance (JPM), Healthcare (JNJ), Consumer (PG, KO), Energy (XOM), Industrials (CAT), ETFs (SPY, QQQ), Bonds (AGG), Alternatives (GLD)
- Each entry: `{ ticker, name, category, sector }`

### 2. `src/hooks/useCustomBacktest.ts`
- Reuses `useMarketData` from existing hook to fetch price data for selected tickers + SPY benchmark
- Aligns all tickers by date, computes weighted daily portfolio returns
- Monthly rebalancing, starts at $10,000
- Computes same metrics as existing strategies (CAGR, volatility, max drawdown, Sharpe, worst quarter)
- Returns `BacktestResult` (same type as existing strategies)

### 3. `src/components/sandbox/CustomPortfolioBuilder.tsx`
Main UI component with:
- **Asset picker**: Grouped by category, click to add (max 5), click X to remove
- **Weight sliders**: One per selected asset, auto-normalize to 100%
- **Allocation bar**: Visual horizontal bar showing weight distribution
- **Run Backtest button**: Triggers data fetch and computation
- On results: renders MetricsPanel, StrategyChart, radar chart, AI evaluation (reusing existing components)

### 4. `src/components/sandbox/CustomRadarScoring.ts`
Diversification-aware radar scoring:
- Return, Risk, Stability, Consistency, Efficiency — same formulas as existing `RadarScoring.ts`
- **Diversification**: scores based on number of unique sectors + number of asset classes (stocks/ETFs/bonds/gold) — multi-class portfolios score higher

## Files to Modify

### 5. `src/hooks/useStrategyBacktest.ts`
- Export `StrategyType` as union including `'custom'`
- No changes to existing backtest functions

### 6. `src/components/sandbox/StrategySelector.tsx`
- Add a 5th card: `{ id: 'custom', name: 'Build Your Own', subtitle: 'Custom Portfolio', icon: '🧩' }`
- Render in same grid (the grid already handles odd counts)

### 7. `src/pages/Sandbox.tsx`
- When `selectedStrategy === 'custom'`, render `CustomPortfolioBuilder` instead of the slider + existing strategy flow
- All existing strategy logic remains untouched

### 8. `supabase/functions/sandbox-evaluate/index.ts`
- Modify the prompt to also handle custom portfolios: accept an optional `assets` array field
- When assets are provided, mention the specific tickers and weights in the evaluation prompt
- Existing strategy evaluation logic unchanged

## Key Design Decisions

- **Max 5 assets** enforced in UI (add button disabled at limit)
- **Weight normalization**: When user adjusts one slider, others scale proportionally to maintain 100% total
- **Same time period** (2021-01-01 to 2023-01-01) and benchmark (SPY) as existing strategies
- **Data fetching**: Uses the same Yahoo Finance proxy with simulated fallback pattern from `useMarketData`
- **Reuse**: MetricsPanel, StrategyChart, PortfolioRadarChart components work with the same `BacktestResult` type
- **Edge function**: Same `sandbox-evaluate` function, extended prompt detects custom portfolio input

## UI Layout (within the detail view)
1. Asset selection panel (categorized grid)
2. Selected assets with weight sliders + allocation bar
3. "Run Backtest" button
4. Results section (same layout as existing strategies): Metrics → Chart → Radar + AI → Transparency note

