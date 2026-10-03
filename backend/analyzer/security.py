"""
Security & Vulnerability Analyzer.
Combines Bandit static analysis with custom AST & heuristic rules for:
- SQL Injection (CWE-89)
- Hardcoded Secrets (CWE-798)
- Deprecated Insecure APIs (CWE-328 / CWE-477)
- Missing Test Suites (CWE-1077)
- High Cyclomatic Complexity (CWE-1120)
"""
import ast
import re
from typing import List, Dict, Any, Optional
from ..models.schema import Issue

SECRET_PATTERNS = [
    (r"(['\"])(mock_sec_key_[0-9a-zA-Z_\-]{10,})\1", "Hardcoded live Stripe API key detected in source code."),
    (r"(['\"])(sk_live_[0-9a-zA-Z]{10,})\1", "Hardcoded live Stripe API key detected in source code."),
    (r"(['\"])(SG\.[0-9a-zA-Z_\.\-]{10,})\1", "Hardcoded SendGrid API token detected in source code."),
    (r"(['\"])(https://hooks\.slack\.com/services/[0-9a-zA-Z_\/\-]+)\1", "Hardcoded Slack Incoming Webhook endpoint detected."),
    (r"(JWT_SECRET_KEY|SECRET_KEY|MASTER_PASS|API_KEY|STRIPE_LIVE_SK)\s*=\s*['\"]([^'\"]+)['\"]", "Hardcoded authentication secret or master password in variable assignment."),
    (r"password\s*=\s*['\"]([^'\"]{4,})['\"]", "Plaintext password string embedded in connection arguments.")
]

SQL_KEYWORDS = ["SELECT ", "INSERT INTO ", "UPDATE ", "DELETE FROM ", "DROP TABLE", "WHERE "]

class SecurityAnalyzer:
    @staticmethod
    def analyze_module(filepath: str, code_str: str, has_tests: bool, complexity_info: Dict[str, Any]) -> List[Issue]:
        issues: List[Issue] = []
        issue_counter = 1
        module_basename = filepath.split("/")[-1].split("\\")[-1]
        mod_prefix = module_basename.replace(".py", "").upper()

        lines = code_str.splitlines()

        # 1. AST-based scanning
        try:
            tree = ast.parse(code_str, filename=filepath)
            for node in ast.walk(tree):
                # Check for SQL queries in assignments or execute calls
                is_sqli = False
                sqli_line = getattr(node, "lineno", 1)

                # Case A: cursor.execute(...) with formatting
                if isinstance(node, ast.Call):
                    is_execute = False
                    if isinstance(node.func, ast.Attribute) and node.func.attr in ("execute", "execute_raw_sql"):
                        is_execute = True
                    elif isinstance(node.func, ast.Name) and node.func.id in ("execute", "execute_raw_sql"):
                        is_execute = True
                    
                    if is_execute and node.args:
                        first_arg = node.args[0]
                        if isinstance(first_arg, ast.BinOp) and isinstance(first_arg.op, ast.Mod):
                            is_sqli = True
                        elif isinstance(first_arg, ast.JoinedStr):
                            is_sqli = True

                # Case B: assignment query = f"SELECT ... {var}" or query = "SELECT ... %s" % var
                elif isinstance(node, ast.Assign):
                    val = node.value
                    if isinstance(val, ast.JoinedStr):
                        # Check if any constant part has SQL keywords
                        raw_parts = [p.value for p in val.values if isinstance(p, ast.Constant) and isinstance(p.value, str)]
                        joined_text = " ".join(raw_parts).upper()
                        if any(k in joined_text for k in SQL_KEYWORDS):
                            is_sqli = True
                    elif isinstance(val, ast.BinOp) and isinstance(val.op, ast.Mod):
                        if isinstance(val.left, ast.Constant) and isinstance(val.left.value, str):
                            if any(k in val.left.value.upper() for k in SQL_KEYWORDS):
                                is_sqli = True

                if is_sqli:
                    snippet = lines[sqli_line - 1].strip() if sqli_line <= len(lines) else ""
                    if not any(iss.line == sqli_line and iss.type == "sql_injection" for iss in issues):
                        issues.append(Issue(
                            id=f"ISSUE-{mod_prefix}-{issue_counter}",
                            type="sql_injection",
                            severity="critical",
                            line=sqli_line,
                            description="SQL query constructed via dynamic string formatting/interpolation exposes database to injection attacks.",
                            snippet=snippet,
                            remediation="Use parameterized SQL queries with bind parameter placeholders.",
                            cwe="CWE-89"
                        ))
                        issue_counter += 1

                # Check for deprecated hashlib.md5
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Attribute) and node.func.attr == "md5":
                        lineno = getattr(node, "lineno", 1)
                        snippet = lines[lineno - 1].strip() if lineno <= len(lines) else ""
                        issues.append(Issue(
                            id=f"ISSUE-{mod_prefix}-{issue_counter}",
                            type="deprecated_api",
                            severity="medium",
                            line=lineno,
                            description="Insecure legacy MD5 hashing routine used without salt or key stretching.",
                            snippet=snippet,
                            remediation="Migrate password hashing to Argon2id or bcrypt with appropriate work factors.",
                            cwe="CWE-328"
                        ))
                        issue_counter += 1

                # Check for deprecated imports (e.g., cgi, imp)
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if alias.name in ("cgi", "imp"):
                            lineno = getattr(node, "lineno", 1)
                            snippet = lines[lineno - 1].strip() if lineno <= len(lines) else ""
                            issues.append(Issue(
                                id=f"ISSUE-{mod_prefix}-{issue_counter}",
                                type="deprecated_api",
                                severity="medium",
                                line=lineno,
                                description=f"Deprecated legacy Python standard library module '{alias.name}' removed in modern Python 3.12+.",
                                snippet=snippet,
                                remediation=f"Replace '{alias.name}' with standard modern equivalents (e.g. importlib, html).",
                                cwe="CWE-477"
                            ))
                            issue_counter += 1

        except Exception:
            pass

        # 2. Regex / Line-based Secret Scanning
        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            if stripped.startswith("#"):
                continue
            for pattern, desc in SECRET_PATTERNS:
                if re.search(pattern, stripped):
                    # Avoid duplicate if already reported on this line
                    if not any(iss.line == idx and iss.type == "hardcoded_secret" for iss in issues):
                        issues.append(Issue(
                            id=f"ISSUE-{mod_prefix}-{issue_counter}",
                            type="hardcoded_secret",
                            severity="critical",
                            line=idx,
                            description=desc,
                            snippet=stripped,
                            remediation="Extract credentials to KMS, AWS Secrets Manager, or environment variables using Pydantic BaseSettings.",
                            cwe="CWE-798"
                        ))
                        issue_counter += 1

        # 3. High Complexity check
        for block in complexity_info.get("blocks", []):
            if block["complexity"] >= 10:
                issues.append(Issue(
                    id=f"ISSUE-{mod_prefix}-{issue_counter}",
                    type="high_complexity",
                    severity="high" if block["complexity"] < 25 else "critical",
                    line=block["line"],
                    description=f"Function '{block['name']}' has high cyclomatic complexity ({block['complexity']}), making it brittle and error-prone.",
                    snippet=f"def {block['name']}(...): [Complexity: {block['complexity']}]",
                    remediation="Decompose into smaller single-responsibility functions or Strategy Pattern domain handlers.",
                    cwe="CWE-1120"
                ))
                issue_counter += 1

        # 4. Missing Tests Check
        if not has_tests:
            issues.append(Issue(
                id=f"ISSUE-{mod_prefix}-{issue_counter}",
                type="no_tests",
                severity="high",
                line=1,
                description=f"Zero automated unit test coverage or regression suite found for {module_basename}.",
                snippet=f"# Missing test suite for {module_basename}",
                remediation="Generate behavioral test suite with parameterized pytest test matrices.",
                cwe="CWE-1077"
            ))
            issue_counter += 1

        return issues
