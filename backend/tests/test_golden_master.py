"""
Unit and Integration Tests for Golden Master Behavior Runner and Modernization.
"""
import pytest
import os
from backend.analyzer.engine import CodebaseAnalyzer
from backend.tester.generator import TestGenerator
from backend.tester.runner import GoldenMasterRunner
from backend.modernizer.engine import ModernizerEngine

def test_generate_and_run_golden_master():
    """Verify golden master records baseline from legacy code."""
    analyzer = CodebaseAnalyzer("backend/sample_legacy_app")
    modules = {m.id: m for m in analyzer.analyze(force_refresh=True)}
    
    test_gen = TestGenerator()
    cases = test_gen.generate_behavior_tests(modules["discounts"])
    assert len(cases) >= 4
    
    runner = GoldenMasterRunner("backend/sample_legacy_app")
    records = runner.record_golden_master("discounts", cases)
    assert len(records) == len(cases)
    assert all(r["success"] for r in records)

def test_modernize_discounts_preserves_behavior():
    """Verify modernizing discounts.py fixes security vulnerabilities and achieves 100% behavioral parity."""
    analyzer = CodebaseAnalyzer("backend/sample_legacy_app")
    modules = {m.id: m for m in analyzer.analyze(force_refresh=True)}
    
    modernizer = ModernizerEngine("backend/sample_legacy_app")
    val_run = modernizer.modernize_module(modules["discounts"])
    
    assert val_run.module_id == "discounts"
    assert val_run.tests_total >= 4
    assert val_run.tests_passed == val_run.tests_total
    assert val_run.behavior_preserved is True
    assert val_run.preservation_score == 100
    assert len(val_run.test_cases) == val_run.tests_total
    assert val_run.diff.after != ""
    assert "def get_customer_discount_multiplier" in val_run.diff.after

def test_rollback_discounts():
    """Verify rollback restores legacy version."""
    modernizer = ModernizerEngine("backend/sample_legacy_app")
    success = modernizer.rollback_module("discounts")
    assert success is True
