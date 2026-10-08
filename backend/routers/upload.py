"""
Project Upload and Analysis Router.
Handles secure file uploads, extraction, disk persistence, and project status.
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

from ..projects.manager import project_manager, DATA_PROJECTS_DIR

router = APIRouter(tags=["upload"])

MAX_ZIP_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_FILES = 200
ALLOWED_EXTENSIONS = {".py"}
IGNORED_DIRS = {"venv", "__pycache__", ".git", "node_modules", "tests", ".pytest_cache", "dist", "build", "egg-info"}


def generate_project_id(name: str) -> str:
    """Generate a safe, unique project ID."""
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')[:20]
    if not slug:
        slug = "project"
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
            if member.is_dir():
                continue
                
            if member.filename.startswith('/') or '..' in member.filename:
                files_skipped += 1
                continue
            
            parts = Path(member.filename).parts
            if any(part in IGNORED_DIRS for part in parts):
                files_skipped += 1
                continue
            
            if not member.filename.endswith('.py'):
                files_skipped += 1
                continue
            
            # Flatten or retain relative filename
            target_path = extract_to / member.filename
            target_path.parent.mkdir(parents=True, exist_ok=True)
            
            if not is_safe_path(extract_to, target_path):
                files_skipped += 1
                continue
            
            with zf.open(member) as source, open(target_path, 'wb') as target:
                shutil.copyfileobj(source, target)
            
            files_extracted += 1
    
    return files_extracted, files_skipped


def analyze_project_task(project_id: str):
    """Task to analyze a project synchronously or background."""
    try:
        project_manager.analyze_and_save(project_id)
    except Exception as e:
        meta = project_manager.get_project_meta(project_id) or {}
        meta["status"] = "failed"
        meta["error"] = str(e)
        meta["progress"] = 0
        p_dir = project_manager.get_project_dir(project_id)
        with open(p_dir / "project.json", 'w', encoding='utf-8') as f:
            import json
            json.dump(meta, f, indent=2)


@router.post("/projects/upload")
async def upload_project(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload a .zip file containing a Python project for analysis."""
    if not file.filename or not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")
    
    content = await file.read()
    if len(content) > MAX_ZIP_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Zip file too large ({len(content)} bytes > {MAX_ZIP_SIZE} bytes = 10 MB)"
        )
    
    project_name = Path(file.filename).stem
    project_id = generate_project_id(project_name)
    
    p_dir = project_manager.get_project_dir(project_id)
    src_dir = p_dir / "src"
    p_dir.mkdir(parents=True, exist_ok=True)
    src_dir.mkdir(parents=True, exist_ok=True)
    
    zip_path = p_dir / "upload.zip"
    with open(zip_path, 'wb') as f:
        f.write(content)
    
    try:
        files_extracted, files_skipped = extract_zip_safely(str(zip_path), src_dir, MAX_FILES)
        os.remove(zip_path)
        
        if files_extracted == 0:
            shutil.rmtree(p_dir)
            raise HTTPException(
                status_code=400,
                detail="No Python files found in zip. Ensure the zip contains .py files."
            )
        
        meta = project_manager.create_project(project_id, project_name, files_extracted, files_skipped)
        
        # Analyze project immediately for instant readiness & persistence
        project_manager.analyze_and_save(project_id)
        
        return {
            "projectId": project_id,
            "name": project_name,
            "status": "done",
            "filesExtracted": files_extracted,
            "filesSkipped": files_skipped,
            "message": f"Project '{project_name}' uploaded and analyzed successfully with {files_extracted} Python modules."
        }
        
    except ValueError as e:
        if p_dir.exists():
            shutil.rmtree(p_dir)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if p_dir.exists():
            shutil.rmtree(p_dir)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/projects/{project_id}/status")
def get_project_status(project_id: str):
    """Get status of a project analysis."""
    meta = project_manager.get_project_meta(project_id)
    if meta:
        return meta
    raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")


@router.get("/projects")
def list_projects():
    """List all uploaded projects with their status."""
    projects = project_manager.list_projects()
    return {
        "projects": projects,
        "total": len(projects)
    }


@router.get("/health/status")
def health_status():
    """Health check for upload service."""
    return {
        "service": "upload",
        "status": "healthy",
        "projects_count": len(project_manager.list_projects())
    }
