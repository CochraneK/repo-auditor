import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "portfolio-audit.yml"


class SemanticWorkflowContractTests(unittest.TestCase):
    def test_manual_semantic_review_is_explicit_and_optional(self):
        text = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("semantic_review:", text)
        self.assertIn("allow_private_repository:", text)
        self.assertIn("allow_private_external_ai:", text)
        self.assertIn("semantic_provider:", text)
        self.assertIn("semantic_model:", text)
        self.assertIn("inputs.semantic_review == true", text)

    def test_old_hard_coded_inventory_totals_are_not_in_workflow(self):
        text = WORKFLOW.read_text(encoding="utf-8")
        self.assertNotIn("PORTFOLIO_EXPECTED_TOTAL:", text)
        self.assertNotIn("PORTFOLIO_EXPECTED_PRIVATE:", text)

    def test_private_semantic_outputs_are_not_committed_or_uploaded(self):
        text = WORKFLOW.read_text(encoding="utf-8")
        semantic_section = text.split("  semantic-review:", 1)[1]
        self.assertIn("private-evidence/manual-semantic-review.json", semantic_section)
        self.assertNotIn("git add private-evidence", semantic_section)
        self.assertNotIn("upload-artifact", semantic_section)

    def test_semantic_summary_script_is_smoke_tested_by_unit_suite(self):
        self.assertTrue((ROOT / "scripts" / "semantic_review_summary.py").exists())
        self.assertTrue((ROOT / "schemas" / "semantic_review.schema.json").exists())


if __name__ == "__main__":
    unittest.main()
