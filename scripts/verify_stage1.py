import urllib.request
import urllib.parse
import json
from pathlib import Path
import os
import requests

BASE_URL = "http://localhost:8000/api"
PROJECTS_DIR = Path(r"c:\Users\hp\Documents\Recore-AI-\test_projects")

def upload_zip(zip_name: str):
    zip_path = PROJECTS_DIR / zip_name
    print(f"\n--- Uploading {zip_name} ---")
    with open(zip_path, 'rb') as f:
        files = {'file': (zip_name, f, 'application/zip')}
        resp = requests.post(f"{BASE_URL}/projects/upload", files=files)
        print("Upload Status Code:", resp.status_code)
        data = resp.json()
        print("Upload Response:", json.dumps(data, indent=2))
        return data['projectId']

def get_analysis(project_id: str):
    resp = requests.get(f"{BASE_URL}/projects/{project_id}/analysis")
    print(f"\n--- Analysis for {project_id} (Status Code: {resp.status_code}) ---")
    data = resp.json()
    modules = data.get("modules", [])
    print(f"Total Modules Count: {len(modules)}")
    module_names = [m['name'] for m in modules]
    print(f"Module Names: {module_names}")
    return data

def verify_all_modules(project_id: str):
    modules_resp = requests.get(f"{BASE_URL}/projects/{project_id}/modules")
    modules = modules_resp.json()
    print(f"\nVerifying {len(modules)} modules for project {project_id}:")
    errors = 0
    for m in modules:
        m_id = m['id']
        # Check single module endpoint
        r1 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}")
        # Check insights endpoint
        r2 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}/insights")
        # Check route endpoint
        r3 = requests.get(f"{BASE_URL}/projects/{project_id}/modules/{m_id}/route")
        
        status_ok = (r1.status_code == 200 and r2.status_code == 200 and r3.status_code == 200)
        if not status_ok:
            print(f"  [FAIL] Module {m_id}: r1={r1.status_code}, r2={r2.status_code}, r3={r3.status_code}")
            errors += 1
        else:
            print(f"  [OK] Module {m_id}: 200 OK (details, insights, route)")
    print(f"Total Module Verification Errors: {errors}")
    return errors

if __name__ == "__main__":
    shop_id = upload_zip("shop_legacy.zip")
    bank_id = upload_zip("bank_legacy.zip")
    
    shop_analysis = get_analysis(shop_id)
    bank_analysis = get_analysis(bank_id)
    
    print("\n--- Project Count Comparison ---")
    print(f"shop_legacy project ({shop_id}): {len(shop_analysis['modules'])} modules")
    print(f"bank_legacy project ({bank_id}): {len(bank_analysis['modules'])} modules")
    assert len(shop_analysis['modules']) == 8, f"Expected 8 modules for shop_legacy, got {len(shop_analysis['modules'])}"
    assert len(bank_analysis['modules']) == 7, f"Expected 7 modules for bank_legacy, got {len(bank_analysis['modules'])}"
    
    err1 = verify_all_modules(shop_id)
    err2 = verify_all_modules(bank_id)
    assert err1 == 0 and err2 == 0, "Module verification failed!"
    print("\nAll Stage 1 upload & module checks passed successfully!")
