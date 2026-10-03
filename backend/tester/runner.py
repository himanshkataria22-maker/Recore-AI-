"""
Golden Master Behavior Test Execution Harness.
Executes test cases in isolated subprocesses with fresh SQLite databases,
records legacy behavioral baselines, and verifies modernized parity.
"""
import os
import sys
import json
import time
import shutil
import tempfile
import subprocess
from typing import List, Dict, Any, Tuple, Optional

from ..models.schema import TestCaseResult

GOLDEN_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "golden")
os.makedirs(GOLDEN_DIR, exist_ok=True)

class GoldenMasterRunner:
    def __init__(self, legacy_app_dir: str):
        self.legacy_app_dir = os.path.abspath(legacy_app_dir)

    def _execute_case_in_subprocess(
        self,
        target_dir: str,
        module_id: str,
        case: Dict[str, Any],
        timeout_seconds: float = 5.0
    ) -> Tuple[bool, Any, int]:
        """
        Executes a single test case against a module inside target_dir in an isolated subprocess.
        Returns: (success: bool, result_or_error: Any, duration_ms: int)
        """
        fn_name = case["function"]
        args_json = json.dumps(case.get("args", []))
        kwargs_json = json.dumps(case.get("kwargs", {}))
        parent_dir = os.path.dirname(target_dir)
        pkg_name = os.path.basename(target_dir)

        # Inline test runner script
        runner_code = f"""
import sys
import os
import json
import importlib

sys.path.insert(0, r"{parent_dir}")

try:
    db_mod = importlib.import_module("{pkg_name}.db_utils")
    db_mod.init_db()
except Exception:
    pass

try:
    mod = importlib.import_module("{pkg_name}.{module_id}")
    fn = getattr(mod, "{fn_name}")
    args = json.loads(r'''{args_json}''')
    kwargs = json.loads(r'''{kwargs_json}''')
    res = fn(*args, **kwargs)
    print("__OUTPUT_START__")
    print(json.dumps({{"status": "ok", "value": res}}))
except Exception as e:
    print("__OUTPUT_START__")
    print(json.dumps({{"status": "error", "error_type": type(e).__name__, "message": str(e)}}))
"""
        start_time = time.time()
        try:
            proc = subprocess.run(
                [sys.executable, "-c", runner_code],
                cwd=target_dir,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                env=dict(os.environ, PYTHONUNBUFFERED="1")
            )
            duration_ms = max(1, int((time.time() - start_time) * 1000))

            output_text = proc.stdout
            if "__OUTPUT_START__" in output_text:
                json_part = output_text.split("__OUTPUT_START__")[-1].strip()
                parsed = json.loads(json_part)
                if parsed["status"] == "ok":
                    return True, parsed["value"], duration_ms
                else:
                    return False, f"Exception: {parsed['error_type']} - {parsed['message']}", duration_ms
            else:
                return False, f"Process failed: {proc.stderr.strip() or output_text.strip()}", duration_ms

        except subprocess.TimeoutExpired:
            duration_ms = int((time.time() - start_time) * 1000)
            return False, "TimeoutExpired (>5s)", duration_ms
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            return False, f"Execution Error: {str(e)}", duration_ms

    def record_golden_master(
        self,
        module_id: str,
        cases: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Runs cases against legacy module and saves baseline output to /backend/golden/<moduleId>.json.
        """
        golden_results = []

        with tempfile.TemporaryDirectory() as tmp_dir:
            # Copy legacy app files to sandbox
            for item in os.listdir(self.legacy_app_dir):
                s = os.path.join(self.legacy_app_dir, item)
                d = os.path.join(tmp_dir, item)
                if os.path.isfile(s) and not item.endswith(".db"):
                    shutil.copy2(s, d)

            for case in cases:
                success, output, dur = self._execute_case_in_subprocess(tmp_dir, module_id, case)
                golden_results.append({
                    "case": case,
                    "success": success,
                    "expected_output": output,
                    "duration_ms": dur
                })

        golden_file = os.path.join(GOLDEN_DIR, f"{module_id}.json")
        with open(golden_file, "w", encoding="utf-8") as f:
            json.dump(golden_results, f, indent=2)

        return golden_results

    def compare_modernized_to_golden(
        self,
        module_id: str,
        modernized_code: str,
        golden_data: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[int, int, bool, int, List[TestCaseResult]]:
        """
        Executes golden cases against modernized module and calculates parity metrics.
        Returns: (tests_total, tests_passed, behavior_preserved, preservation_score, test_results)
        """
        if golden_data is None:
            golden_file = os.path.join(GOLDEN_DIR, f"{module_id}.json")
            if not os.path.exists(golden_file):
                raise FileNotFoundError(f"Golden master record for {module_id} does not exist.")
            with open(golden_file, "r", encoding="utf-8") as f:
                golden_data = json.load(f)

        test_results: List[TestCaseResult] = []
        passed_count = 0

        with tempfile.TemporaryDirectory() as tmp_dir:
            # Copy base legacy dependencies
            for item in os.listdir(self.legacy_app_dir):
                s = os.path.join(self.legacy_app_dir, item)
                d = os.path.join(tmp_dir, item)
                if os.path.isfile(s) and not item.endswith(".db"):
                    shutil.copy2(s, d)

            # Overwrite the target module with the modernized code
            target_mod_path = os.path.join(tmp_dir, f"{module_id}.py")
            with open(target_mod_path, "w", encoding="utf-8") as f:
                f.write(modernized_code)

            for entry in golden_data:
                case = entry["case"]
                expected = entry["expected_output"]

                ok, actual, dur = self._execute_case_in_subprocess(tmp_dir, module_id, case)

                # Parity comparison (deep equality or float precision tolerance)
                is_match = self._values_equal(expected, actual)
                status = "passed" if is_match else "failed"

                if is_match:
                    passed_count += 1

                input_summary = f"{case['function']}({', '.join(map(str, case.get('args', [])))})"
                output_summary = f"Modern: {str(actual)[:40]} | Expected: {str(expected)[:40]}"

                test_results.append(TestCaseResult(
                    id=case.get("id", f"TC-{len(test_results)+1:02d}"),
                    name=case.get("name", f"Verification of {case['function']}"),
                    type=case.get("type", "regression"),
                    status=status,
                    duration_ms=dur,
                    assertion=f"assert modern_output == golden_expected",
                    input_summary=input_summary,
                    output_summary=output_summary
                ))

        total_tests = len(golden_data)
        preservation_score = int((passed_count / total_tests * 100)) if total_tests > 0 else 100
        behavior_preserved = (passed_count == total_tests)

        return total_tests, passed_count, behavior_preserved, preservation_score, test_results

    def _values_equal(self, val1: Any, val2: Any) -> bool:
        """Deep comparison helper with float rounding tolerance."""
        if type(val1) != type(val2):
            # Allow int to float comparison
            if isinstance(val1, (int, float)) and isinstance(val2, (int, float)):
                return abs(float(val1) - float(val2)) < 1e-4
            return False
            
        if isinstance(val1, float):
            return abs(val1 - val2) < 1e-4
            
        if isinstance(val1, dict):
            if set(val1.keys()) != set(val2.keys()):
                return False
            return all(self._values_equal(val1[k], val2[k]) for k in val1)
            
        if isinstance(val1, list):
            if len(val1) != len(val2):
                return False
            return all(self._values_equal(a, b) for a, b in zip(val1, val2))
            
        return val1 == val2
