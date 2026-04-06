

# Enhanced Dot-Com Bubble Scenario — Interactive Educational Module

## Summary

Upgrade the existing Scenario Simulator's Dot-Com preset into a fully interactive, education-first experience with unified stock/portfolio panel, educational push messages, enhanced AI commentary, personalized learning outcomes, and richer visualizations.

---

## Changes Overview

### 1. Unified Stock & Portfolio Sidebar

**Merge** `DotComStockGrid` (currently below the chart) and `PortfolioBuilder` (sidebar) into a single tabbed sidebar panel for the Dot-Com scenario.

- **Tab 1 — Stock Universe**: Industry filter chips + stock tiles with hover sparklines, Peak Return, P/S, Volume. Click "Add" to allocate.
- **Tab 2 — My Portfolio**: Position cards with weight sliders, entry price, current P&L, sector exposure bar.
- Allocation bar at the top always visible regardless of active tab.
- Remove the separate `DotComStockGrid` section from below the chart.

**File**: Create `src/components/scenario/DotComSidePanel.tsx`
**Modify**: `src/pages/ScenarioSimulator.tsx` — conditionally render `DotComSidePanel` instead of separate `PortfolioBuilder` + `DotComStockGrid` for the dot-com preset.

---

### 2. Educational Push Messages

Add a notification system that triggers contextual warnings and suggestions based on portfolio state and timeline position.

**Triggers**:
- Concentration > 50% in one sector → "Your portfolio is concentrated in [industry]. Historically, sector concentration amplified losses during crashes."
- All positions in "failed" risk category (internal) → "Consider diversifying into less volatile sectors to reduce potential drawdown."
- High return + high drawdown → "Your portfolio shows high returns, but drawdown reached X%, and Sharpe is only Y, indicating excessive risk."
- Timeline lands on a major event → "Market this month: [event description]. Consider how your current allocation handles this."

**Implementation**:
- Create `src/components/scenario/PushMessages.tsx` — renders animated toast-like cards above the chart area.
- Logic in a new `src/hooks/usePushMessages.ts` that evaluates positions, metrics, current event, and `dotcom-stocks.ts` risk data to produce messages. Debounced to avoid spam.

---

### 3. Enhanced Analytics Panel with Educational Tooltips

Upgrade `AnalyticsPanel.tsx` to include:
- Hover tooltips on each metric explaining its significance (e.g., "Sharpe Ratio measures risk-adjusted return. Below 0.5 suggests excessive risk for the returns achieved.")
- Sector concentration breakdown (pie/bar showing % by industry)
- Color-coded risk indicators (green/amber/red thresholds)

**Modify**: `src/components/scenario/AnalyticsPanel.tsx`

---

### 4. Rolling Sharpe Overlay on Chart

Add a toggleable Rolling Sharpe line to `MarketChart.tsx`:
- Compute rolling 60-day Sharpe from NAV history in `useScenarioSimulation.ts` (expose as `rollingSharpe` array).
- Add a third toggle button ("Sharpe") alongside Drawdown and Volatility.
- Render on a secondary Y-axis.

**Modify**: `src/hooks/useScenarioSimulation.ts`, `src/components/scenario/MarketChart.tsx`

---

### 5. AI Commentary Enhancement

Upgrade the edge function and frontend to provide structured, actionable insights:

**Edge function** (`supabase/functions/scenario-commentary/index.ts`):
- Add sector exposure analysis to the prompt (compute % by industry from positions).
- Request structured output sections: Market Context, Portfolio Analysis, Risk Warnings, Suggestions.
- Include worst-quarter and Sharpe in metrics sent.
- Add instruction to warn about high-return-but-high-risk portfolios.

**Frontend** (`src/components/scenario/AICommentary.tsx`):
- Auto-trigger commentary on significant portfolio or timeline changes (debounced, not on every tick).
- Add visual icons/badges for key insight types (risk warning, diversification tip, etc.).
- Show a "loading" skeleton while generating.

---

### 6. Personalized AI Learning Outcomes

Replace static `LearningOutcomes` with AI-generated personalized insights.

**Create**: `src/components/scenario/PersonalizedOutcomes.tsx`
- Triggered when user reaches end of timeline or clicks "View My Results"
- Sends full portfolio history, final metrics, trade history to a new edge function call (reuse `scenario-commentary` with a `type: 'summary'` parameter)
- Displays: Portfolio vs Market comparison, Risk/return trade-offs learned, Visual badges (e.g., "Well-Diversified", "Capital Preserved", "High Risk Exposure", "Concentration Risk")
- Badges computed client-side from metrics: Sharpe > 0.8 → "Risk-Aware", maxDrawdown < -30% → "High Risk Exposure", positions in 3+ industries → "Well-Diversified"

**Modify**: `supabase/functions/scenario-commentary/index.ts` — add `type` parameter handling for `'summary'` mode with different prompt.

---

### 7. Timeline Push Messages per Month

Enhance `TimelineScrubber.tsx` to show contextual messages as the timeline advances:
- When timeline crosses an event date during playback, briefly flash the event description.
- Add monthly market summary hints from scenario events data.

**Modify**: `src/components/scenario/TimelineScrubber.tsx`, `src/pages/ScenarioSimulator.tsx`

---

### 8. NAV Chart Drawdown Shading for Portfolio

Currently drawdown shading uses the index. Add portfolio-specific drawdown shading:
- Compute portfolio drawdown from `navHistory` in `useScenarioSimulation.ts`.
- Pass to `MarketChart` and shade below the NAV line.

**Modify**: `src/hooks/useScenarioSimulation.ts`, `src/components/scenario/MarketChart.tsx`

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/scenario/DotComSidePanel.tsx` | **Create** — unified stock universe + portfolio panel |
| `src/components/scenario/PushMessages.tsx` | **Create** — educational notification cards |
| `src/hooks/usePushMessages.ts` | **Create** — push message trigger logic |
| `src/components/scenario/PersonalizedOutcomes.tsx` | **Create** — AI-generated learning summary with badges |
| `src/pages/ScenarioSimulator.tsx` | **Modify** — integrate new panels, remove separate grid |
| `src/components/scenario/AnalyticsPanel.tsx` | **Modify** — add tooltips, sector breakdown |
| `src/components/scenario/MarketChart.tsx` | **Modify** — rolling Sharpe overlay, portfolio drawdown |
| `src/components/scenario/AICommentary.tsx` | **Modify** — auto-trigger, structured display |
| `src/components/scenario/TimelineScrubber.tsx` | **Modify** — event flash messages |
| `src/hooks/useScenarioSimulation.ts` | **Modify** — rolling Sharpe, portfolio drawdown arrays |
| `supabase/functions/scenario-commentary/index.ts` | **Modify** — structured output, summary mode, sector analysis |

---

## Technical Notes

- All internal risk classifications (`failed`/`moderate`/`resilient`) remain hidden from UI; only used in push message logic and AI prompts.
- Push messages are debounced (show max 1 per 10 seconds) to avoid overwhelming users.
- AI commentary auto-triggers are debounced (30s cooldown) to manage rate limits.
- Badges in personalized outcomes are computed client-side from metrics thresholds — no AI needed for badge assignment.
- Existing non-dot-com scenarios continue using the current `PortfolioBuilder` unchanged.

