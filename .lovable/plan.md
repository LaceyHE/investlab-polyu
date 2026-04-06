

# Scenario Simulator & Portfolio Explorer — Implementation Plan

## Overview

Replace the current "Stress Tests" section with a comprehensive **Scenario Simulator & Portfolio Explorer** that uses real market data (Yahoo Finance proxy), AI-powered commentary (Lovable AI), interactive portfolio building, and rich analytics.

---

## Architecture

```text
┌─────────────────────────────────────────────────┐
│  StressTests.tsx → ScenarioSimulator.tsx (page)  │
│  ┌─────────────────────────────────────────────┐ │
│  │ Scenario Selection (presets + custom range) │ │
│  │ → launches simulation view                  │ │
│  ├─────────────────────────────────────────────┤ │
│  │ SimulationView                              │ │
│  │  ├ MarketDashboard (index + metrics)        │ │
│  │  ├ InteractiveChart (price/NAV + overlays)  │ │
│  │  ├ PortfolioBuilder (drag weights)          │ │
│  │  ├ TimelineScrubber (slider + playback)     │ │
│  │  ├ AnalyticsPanel (returns, Sharpe, etc.)   │ │
│  │  ├ AICommentary (Lovable AI edge function)  │ │
│  │  └ LearningOutcomes (summary card)          │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Edge Function: scenario-commentary/index.ts      │
│  Hook: useScenarioSimulation.ts                   │
│  Hook: useMarketData.ts (Yahoo Finance proxy)     │
│  Data: scenario-presets.ts (annotations/events)   │
└─────────────────────────────────────────────────┘
```

---

## Step-by-step Plan

### 1. Rename and rebrand across the app
- Rename route from `/stress-tests` to `/scenarios` (keep old path as redirect)
- Update `AppNav.tsx`: "Stress Tests" → "Scenarios" with a new icon
- Update `LearningPath.tsx`: sidebar card text
- Update `Index.tsx` if it references stress tests
- All UI language shifts to "Explore", "Simulate", "Understand"

### 2. Create market data layer (`src/hooks/useMarketData.ts`)
- Fetch historical prices from a free Yahoo Finance proxy API (e.g., `query1.finance.yahoo.com` or a CORS-friendly proxy)
- Accept ticker array + date range, return daily OHLCV data
- Cache responses in React Query (`@tanstack/react-query`) with long stale times
- Compute MA50, rolling volatility, drawdown from raw data
- Adaptive time aggregation: auto-switch between daily/weekly/monthly based on volatility threshold; allow manual override
- Fallback to simulated data if API fails

### 3. Create scenario presets data (`src/data/scenario-presets.ts`)
- Define 4 preset scenarios with:
  - Date range, relevant tickers (index constituents for that era)
  - Annotated events array: `{ date, label, description, type: 'crash' | 'fed' | 'earnings' | 'policy' }`
  - Summary/learning text
- Support custom date range (user picks start/end dates, selects tickers)

### 4. Build simulation hook (`src/hooks/useScenarioSimulation.ts`)
- Portfolio state: positions (long only — no short selling per education constraints), weights, cash
- Timeline scrubber position (current date within range)
- Auto-playback mode (advance day-by-day with interval)
- Real-time metric recalculation: Total Return, CAGR, Max Drawdown, Worst Quarter, Rolling Sharpe, Volatility, Net Exposure
- Cumulative and rolling stat windows
- Trade marker history (entry/exit points)

### 5. Build the Scenario Simulator page (`src/pages/ScenarioSimulator.tsx`)
Replaces `StressTests.tsx`.

**Selection screen:**
- 4 preset scenario cards (Dot-Com, GFC, COVID, Recent Volatility) with date range, peak drawdown, key stat
- "Custom Range" option with date picker + ticker selector
- Each card uses educational framing: "Explore the Dot-Com era"

**Simulation view (after selecting a scenario):**

#### A. Market Dashboard (top bar)
- Current date, index level, period return
- Sentiment indicator derived from drawdown/volatility
- Key event badge when on an annotated date

#### B. Interactive Chart (center, large)
- Price/NAV line chart using `recharts` AreaChart
- Drawdown shaded areas (red fills below equity curve)
- Toggleable overlays: Rolling Sharpe, Rolling Volatility
- Annotated event markers with tooltips (vertical lines + icons)
- Portfolio NAV overlaid on index for comparison
- Trade entry/exit markers (dots on the chart)

#### C. Timeline Scrubber (below chart)
- Slider component (reuse existing `slider.tsx`) spanning full date range
- Play/Pause button for auto-advance
- Speed control (1x, 2x, 5x)
- Date label display

#### D. Portfolio Builder (side panel or below)
- Add positions from available tickers
- Drag slider to adjust weight (0–100%)
- Total allocation must equal 100% (or remainder = cash)
- Click to add trade markers at current timeline position
- Position cards show: ticker, weight, current P&L, contribution to risk
- Real-time recalculation on any change

#### E. Analytics Panel (collapsible side section)
- Summary metrics: Total Return, CAGR, Max Drawdown, Worst Quarter
- Rolling Sharpe Ratio chart (small sparkline)
- Volatility gauge
- Net/Gross Exposure bar
- Both cumulative and rolling windows

#### F. AI Commentary Panel
- "What happened here?" button at current timeline position
- Generates contextual explanation via Lovable AI edge function
- Commentary considers: current scenario, portfolio composition, market conditions, recent events
- Displayed in a collapsible card with markdown rendering
- Education-first tone (no predictions, no trade advice)

#### G. Learning Outcomes Card (end of scenario or always-visible)
- What happened in this scenario (historical context)
- Portfolio behavior insights (drawdown analysis, which positions helped/hurt)
- Key takeaways for risk and diversification
- Final reflection question

### 6. Create AI edge function (`supabase/functions/scenario-commentary/index.ts`)
- Enable Lovable Cloud if not already enabled
- Accept: scenario name, current date, portfolio holdings, recent events, metrics
- System prompt: educational tone, explain market events, portfolio dynamics, risk lessons. No predictions, no trade advice.
- Streaming response via SSE
- Handle 429/402 errors gracefully

### 7. Update routing and navigation
- `App.tsx`: Add `/scenarios` route, redirect `/stress-tests` → `/scenarios`
- Preserve existing dot-com simulation data/components as they can be reused for the Dot-Com preset
- Update all internal links

### 8. Adaptive time aggregation logic
- In `useMarketData.ts`: calculate rolling 20-day volatility
- If vol > threshold → aggregate to weekly bars
- If vol < threshold → monthly bars
- Default view auto-selects; user can override via toggle buttons (Daily / Weekly / Monthly)

### 9. Visual polish
- Drawdown shading on charts using `recharts` Area with gradient fill
- Framer Motion animations for panel transitions, metric updates
- Sentiment-driven subtle color shifts (warm tones in calm markets, cool/red in stress)
- Tooltip overlays on annotated events
- Smooth number animations on metric changes

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/ScenarioSimulator.tsx` | Create (replaces StressTests) |
| `src/hooks/useMarketData.ts` | Create |
| `src/hooks/useScenarioSimulation.ts` | Create |
| `src/data/scenario-presets.ts` | Create |
| `src/components/scenario/MarketChart.tsx` | Create |
| `src/components/scenario/PortfolioBuilder.tsx` | Create |
| `src/components/scenario/TimelineScrubber.tsx` | Create |
| `src/components/scenario/AnalyticsPanel.tsx` | Create |
| `src/components/scenario/AICommentary.tsx` | Create |
| `src/components/scenario/LearningOutcomes.tsx` | Create |
| `src/components/scenario/ScenarioCard.tsx` | Create |
| `supabase/functions/scenario-commentary/index.ts` | Create |
| `src/App.tsx` | Modify (routes) |
| `src/components/AppNav.tsx` | Modify (rename label) |
| `src/pages/LearningPath.tsx` | Modify (rename references) |
| `src/pages/StressTests.tsx` | Keep as redirect or remove |

---

## Technical Notes

- **Yahoo Finance proxy**: Will use a CORS-friendly proxy endpoint. If it fails, falls back to the existing simulated data from `dotcom-data.ts`.
- **Lovable Cloud**: Required for the AI commentary edge function. Will need to enable it.
- **Education constraints maintained**: No profit rankings, no trade signals, no optimization. All commentary is reflective and educational.
- **Existing dot-com simulation**: The current `DotComSimulation` component and data can be preserved as a "legacy" interactive mode within the Dot-Com preset, or its data can feed the new chart system.

