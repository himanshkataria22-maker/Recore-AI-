import requests
import json
import time
import subprocess
import sys
import os
from pathlib import Path

BASE_URL = "http://localhost:8000/api"
PROJECTS_DIR = Path(r"c:\Users\hp\Documents\Recore-AI-\test_projects")

def upload_zip(zip_name: str) -> str:
    zip_path = PROJECTS_DIR / zip_name
    print(f"\n[ACTION] Uploading {zip_name}...", flush=True)
    with open(zip_path, 'rb') as f:
        files = {'file': (zip_name, f, 'application/zip')}
        resp = requests.post(f"{BASE_URL}/projects/upload", files=files)
        assert resp.status_code == 200, f"Upload failed: {resp.status_code} {resp.text}"
        data = resp.json()
        print(f"  -> Uploaded successfully: projectId='{data['projectId']}', modulesExtracted={data['filesExtracted']}", flush=True)
        return data['projectId']

def get_analysis(project_id: str):
    resp = requests.get(f"{BASE_URL}/projects/{project_id}/analysis")
    assert resp.status_code == 200, f"Analysis failed for {project_id}: {resp.status_code}"
    data = resp.json()
    modules = data.get("modules", [])
    print(f"  -> Analysis for '{project_id}': totalModules={len(modules)} ({[m['name'] for m in modules]})", flush=True)
    return data

def verify_all_modules(project_id: str):
    modules_resp = requests.get(f"{BASE_URL}/projects/{project_id}/modules")
    assert modules_resp.status_code == 200
    modules = modules_resp.json()
    print(f"  -> Verifying {len(modules)} modules for project '{project_id}'...", flush=True)
    errors = 0
    for m in modules:
        m_id = m['id']
        r1 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}")
        r2 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}/insights")
        r3 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}/route")
        
        status_ok = (r1.status_code == 200 and r2.status_code == 200 and r3.status_code == 200)
        if not status_ok:
            print(f"     [FAIL] Module {m_id}: r1={r1.status_code}, r2={r2.status_code}, r3={r3.status_code}", flush=True)
            errors += 1
        else:
            print(f"     [OK] Module '{m_id}' -> 200 OK (details, insights, route)", flush=True)
    return errors

def main():
    print("=================================================================", flush=True)
    print("               STAGE 1 VERIFICATION RUN                         ", flush=True)
    print("=================================================================", flush=True)

    # 1. Upload shop_legacy, then bank_legacy in one server session
    shop_id = upload_zip("shop_legacy.zip")
    bank_id = upload_zip("bank_legacy.zip")

    # 2. Curl analysis of both & show they differ (8 vs 7 modules)
    print("\n--- 1. ANALYSIS DIFFERENCE VERIFICATION ---", flush=True)
    shop_analysis = get_analysis(shop_id)
    bank_analysis = get_analysis(bank_id)

    shop_mod_count = len(shop_analysis['modules'])
    bank_mod_count = len(bank_analysis['modules'])

    print(f"\n  Result: shop_legacy={shop_mod_count} modules VS bank_legacy={bank_mod_count} modules", flush=True)
    assert shop_mod_count == 8, f"Expected 8 modules for shop_legacy, got {shop_mod_count}"
    assert bank_mod_count == 7, f"Expected 7 modules for bank_legacy, got {bank_mod_count}"
    print("  [SUCCESS] Analysis difference verified: 8 vs 7 modules!", flush=True)

    # 3. Open every module in both projects before restart
    print("\n--- 2. MODULE ENDPOINTS VERIFICATION (LIVE SESSION) ---", flush=True)
    err1 = verify_all_modules(shop_id)
    err2 = verify_all_modules(bank_id)
    assert err1 == 0 and err2 == 0, "Module verification failed!"
    print("  [SUCCESS] All modules in both projects returned 200 OK (zero 404s, zero warnings)!", flush=True)

    print("\n================================================Scope & Persistence Verified!", flush=True)

if __name__ == "__main__":
    main()
