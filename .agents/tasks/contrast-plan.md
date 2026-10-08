# Light Mode Color Contrast Fix - Implementation Plan

## Overview
Fix light mode (lyt) color contrast issues across the ReCore AI frontend. Multiple components have insufficient contrast ratios failing WCAG AA standards (4.5:1 minimum for normal text). Primary issues:
1. **Filter tabs active state** — blue text on light backgrounds (failing 4.5:1)
2. **Badge text colors** — light text on light backgrounds in light mode
3. **Button text** — light colored text in light mode
4. **Links and inline text** — low contrast in light mode

## Design Decisions

### Decision 1: Active Tab Styling (Filter Tabs)
**Current problematic pattern:** `bg-slate-200/300 dark:bg-slate-800 text-blue-700 dark:text-cyan-300`
- Light mode: blue-700 text on slate-200/300 = ~4.5:1 (borderline, actual is lower with opacity)
- **Solution:** Use dark text on light background in light mode for contrast ≥ 7:1
- Replace text with `text-slate-900` in light mode, keep `dark:text-cyan-300` for dark mode
- **Rationale:** Maintains visual distinction while passing WCAG AA (actually achieves AAA ~7:1 ratio)

### Decision 2: Badge Colors (Risk, Status, Severity)
**Current:** Light colored badges like `text-emerald-400` on light backgrounds look faded
- **Solution:** Use darker shades in light mode (e.g., `text-emerald-700 dark:text-emerald-400`)
- **Pattern:** Always use a darker variant in light mode, keep existing dark mode colors
- **Rationale:** Badges should be visible and readable; darker text improves contrast from 5:1 to 6:1+

### Decision 3: Inline Links (blue text in code blocks, etc.)
**Current:** `text-blue-700 dark:text-cyan-300` — this is already good (7:1+ contrast)
- Some instances use `text-cyan-700` which can be marginal in light mode
- **Solution:** Standardize on `text-blue-700` for light mode, `dark:text-cyan-300` for dark
- **Rationale:** Pure blue has better contrast than cyan shade

## Implementation Steps

### Phase 1: Filter Tabs (Highest Impact)

#### 1.1 Fix filter tabs in `/app/page.tsx` (dashboard module filter)
**Location:** Dashboard codebase modules section, filter pills for risk levels
**Files:** `frontend/app/page.tsx`
**Current pattern (line ~552-556):**
```
bg-slate-300 dark:bg-slate-800 text-blue-700 dark:text-cyan-300
```
**Change to:**
```
bg-slate-300 dark:bg-slate-800 text-slate-900 dark:text-cyan-300 font-semibold
```
**Rationale:** slate-900 on slate-300 = ~9:1 contrast (WCAG AAA), maintains active state visibility

**Verify:** Run dev server, check dashboard filter pills in light mode — text should be clearly readable

#### 1.2 Fix filter tabs in `/app/graph/page.tsx` (dependency graph)
**Files:** `frontend/app/graph/page.tsx`
**Current pattern (line ~364):**
```
bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-500 dark:border-slate-700
```
**Issue:** `bg-slate-800` is dark but text is blue-700 which is also dark = low contrast in active state
**Change to:**
```
bg-blue-600 dark:bg-slate-800 text-white dark:text-cyan-300 border border-blue-700 dark:border-slate-700
```
**Rationale:** When active in light mode, use clear blue bg with white text (7:1+). Maintains dark mode experience.

**Verify:** Graph page risk filter tabs render with good contrast in both modes

#### 1.3 Fix filter tabs in `/components/ui/TestRunner.tsx` (test filter)
**Files:** `frontend/components/ui/TestRunner.tsx`
**Current pattern (line ~129):**
```
bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-slate-700
```
**Issue:** cyan-700 on slate-200 = ~5:1 (marginal), needs darker text
**Change to:**
```
bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-cyan-300 border border-slate-300 dark:border-slate-700 font-semibold
```
**Rationale:** slate-900 on slate-200 = ~9:1 (WCAG AAA)

**Verify:** Run validation page, check test filter tabs for clear text visibility

#### 1.4 Fix filter tabs in `/components/ui/DiffViewer.tsx` (code diff mode toggle)
**Files:** `frontend/components/ui/DiffViewer.tsx`
**Current pattern (line ~47-50, 58-61):**
```
bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/30
```
**Change to:**
```
bg-white dark:bg-cyan-500/20 text-slate-900 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/30 font-semibold
```
**Rationale:** Pure white background + slate-900 text = 21:1 contrast (excellent)

**Verify:** Validation page code diff viewer — toggle buttons text clearly visible

#### 1.5 Fix filter tabs in `/components/ui/UploadAnalysisModal.tsx` (upload tab toggle)
**Files:** `frontend/components/ui/UploadAnalysisModal.tsx`
**Current pattern (line ~185-188, 196-199):**
```
bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-semibold
```
**Change to:**
```
bg-white dark:bg-slate-800 text-slate-900 dark:text-cyan-300 font-semibold
```
**Rationale:** slate-900 on white = 21:1 contrast (WCAG AAA)

**Verify:** Upload modal shows clear active tab text

#### 1.6 Fix Sidebar module active link (Sidebar.tsx)
**Files:** `frontend/components/layout/Sidebar.tsx`
**Current pattern (line ~155):**
```
bg-blue-200 dark:bg-cyan-950/40 text-blue-700 dark:text-cyan-300
```
**Change to:**
```
bg-blue-600 dark:bg-cyan-950/40 text-white dark:text-cyan-300
```
**Rationale:** When active in light mode, use clear contrast. Blue-600 bg + white text = 7:1+

**Verify:** Sidebar active module link is clearly visible in light mode

---

### Phase 2: Badge Colors (Medium Impact)

#### 2.1 Fix Risk Badge utility function
**Files:** `frontend/lib/utils.ts`
**Function:** `getRiskBadgeClasses()`
**Current (lines 24-31):**
```typescript
export function getRiskBadgeClasses(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    case "high":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "low":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}
```

**Problem:** Light text colors (400 shades) on semi-transparent backgrounds look faded in light mode
**Change to:**
```typescript
export function getRiskBadgeClasses(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20";
    case "high":
      return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20";
    case "medium":
      return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20";
    case "low":
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20";
    default:
      return "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20";
  }
}
```

**Rationale:** 
- Light mode: Solid light backgrounds (50 shades) + darker text (700 shades) = 6:1+ contrast
- Dark mode: Maintains existing semi-transparent backgrounds + light text
- Meets WCAG AA across both themes

**Verify:** Unit tests for RiskBadge component, visual check in dashboard and module views

#### 2.2 Fix Status Badge component
**Files:** `frontend/components/ui/StatusBadge.tsx`
**Update all status badge classes:**

**Current "modernized" (line ~10):**
```
bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
```
**Change to:**
```
bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20
```

**Current "analyzing" (line ~17):**
```
bg-cyan-500/10 text-cyan-400 border border-cyan-500/20
```
**Change to:**
```
bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20
```

**Current "legacy" (line ~24):**
```
bg-slate-500/10 text-slate-400 border border-slate-700/50
```
**Change to:**
```
bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50
```

**Verify:** Module cards show status badges with clear text in light mode

#### 2.3 Fix Severity Badge component
**Files:** `frontend/components/ui/SeverityBadge.tsx`
**Update badge severity colors (function at line ~30):**

**Current patterns in getStyle():**
```
"bg-red-500/10 text-red-400 border-red-500/30"
"bg-orange-500/10 text-orange-400 border-orange-500/30"
"bg-amber-500/10 text-amber-400 border-amber-500/30"
"bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
```

**Change to:**
```typescript
const getStyle = () => {
  switch (severity) {
    case "critical":
      return "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30";
    case "high":
      return "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30";
    case "medium":
      return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30";
    case "low":
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30";
  }
};
```

**Verify:** Issue type badges in module detail pages render with readable text

---

### Phase 3: Other Text Color Fixes (Low Impact - But Important)

#### 3.1 Fix inline code/link text in `/app/validate/[id]/page.tsx`
**Files:** `frontend/app/validate/[id]/page.tsx`
**Location:** Shadow comparison table, line ~547 (in code display)
**Current:** `text-blue-700 dark:text-cyan-300`
**Note:** This is actually already good (7:1+), but for consistency:
**Optional change to:** `text-blue-800 dark:text-cyan-300` for even better contrast in light mode
**Rationale:** Marginal improvement, low priority

#### 3.2 Fix inline links in `/app/module/[id]/page.tsx`
**Files:** `frontend/app/module/[id]/page.tsx`
**Location:** Dependency links, line ~291
**Current:** `text-blue-700 dark:text-cyan-300`
**Status:** Already acceptable (6.5:1), no change needed

#### 3.3 Fix inline badges in `/app/planner/page.tsx`
**Files:** `frontend/app/planner/page.tsx`
**Location:** Phase pills, line ~432
**Current:** `text-cyan-700 dark:text-cyan-300`
**Change to:** `text-cyan-800 dark:text-cyan-300` or better yet `text-slate-900 dark:text-cyan-300`
**For consistency, change to:** `text-slate-900 dark:text-cyan-300`
**Rationale:** Consistent with other inline code styling

---

## Summary of Changes by File

| File | Changes | Contrast Gain |
|------|---------|--------------|
| `frontend/app/page.tsx` | Update 1 filter tab set (lines ~552-556) | 4.5→9:1 |
| `frontend/app/graph/page.tsx` | Update 1 filter tab set (lines ~363-367) | 3→7:1 |
| `frontend/components/ui/TestRunner.tsx` | Update 1 filter tab set (lines ~128-132) | 5→9:1 |
| `frontend/components/ui/DiffViewer.tsx` | Update 2 tab buttons (lines 46-61) | 5→21:1 |
| `frontend/components/ui/UploadAnalysisModal.tsx` | Update 2 tab buttons (lines ~185-199) | 4→21:1 |
| `frontend/components/layout/Sidebar.tsx` | Update active link styling (line ~155) | 4→7:1 |
| `frontend/lib/utils.ts` | Update `getRiskBadgeClasses()` (lines 24-31) | 4→6:1 |
| `frontend/components/ui/StatusBadge.tsx` | Update all 3 status badge styles (lines ~10-25) | 4→6:1 |
| `frontend/components/ui/SeverityBadge.tsx` | Update `getStyle()` function (lines ~30-42) | 4→6:1 |
| `frontend/app/planner/page.tsx` | Update 1 inline code snippet (line ~432) | 5→7:1 |

## WCAG Compliance

### Ratios Achieved
- **Filter Tabs:** Most achieve 7:1-9:1 (WCAG AAA)
- **Badges:** All achieve 6:1+ (WCAG AA, many approach AAA)
- **Button Text:** 7:1+ (WCAG AAA)

### Testing Notes
- Test in light mode (default) and dark mode
- Use browser DevTools contrast checker to verify
- Manually inspect all badge types, filter states, and button hover states
- Check DiffViewer toggle in code diff mode
- Verify sidebar active module link at all screen sizes

---

## Implementation Order
1. **Filter Tabs (Highest impact on UX)** — Do all 5 tab sets first
2. **Utility function & Badges** — Update the core utilities then badge components
3. **Inline text** — Clean up remaining minor contrast issues

**Total files to modify:** 10
**Total pattern replacements:** 14
**Estimated impact:** Fixes light mode theme accessibility completely for normal use text

