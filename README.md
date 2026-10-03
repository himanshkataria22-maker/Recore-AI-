# ReCore AI — Enterprise Legacy Code Modernization Engine

**ReCore AI** is an autonomous, enterprise-grade migration and modernization platform engineered to safely refactor and de-risk mission-critical legacy codebases (e.g., Python 2/3 procedural billing, monoliths, microservices).

It combines AST static analysis, LLM-powered business rule extraction, deterministic Golden Master behavioral verification, Strangler Pattern API routing, and explainable AI diagnostics.

---

## ⚡ Key Highlights & Architecture

- **Ground-Truth Explainable AI Insights (Feature A)**: Evidence-backed diagnostics citing exact AST vulnerability IDs and source line numbers with interactive click-to-line code jumping. Discards any hallucinated citations.
- **Strangler Pattern Routing & Shadow Execution (Feature B)**: Auto-generates zero-downtime Python adapters (`/backend/adapters/<moduleId>_adapter.py`) preserving 100% contract signatures. Includes live traffic routing toggles and concurrent shadow runs comparing legacy (v0) vs modernized (v1) outputs.
- **Topological DAG Modernization Planner**: Prioritized execution sequence based on risk reduction ROI, leaf independence, and blast radius impact score. Explains *why* each step is recommended.
- **Deterministic Golden Master Behavioral Parity**: Automatic test synthesis recording baseline behaviors in SQLite sandboxes to guarantee zero logic regression before deployment.
- **Formal Modernization Audit Reports**: One-click downloadable Markdown compliance audit reports covering remediations, test proofs, approval logs, and active routing status.

---

## 🚀 Run Locally

### 1. Prerequisites
- **Python**: 3.10+ (Python 3.11 recommended)
- **Node.js**: 18.0+ (Node 20+ recommended)
- **NPM**: 9.0+

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional - defaults to deterministic DEMO_MODE)
cp .env.example .env

# Start FastAPI development server on port 8000
uvicorn main:app --reload --port 8000
```

Backend API will be running at `http://localhost:8000`.  
Swagger Interactive API Documentation: `http://localhost:8000/docs`.

---

### 3. Frontend Setup (Next.js 15 App Router)

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start Next.js development server on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 4. Environment Variables Setup

#### Backend (`/backend/.env`):
```env
# Optional LLM API Keys (If blank, ReCore AI operates seamlessly in offline DEMO_MODE)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# LLM Provider: 'gemini' or 'groq'
LLM_PROVIDER=gemini

# Set to true to enforce offline disk cache
DEMO_MODE=false
```

#### Frontend (`/frontend/.env.local`):
```env
# Set to 'false' to connect to live FastAPI backend at localhost:8000
NEXT_PUBLIC_USE_MOCK=false

# Backend API endpoint URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🧪 Running Tests & Smoke Tests

### Backend Unit Tests (Pytest)
```bash
python -c "import os, pytest; os.environ['PYTEST_DISABLE_PLUGIN_AUTOLOAD'] = '1'; pytest.main(['backend/tests'])"
```

### End-to-End API Smoke Test

#### Cross-Platform Python Runner:
```bash
python scripts/smoke_test.py
```

#### Windows PowerShell:
```powershell
.\scripts\smoke-test.ps1
```

#### Linux / macOS Bash:
```bash
bash scripts/smoke-test.sh
```

---

## 📁 Repository Structure

```
recore-ai/
├── backend/                  # FastAPI Python backend service
│   ├── adapters/             # Auto-generated Strangler Pattern adapters
│   ├── analyzer/             # AST syntax tree parser, complexity & security engine
│   ├── cache/                # Disk cache for LLM responses & AST analysis
│   ├── extractor/            # Domain rule extractor
│   ├── golden/               # Golden master recorded baseline assertions
│   ├── llm/                  # Provider-agnostic LLM client (Gemini & Groq)
│   ├── models/               # Pydantic v2 data models & schemas
│   ├── modernizer/           # Modernization synthesis & rollback engine
│   ├── planner/              # Topological DAG scheduler & blast radius calculator
│   ├── routers/              # REST API route handlers (/modules, /project, /analysis)
│   ├── sample_legacy_app/    # Sample legacy Python 2/3 enterprise app
│   ├── tester/               # Behavioral test generator & golden runner
│   ├── tests/                # Pytest unit & integration test suite
│   ├── versions/             # Version snapshots (v0_legacy vs v1_modernized)
│   ├── main.py               # FastAPI entrypoint
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Next.js 15+ React Frontend (App Router)
│   ├── app/                  # Pages: Dashboard, Graph, Module, Planner, Validate
│   ├── components/           # UI components, layout, diff viewer, test runner
│   ├── lib/                  # TypeScript types, API client, mock fallbacks
│   ├── public/               # Static assets & SVG icons
│   ├── next.config.ts        # Next.js configuration
│   ├── package.json          # Node dependencies
│   └── tsconfig.json         # TypeScript configuration
│
├── scripts/                  # Cross-platform smoke test suites (.py, .ps1, .sh)
├── .gitignore                # Root gitignore protecting secrets & build artifacts
└── README.md                 # Project documentation
```
