"""
ReCore AI FastAPI Backend Application.
Provides AST Codebase Analysis, LLM Business Rule Extraction,
Golden Master Parity Testing, and Modernization Planning.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from .routers import modules, project, analysis, upload

app = FastAPI(
    title="ReCore AI API",
    description="Autonomous Enterprise Legacy-to-Modern Code Migration Engine",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (http://localhost:3000) and dev environments
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under both /api and /api/v1 for total compatibility
app.include_router(modules.router, prefix="/api")
app.include_router(modules.router, prefix="/api/v1")

app.include_router(project.router, prefix="/api")
app.include_router(project.router, prefix="/api/v1")

app.include_router(analysis.router, prefix="/api")
app.include_router(analysis.router, prefix="/api/v1")

app.include_router(upload.router, prefix="/api")
app.include_router(upload.router, prefix="/api/v1")

@app.get("/api/health", tags=["system"])
@app.get("/api/v1/health", tags=["system"])
@app.get("/health", tags=["system"])
def health_check():
    """Health check endpoint with demo mode status."""
    import os
    is_demo = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    has_keys = bool(os.getenv("GEMINI_API_KEY") or os.getenv("GROQ_API_KEY"))
    demo_active = is_demo or not has_keys
    
    return {
        "status": "healthy",
        "service": "recore-ai-backend",
        "demoMode": demo_active,
        "cacheServing": demo_active,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
