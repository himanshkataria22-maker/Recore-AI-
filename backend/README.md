# ReCore AI - Backend Architecture & API Engine

Autonomous Enterprise Legacy-to-Modern Python Code Migration, Golden-Master Behavior Testing, and Risk Planning Engine.

---

## Architecture Overview

```
backend/
├── sample_legacy_app/     # 12+ runnable legacy Python modules with deliberate vulnerabilities & business rules
├── analyzer/              # AST parser, Radon cyclomatic complexity, Bandit security scanner, risk scorer
├── llm/                   # Provider-agnostic LLM wrapper (Gemini/Groq), SHA256 disk cache, secret redactor
├── extractor/             # AST business rule decompiler with source line verification
├── tester/                # Golden-Master behavioral test generator & isolated subprocess test runner
├── modernizer/            # Automated code synthesizer with version control (v0/v1) & instant rollback
├── planner/               # Prioritized modernization planner (ROI ratio) & transitive blast radius calculator
├── models/                # Pydantic v2 schemas with camelCase serialization matching /lib/types.ts
├── routers/               # FastAPI REST route controllers matching frontend /lib/api.ts
├── tests/                 # Complete 20-test pytest suite
├── main.py                # FastAPI entry point with CORS enabled for http://localhost:3000
└── README.md
```

---

## Quickstart & Setup

### 1. Requirements
- Python 3.11+
- Virtualenv or system Python

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `LLM_PROVIDER` | LLM API provider (`gemini` or `groq`) | `gemini` |
| `GEMINI_API_KEY` | Google Gemini API Key | `""` |
| `GROQ_API_KEY` | Groq API Key | `""` |
| `DEMO_MODE` | If `true`, serves offline deterministic cached responses without calling external APIs | `true` |

---

## How DEMO_MODE Works
When `DEMO_MODE=true`:
1. All prompts check the persistent disk cache `/backend/cache/llm/<sha256>.json`.
2. If cache miss, high-fidelity deterministic fallback logic generates verified business rules and behavioral test suites for standard legacy modules.
3. No real network or external API dependency is required, ensuring offline presentations and automated test runners work deterministically.

---

## Golden-Master Behavioral Testing Workflow

1. **Test Matrix Generation**: Prompts LLM to analyze the AST contract of public functions and generate normal, boundary, edge case, and security test vectors.
2. **Legacy Baseline Execution**: Runs each case against the legacy module in an isolated temp sandbox with a freshly seeded SQLite database. Results are saved to `/backend/golden/<moduleId>.json`.
3. **Automated Modernization**: The Modernizer rewrites the module with parameterized SQL queries, explicit typing, docstrings, and zero security vulnerabilities while preserving function signatures.
4. **Behavioral Parity Verification**: Runs identical test cases against the modernized module in sandbox, executing deep parity comparison (float-safe).
5. **Contract Certification**: Produces a `ValidationRun` object containing diffs, loc metrics, complexity reductions, and per-test execution proof.

---

## Running the Backend Server

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger UI is available at:
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

---

## Running Tests

Run all 20 unit and integration tests:
```bash
python -m pytest -p no:pytest_ethereum backend/tests/ -v
```

---

## REST API Endpoints (Matching `/lib/api.ts`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and version check |
| `GET` | `/api/project/summary` | Project health, LOC, and risk breakdown |
| `GET` | `/api/modules` | List all discovered modules with risk scores |
| `GET` | `/api/modules/{id}` | Single module details and AST code |
| `GET` | `/api/graph` | React Flow dependency graph nodes and edges |
| `GET` | `/api/business-rules` | Extracted business rules (optional `?moduleId=...`) |
| `GET` | `/api/modules/{id}/rules` | Business rules for specific module |
| `GET` | `/api/plan` | Prioritized modernization roadmap by ROI |
| `GET` | `/api/blast-radius/{id}` | Direct and transitive downstream blast radius |
| `POST` | `/api/analyze` | Trigger fresh static analysis of codebase |
| `POST` | `/api/modules/{id}/generate-tests` | Generate behavioral test suite |
| `POST` | `/api/modules/{id}/modernize` | Modernize module and run Golden Master |
| `GET` | `/api/validation/{id}` | Latest validation run and parity proof |
| `POST` | `/api/validation/{id}/approve` | Sign-off on modernized module |
| `POST` | `/api/modules/{id}/rollback` | Rollback to v0 legacy baseline |
