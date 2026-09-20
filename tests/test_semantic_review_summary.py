import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import semantic_review_summary as srs


class SemanticReviewSummaryTests(unittest.TestCase):
    def test_private_summary_omits_repository_and_titles(self):
        evidence = {"repository": "CochraneK/secret-repo", "visibility": "private"}
        report = {
            "provider": "deepseek",
            "model": "model",
            "confidence": 0.8,
            "summary": "Sensitive summary",
            "findings": [{"severity": "P1", "code": "X", "title": "Sensitive title"}],
            "regression_candidates": ["Sensitive candidate"],
        }
        text = srs.render(evidence, report)
        self.assertNotIn("secret-repo", text)
        self.assertNotIn("Sensitive title", text)
        self.assertNotIn("Sensitive summary", text)
        self.assertIn("P1 1", text)

    def test_public_summary_includes_actionable_findings(self):
        evidence = {"repository": "CochraneK/public-repo", "visibility": "public"}
        report = {
            "provider": "glm",
            "model": "model",
            "confidence": 0.7,
            "summary": "Public summary",
            "findings": [{
                "severity": "P2",
                "code": "DOC-1",
                "title": "Missing quick start",
                "remediation": "Add one.",
            }],
            "regression_candidates": [],
        }
        text = srs.render(evidence, report)
        self.assertIn("CochraneK/public-repo", text)
        self.assertIn("Missing quick start", text)
        self.assertIn("Add one.", text)


if __name__ == "__main__":
    unittest.main()
