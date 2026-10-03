"""
AST-based Python Code Parser for Legacy Codebases.
Extracts LOC, import dependencies, defined functions, and docstrings.
"""
import ast
import os
from typing import List, Set, Dict, Any

class CodeParser:
    def __init__(self, filepath: str, code_str: str = None):
        self.filepath = filepath
        if code_str is not None:
            self.raw_code = code_str
        else:
            with open(filepath, "r", encoding="utf-8") as f:
                self.raw_code = f.read()
        self.tree = ast.parse(self.raw_code, filename=filepath)
        self.loc = len([l for l in self.raw_code.splitlines() if l.strip()])

    def extract_imports(self) -> Set[str]:
        """
        Extract imported module names and relative dependencies.
        """
        deps = set()
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    # e.g., 'jwt', 'hashlib', 'sqlite3'
                    name = alias.name.split(".")[0]
                    deps.add(name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    # e.g., 'app.services.discounts' -> discounts or 'app.services'
                    parts = node.module.split(".")
                    deps.add(parts[-1])
                for alias in node.names:
                    deps.add(alias.name)
        return deps

    def extract_public_functions(self) -> List[Dict[str, Any]]:
        """
        Extract public top-level functions with signatures.
        """
        functions = []
        for node in self.tree.body:
            if isinstance(node, ast.FunctionDef) and not node.name.startswith("_"):
                args = [a.arg for a in node.args.args]
                docstring = ast.get_docstring(node) or ""
                functions.append({
                    "name": node.name,
                    "args": args,
                    "line": node.lineno,
                    "docstring": docstring.strip()
                })
        return functions
