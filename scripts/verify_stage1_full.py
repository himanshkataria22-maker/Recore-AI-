import requests
import json
import time
import subprocess
import sys
from pathlib import Path

BASE_URL = "http://localhost:8000/api"
PROJECTS_DIR = Path(r"c:\Users\hp\Documents\Recore-AI-\test_projects")

def upload_zip(zip_name: str) -> str:
    zip_path = PROJECTS_DIR / zip_name
    print(f"\n--- Uploading {zip_name} ---", flush=True)
    with open(zip_path, 'rb') as f:
        files = {'file': (zip_name, f, 'application/zip')}
        resp = requests.post(f"{BASE_URL}/projects/upload", files=files)
        print(f"Upload Status Code: {resp.status_code}", flush=True)
        data = resp.json()
        print(f"Upload Response: {json.dumps(data, indent=2)}", flush=True)
        return data['projectId']

def get_analysis(project_id: str):
    resp = requests.get(f"{BASE_URL}/projects/{project_id}/analysis")
    print(f"\n--- Analysis Endpoint for {project_id} (Status: {resp.status_code}) ---", flush=True)
    data = resp.json()
    modules = data.get("modules", [])
    print(f"Module Count: {len(modules)}", flush=True)
    print(f"Modules: {[m['name'] for m in modules]}", flush=True)
    return data

def verify_all_modules(project_id: str):
    modules_resp = requests.get(f"{BASE_URL}/projects/{project_id}/modules")
    modules = modules_resp.json()
    print(f"\nVerifying {len(modules)} modules for project '{project_id}':", flush=True)
    errors = 0
    for m in modules:
        m_id = m['id']
        r1 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}")
        r2 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}/insights")
        r3 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}/route")
        
        status_ok = (r1.status_code == 200 and r2.status_code == 200 and r3.status_code == 200)
        if not status_ok:
            print(f"  [FAIL] Module {m_id}: r1={r1.status_code}, r2={r2.status_code}, r3={r3.status_code}", flush=True)
            errors += 1
        else:
            print(f"  [OK] Module {m_id}: 200 OK (details, insights, route)", flush=True)
    return errors

def main():
    # Step 1: Upload shop_legacy and bank_legacy
    shop_id = upload_zip("shop_legacy.zip")
    bank_id = upload_zip("bank_legacy.zip")

    # Step 2: Compare analyses (8 vs 7 modules)
    shop_analysis = get_analysis(shop_id)
    bank_analysis = get_analysis(bank_id)

    shop_count = len(shop_analysis['modules'])
    bank_count = len(bank_analysis['modules'])

    print("\n==========================================", flush=True)
    print("ANALYSIS COMPARISON RESULT:", flush=True)
    print(f"shop_legacy project ID: {shop_id} -> {shop_count} modules", flush=True)
    print(f"bank_legacy project ID: {bank_id} -> {bank_count} modules", flush=True)
    print("==========================================", flush=True)

    assert shop_count == 8, f"Expected 8 modules for shop_legacy, got {shop_count}"
    assert bank_count == 7, f"Expected 7 modules for bank_legacy, got {bank_count}"

    # Step 3: Verify every module in both projects before server restart
    print("\n--- BEFORE SERVER RESTART: Verifying All Module Endpoints ---", flush=True)
    err_shop_before = verify_all_modules(shop_id)
    err_bank_before = verify_all_modules(bank_id)
    assert err_shop_before == 0 and err_bank_before == 0, "Module verification failed before restart"

    print("\nStage 1 verification completed successfully!", flush=True)

if __name__ == "__main__":
    main()
