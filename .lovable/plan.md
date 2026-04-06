# Rename to InvestLab + Redesign Homepage as Hub

## Overview

Rename the entire app from "StrategyLab" to "InvestLab". Redesign the homepage to be a clear dashboard-style hub with direct navigation cards to Learning Path, Sandbox, Scenarios, and a new Account page.

## Changes

### 1. Global rename: StrategyLab → InvestLab

**Files:** `index.html`, `src/components/AppNav.tsx`, `src/pages/Index.tsx`

- Update `<title>` and OG meta tags in `index.html` to "InvestLab"
- Change logo text in `AppNav.tsx` from "StrategyLab" to "InvestLab"
- Update footer text in `Index.tsx`

### 2. Add Account nav item + route

**Files:** `src/components/AppNav.tsx`, `src/App.tsx`

- Add `/account` to nav items with User icon and "Account" label
- Make the existing User avatar in the nav link to `/account`
- Add route in `App.tsx`

### 3. Create Account page

**File:** `src/pages/Account.tsx` (new)

- Profile header with avatar placeholder and name
- **Progress section**: shows module completion status (6 modules as a progress bar / checklist)
- **Badges earned**: visual badge cards (e.g., "Completed Module 1", "First Scenario Run", "Sandbox Explorer") — static/placeholder data for now
- **Comments earned**: list of AI commentary highlights the user has received
- **Investment Ability Analysis**: radar chart or summary card showing strengths across dimensions (strategy thinking, risk awareness, environment reading, reflection quality) — reuse the radar chart pattern from the Sandbox

### 4. Redesign Homepage as a Hub

**File:** `src/pages/Index.tsx`

- Keep the hero section but make it shorter and punchier
- Replace the pillars + blockquote + CTA sections with **four large navigation cards** in a 2x2 grid:
  1. **Learning Path** — icon, brief description ("Master 6 modules of strategy thinking"), progress indicator, link
  2. **Sandbox** — icon, brief description ("Test strategies with real historical data"), link
  3. **Scenarios** — icon, brief description ("Simulate market crises and stress-test portfolios"), link
  4. **Investor Hub** — icon, brief description ("Track progress, badges, and investment analysis"), link
- Each card is a clickable `Link` with hover animation
- Keep footer, updated to "InvestLab"

## Technical details

### Files to create


| File                    | Purpose                  |
| ----------------------- | ------------------------ |
| `src/pages/Account.tsx` | New account/profile page |


### Files to modify


| File                        | Change                                         |
| --------------------------- | ---------------------------------------------- |
| `index.html`                | Title + meta tags → "InvestLab"                |
| `src/components/AppNav.tsx` | Rename logo, add Account nav item, link avatar |
| `src/pages/Index.tsx`       | Redesign as hub with 4 navigation cards        |
| `src/App.tsx`               | Add `/account` route                           |


### Design approach

- Reuse existing card styles (`rounded-xl border border-border bg-gradient-card`)
- Reuse existing motion animations from current homepage
- Account page reuses `PortfolioRadarChart` component pattern for the ability analysis
- All data is static/placeholder for now (no database needed yet)