"""
Unit Tests for Analyzer Engine and Risk Scoring.
"""
import pytest
from backend.analyzer.engine import CodebaseAnalyzer, calculate_module_risk
from backend.analyzer.parser import CodeParser
from backend.analyzer.complexity import ComplexityAnalyzer
from backend.analyzer.security import SecurityAnalyzer
from backend.models.schema import Issue

def test_calculate_module_risk_low():
    """Test risk calculation for low-risk module."""
    score, level = calculate_module_risk(
        issues=[],
        complexity=2,
        has_tests=True,
        dependents_count=0
    )
    assert score == 0
    assert level == "low"

def test_calculate_module_risk_critical():
    """Test risk calculation for vulnerable, untested module with high blast radius."""
    issues = [
        Issue(id="1", type="sql_injection", severity="critical", line=10, description="SQLi"),
        Issue(id="2", type="hardcoded_secret", severity="critical", line=20, description="Secret"),
        Issue(id="3", type="no_tests", severity="high", line=1, description="No tests")
    ]
    score, level = calculate_module_risk(
        issues=issues,
        complexity=45,
        has_tests=False,
        dependents_count=6
    )
    assert score >= 80
    assert level == "critical"

def test_ast_parser_extracts_imports():
    """Test AST parser accurately extracts dependencies."""
    code = """
import hashlib
from app.services import discounts, tax_calculator
from . import db_utils
"""
    parser = CodeParser("test.py", code)
    imports = parser.extract_imports()
    assert "hashlib" in imports
    assert "discounts" in imports
    assert "tax_calculator" in imports
    assert "db_utils" in imports

def test_security_analyzer_detects_sqli():
    """Test security analyzer detects SQL injection via % and f-string."""
    code = """
def query_user(username):
    cursor.execute("SELECT * FROM users WHERE name = '%s'" % username)
"""
    issues = SecurityAnalyzer.analyze_module("user.py", code, has_tests=True, complexity_info={})
    sqli = [i for i in issues if i.type == "sql_injection"]
    assert len(sqli) == 1
    assert sqli[0].severity == "critical"
    assert sqli[0].cwe == "CWE-89"

def test_codebase_analyzer_end_to_end():
    """Test full codebase analysis on sample legacy app."""
    analyzer = CodebaseAnalyzer("backend/sample_legacy_app")
    modules = analyzer.analyze(force_refresh=True)
    assert len(modules) >= 12
    mod_dict = {m.id: m for m in modules}
    
    assert "billing" in mod_dict
    assert "auth" in mod_dict
    assert "discounts" in mod_dict
    assert "db_utils" in mod_dict

    # Check dependency resolution
    assert "discounts" in mod_dict["billing"].depends_on
    assert "billing" in mod_dict["discounts"].used_by
    assert mod_dict["auth"].risk_level in ("high", "critical")
