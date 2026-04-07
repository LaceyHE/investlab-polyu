

# Link Hub to Real Activity + Seed Lacey's Data

## Two parts

### Part A: Seed Lacey's progress records

Insert realistic activity records for user `dc4d1350-3439-4e25-9cca-3582239ace6b` into `user_progress` using the insert tool:

- **3 module completions**: `module_complete` for modules 1, 2, 3
- **2 scenario runs**: `scenario_run` for `dotcom` and `covid`
- **2 sandbox backtests**: `sandbox_backtest` for `allocation` (60/40) and `momentum` (Speed Racer)
- **1 custom portfolio**: `sandbox_custom` with sample assets/weights
- **3 knowledge points**: `knowledge_point` for concepts like `fundamental-thinking`, `technical-thinking`, `momentum-thinking`

Timestamps spread over the past 2 weeks so the timeline looks natural.

### Part B: Wire tracking calls across the app

**Files to modify:**

1. **`src/pages/ModuleOne.tsx` through `ModuleSix.tsx`** (6 files)
   - Import `useUserProgress`
   - Call `markComplete("module_view", "module-N")` on mount
   - Call `markComplete("module_complete", "module-N")` when user clicks "Continue to next module"
   - Track knowledge points from educational content sections

2. **`src/pages/Sandbox.tsx`**
   - When backtest results render, call `markComplete("sandbox_backtest", strategyId, { strategy })`
   - For custom portfolio, call `markComplete("sandbox_custom", "custom-portfolio", { assets })`

3. **`src/pages/ScenarioSimulator.tsx`**
   - When user selects a scenario, call `markComplete("scenario_run", scenarioId)`

4. **`src/hooks/useUserProgress.ts`**
   - Add `getActivities(type)` helper returning filtered records with metadata
   - Add `activityCount(type)` helper

5. **`src/pages/Account.tsx`** — Rebuild Hub cards with real data:
   - **Learning Progress**: Show visited vs completed with dates
   - **Activity Timeline**: Replace static AI Commentary with chronological feed of recent actions ("Ran 60/40 backtest", "Explored Dot-Com scenario")
   - **Sandbox/Scenario stats**: Show counts and which strategies/scenarios were tried
   - **Radar chart**: Scores driven by actual activity counts
   - **Badges**: Add "Portfolio Architect" (custom portfolio), "History Student" (all scenarios), keep existing ones now earnable
   - **Knowledge Points**: Show concept tags from `knowledge_point` records

### Summary of changes

| Action | File(s) |
|--------|---------|
| Insert | ~10 rows into `user_progress` for Lacey |
| Modify | `ModuleOne.tsx` – `ModuleSix.tsx` (add tracking) |
| Modify | `Sandbox.tsx` (track backtests) |
| Modify | `ScenarioSimulator.tsx` (track scenario runs) |
| Modify | `useUserProgress.ts` (add helpers) |
| Modify | `Account.tsx` (rebuild with real data) |

No database schema changes needed — the existing `user_progress` table already supports all activity types.

