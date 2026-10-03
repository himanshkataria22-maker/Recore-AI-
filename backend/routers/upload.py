"""
Project Upload and Analysis Router.
Handles secure file uploads, extraction, and background analysis.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
import os
import zipfile
import shutil
import secrets
import string
from datetime import datetime
from pathlib import Path
import re

from ..analyzer.engine import CodebaseAnalyzer
from ..models.schema import Module

router = APIRouter(tags=["upload"])

# Configuration
PROJECTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "projects")
MAX_ZIP_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_FILES = 200
ALLOWED_EXTENSIONS = {".py"}
IGNORED_DIRS = {"venv", "__pycache__", ".git", "node_modules", "tests", ".pytest_cache", "dist", "build", "egg-info"}

os.makedirs(PROJECTS_DIR, exist_ok=True)

# In-memory project status store (in production, use Redis or DB)
_PROJECT_STATUS: Dict[str, Dict[str, Any]] = {}


def generate_project_id(name: str) -> str:
    """Generate a safe, unique project ID."""
    # Slugify name
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')[:20]
    # Add random suffix
    suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))
    return f"{slug}-{suffix}"


def is_safe_path(base_path: Path, target_path: Path) -> bool:
    """Check if target_path is within base_path (prevents zip-slip)."""
    try:
        resolved = target_path.resolve()
        base = base_path.resolve()
        return resolved.parts[:len(base.parts)] == base.parts
    except Exception:
        return False


def extract_zip_safely(
    zip_path: str,
    extract_to: Path,
    max_files: int = MAX_FILES
) -> tuple[int, int]:
    """
    Safely extract a zip file, filtering to only .py files and ignoring dangerous paths.
    Returns (files_extracted, files_skipped).
    """
    files_extracted = 0
    files_skipped = 0
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        members = zf.infolist()
        
        if len(members) > max_files:
            raise ValueError(f"Zip contains too many files ({len(members)} > {max_files})")
        
        for member in members:
            # Skip directories
            if member.is_dir():
                continue
                
            # Check for zip-slip (absolute paths or ..)
            if member.filename.startswith('/') or '..' in member.filename:
                files_skipped += 1
                continue
            
            # Skip ignored directories
            parts = Path(member.filename).parts
            if any(part in IGNORED_DIRS for part in parts):
                files_skipped += 1
                continue
            
            # Only extract .py files
            if not member.filename.endswith('.py'):
                files_skipped += 1
                continue
            
            # Extract to safe path
            target_path = extract_to / member.filename
            
            # Ensure parent directory exists
            target_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Verify safe path
            if not is_safe_path(extract_to, target_path):
                files_skipped += 1
                continue
            
            # Extract file
            with zf.open(member) as source, open(target_path, 'wb') as target:
                shutil.copyfileobj(source, target)
            
            files_extracted += 1
    
    return files_extracted, files_skipped


def analyze_project_background(project_id: str, source_path: str):
    """Background task to analyze a project."""
    try:
        _PROJECT_STATUS[project_id]["status"] = "analyzing"
        _PROJECT_STATUS[project_id]["progress"] = 20
        
        # Run analyzer
        analyzer = CodebaseAnalyzer(source_path)
        modules = analyzer.analyze(force_refresh=True)
        
        _PROJECT_STATUS[project_id]["progress"] = 80
        
        # Save analysis results
        project_dir = Path(source_path).parent
        analysis_file = project_dir / "analysis.json"
        
        import json
        analysis_data = {
            "projectId": project_id,
            "analyzedAt": datetime.utcnow().isoformat() + "Z",
            "totalModules": len(modules),
            "modules": [
                {
                    "id": m.id,
                    "name": m.name,
                    "path": m.path,
                    "riskScore": m.risk_score,
                    "riskLevel": m.risk_level,
                    "issuesCount": len(m.issues)
                }
                for m in modules
            ]
        }
        
        with open(analysis_file, 'w', encoding='utf-8') as f:
            json.dump(analysis_data, f, indent=2)
        
        _PROJECT_STATUS[project_id]["status"] = "done"
        _PROJECT_STATUS[project_id]["progress"] = 100
        _PROJECT_STATUS[project_id]["moduleCount"] = len(modules)
        _PROJECT_STATUS[project_id]["completedAt"] = datetime.utcnow().isoformat() + "Z"
        
    except Exception as e:
        _PROJECT_STATUS[project_id]["status"] = "failed"
        _PROJECT_STATUS[project_id]["error"] = str(e)
        _PROJECT_STATUS[project_id]["progress"] = 0


@router.post("/projects/upload")
async def upload_project(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a .zip file containing a Python project for analysis.
    
    Security measures:
    - Max 10 MB zip file size
    - Max 200 files extracted
    - Only .py files extracted
    - Ignores venv, __pycache__, .git, node_modules, tests, data blobs
    - Prevents zip-slip attacks (no absolute paths or ..)
    - No code execution during upload (AST/static analysis only)
    
    Returns:
    - projectId: unique identifier for tracking
    - name: project name
    - status: "queued" or "analyzing"
    - filesExtracted: number of .py files extracted
    """
    
    # Validate file type
    if not file.filename or not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")
    
    # Read file to check size
    content = await file.read()
    if len(content) > MAX_ZIP_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Zip file too large ({len(content)} bytes > {MAX_ZIP_SIZE} bytes = 10 MB)"
        )
    
    # Generate project ID
    project_name = Path(file.filename).stem
    project_id = generate_project_id(project_name)
    
    # Create project directories
    project_dir = Path(PROJECTS_DIR) / project_id
    src_dir = project_dir / "src"
    project_dir.mkdir(parents=True, exist_ok=True)
    src_dir.mkdir(parents=True, exist_ok=True)
    
    # Save uploaded zip temporarily
    zip_path = project_dir / "upload.zip"
    with open(zip_path, 'wb') as f:
        f.write(content)
    
    try:
        # Extract safely
        files_extracted, files_skipped = extract_zip_safely(str(zip_path), src_dir, MAX_FILES)
        
        # Clean up zip
        os.remove(zip_path)
        
        # Check for empty project
        if files_extracted == 0:
            shutil.rmtree(project_dir)
            raise HTTPException(
                status_code=400,
                detail="No Python files found in zip. Ensure the zip contains .py files."
            )
        
        # Initialize project status
        _PROJECT_STATUS[project_id] = {
            "projectId": project_id,
            "name": project_name,
            "status": "queued",
            "progress": 0,
            "filesExtracted": files_extracted,
            "filesSkipped": files_skipped,
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "error": None,
            "moduleCount": 0
        }
        
        # Queue background analysis
        background_tasks.add_task(analyze_project_background, project_id, str(src_dir))
        
        return {
            "projectId": project_id,
            "name": project_name,
            "status": "queued",
            "filesExtracted": files_extracted,
            "filesSkipped": files_skipped,
            "message": f"Project uploaded successfully. {files_extracted} Python files extracted, {files_skipped} files skipped."
        }
        
    except ValueError as e:
        # Clean up on error
        if project_dir.exists():
            shutil.rmtree(project_dir)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Clean up on error
        if project_dir.exists():
            shutil.rmtree(project_dir)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/projects/{project_id}/status")
def get_project_status(project_id: str):
    """
    Get the current status of a project analysis.
    
    Status values:
    - "queued": Waiting to start analysis
    - "analyzing": Currently analyzing code
    - "done": Analysis complete
    - "failed": Analysis failed (see error field)
    
    Progress: 0-100 percentage
    """
    if project_id not in _PROJECT_STATUS:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    
    return _PROJECT_STATUS[project_id]


@router.get("/projects")
def list_projects():
    """List all uploaded projects with their current status."""
    return {
        "projects": list(_PROJECT_STATUS.values()),
        "total": len(_PROJECT_STATUS)
    }
