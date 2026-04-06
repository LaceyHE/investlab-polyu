

# Align all scenarios to match Dot-Com Bubble experience

## Overview
Create rich stock data files for GFC, COVID, and Recent Volatility scenarios (matching the `dotcom-stocks.ts` pattern), then generalize the sidebar and supporting components so every scenario gets the full experience: tabbed sidebar with sparklines, industry filters, push messages, auto-triggered AI commentary, and personalized outcomes.

## Changes

### 1. Create stock data files for each scenario

Create three new files following the `DotComStock` interface pattern (renamed to a generic `ScenarioStock`):

| File | Scenario | Stocks |
|------|----------|--------|
| `src/data/gfc-stocks.ts` | 2008 Financial Crisis | JPM, BAC, C, GS, MS, WFC, AIG, GE, AAPL, MSFT, XOM, PG, JNJ, KO, WMT |
| `src/data/covid-stocks.ts` | COVID Crash | AAPL, MSFT, AMZN, GOOGL, META, TSLA, NFLX, ZM, MRNA, PFE, XOM, BA, DAL, MAR, DIS |
| `src/data/ratehike-stocks.ts` | Recent Volatility | AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, XOM, CVX, JPM, UNH, PG, KO, LLY, BRK-B |

Each file exports:
- A typed array of stocks with `ticker`, `name`, `industry`, `riskCategory`, `peakReturn`, `peakPSRatio`, `narrative`
- An `industries` array
- Uses the same `ScenarioStock` type (or keeps the `DotComStock` type renamed generically)

### 2. Create a unified stock registry

**File: `src/data/scenario-stocks.ts`** (new)
- Exports a `ScenarioStock` interface (same shape as `DotComStock`)
- Exports a `getStocksForScenario(scenarioId: string)` function that returns the correct stock array
- Exports a `getIndustriesForScenario(scenarioId: string)` function
- This becomes the single import point for all components

### 3. Generalize DotComSidePanel → ScenarioSidePanel

**File: `src/components/scenario/DotComSidePanel.tsx`** (rename/refactor)
- Accept a `stocks` prop (array of `ScenarioStock`) instead of importing `dotcomStocks` directly
- Accept an `industries` prop
- Remove hardcoded `dotcomStocks` import
- Everything else stays the same (sparklines, filters, tabs, tooltips)

### 4. Update ScenarioSimulator.tsx

- Remove the `isDotCom` branching — all scenarios use the rich side panel
- Import `getStocksForScenario` to get the correct stock array
- Pass stocks to the generalized side panel
- Enable push messages for all scenarios (`enabled: !!selectedScenario`)
- Enable AI commentary `autoTrigger` for all scenarios
- Show `PersonalizedOutcomes` for all scenarios when at end with positions

### 5. Update dependent components

- **AnalyticsPanel.tsx**: Accept stocks as prop instead of importing `dotcomStocks`
- **PersonalizedOutcomes.tsx**: Accept stocks as prop instead of importing `dotcomStocks`
- **usePushMessages.ts**: Accept stocks as parameter instead of importing `dotcomStocks`

### 6. Remove PortfolioBuilder.tsx usage

The basic `PortfolioBuilder` component is no longer needed since all scenarios use the rich side panel. It can be kept in the codebase but won't be rendered.

## Files summary

| Action | File |
|--------|------|
| Create | `src/data/gfc-stocks.ts` |
| Create | `src/data/covid-stocks.ts` |
| Create | `src/data/ratehike-stocks.ts` |
| Create | `src/data/scenario-stocks.ts` |
| Modify | `src/components/scenario/DotComSidePanel.tsx` — generalize to accept stocks prop |
| Modify | `src/pages/ScenarioSimulator.tsx` — remove isDotCom branching |
| Modify | `src/components/scenario/AnalyticsPanel.tsx` — accept stocks prop |
| Modify | `src/components/scenario/PersonalizedOutcomes.tsx` — accept stocks prop |
| Modify | `src/hooks/usePushMessages.ts` — accept stocks parameter |

