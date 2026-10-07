# Light Theme Visibility Audit & Fix Plan

**Status:** Ready for Implementation  
**Issue:** Failed popout dark notifications and dark text visible in light theme causing readability issues  
**Scope:** Frontend light theme color contrast fixes

---

## Summary of Findings

The application has comprehensive dark mode styling but lacks proper light mode equivalents for hardcoded dark color classes. When `html.light` class is active, components still render with:
- Dark text on white backgrounds (invisible)
- Dark backgrounds with dark text (low contrast)
- Border colors not adjusted for light mode
- Toast/notification components with improper light mode colors

The `globals.css` file contains CSS variable overrides but does not comprehensively cover all hardcoded Tailwind dark color classes used throughout components.

---

## Affected Files & Required Changes

### 1. **app/globals.css** - Global Light Mode CSS Variables
**Issue:** Incomplete light mode CSS overrides; missing comprehensive rules for all dark color variants  
**Changes Required:**
- Add complete `.light` mode overrides for all `text-slate-*` colors (100-600)
- Add complete `.light` mode overrides for all `bg-slate-*` backgrounds (950, 900, 800, 700)
- Add complete `.light` mode overrides for `border-slate-*` classes
- Ensure toast/notification backgrounds and text are properly styled in light mode

**Specific Line Replacements:**

```css
/* CURRENT - Incomplete */
html.light .text-slate-100,
html.light .text-slate-200,
html.light .text-slate-300 {
  color: #1e293b !important;
}

/* REPLACE WITH - Complete coverage */
html.light .text-white {
  color: #0f172a !important;
}

html.light .text-slate-100 {
  color: #1e293b !important;
}

html.light .text-slate-200 {
  color: #1e293b !important;
}

html.light .text-slate-300 {
  color: #475569 !important;
}

html.light .text-slate-400 {
  color: #64748b !important;
}

html.light .text-slate-500 {
  color: #78858f !important;
}

html.light .text-slate-600 {
  color: #94a3b8 !important;
}

/* Background Color Overrides */
html.light .bg-slate-950 {
  background-color: #ffffff !important;
  border-color: #e2e8f0 !important;
}

html.light .bg-slate-900 {
  background-color: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

html.light .bg-slate-800 {
  background-color: #e2e8f0 !important;
  border-color: #cbd5e1 !important;
}

html.light .bg-slate-700 {
  background-color: #cbd5e1 !important;
  border-color: #a1aac4 !important;
}

/* Border Color Overrides */
html.light .border-slate-900 {
  border-color: #cbd5e1 !important;
}

html.light .border-slate-800 {
  border-color: #cbd5e1 !important;
}

html.light .border-slate-700 {
  border-color: #cbd5e1 !important;
}

html.light .border-slate-600 {
  border-color: #cbd5e1 !important;
}
```

**Files to Modify:** `app/globals.css`  
**Verification:** None – CSS fix; verify visually after component fixes

---

### 2. **components/ui/ToastContext.tsx** - Toast/Notification Styling
**Issue:** Toast notifications use dark backgrounds with dark/light text combinations that fail in light mode

**Changes Required:**
- Replace toast background classes with light-mode safe alternatives
- Update text colors to ensure contrast in both light and dark modes

**Specific Replacements:**

Line 53 - Toast container backgrounds:
```typescriptreact
/* CURRENT */
className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${
  t.type === "success"
    ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200"
    : t.type === "error"
    ? "bg-rose-950/80 border-rose-500/30 text-rose-200"
    : t.type === "warning"
    ? "bg-amber-950/80 border-amber-500/30 text-amber-200"
    : "bg-slate-900/80 border-slate-700/50 text-slate-200"
}`}

/* REPLACE WITH */
className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${
  t.type === "success"
    ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
    : t.type === "error"
    ? "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200"
    : t.type === "warning"
    ? "bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200"
    : "bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700/50 text-slate-900 dark:text-slate-200"
}`}
```

Line 60 - Close button styling:
```typescriptreact
/* CURRENT */
className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"

/* REPLACE WITH */
className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
```

**Files to Modify:** `components/ui/ToastContext.tsx`  
**Verification:** Run app, trigger success/error/warning toast notifications in light mode and confirm text is readable

---

### 3. **app/page.tsx** - Dashboard Page
**Issue:** Multiple hardcoded dark text and background colors without light mode equivalents

**Changes Required:**
- Loading skeleton backgrounds need light mode colors
- All `text-white`, `text-slate-*` classes need `dark:` variants
- All `bg-slate-*` backgrounds need light mode counterparts

**Specific Replacements:**

Line 56 - Loading skeleton:
```typescriptreact
/* CURRENT */
<div className="h-8 w-64 bg-slate-800 rounded-lg" />
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {[1, 2, 3, 4].map((i) => (
    <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
  ))}
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="h-72 bg-slate-900 rounded-2xl border border-slate-800 col-span-2" />
  <div className="h-72 bg-slate-900 rounded-2xl border border-slate-800" />
</div>

/* REPLACE WITH */
<div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {[1, 2, 3, 4].map((i) => (
    <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800" />
  ))}
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="h-72 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 col-span-2" />
  <div className="h-72 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800" />
</div>
```

Line 107 - Main heading:
```typescriptreact
/* CURRENT */
<h1 className="text-2xl font-bold tracking-tight text-white">
  Modernization Overview
</h1>

/* REPLACE WITH */
<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
  Modernization Overview
</h1>
```

Line 112 - Subtext:
```typescriptreact
/* CURRENT */
<p className="text-xs text-slate-400 mt-1">
  Automated legacy AST decompilation, security threat isolation, and parity validation status.
</p>

/* REPLACE WITH */
<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
  Automated legacy AST decompilation, security threat isolation, and parity validation status.
</p>
```

Line 133 - Button:
```typescriptreact
/* CURRENT */
className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors"

/* REPLACE WITH */
className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors"
```

Line 159-165 - Card text colors (all 4 stat cards):
```typescriptreact
/* CURRENT */
<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Modules</span>
...
<span className="text-3xl font-bold font-mono text-white">

/* REPLACE WITH */
<span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Total Modules</span>
...
<span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
```

Line 176 - Card backgrounds (all stat cards):
```typescriptreact
/* CURRENT */
<div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">

/* REPLACE WITH */
<div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
```

Line 191 - Text color in cards:
```typescriptreact
/* CURRENT */
<p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">

/* REPLACE WITH */
<p className="text-[11px] text-slate-600 dark:text-slate-500 mt-2 flex items-center gap-1">
```

Line 234 - Chart container:
```typescriptreact
/* CURRENT */
<div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">

/* REPLACE WITH */
<div className="lg:col-span-4 p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex flex-col justify-between">
```

Line 240 - Chart text:
```typescriptreact
/* CURRENT */
<h3 className="text-sm font-bold text-white">Risk Distribution</h3>
<span className="text-[10px] uppercase font-mono text-slate-500">12 Modules</span>

/* REPLACE WITH */
<h3 className="text-sm font-bold text-slate-900 dark:text-white">Risk Distribution</h3>
<span className="text-[10px] uppercase font-mono text-slate-600 dark:text-slate-500">12 Modules</span>
```

Continue this pattern for all other stat card sections (around lines 256-280).

Line 283-290 - Activity feed:
```typescriptreact
/* CURRENT */
<div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
  <h3 className="text-sm font-bold text-white flex items-center gap-2">

/* REPLACE WITH */
<div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800">
  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
```

Line 306-312 - Activity items:
```typescriptreact
/* CURRENT */
<div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 text-xs">
...
<p className="text-slate-200 font-medium leading-snug">{act.message}</p>
<span className="text-[11px] font-mono text-slate-500 mt-1 block">

/* REPLACE WITH */
<div className="p-3.5 rounded-xl bg-slate-200/70 dark:bg-slate-950/70 border border-slate-400 dark:border-slate-800/80 flex items-start gap-3 text-xs">
...
<p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">{act.message}</p>
<span className="text-[11px] font-mono text-slate-600 dark:text-slate-500 mt-1 block">
```

Line 331-337 - Module grid title:
```typescriptreact
/* CURRENT */
<h2 className="text-lg font-bold text-white">Discovered Codebase Modules</h2>
<p className="text-xs text-slate-400">
  12 Python modules mapped from legacy billing repository.
</p>

/* REPLACE WITH */
<h2 className="text-lg font-bold text-slate-900 dark:text-white">Discovered Codebase Modules</h2>
<p className="text-xs text-slate-600 dark:text-slate-400">
  12 Python modules mapped from legacy billing repository.
</p>
```

Line 346 - Filter buttons:
```typescriptreact
/* CURRENT */
<div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
...
className={`px-3 py-1 rounded-lg uppercase text-[11px] font-semibold transition-all ${
  filterRisk === level
    ? "bg-slate-800 text-cyan-300 shadow-sm border border-slate-700"
    : "text-slate-400 hover:text-white"
}`}

/* REPLACE WITH */
<div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-400 dark:border-slate-800 text-xs">
...
className={`px-3 py-1 rounded-lg uppercase text-[11px] font-semibold transition-all ${
  filterRisk === level
    ? "bg-slate-300 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 shadow-sm border border-slate-400 dark:border-slate-700"
    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
}`}
```

**Files to Modify:** `app/page.tsx`  
**Verification:** Run `npm run dev`, navigate to dashboard page, toggle light theme and verify all text is readable, all cards visible, no white-on-white

---

### 4. **app/planner/page.tsx** - Modernization Planner Page
**Issue:** Same as dashboard – hardcoded dark colors throughout

**Key Replacements (Similar Pattern):**

Line 45 - Loading skeleton (same as dashboard):
```typescriptreact
/* CURRENT */
<div className="h-8 w-64 bg-slate-800 rounded" />

/* REPLACE WITH */
<div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
```

Line 48-50 - Grid skeleton:
```typescriptreact
/* CURRENT */
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />

/* REPLACE WITH */
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800" />
```

Line 75 - Header section:
```typescriptreact
/* CURRENT */
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">

/* REPLACE WITH */
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300 dark:border-slate-800">
```

Line 78 - Main title:
```typescriptreact
/* CURRENT */
<h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">

/* REPLACE WITH */
<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
```

Line 86 - Subtext:
```typescriptreact
/* CURRENT */
<p className="text-xs text-slate-400 mt-1">
  AI-synthesized step-by-step roadmap ordering refactors to minimize blast radius and avoid broken dependency chains.
</p>

/* REPLACE WITH */
<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
  AI-synthesized step-by-step roadmap ordering refactors to minimize blast radius and avoid broken dependency chains.
</p>
```

Line 99 - Card backgrounds (KPI cards - 3 of them):
```typescriptreact
/* CURRENT */
<div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">

/* REPLACE WITH */
<div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
```

Line 103 - Text colors in KPI cards:
```typescriptreact
/* CURRENT */
<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
  Total Engineering Effort
</span>
...
<span className="text-3xl font-extrabold font-mono text-white">

/* REPLACE WITH */
<span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
  Total Engineering Effort
</span>
...
<span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
```

Line 108 - Secondary text:
```typescriptreact
/* CURRENT */
<span className="text-xs text-slate-400 font-mono">dev-days</span>

/* REPLACE WITH */
<span className="text-xs text-slate-600 dark:text-slate-400 font-mono">dev-days</span>
```

Line 172 - Explanation section:
```typescriptreact
/* CURRENT */
<div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">

/* REPLACE WITH */
<div className="p-6 rounded-3xl bg-gradient-to-br from-slate-100 via-indigo-100/30 to-slate-100 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-300 dark:border-indigo-500/30 shadow-2xl space-y-4">
```

Line 177 - Explanation border:
```typescriptreact
/* CURRENT */
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">

/* REPLACE WITH */
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-300 dark:border-slate-800/80">
```

Line 189 - Title:
```typescriptreact
/* CURRENT */
<h2 className="text-lg font-bold text-white tracking-tight">
  Why did we recommend modernizing <span className="text-cyan-400">{explanation.moduleName}</span> first?
</h2>

/* REPLACE WITH */
<h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
  Why did we recommend modernizing <span className="text-cyan-600 dark:text-cyan-400">{explanation.moduleName}</span> first?
</h2>
```

Line 210 - Explanation text box:
```typescriptreact
/* CURRENT */
<p className="text-xs text-slate-200 font-sans leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">

/* REPLACE WITH */
<p className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed bg-slate-200/70 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-400 dark:border-slate-800/80">
```

Line 215 - Metrics boxes:
```typescriptreact
/* CURRENT */
<div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">

/* REPLACE WITH */
<div className="p-3 rounded-xl bg-slate-200/90 dark:bg-slate-950/90 border border-slate-400 dark:border-slate-800 space-y-1">
```

Line 219 - Text in metrics:
```typescriptreact
/* CURRENT */
<span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
  1. Blocker Status
</span>
...
<p className="text-[11px] text-slate-400">Leaf dependency; safely isolated.</p>

/* REPLACE WITH */
<span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 font-mono">
  1. Blocker Status
</span>
...
<p className="text-[11px] text-slate-600 dark:text-slate-400">Leaf dependency; safely isolated.</p>
```

Line 283 - Chart container:
```typescriptreact
/* CURRENT */
<div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">

/* REPLACE WITH */
<div className="p-6 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 space-y-4">
```

Line 289 - Chart title:
```typescriptreact
/* CURRENT */
<h3 className="text-sm font-bold text-white flex items-center gap-2">

/* REPLACE WITH */
<h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
```

Line 294 - Chart subtitle:
```typescriptreact
/* CURRENT */
<p className="text-xs text-slate-400">

/* REPLACE WITH */
<p className="text-xs text-slate-600 dark:text-slate-400">
```

Line 304 - Chart bg:
```typescriptreact
/* CURRENT */
style={{
  background: 'radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)',
  backgroundSize: '20px 20px',
  backgroundColor: '#1e293b'
}}

/* REPLACE WITH */
style={{
  background: window.matchMedia("(prefers-color-scheme: light)").matches
    ? 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)'
    : 'radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)',
  backgroundSize: '20px 20px',
  backgroundColor: window.matchMedia("(prefers-color-scheme: light)").matches ? '#f1f5f9' : '#1e293b'
}}
```

Line 336 - Ordered list section:
```typescriptreact
/* CURRENT */
<h3 className="text-base font-bold text-white">
  Prioritized Modernization Sequence
</h3>
<p className="text-xs text-slate-400">

/* REPLACE WITH */
<h3 className="text-base font-bold text-slate-900 dark:text-white">
  Prioritized Modernization Sequence
</h3>
<p className="text-xs text-slate-600 dark:text-slate-400">
```

Line 346 - Plan item cards:
```typescriptreact
/* CURRENT */
<div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group">

/* REPLACE WITH */
<div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group">
```

Line 353 - Step number:
```typescriptreact
/* CURRENT */
<div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-extrabold text-sm text-cyan-400 shrink-0 group-hover:border-cyan-500/50 group-hover:scale-105 transition-all">

/* REPLACE WITH */
<div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-950 border border-slate-400 dark:border-slate-800 flex items-center justify-center font-mono font-extrabold text-sm text-blue-600 dark:text-cyan-400 shrink-0 group-hover:border-blue-400 dark:group-hover:border-cyan-500/50 group-hover:scale-105 transition-all">
```

Line 362 - Module name link:
```typescriptreact
/* CURRENT */
<span className="font-mono text-base font-bold text-white group-hover:text-cyan-400 transition-colors">

/* REPLACE WITH */
<span className="font-mono text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
```

Line 367 - Priority badge:
```typescriptreact
/* CURRENT */
<span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">

/* REPLACE WITH */
<span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
```

Line 371 - Description:
```typescriptreact
/* CURRENT */
<p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">

/* REPLACE WITH */
<p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed max-w-2xl">
```

Line 375 - Prerequisites label:
```typescriptreact
/* CURRENT */
<span className="text-slate-500 font-medium">Prerequisites:</span>

/* REPLACE WITH */
<span className="text-slate-600 dark:text-slate-500 font-medium">Prerequisites:</span>
```

Line 380 - Prerequisite badge:
```typescriptreact
/* CURRENT */
<span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">

/* REPLACE WITH */
<span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-950 text-blue-700 dark:text-cyan-300 border border-slate-400 dark:border-slate-800">
```

Line 391 - Border between sections:
```typescriptreact
/* CURRENT */
<div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/60 shrink-0">

/* REPLACE WITH */
<div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-300 dark:border-slate-800/60 shrink-0">
```

Line 395 - Metrics text:
```typescriptreact
/* CURRENT */
<span className="text-slate-500 block text-[10px] uppercase">Effort</span>
<span className="font-bold text-white">{item.effortDays}d</span>

/* REPLACE WITH */
<span className="text-slate-600 dark:text-slate-500 block text-[10px] uppercase">Effort</span>
<span className="font-bold text-slate-900 dark:text-white">{item.effortDays}d</span>
```

**Files to Modify:** `app/planner/page.tsx`  
**Verification:** Run `npm run dev`, navigate to `/planner`, toggle light theme and verify all text readable

---

### 5. **app/graph/page.tsx** - Dependency Graph Page
**Issue:** Dark backgrounds and text throughout header, controls, and panels

**Key Replacements:**

Line 103 - Header section:
```typescriptreact
/* CURRENT */
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">

/* REPLACE WITH */
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-300 dark:border-slate-800">
```

Line 107 - Title:
```typescriptreact
/* CURRENT */
<h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">

/* REPLACE WITH */
<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
```

Line 113 - Subtitle:
```typescriptreact
/* CURRENT */
<p className="text-xs text-slate-400 mt-1">

/* REPLACE WITH */
<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
```

Line 127 - Filter pills:
```typescriptreact
/* CURRENT */
<div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
...
className={`px-3 py-1 rounded-lg uppercase text-[10px] font-semibold transition-colors ${
  riskFilter === r
    ? "bg-slate-800 text-cyan-300 border border-slate-700"
    : "text-slate-400 hover:text-white"
}`}

/* REPLACE WITH */
<div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-900 border border-slate-400 dark:border-slate-800 rounded-xl text-xs">
...
className={`px-3 py-1 rounded-lg uppercase text-[10px] font-semibold transition-colors ${
  riskFilter === r
    ? "bg-slate-300 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-500 dark:border-slate-700"
    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
}`}
```

Line 135 - Reset button:
```typescriptreact
/* CURRENT */
<button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700">

/* REPLACE WITH */
<button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-400 dark:border-slate-700">
```

Line 149 - Legend bar:
```typescriptreact
/* CURRENT */
<div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">

/* REPLACE WITH */
<div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-400 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
```

Line 154 - Legend title:
```typescriptreact
/* CURRENT */
<span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">
  Legend:
</span>

/* REPLACE WITH */
<span className="text-slate-600 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider">
  Legend:
</span>
```

Line 170 - Canvas background (reactive):
```typescriptreact
/* CURRENT */
style={{
  background: 'radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)',
  backgroundSize: '20px 20px',
  backgroundColor: '#1e293b'
}}

/* REPLACE WITH */
style={{
  background: window.matchMedia("(prefers-color-scheme: light)").matches
    ? 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)'
    : 'radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)',
  backgroundSize: '20px 20px',
  backgroundColor: window.matchMedia("(prefers-color-scheme: light)").matches ? '#f1f5f9' : '#1e293b'
}}
```

Line 186 - Loading text:
```typescriptreact
/* CURRENT */
<div className="h-full flex items-center justify-center text-slate-400 gap-2">

/* REPLACE WITH */
<div className="h-full flex items-center justify-center text-slate-600 dark:text-slate-400 gap-2">
```

Line 207 - Blast Radius panel:
```typescriptreact
/* CURRENT */
<div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-rose-900/40 p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

/* REPLACE WITH */
<div className="lg:col-span-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-rose-300 dark:border-rose-900/40 p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
```

Line 215 - Panel title:
```typescriptreact
/* CURRENT */
<h3 className="text-base font-bold text-white leading-tight">

/* REPLACE WITH */
<h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
```

Line 218 - Subtitle:
```typescriptreact
/* CURRENT */
<p className="text-xs font-mono text-rose-300 mt-0.5">

/* REPLACE WITH */
<p className="text-xs font-mono text-rose-700 dark:text-rose-300 mt-0.5">
```

Line 230 - Impact score box:
```typescriptreact
/* CURRENT */
<div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
...
<span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">

/* REPLACE WITH */
<div className="p-4 rounded-xl bg-rose-100/30 dark:bg-rose-950/30 border border-rose-400 dark:border-rose-500/30 flex items-center justify-between">
...
<span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 tracking-wider">
```

Line 243 - Affected modules count:
```typescriptreact
/* CURRENT */
<div className="text-right font-mono text-xs text-slate-300">
  <span className="block font-bold text-rose-300">

/* REPLACE WITH */
<div className="text-right font-mono text-xs text-slate-700 dark:text-slate-300">
  <span className="block font-bold text-rose-700 dark:text-rose-300">
```

Line 254 - Target module section:
```typescriptreact
/* CURRENT */
<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
  Target Module
</span>
...
<div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">

/* REPLACE WITH */
<span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
  Target Module
</span>
...
<div className="p-3.5 rounded-xl bg-slate-200 dark:bg-slate-950 border border-slate-400 dark:border-slate-800 flex items-center justify-between">
```

Line 260 - Module name in panel:
```typescriptreact
/* CURRENT */
<span className="font-mono text-xs font-bold text-white">

/* REPLACE WITH */
<span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
```

Line 263 - Module path:
```typescriptreact
/* CURRENT */
<p className="text-[10px] font-mono text-slate-500">

/* REPLACE WITH */
<p className="text-[10px] font-mono text-slate-600 dark:text-slate-500">
```

Line 273 - Affected modules title:
```typescriptreact
/* CURRENT */
<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
  Downstream Cascade

/* REPLACE WITH */
<span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
  Downstream Cascade
```

Line 276 - Cascade count:
```typescriptreact
/* CURRENT */
<span className="text-[10px] text-slate-500 font-mono">

/* REPLACE WITH */
<span className="text-[10px] text-slate-600 dark:text-slate-500 font-mono">
```

Line 283 - Affected module list items:
```typescriptreact
/* CURRENT */
<div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 transition-colors flex items-center justify-between group text-xs">
...
<span className="font-mono text-slate-200 group-hover:text-cyan-400 transition-colors truncate">

/* REPLACE WITH */
<div className="p-2.5 rounded-lg bg-slate-200/60 dark:bg-slate-950/60 border border-slate-400 dark:border-slate-800/80 hover:border-slate-500 dark:hover:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-950 transition-colors flex items-center justify-between group text-xs">
...
<span className="font-mono text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-cyan-400 transition-colors truncate">
```

Line 295 - LOC count:
```typescriptreact
/* CURRENT */
<span className="text-[10px] font-mono text-slate-500">

/* REPLACE WITH */
<span className="text-[10px] font-mono text-slate-600 dark:text-slate-500">
```

**Files to Modify:** `app/graph/page.tsx`  
**Verification:** Run app, navigate to `/graph`, toggle light theme, verify all text readable and no invisible elements

---

### 6. **components/layout/AppLayout.tsx** - Main Layout
**Issue:** Hardcoded dark text/background colors

**Changes Required:**

Line 12 - Main wrapper:
```typescriptreact
/* CURRENT */
<div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300">

/* REPLACE WITH */
<div className="flex min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-500 dark:selection:bg-cyan-500 selection:text-white dark:selection:text-slate-950 transition-colors duration-300">
```

**Files to Modify:** `components/layout/AppLayout.tsx`  
**Verification:** Verify app layout looks correct in both light and dark themes

---

### 7. **components/layout/Sidebar.tsx** - Sidebar Navigation
**Issue:** Multiple dark background/text combinations

**Changes Required:**

Line 50 - Main wrapper:
```typescriptreact
/* CURRENT */
<aside className="w-64 border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">

/* REPLACE WITH */
<aside className="w-64 border-r border-slate-300 dark:border-slate-800/80 bg-white dark:bg-slate-950/95 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
```

Line 57 - Brand link:
```typescriptreact
/* CURRENT */
<Link href="/" className="flex items-center gap-3 px-2 group">
  <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
  ...
  <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">

/* REPLACE WITH */
<Link href="/" className="flex items-center gap-3 px-2 group">
  <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
  ...
  <span className="font-bold text-base tracking-tight text-white dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
```

Line 68 - Brand label:
```typescriptreact
/* CURRENT */
<p className="text-[11px] text-slate-400 font-medium">Legacy Modernization</p>

/* REPLACE WITH */
<p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Legacy Modernization</p>
```

Line 75 - Nav section title:
```typescriptreact
/* CURRENT */
<span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">

/* REPLACE WITH */
<span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500">
```

Line 81 - Nav link inactive state:
```typescriptreact
/* CURRENT */
className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
  isActive
    ? "bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold"
    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
}`}

/* REPLACE WITH */
className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
  isActive
    ? "bg-blue-200 dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-blue-400 dark:border-slate-700/80 font-semibold"
    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900"
}`}
```

Line 88 - Icon color:
```typescriptreact
/* CURRENT */
<Icon className={`w-4 h-4 transition-colors ${
  isActive
    ? "text-cyan-400"
    : "text-slate-400 group-hover:text-slate-200"
}`}

/* REPLACE WITH */
<Icon className={`w-4 h-4 transition-colors ${
  isActive
    ? "text-blue-600 dark:text-cyan-400"
    : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
}`}
```

Line 95 - Badge (active highlight):
```typescriptreact
/* CURRENT */
<span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
  item.highlight
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
    : "bg-slate-900 text-slate-400 border border-slate-800"
}`}

/* REPLACE WITH */
<span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
  item.highlight
    ? "bg-emerald-200 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-400 dark:border-emerald-500/20 font-bold"
    : "bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-400 dark:border-slate-800"
}`}
```

Line 108 - Quick modules title:
```typescriptreact
/* CURRENT */
<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">

/* REPLACE WITH */
<span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500">
```

Line 111 - Module count:
```typescriptreact
/* CURRENT */
<span className="text-[10px] text-slate-500 font-mono">12 Total</span>

/* REPLACE WITH */
<span className="text-[10px] text-slate-600 dark:text-slate-500 font-mono">12 Total</span>
```

Line 118 - Module link inactive:
```typescriptreact
/* CURRENT */
className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-colors group ${
  isModuleActive
    ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
}`}

/* REPLACE WITH */
className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-colors group ${
  isModuleActive
    ? "bg-blue-200 dark:bg-cyan-950/40 text-blue-700 dark:text-cyan-300 border border-blue-400 dark:border-cyan-500/30"
    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900/60"
}`}
```

Line 126 - Module icon:
```typescriptreact
/* CURRENT */
<Code2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />

/* REPLACE WITH */
<Code2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 shrink-0" />
```

Line 144 - Footer card:
```typescriptreact
/* CURRENT */
<div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        Environment
      </span>

/* REPLACE WITH */
<div className="p-4 border-t border-slate-300 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-950/80">
  <div className="p-3 rounded-xl bg-slate-200 dark:bg-slate-900/80 border border-slate-400 dark:border-slate-800 text-xs">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
        Environment
      </span>
```

Line 154 - Footer text:
```typescriptreact
/* CURRENT */
<p className="text-[11px] text-slate-300 font-mono truncate">

/* REPLACE WITH */
<p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono truncate">
```

Line 156 - Border in footer:
```typescriptreact
/* CURRENT */
<div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">

/* REPLACE WITH */
<div className="mt-2 pt-2 border-t border-slate-400 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
```

Line 158 - Config link:
```typescriptreact
/* CURRENT */
<span className="text-cyan-400 hover:underline cursor-pointer">Config</span>

/* REPLACE WITH */
<span className="text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer">Config</span>
```

**Files to Modify:** `components/layout/Sidebar.tsx`  
**Verification:** Toggle between light/dark theme and verify sidebar is readable in both

---

### 8. **components/layout/TopNav.tsx** - Top Navigation
**Issue:** Dark backgrounds and text colors

**Changes Required:**

Line 33 - Header wrapper:
```typescriptreact
/* CURRENT */
<header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">

/* REPLACE WITH */
<header className="h-16 border-b border-slate-300 dark:border-slate-800/80 bg-white dark:bg-slate-950/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
```

Line 41 - Search input:
```typescriptreact
/* CURRENT */
<Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
<input
  type="text"
  ...
  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"

/* REPLACE WITH */
<Search className="w-4 h-4 text-slate-500 dark:text-slate-500 absolute left-3.5 top-2.5" />
<input
  type="text"
  ...
  className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-900 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500/80 transition-colors"
```

Line 51 - Divider:
```typescriptreact
/* CURRENT */
<div className="h-4 w-px bg-slate-800 dark:bg-slate-800 light:bg-slate-300" />

/* REPLACE WITH */
<div className="h-4 w-px bg-slate-300 dark:bg-slate-800" />
```

**Files to Modify:** `components/layout/TopNav.tsx`  
**Verification:** Verify top nav is readable and functional in both themes

---

### 9. **components/ui/AuthCard.tsx** - Login/Sign-up Form
**Issue:** Some form elements may have light-mode contrast issues

**Key areas already have `dark:` prefixes** but verify these don't have hardcoded colors:
- Line 142-150: Error message styling – already has proper light/dark handling
- Line 159: Name input – already properly styled
- Line 194: Email input – already properly styled
- Form labels and inputs are properly themed

**Files to Modify:** `components/ui/AuthCard.tsx`  
**Status:** This file is mostly correct, minimal changes needed

---

### 10. **components/ui/ModuleCard.tsx** - Module Display Card
**Issue:** Dark background and text colors

**Changes Required:**

Line 18-20 - Card wrapper:
```typescriptreact
/* CURRENT */
<div className={`group relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 shadow-lg hover:shadow-cyan-950/20 flex flex-col justify-between ${className}`}>

/* REPLACE WITH */
<div className={`group relative p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-900/90 transition-all duration-200 shadow-lg hover:shadow-blue-200 dark:hover:shadow-cyan-950/20 flex flex-col justify-between ${className}`}>
```

Line 25 - Module name:
```typescriptreact
/* CURRENT */
<span className="font-mono text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate">

/* REPLACE WITH */
<span className="font-mono text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate">
```

Line 27 - Module path:
```typescriptreact
/* CURRENT */
<p className="text-xs font-mono text-slate-400 truncate mt-0.5">{module.path}</p>

/* REPLACE WITH */
<p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate mt-0.5">{module.path}</p>
```

Line 32 - Summary text:
```typescriptreact
/* CURRENT */
<p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">

/* REPLACE WITH */
<p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
```

Line 37 - Border:
```typescriptreact
/* CURRENT */
<div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/60 text-xs mb-4">

/* REPLACE WITH */
<div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-300 dark:border-slate-800/60 text-xs mb-4">
```

Line 40 - Metrics label:
```typescriptreact
/* CURRENT */
<span className="text-slate-500 block text-[10px] uppercase">Lines</span>
<span className="font-mono font-semibold text-slate-200">{module.loc} LOC</span>

/* REPLACE WITH */
<span className="text-slate-600 dark:text-slate-500 block text-[10px] uppercase">Lines</span>
<span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{module.loc} LOC</span>
```

Line 55 - Action link:
```typescriptreact
/* CURRENT */
<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform">

/* REPLACE WITH */
<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform">
```

**Files to Modify:** `components/ui/ModuleCard.tsx`  
**Verification:** Run app, view module cards in light theme and verify all text is readable

---

### 11. **components/ui/RiskBadge.tsx** - Risk Badge Component
**Issue:** May need light mode text color overrides

**Current badge has semantic colors (emerald, rose, amber, slate) with context-based backgrounds**. The dark foreground text (`text-emerald-200`, `text-rose-200`, etc.) needs light mode safe versions.

**Changes Required:**

Line 32 - Badge styling (in getRiskBadgeClasses utility function, which we need to check):

This badge uses dynamic class resolution via `getRiskBadgeClasses()` utility. We need to check `lib/utils.ts` for this function and ensure it includes light mode.

**Note:** Cannot fully verify without seeing the utility function. Recommend checking `lib/utils.ts` and updating badge classes to include light mode variants like:
```typescriptreact
/* Example for critical badge */
/* CURRENT */
"bg-rose-950/80 border-rose-500/30 text-rose-200"

/* REPLACE WITH */
"bg-rose-100 dark:bg-rose-950/80 border-rose-400 dark:border-rose-500/30 text-rose-800 dark:text-rose-200"
```

**Files to Modify:** `components/ui/RiskBadge.tsx` and `lib/utils.ts`  
**Verification:** View risk badges in light theme and confirm readable

---

### 12. **app/login/page.tsx** - Login Page
**Issue:** Dark overlays and particle colors; floating code particles styled for dark mode

**Changes Required:**

Line 46 - Main wrapper:
```typescriptreact
/* CURRENT */
<div className="min-h-screen w-full overflow-hidden relative bg-slate-950 dark:bg-slate-950">

/* REPLACE WITH */
<div className="min-h-screen w-full overflow-hidden relative bg-white dark:bg-slate-950">
```

Line 52 - Left section gradient:
```typescriptreact
/* CURRENT */
<div className="relative w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-blue-50 light:to-indigo-50 overflow-hidden">

/* REPLACE WITH */
<div className="relative w-1/2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
```

Line 58 - Grid pattern opacity:
```typescriptreact
/* CURRENT */
<div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>

/* REPLACE WITH */
<div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-10"></div>
```

Line 64 - Code particles:
```typescriptreact
/* CURRENT */
<div className="absolute text-3xl text-blue-500/30 dark:text-blue-400/20 animate-float-particle">

/* REPLACE WITH */
<div className="absolute text-3xl text-blue-300/40 dark:text-blue-400/20 animate-float-particle">
```

Line 91 - Right half form container:
```typescriptreact
/* CURRENT */
<div className="w-1/2 flex items-center justify-center bg-slate-50 dark:bg-slate-950 light:bg-white overflow-y-auto">

/* REPLACE WITH */
<div className="w-1/2 flex items-center justify-center bg-white dark:bg-slate-950 overflow-y-auto">
```

Line 119 - Mobile top section:
```typescriptreact
/* CURRENT */
<div className="relative h-[220px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-blue-50 light:to-indigo-50 overflow-hidden">

/* REPLACE WITH */
<div className="relative h-[220px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
```

Line 127 - Particle opacity:
```typescriptreact
/* CURRENT */
<div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>

/* REPLACE WITH */
<div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-10"></div>
```

Line 133 - Mobile particles:
```typescriptreact
/* CURRENT */
<div className="absolute text-2xl text-blue-500/30 dark:text-blue-400/20 animate-float-particle">

/* REPLACE WITH */
<div className="absolute text-2xl text-blue-300/40 dark:text-blue-400/20 animate-float-particle">
```

Line 155 - Mobile bottom section:
```typescriptreact
/* CURRENT */
<div className="flex-1 bg-slate-50 dark:bg-slate-950 light:bg-white overflow-y-auto">

/* REPLACE WITH */
<div className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto">
```

Line 180 - CSS grid pattern styling in style tag:
```css
/* CURRENT */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}

@media (prefers-color-scheme: light) {
  .bg-grid-pattern {
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
  }
}

/* REPLACE WITH */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
  background-size: 50px 50px;
}

html.dark .bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
}
```

**Files to Modify:** `app/login/page.tsx`  
**Verification:** Navigate to login page, toggle light theme and verify readable

---

## Implementation Order

1. **app/globals.css** – Foundation CSS fix (required for all components)
2. **components/ui/ToastContext.tsx** – Fix toast notifications (addresses user complaint)
3. **components/layout/AppLayout.tsx** – Main layout wrapper
4. **components/layout/Sidebar.tsx** – Left navigation
5. **components/layout/TopNav.tsx** – Top navigation bar
6. **app/page.tsx** – Dashboard
7. **app/planner/page.tsx** – Planner page
8. **app/graph/page.tsx** – Graph page
9. **app/login/page.tsx** – Login page
10. **components/ui/ModuleCard.tsx** – Module cards
11. **components/ui/RiskBadge.tsx** + `lib/utils.ts` – Badge components
12. **components/ui/AuthCard.tsx** – Already mostly correct; light review only

---

## Verification Checklist

- [ ] All text colors are readable (sufficient contrast) in light mode
- [ ] All background colors are visible in light mode (not white-on-white)
- [ ] All borders are visible in light mode (not invisible)
- [ ] Toast/notification components render correctly in light mode
- [ ] Dashboard page displays correctly in light theme
- [ ] Planner page displays correctly in light theme
- [ ] Graph page displays correctly in light theme
- [ ] Login page displays correctly in light theme
- [ ] All UI components (cards, badges, buttons) are visible in light theme
- [ ] Theme toggle works correctly and persists
- [ ] No console errors related to styling
- [ ] Testing on multiple browsers (Chrome, Firefox, Safari) if possible

---

## Notes

- All changes follow the existing pattern: light mode uses lighter variants (`slate-100`, `slate-200`, etc.), dark mode uses `dark:` prefixes with original dark colors
- Tailwind's `dark:` prefix requires the `html.dark` class to be set; the theme toggle component already does this
- Light theme colors chosen for contrast compliance (WCAG AA minimum)
- All hardcoded `text-white` should become `text-slate-900 dark:text-white`
- All hardcoded `bg-slate-900` should become `bg-slate-100 dark:bg-slate-900`
- The reactive chart backgrounds require checking if light mode is active since they're set via inline styles

