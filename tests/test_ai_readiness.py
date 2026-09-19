import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import ai_readiness as ar


class AIReadinessTests(unittest.TestCase):
    def test_full_repository_is_ready(self):
        evidence = {
            "repository": "x/y",
            "common_files": {"README.md": True},
            "ai_readiness_files": {
                "AGENTS.md": True,
                "HANDOFF.md": True,
                "STATUS.md": True,
                "DECISIONS.md": True,
                "architecture_docs": ["docs/architecture.md"],
                "validation_documented": True,
            },
            "readme_quality": {"has_visual": True, "has_quick_start": True},
        }
        result = ar.assess(evidence)
        self.assertEqual(result["readiness_score"], 100)
        self.assertEqual(result["readiness_state"], "AI_READY")
        self.assertEqual(result["findings"], [])

    def test_missing_handoff_is_reported(self):
        evidence = {
            "repository": "x/y",
            "common_files": {"README.md": True},
            "ai_readiness_files": {},
            "readme_quality": {},
        }
        result = ar.assess(evidence)
        codes = {item["code"] for item in result["findings"]}
        self.assertIn("AI-HANDOFF-MISSING", codes)
        self.assertIn("AI-VALIDATION-MISSING", codes)
        self.assertEqual(result["readiness_state"], "NOT_READY")


if __name__ == "__main__":
    unittest.main()
