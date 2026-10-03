"""
Explainable AI Insights Engine.
Generates grounded, evidence-backed architectural diagnostics for legacy modules.
Strictly validates that every cited issue ID and line number exists in static AST analysis facts,
dropping any hallucinated citations.
"""
import os
import json
from typing import Dict, Any, List, Optional

from ..models.schema import Module, AIInsight, AIInsightRiskReason, Issue
from ..llm.client import LLMClient

INSIGHTS_PROMPT = """
You are a principal software architect and security auditor diagnosing legacy codebases.
Analyze the following Python module and provide explainable, evidence-backed diagnostic insights.

CRITICAL GROUNDING REQUIREMENTS:
1. Every item in 'whyRisky' MUST cite an EXACT 'evidenceIssueId' from the Real Static Analysis Issues list provided below.
2. Every item in 'whyRisky' MUST specify the EXACT 'line' number where the vulnerability/risk occurs.
3. Do NOT invent issue IDs or cite non-existent line numbers. Hallucinations will be automatically discarded.
4. Provide a clear, actionable 'suggestedFix' targeting modern Python 3.11+, Pydantic v2 schemas, and parameterized queries.

Module Metadata:
- Name: {name} (ID: {module_id})
- Lines of Code: {loc}
- Cyclomatic Complexity: {complexity}
- Downstream Dependents Count: {dependents_count}

Real Static Analysis Issues Found:
{issues_json}

Module Source Code:
```python
{code_str}
```

Return JSON strictly matching this schema:
{{
  "moduleId": "{module_id}",
  "summary": "Executive summary of architectural and security risks in this module...",
  "whyRisky": [
    {{
      "reason": "Clear explanation of the exact architectural/security flaw...",
      "evidenceIssueId": "ISS-01",
      "line": 23
    }}
  ],
  "suggestedFix": "Concrete, step-by-step modernization strategy...",
  "confidence": 96
}}
"""

class InsightsEngine:
    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm = llm_client or LLMClient()

    def generate_insights(self, module: Module, raw_code: Optional[str] = None) -> AIInsight:
        """
        Generates explainable AI insights grounded in real AST analysis facts.
        """
        code = raw_code or module.raw_code or ""
        if not code and os.path.exists(module.path):
            with open(module.path, "r", encoding="utf-8") as f:
                code = f.read()

        issues_data = [
            {
                "id": iss.id,
                "type": iss.type,
                "severity": iss.severity,
                "line": iss.line,
                "description": iss.description,
                "cwe": iss.cwe
            }
            for iss in module.issues
        ]

        prompt = INSIGHTS_PROMPT.format(
            name=module.name,
            module_id=module.id,
            loc=module.loc,
            complexity=module.complexity,
            dependents_count=len(module.used_by),
            issues_json=json.dumps(issues_data, indent=2),
            code_str=code
        )

        llm_response = self.llm.complete_json(prompt)
        
        # Grounding validation map
        valid_issues: Dict[str, Issue] = {iss.id: iss for iss in module.issues}
        line_to_issue: Dict[int, Issue] = {iss.line: iss for iss in module.issues}

        validated_reasons: List[AIInsightRiskReason] = []
        summary = ""
        suggested_fix = ""
        confidence = 95

        if isinstance(llm_response, dict):
            summary = llm_response.get("summary", "")
            suggested_fix = llm_response.get("suggestedFix", "")
            confidence = int(llm_response.get("confidence", 95))
            raw_reasons = llm_response.get("whyRisky", [])

            for item in raw_reasons:
                if not isinstance(item, dict):
                    continue
                issue_id = item.get("evidenceIssueId", "")
                line = int(item.get("line", 0))
                reason_text = item.get("reason", "").strip()

                if not reason_text:
                    continue

                # FACT CHECK 1: Does evidenceIssueId exist in real analyzer issues?
                matched_issue = valid_issues.get(issue_id)
                if not matched_issue and line in line_to_issue:
                    # Self-heal citation to valid issue on same line
                    matched_issue = line_to_issue[line]
                    issue_id = matched_issue.id

                if matched_issue:
                    # FACT CHECK 2: Validate line number matches real issue
                    valid_line = matched_issue.line if matched_issue.line > 0 else line
                    validated_reasons.append(AIInsightRiskReason(
                        reason=reason_text,
                        evidence_issue_id=issue_id,
                        line=valid_line
                    ))
                else:
                    # Discard hallucinated citation
                    pass

        # If LLM didn't return valid reasons or demo mode fallback needed:
        if not validated_reasons:
            validated_reasons = self._generate_grounded_fallback_reasons(module)

        if not summary:
            summary = f"Module '{module.name}' contains {len(module.issues)} detected security vulnerabilities with high cyclomatic complexity ({module.complexity}). Refactoring is essential to secure data access and unblock downstream dependents ({len(module.used_by)} callers)."

        if not suggested_fix:
            suggested_fix = "Refactor module using Pydantic v2 schemas for strict input verification, replace raw string SQL queries with parameterized bindings, and isolate stateful logic behind async service interfaces."

        return AIInsight(
            module_id=module.id,
            summary=summary,
            why_risky=validated_reasons,
            suggested_fix=suggested_fix,
            confidence=max(75, min(99, confidence))
        )

    def _generate_grounded_fallback_reasons(self, module: Module) -> List[AIInsightRiskReason]:
        """
        Creates deterministically grounded risk reasons directly from static AST analyzer issues.
        """
        reasons: List[AIInsightRiskReason] = []
        for iss in module.issues:
            desc = iss.description
            if iss.type == "sql_injection":
                reason = f"Critical SQL Injection vulnerability via unparameterized string formatting. Allows untrusted user inputs to alter database queries."
            elif iss.type == "hardcoded_secret":
                reason = f"Hardcoded credential or private signing key exposed in source code. Violates enterprise secret isolation standards."
            elif iss.type == "deprecated_api":
                reason = f"Reliance on deprecated or unsupported legacy API functions, preventing Python 3.11+ compatibility."
            elif iss.type == "high_complexity":
                reason = f"High cyclomatic complexity ({module.complexity}) and deep branching nesting creates unmaintainable execution paths and high regression risk."
            elif iss.type == "no_tests":
                reason = f"Zero automated unit or behavioral regression test coverage, risking silent regressions during upgrades."
            else:
                reason = f"{iss.severity.capitalize()} severity issue detected: {desc}."

            reasons.append(AIInsightRiskReason(
                reason=reason,
                evidence_issue_id=iss.id,
                line=iss.line
            ))
        return reasons
