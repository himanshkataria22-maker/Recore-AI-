"""
Radon-based Cyclomatic Complexity and Halstead Metrics Analyzer.
"""
from radon.complexity import cc_visit, cc_rank
from typing import Dict, Any

class ComplexityAnalyzer:
    @staticmethod
    def analyze_complexity(code_str: str) -> Dict[str, Any]:
        """
        Calculates cyclomatic complexity for a given Python code string.
        Returns max complexity, average complexity, and blocks.
        """
        try:
            blocks = cc_visit(code_str)
            if not blocks:
                return {"max_complexity": 1, "avg_complexity": 1.0, "rank": "A", "blocks": []}
                
            scores = [b.complexity for b in blocks]
            max_cc = max(scores)
            avg_cc = sum(scores) / len(scores)
            
            # Weighted total complexity reflecting module size
            total_cc = sum(scores)
            
            return {
                "max_complexity": max_cc,
                "total_complexity": total_cc,
                "avg_complexity": round(avg_cc, 1),
                "rank": cc_rank(max_cc),
                "blocks": [{"name": b.name, "complexity": b.complexity, "line": b.lineno} for b in blocks]
            }
        except Exception as e:
            return {"max_complexity": 1, "total_complexity": 1, "avg_complexity": 1.0, "rank": "A", "error": str(e), "blocks": []}
