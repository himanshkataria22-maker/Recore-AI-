# Implementation Plan: Remove Hardcoded Mock Data & Fix Button Logic

**Task**: Remove hardcoded mock data from the Validation & Proof page and fix approval/traffic-routing button logic to correctly enforce state constraints.

**Root Cause Analysis**:
The `/validate/[id]` page contains hardcoded strings and mock data that bypass real API data, hardcoded button disabled logic that only checks `isSubmitting`/`isTogglingRoute` without validating business preconditions, and missing UI feedback (tooltips, styling) for disabled states. The page displays mock content like "100% mathematical parity", "Zero functional regression", and "85.7% complexity reduction" even when no real data is loaded or tests have failed.

---

## Implementation Steps

### 1. Fix Approve Button Logic (Line ~709)
   
   **What to do**: Replace the hardcoded disabled logic on the "Approve Modernized Module" button with the calculated `canApprove` and `approveDisabledReason` constants that already exist in the code. Apply conditional styling (gray/opacity-50 when disabled, green when enabled) and add a tooltip title to show the disabled reason.
   
   **Files to modify**:
   - `frontend/app/validate/[id]/page.tsx`
   
   **Exact changes**:
   - Line ~709: Change the Approve button from `disabled={isSubmitting}` to `disabled={isSubmitting || !canApprove}`
   - Add `title={approveDisabledReason || "Approve this modernized module for production"}` to the button element
   - Replace button className with conditional styling:
     ```
     className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
       !canApprove || isSubmitting
         ? "bg-slate-400 text-slate-700 opacity-50 cursor-not-allowed"
         : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95"
     }`}
     ```
   
   **Verify**: 
   - Open `/validate/billing` (approved case from mock data). The Approve button should be disabled (gray) with tooltip "Already approved".
   - Open `/validate/discounts` (pending case with all tests passed). The Approve button should be enabled (green) and clickable.
   - Open `/validate/discounts`, manually set `testsPassed` to 11 in mock data. Reload. The Approve button should be disabled with tooltip showing failed tests count.

---

### 2. Fix Modernized Traffic Route Button Logic (Line ~476)
   
   **What to do**: Add a `canToggleRoute` constant (disabled when `testsTotal === 0`, `testsPassed < testsTotal`, `approvalStatus !== 'approved'`, or `securityIssuesFixed === 0`). Apply to the "Modernized (v1)" button's `disabled` prop and add a tooltip explaining why it's disabled.
   
   **Files to modify**:
   - `frontend/app/validate/[id]/page.tsx`
   
   **Exact changes**:
   - After the existing `canApprove` and `approveDisabledReason` constants (around line 340), add:
     ```typescript
     // Determine if traffic route toggle to modernized should be enabled
     const canToggleRoute =
       validation &&
       validation.testsTotal > 0 &&
       validation.testsPassed === validation.testsTotal &&
       validation.approvalStatus === "approved" &&
       validation.securityIssuesFixed > 0;
     
     const routeDisabledReason = !validation
       ? "No validation run"
       : validation.testsTotal === 0
       ? "No tests run"
       : validation.testsPassed < validation.testsTotal
       ? `${validation.testsTotal - validation.testsPassed} test(s) failed`
       : validation.approvalStatus !== "approved"
       ? "Module not approved"
       : validation.securityIssuesFixed === 0
       ? "Security vulnerabilities not fixed"
       : null;
     ```
   - Line ~476: Update the "Modernized (v1)" button:
     - Change `disabled={isTogglingRoute}` to `disabled={isTogglingRoute || !canToggleRoute}`
     - Add `title={canToggleRoute ? "Switch to modernized version" : routeDisabledReason}`
     - Update className to apply conditional styling when disabled:
       ```
       className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
         route?.target === "modernized"
           ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
           : !canToggleRoute || isTogglingRoute
           ? "text-slate-400 bg-slate-200 dark:bg-slate-800 cursor-not-allowed opacity-50"
           : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900"
       }`}
       ```
   
   **Verify**:
   - Open `/validate/billing` (approved, all tests pass, security fixed). The Modernized button should be enabled and green.
   - Open `/validate/discounts` (pending, not approved). The Modernized button should be disabled (gray) with tooltip "Module not approved".
   - Manually set `securityIssuesFixed` to 0 in mock data. The Modernized button should be disabled with tooltip "Security vulnerabilities not fixed".

---

### 3. Audit & Replace Hardcoded Strings in Approval Panel
   
   **What to do**: Replace all hardcoded display strings in the approval panel (lines ~670–710) with data from the `validation` object. Each field must pull from the API data or show "—" if not available. Specifically check: approver name, approval date, approval notes, test counts, security stats, module metadata.
   
   **Files to modify**:
   - `frontend/app/validate/[id]/page.tsx`
   
   **Exact changes**:
   - Line ~703 (approved case): Replace the static text `Module Approved by {validation.approvedBy}` with:
     ```typescript
     Module Approved by {validation.approvedBy || "—"}
     ```
   - Line ~704: Replace notes display with:
     ```typescript
     {validation.approvalNotes || "No notes provided"}
     ```
   - Line ~706: Replace timestamp with:
     ```typescript
     Signed at: {validation.approvedAt ? new Date(validation.approvedAt).toLocaleString() : "—"} (Audit Hash Recorded)
     ```
   - Ensure all displayed values (`validation.approvedBy`, `validation.approvalNotes`, `validation.approvedAt`) come directly from the API response object; never use hardcoded fallbacks like "sarah.chen@recore.ai", "CISO team", "3/10/2026".
   
   **Verify**:
   - Open `/validate/billing` (approved case). Confirm the approval panel shows the correct approver (`alex.rivera@enterprise.corp`), notes ("Security review completed..."), and timestamp from the mock data.
   - Change `validation.approvedBy` to `null` in mock data. Reload. The page should display "—" instead of a hardcoded name.

---

### 4. Verify DiffViewer Data Flow (Lines ~654–671)
   
   **What to do**: Confirm that the DiffViewer component at line 654 receives real diff data from `validation.diff.before` and `validation.diff.after`, not hardcoded code samples. Check that these fields are populated correctly from the API and that the component never falls back to mock/hardcoded code.
   
   **Files to modify**:
   - `frontend/app/validate/[id]/page.tsx`
   
   **Exact changes**:
   - Line 654: Verify the DiffViewer call passes the correct props:
     ```typescript
     <DiffViewer
       before={validation.diff.before}
       after={validation.diff.after}
       beforeLoc={validation.diff.beforeLoc}
       afterLoc={validation.diff.afterLoc}
       complexityReduction={validation.diff.complexityReduction}
     />
     ```
   - No changes needed here; this is already correct. Verify that `validation.diff.before` and `validation.diff.after` contain the real code samples from the API (e.g., the billing.py legacy and modernized versions), not hardcoded FastAPI/HTTPException examples.
   - If DiffViewer shows "No changes made" when before and after are identical, this is correct behavior.
   
   **Verify**:
   - Open `/validate/billing` and compare the displayed code in the DiffViewer against the `validation.diff.before` and `validation.diff.after` strings in the mock data. They should match exactly.
   - Confirm that the DiffViewer title remains "Legacy Baseline (Python 2.7 / 3.6)" and "Modernized Synthesized Target (FastAPI / Pydantic v2)" (these are descriptive, not hardcoded data from the module).

---

### 5. Audit Hero Banner for Hardcoded Strings (Lines ~397–407)
   
   **What to do**: Replace hardcoded hero banner text that contains mock claims like "Zero functional regression detected" and "100% mathematical parity" with real data from the validation object. The banner should always reflect actual test results and never display marketing copy when data is missing or tests have failed.
   
   **Files to modify**:
   - `frontend/app/validate/[id]/page.tsx`
   
   **Exact changes**:
   - Line ~401–403: Replace the hardcoded description:
     ```typescript
     // BEFORE (hardcoded)
     Zero functional regression detected. All domain edge cases, pricing proration formulas, and loyalty rules match the legacy baseline with 100% mathematical parity.
     
     // AFTER (data-driven)
     {validation.testsPassed === validation.testsTotal
       ? "All domain edge cases, pricing proration formulas, and loyalty rules match the legacy baseline with 100% behavioral parity."
       : `${validation.testsTotal - validation.testsPassed} test(s) failed. Module requires additional fixes before approval.`}
     ```
   - Line ~412: Replace the Security Vulnerabilities display with:
     ```typescript
     {validation.securityIssuesFixed} Issues Remediated
     ```
     (This is already correct; verify it sources from `validation.securityIssuesFixed`, not a hardcoded "1" or "3".)
   - Line ~423: Replace the Complexity Reduction display with:
     ```typescript
     {validation.diff.complexityReduction || "—"}
     ```
     (This is already correct; verify it sources from `validation.diff.complexityReduction`.)
   
   **Verify**:
   - Open `/validate/billing` (all tests pass). The banner should say "All domain edge cases ... match the legacy baseline with 100% behavioral parity."
   - Modify mock data: set `testsPassed` to 46 (one less than `testsTotal: 47`). Reload. The banner should say "1 test(s) failed. Module requires additional fixes before approval."
   - Confirm the security and complexity badges always display the real numbers from the data, never hardcoded values.

---

### 6. Grep & Remove All Hardcoded Mock Identifiers (Repo-wide)
   
   **What to do**: Search the entire codebase for hardcoded strings and values mentioned in the user's original issue (sarah.chen, CISO, 3/10/2026, "12 Modules", "12 Total", "28", "85.7", "mathematical parity", "Zero functional regression", "FastAPI", "HTTPException") and ensure none are used as fallback display values. Some of these strings (like "FastAPI" in DiffViewer titles, "mathematical parity" in toast messages) are acceptable as descriptive labels, not data; hardcoded *data values* from the module (like "85.7%" for a specific module's reduction) must come from the API.
   
   **Files to modify**:
   - Inspect all `*.tsx` and `*.ts` files in `frontend/app` and `frontend/components`
   
   **Exact changes**:
   - Review grep results:
     - `frontend/app/validate/[id]/page.tsx` line 156: "100% mathematical parity" in toast success message — KEEP (this is user-facing feedback, not hardcoded module data).
     - `frontend/app/validate/[id]/page.tsx` line 401: "100% mathematical parity" in hero banner description — CHANGE to data-driven (see step 5).
     - `frontend/components/ui/DiffViewer.tsx` line 23: "FastAPI / Pydantic v2" title — KEEP (this is a descriptive label for the diff viewer, not module-specific data).
     - `frontend/components/ui/SpeechBubble.tsx` line 16: "Zero functional regression guaranteed ⚡" — KEEP (this is UI copy, not data).
     - No hardcoded module metrics (like "85.7%" for billing.py or "28 modules") should appear in the page; all must come from validation object or mock data.
   - Verify that `/validate/[id]` page never hardcodes approval metadata (approver name, approval date, test counts specific to one run).
   
   **Verify**:
   - Grep the entire `frontend` folder for "sarah.chen", "CISO", "3/10/2026", "Module Approved by sarah", "12 Total", "Complexity 28 -> 4", "85.7%" used as hardcoded display text. Confirm no results (or only in comments/documentation).
   - Open the page in the browser and confirm no hardcoded UUIDs, emails, or metric values appear that are not sourced from the API mock data.

---

### 7. Verify Build & Test (End-to-End)
   
   **What to do**: Build the frontend and run any available tests to confirm no regressions. Manually test the page with the mock data to ensure all buttons behave correctly, all text is data-driven, and no hardcoded fallback strings appear.
   
   **Files to modify**: None (verification only).
   
   **Verify**:
   - `cd frontend && npm run build` — confirm no build errors or TypeScript type issues.
   - `npm run dev` — start the dev server on `http://localhost:3000`.
   - Open `http://localhost:3000/validate/billing` (approved module, all tests pass).
     - Approve button should be disabled (gray) with tooltip "Already approved".
     - Modernized button should be enabled (green) and clickable.
     - Approval panel should show "alex.rivera@enterprise.corp", the approval notes, and a valid timestamp.
     - Hero banner should display "All domain edge cases ... 100% behavioral parity".
     - DiffViewer should show the real billing.py diff (42 → 6 LOC, 85.7% reduction).
   - Open `http://localhost:3000/validate/discounts` (pending module, all tests pass).
     - Approve button should be enabled (green) and clickable.
     - Modernized button should be disabled (gray) with tooltip "Module not approved".
     - Approval panel should show the textarea for notes.
   - Confirm no console errors, network failures, or undefined values in the DevTools.

---

## Summary of Changes

| Component | Issue | Fix | Priority |
|-----------|-------|-----|----------|
| Approve Button | Only disabled by `isSubmitting` | Add `canApprove` logic + tooltip + conditional styling | High |
| Modernized Route Button | Only disabled by `isTogglingRoute` | Add `canToggleRoute` logic + tooltip + conditional styling | High |
| Approval Panel | Hardcoded static text for approver, date, notes | Use real data from `validation.approvedBy/At/Notes` or show "—" | High |
| Hero Banner | Hardcoded "Zero functional regression" & "100% mathematical parity" | Make text conditional on actual test results | Medium |
| DiffViewer | Verify data flow (already correct) | No changes needed; confirm real code samples passed | Low |
| Repo-wide Strings | Audit for hardcoded mock identifiers | Remove hardcoded data values; keep descriptive labels | Low |
| Build & Tests | Ensure no regressions | Run `npm run build` and manual browser testing | High |

---

## Testing Checklist

- [ ] Approve button disabled when `testsTotal === 0`
- [ ] Approve button disabled when `testsPassed < testsTotal`
- [ ] Approve button disabled when `approvalStatus !== 'pending'`
- [ ] Approve button enabled and clickable when all conditions pass
- [ ] Approve button tooltip shows the correct disabled reason
- [ ] Approve button styling: gray/opacity-50 when disabled, green when enabled
- [ ] Modernized button disabled when `testsTotal === 0`
- [ ] Modernized button disabled when `testsPassed < testsTotal`
- [ ] Modernized button disabled when `approvalStatus !== 'approved'`
- [ ] Modernized button disabled when `securityIssuesFixed === 0`
- [ ] Modernized button enabled and green when target is already "modernized"
- [ ] Modernized button tooltip shows the correct disabled reason
- [ ] Approval panel shows real approver name (or "—")
- [ ] Approval panel shows real approval notes (or "No notes provided")
- [ ] Approval panel shows real approval timestamp (or "—")
- [ ] Hero banner text reflects actual test results, not hardcoded claims
- [ ] Hero banner security and complexity badges show real data
- [ ] DiffViewer displays real before/after code from the validation object
- [ ] No hardcoded mock identifiers appear in page display
- [ ] Frontend builds without TypeScript errors
- [ ] No console errors or undefined values in DevTools

