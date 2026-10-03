# ReCore AI — Enterprise Legacy-Code Modernization Platform

**ReCore AI** is an enterprise-grade developer platform designed to de-risk and automate legacy codebase modernizations (e.g. Python 2/3 legacy billing, microservices, monolithic apps). It provides AST-based dependency graphs, interactive blast-radius calculation, hidden business rule extraction, prioritized modernization scheduling, and deterministic parity test validation.

---

## ⚡ Key Features

1. **Executive Dashboard (`/`)**
   - High-level KPIs: Total Modules, Critical Risks, Modernized %, Behavior Tests Passing.
   - Interactive Risk Distribution & Security Vulnerability Breakdown charts (Recharts).
   - "Start New Analysis" modal with Drag-and-Drop ZIP / Git repo scanner and real-time step simulation.
   - Codebase module catalog with risk filtering and direct inspection links.

2. **AST Dependency Graph & Blast Radius Engine (`/graph`)**
   - Interactive React Flow DAG mapping modules, LOC node sizing, and risk-level color codes.
   - **Interactive Blast Radius:** Clicking any node highlights the exact direct and transitive downstream modules at risk in glowing red, dims unaffected nodes, and opens a telemetry panel with cumulative impact scores.

3. **Module Inspector (`/module/[id]`)**
   - **Overview Tab:** Circular SVG Risk Gauge (0–100), metadata (LOC, complexity, coverage, dependents), and pinpointed issue list with CWE tags and remediation suggestions.
   - **AST Code Inspection Tab:** Read-only syntax view with highlighted issue lines and tooltips.
   - **Business Rule Extractor Tab:** AI AST-extracted hidden domain rules (e.g., grandfathered discounts, EU VAT reverse charge) in plain English linked to code snippets with confidence badges and a one-click Markdown spec export.
   - **AI Diagnostic Insights Tab:** Explainable "Why is this risky" breakdowns and recommended target stack architectures.

4. **Modernization Execution Planner (`/planner`)**
   - Optimized DAG sequence timeline with dev-day effort estimation and projected risk drop.
   - Risk-vs-Value Priority Quadrant chart (Quick Wins vs Strategic Overhauls).
   - Direct "Modernize this module" execution triggers.

5. **Parity Validation & Proof (`/validate/[id]`)**
   - **Hero Screen:** Big *"47/47 Behavior Tests Preserved"* certification badge.
   - Interactive animated test matrix with real-time test runner simulation, assertion telemetry, and fuzzer inputs.
   - Side-by-side & Unified Code Diff Viewer (LOC and complexity reduction indicators).
   - Dual-key Human Verification & Sign-off Gate (Approve / Reject with notes and audit timestamps).
   - Instant 1-click Rollback and Downloadable Audit Proof Certificate (`.md`).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Node 22+ recommended)
- **NPM**: v9.0.0 or higher

### 2. Installation
```bash
# Navigate to project directory
cd scratch/recore-ai

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔌 Switching from Mock Data to Real FastAPI Backend

All data interactions are decoupled through a single typed API abstraction layer at `lib/api.ts`.

To switch from mock data to a live backend:

1. Create a `.env.local` file in the root directory:
```env
# Set to 'false' to route calls to your live backend
NEXT_PUBLIC_USE_MOCK=false

# Base URL for your FastAPI or REST API server
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

2. Implement the corresponding FastAPI endpoints adhering to the data contracts defined in `lib/types.ts`:
- `GET /api/v1/project/summary` &rarr; `ProjectSummary`
- `GET /api/v1/modules` &rarr; `Module[]`
- `GET /api/v1/modules/{id}` &rarr; `Module`
- `GET /api/v1/graph` &rarr; `DependencyGraphData`
- `GET /api/v1/business-rules` &rarr; `BusinessRule[]`
- `GET /api/v1/plan` &rarr; `ModernizationPlan`
- `GET /api/v1/validation/{id}` &rarr; `ValidationRun`
- `POST /api/v1/validation/{id}/approve` &rarr; `{ success: true }`
- `POST /api/v1/modules/{id}/rollback` &rarr; `{ success: true }`
- `POST /api/v1/analyze` &rarr; `{ success: true }`

---

## 🛠️ Technology Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Dark Theme
- **Graph Visualization:** `@xyflow/react` (React Flow)
- **Analytics & Charts:** `recharts`
- **Animations:** `framer-motion` & `canvas-confetti`
- **Icons:** `lucide-react`
