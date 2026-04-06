

# Fix: Black/blank space in right sidebar TabsContent

## Root Cause

Radix `TabsContent` renders as `display: block` when active. Even though the parent `Tabs` is `flex flex-col` and TabsContent has `flex-1`, a block-level element doesn't stretch to fill remaining flex space the same way a flex child with `display: flex` does. The `flex-1` only sets `flex-grow`, but since Radix controls the `display` property internally, the content area doesn't actually fill the remaining height.

## Fix

**File: `src/components/scenario/DotComSidePanel.tsx`**

Replace the flex-based layout approach with explicit height calculations that don't depend on Radix's display behavior:

1. The `Tabs` wrapper: keep `flex-1 flex flex-col min-h-0`
2. Both `TabsContent` elements: add `data-[state=active]:flex data-[state=active]:flex-col` so that when Radix activates the tab, it becomes a flex container that properly fills space
3. Alternatively (more reliable): wrap the entire tabs area below the TabsList in a `div` with `flex-1 min-h-0 relative`, and position TabsContent with `absolute inset-0` + `overflow-y-auto` so it fills the exact remaining space regardless of Radix's display model

**Recommended approach**: Use the `absolute` positioning method since it's immune to Radix display quirks:

- Wrap both `TabsContent` in a relative container: `<div className="flex-1 min-h-0 relative">`
- Each `TabsContent`: `absolute inset-0 overflow-y-auto px-4 pb-4`
- Remove the `ScrollArea` wrapper since the TabsContent itself scrolls
- This guarantees the content area exactly fills available space with no blank gaps

## Files to modify
- `src/components/scenario/DotComSidePanel.tsx` — wrap TabsContent in a relative container, use absolute positioning for tab panels

