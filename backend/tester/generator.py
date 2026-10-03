"""
Behavioral Test Suite Generator.
Prompts LLM to analyze module contracts and generate boundary, edge case,
and regression test input vectors without predefined assertions.
"""
from typing import List, Dict, Any, Optional
from ..models.schema import Module
from ..llm.client import LLMClient
from ..analyzer.parser import CodeParser

TEST_GEN_PROMPT = """
You are an expert QA and software reliability engineer.
Analyze the following Python source code and generate a comprehensive matrix of test cases covering:
1. Normal standard cases
2. Edge cases and boundary values (e.g. 0, max values, threshold limits)
3. Invariants and security fuzz payloads

For each case, provide:
- "id": Unique ID (e.g., "TC-01")
- "name": Descriptive name of the test scenario
- "function": Public function name to call
- "args": List of positional arguments
- "kwargs": Dictionary of keyword arguments
- "type": One of "regression", "edge_case", "invariant", "security"
- "note": Explanation of the boundary or invariant being tested

Module name: '{module_name}'
Public functions: {public_funcs}

Source code:
```python
{code_str}
```

Return JSON strictly in the format: {{"cases": [...]}}
"""

class TestGenerator:
    __test__ = False
    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm = llm_client or LLMClient()

    def generate_behavior_tests(self, module: Module, raw_code: Optional[str] = None) -> List[Dict[str, Any]]:
        code = raw_code or module.raw_code or ""
        parser = CodeParser(module.path, code)
        public_funcs = [f["name"] for f in parser.extract_public_functions()]

        prompt = TEST_GEN_PROMPT.format(
            module_name=module.name,
            public_funcs=public_funcs,
            code_str=code
        )

        response = self.llm.complete_json(prompt)
        raw_cases = response.get("cases", []) if isinstance(response, dict) else []

        valid_cases = []
        for idx, c in enumerate(raw_cases, start=1):
            fn_name = c.get("function")
            if fn_name in public_funcs or fn_name:
                valid_cases.append({
                    "id": c.get("id", f"TC-{idx:02d}"),
                    "name": c.get("name", f"Test {fn_name} case {idx}"),
                    "function": fn_name,
                    "args": c.get("args", []),
                    "kwargs": c.get("kwargs", {}),
                    "type": c.get("type", "regression"),
                    "note": c.get("note", "")
                })

        return valid_cases
