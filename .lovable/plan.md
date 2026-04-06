

# Scenario Module UX Enhancements

## 1. Stock Selection — Fix Overflow & Scrollable Panel

**File**: `src/components/scenario/DotComSidePanel.tsx`

- The `TabsContent` for "universe" already has `overflow-y-auto` but the parent container's `max-h-[calc(100vh-200px)]` may clip content. Add `ScrollArea` from radix to both tab panels for smoother scrolling with visible scrollbars.
- Ensure the filter chips row stays sticky at the top of the universe tab so it doesn't scroll away.
- Keep existing hover tooltip behavior (Peak Return, P/S Ratio, Avg Volume, Mini Sparkline) unchanged.

## 2. Push Messages — Auto-Dismiss, Centered Popups, More Event Types

**Files**: `src/hooks/usePushMessages.ts`, `src/components/scenario/PushMessages.tsx`

### Hook changes (`usePushMessages.ts`):
- Expand message types from `'warning' | 'info' | 'suggestion'` to include `'crash' | 'rally' | 'volatility' | 'bubble'`.
- Add auto-dismiss: each message gets a `ttl` (e.g., 6 seconds). A `useEffect` interval removes expired messages automatically.
- Add new trigger conditions:
  - High volatility detected (volatility > 35%) triggers a "volatility" message.
  - Timeline event types (`crash`, `rally`, `bubble`) map to matching message types.

### Component changes (`PushMessages.tsx`):
- Render as a **fixed overlay centered on the viewport** (`fixed inset-x-0 top-20 z-50 flex flex-col items-center`).
- Add more icons: `TrendingDown` (crash), `TrendingUp` (rally), `Activity` (volatility), `Flame` (bubble).
- Add a progress bar that shrinks over the TTL duration, then auto-removes. No manual dismiss button needed (but keep it as optional).
- Each message fades in and auto-fades out after TTL.

## 3. AI Commentary — Structured Sections with Icons

**File**: `src/components/scenario/AICommentary.tsx`

- Update the edge function prompt (already structured with `**Market Context**`, `**Portfolio Analysis**`, `**Key Insight**`).
- In `renderCommentary`, parse markdown headings (`h3`/`h2`) and bold section headers more aggressively:
  - `Market Context` → `BarChart3` icon + blue-tinted card
  - `Portfolio Analysis` → `PieChart` icon + neutral card
  - `Key Insight` / `Risk Warning` → `AlertTriangle` icon + amber card
  - `Suggestion` → `Lightbulb` icon + green card
- Wrap each detected section in a visually distinct mini-card with icon, rather than plain markdown.
- Add metric highlights: detect patterns like `XX%` or `Sharpe X.XX` in text and render them as inline `<span>` badges with monospace font and color coding.

**File**: `supabase/functions/scenario-commentary/index.ts`
- Refine the system prompt to explicitly request three clearly labeled sections: `## Market Context`, `## Portfolio Analysis`, `## Key Insight`.
- Add instruction: "Highlight specific metrics inline using bold, e.g., **drawdown of -32%**, **Sharpe of 0.4**."

## 4. Learning Outcomes — Structured with Badges and Actionable Lessons

**File**: `src/components/scenario/PersonalizedOutcomes.tsx`

- Reorganize the layout into two columns after badges:
  - **Left column: Strengths** — green-tinted cards with check icons
  - **Right column: Areas to Explore** — amber-tinted cards with lightbulb icons
- Add 3 fixed actionable lesson prompts below the AI summary (always shown, not AI-generated):
  1. "Compare your return vs. a diversified benchmark"
  2. "Assess concentration risk and its impact on volatility"
  3. "Reflect on how defensive allocation could improve your Sharpe ratio"
- Style badges with tooltip descriptions on hover (already partially implemented — ensure `title` attr works well or switch to `Tooltip` component).
- Update the edge function summary prompt to explicitly output `**Strengths**` and `**Areas to Explore**` sections (already in the prompt — ensure frontend parses and splits them).
- Parse the AI response to split at `**Strengths**` and `**Areas to Explore**` headers, rendering each in its respective column rather than as plain markdown.

## Files Summary

| File | Action |
|------|--------|
| `src/components/scenario/DotComSidePanel.tsx` | Modify — add ScrollArea, sticky filters |
| `src/hooks/usePushMessages.ts` | Modify — add types, TTL auto-dismiss, new triggers |
| `src/components/scenario/PushMessages.tsx` | Modify — centered overlay, auto-fade, more icons, progress bar |
| `src/components/scenario/AICommentary.tsx` | Modify — section cards with icons, metric badges |
| `src/components/scenario/PersonalizedOutcomes.tsx` | Modify — two-column strengths/areas, actionable lessons |
| `supabase/functions/scenario-commentary/index.ts` | Modify — refined prompt structure |

