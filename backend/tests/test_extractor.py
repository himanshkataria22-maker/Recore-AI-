"""
Unit Tests for Business Rule Extractor and Redaction.
"""
import pytest
from backend.analyzer.engine import CodebaseAnalyzer
from backend.extractor.rules import BusinessRuleExtractor
from backend.llm.redactor import redact_secrets

def test_secret_redactor():
    """Verify secrets are redacted before sending to LLMs."""
    code = """
STRIPE_LIVE_SK = "mock_sec_key_legacy_billing_prod_9901"
SENDGRID_KEY = "SG.dummy_mock_sendgrid_key_prod_992"
MASTER_PASS = "admin456"
"""
    redacted = redact_secrets(code)
    assert "admin456" not in redacted
    assert "REDACTED" in redacted

def test_business_rule_extractor_discounts():
    """Verify extraction and code verification for discounts module."""
    analyzer = CodebaseAnalyzer("backend/sample_legacy_app")
    modules = {m.id: m for m in analyzer.analyze(force_refresh=True)}
    extractor = BusinessRuleExtractor()
    rules = extractor.extract_business_rules(modules["discounts"])
    
    assert len(rules) >= 3
    rule_texts = " ".join([r.plain_english for r in rules])
    assert "25%" in rule_texts or "loyalty" in rule_texts.lower()
    
    # Assert line numbers and verified code snippets
    for r in rules:
        assert r.line > 0
        assert r.code_snippet in modules["discounts"].raw_code

def test_business_rule_extractor_billing():
    """Verify extraction and code verification for billing module."""
    analyzer = CodebaseAnalyzer("backend/sample_legacy_app")
    modules = {m.id: m for m in analyzer.analyze(force_refresh=True)}
    extractor = BusinessRuleExtractor()
    rules = extractor.extract_business_rules(modules["billing"])
    
    assert len(rules) >= 2
    for r in rules:
        assert r.line > 0
        assert r.code_snippet in modules["billing"].raw_code
