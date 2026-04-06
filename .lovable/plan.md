

# Fix: Radar Chart Scoring & Portfolio Calculation

## Issue 1: Radar Chart Mismatch

**Root Cause**: The current `RadarScoring.ts` maps CAGR from -20% to +20% onto 0-10. With real data (CAGR range ~-5% to +15%), this creates unintuitive scores (e.g., CAGR 5% → score 6.3 instead of a clear 2.5).

**Fix in `src/components/sandbox/RadarScoring.ts`**: Replace normalization with the user's specified fixed scales:

| Dimension | Metric | Scale |
|-----------|--------|-------|
| Return | CAGR | 0% → 0, 10% → 5, 20% → 10 |
| Risk | Volatility (inverted) | 0% vol → 10, 20% → 5, 40% → 0 |
| Stability | Max Drawdown (inverted) | 0% dd → 10, -20% → 5, -40% → 0 |
| Diversification | Strategy/param based | Same logic (unchanged) |
| Consistency | Worst Quarter (inverted) | 0% → 10, -15% → 5, -30% → 0 |
| Efficiency | Sharpe Ratio | 0 → 0, 1 → 5, 2 → 10 |

Formula: `score = clamp((metric / maxMetric) * 10)` with inversions where needed.

## Issue 2: Portfolio Always Favors 100% Stock

**Root Cause**: The backtest logic in `backtest6040` looks correct structurally — it aligns SPY/AGG dates, applies weights, and rebalances monthly. The real issue is that the **Yahoo Finance API calls are failing** (CORS errors visible in network logs), so it falls back to `generateFallbackData`. The fallback data has AGG with a negative drift (`dailyDrift = -0.0001`) and a down-year regime, but the magnitude may not produce realistic enough bond behavior.

**Fix in `src/hooks/useStrategyBacktest.ts`**:
1. Improve `generateFallbackData` to produce more realistic SPY/AGG behavior for 2021-2022:
   - SPY: ~380 start, rises to ~475 by end 2021, drops to ~380 by end 2022 (~0% total)
   - AGG: ~115 start, relatively flat 2021, drops to ~97 by end 2022 (~-16% total, reflecting the 2022 bond rout)
2. Fix the Sharpe calculation (lines 138-145 have a redundant double-calculation; clean up to use one consistent formula)
3. Ensure fallback data creates realistic diversification dynamics where bonds sometimes help and sometimes don't

**Expected outcomes after fix**:
- 100% SPY: Higher return, higher volatility
- 100% AGG: Lower/negative return, lower volatility
- 60/40: Moderate return, lower drawdown, potentially better Sharpe

## Files Modified

| File | Change |
|------|--------|
| `src/components/sandbox/RadarScoring.ts` | New fixed normalization scales |
| `src/hooks/useStrategyBacktest.ts` | Improved fallback data + Sharpe fix |

No other files need changes — the radar chart component and evaluation component consume scores from `RadarScoring.ts` and will update automatically.

