
## Fix plan: Right sidebar overflow on Stock-All

### Goal
Keep the left and right columns visually aligned on desktop, and make the **right sidebar scroll internally** when the stock list is long.

### Root cause
The right column currently uses `lg:overflow-y-auto lg:max-h-full`, but it does **not have a reliably constrained height**.  
So when “Stocks → All” becomes tall, the sidebar can still grow beyond the left column instead of becoming a contained scroll area.

### Implementation approach

#### 1. Constrain the right sidebar at the page level
**File:** `src/pages/ScenarioSimulator.tsx`

- Replace the current sidebar wrapper with a **sticky, viewport-capped container** on large screens.
- Use a fixed top offset and fixed max/height calculation so the sidebar always has a real scroll boundary.

Planned direction:
- Keep the main 2-column grid
- Change right wrapper to something like:
  - `lg:sticky`
  - `lg:top-20`
  - `lg:self-start`
  - `lg:h-[calc(100vh-6rem)]` or equivalent
- Remove outer `overflow-y-auto` from this wrapper if the inner panel already owns scrolling

This matches your request to use a fixed margin/top offset and keep scrolling on the right side.

#### 2. Make the side panel itself own the scrolling
**File:** `src/components/scenario/DotComSidePanel.tsx`

- Ensure the root card fully fills the constrained parent:
  - keep `flex flex-col h-full min-h-0`
  - add `overflow-hidden` so content cannot spill out
- Ensure both tab panels can shrink correctly:
  - `Tabs` stays `flex-1 min-h-0`
  - both `TabsContent` blocks get `min-h-0 overflow-hidden`
- Let the existing `ScrollArea` be the only scroll container for:
  - Stock universe list
  - Portfolio tab content

### Expected result
- On desktop, the right sidebar height stays fixed relative to the viewport
- When “Stock-All” is selected, the **stock list scrolls inside the sidebar**
- The left content can remain taller, but the right panel no longer visually overflows or creates awkward blank/stretch behavior

## Technical details
```text
Current issue:
ScenarioSimulator wrapper: overflow-y-auto + max-h-full
but no explicit height source
=> child can still expand

Fix:
ScenarioSimulator
  right wrapper = sticky + explicit desktop height

DotComSidePanel
  root = h-full min-h-0 overflow-hidden
  tab content = min-h-0 overflow-hidden
  ScrollArea = actual scrolling region
```

### Files to update
- `src/pages/ScenarioSimulator.tsx`
- `src/components/scenario/DotComSidePanel.tsx`

### Acceptance checks
- Open Dot-Com scenario on desktop
- Switch to `Stocks`
- Select `All`
- Confirm the right sidebar does not exceed its visual container
- Confirm the stock list scrolls internally
- Confirm the left column layout remains unchanged
- Confirm mobile/tablet stacking still works normally
