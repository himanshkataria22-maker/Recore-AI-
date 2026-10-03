"""
Business Rule Extractor.
Uses LLM AST reasoning to extract business logic, thresholds, calculation rules,
and verifies against source code to drop hallucinated snippets and correct line numbers.
"""
from typing import List, Dict, Any, Optional
import os
import re

from ..models.schema import BusinessRule, Module
from ..llm.client import LLMClient

RULE_EXTRACTION_PROMPT = """
You are an expert legacy code business analyst.
Analyze the following Python source code and extract all hidden business rules, condition thresholds, pricing formulas, compliance checks, or approval workflows.

For each rule, return a JSON object with:
- "plainEnglish": A clear, concise business description of the rule.
- "codeSnippet": The EXACT lines of code from the file where this rule is implemented.
- "line": The approximate line number in the source file.
- "confidence": An integer between 70 and 100.
- "category": One of "pricing", "compliance", "security", "workflow", "validation".
- "implication": Why this rule matters to the business and must be preserved during migration.

Source code for module '{module_name}':
```python
{code_str}
```

Return JSON with format: {{"rules": [...]}}
"""

class BusinessRuleExtractor:
    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm = llm_client or LLMClient()

    def extract_business_rules(self, module: Module, raw_code: Optional[str] = None) -> List[BusinessRule]:
        """
        Extracts verified business rules from a given module.
        Drops hallucinated snippets and verifies exact line occurrences.
        """
        code = raw_code or module.raw_code or ""
        if not code and os.path.exists(module.path):
            with open(module.path, "r", encoding="utf-8") as f:
                code = f.read()

        if not code:
            return []

        prompt = RULE_EXTRACTION_PROMPT.format(
            module_name=module.name,
            code_str=code
        )

        response = self.llm.complete_json(prompt)
        raw_rules = response.get("rules", []) if isinstance(response, dict) else []

        code_lines = code.splitlines()
        verified_rules: List[BusinessRule] = []
        rule_idx = 1

        for r in raw_rules:
            snippet = r.get("codeSnippet", "").strip()
            if not snippet:
                continue

            # Check if snippet or main parts of snippet exist in source file
            first_line = snippet.splitlines()[0].strip()
            matched_line = None

            for line_no, line in enumerate(code_lines, start=1):
                if first_line in line or line.strip() == first_line:
                    matched_line = line_no
                    break

            # If snippet was not found at all, drop hallucinated rule
            if matched_line is None and snippet not in code:
                continue

            verified_line = matched_line if matched_line is not None else int(r.get("line", 1))

            rule_obj = BusinessRule(
                id=f"RULE-{module.id.upper()}-{rule_idx}",
                module_id=module.id,
                module_name=module.name,
                plain_english=r.get("plainEnglish", ""),
                code_snippet=snippet,
                line=verified_line,
                confidence=int(r.get("confidence", 90)),
                category=r.get("category", "pricing"),
                implication=r.get("implication", "")
            )
            verified_rules.append(rule_obj)
            rule_idx += 1

        return verified_rules
