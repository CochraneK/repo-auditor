import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import ai_readiness as ar


class SelfAIReadinessTests(unittest.TestCase):
    def test_repo_auditor_dogfoods_ai_readiness(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        docs = [p.relative_to(ROOT).as_posix() for p in (ROOT / "docs").rglob("*.md") if "architect" in p.name.lower()]
        validation_text = "\n".join(
            p.read_text(encoding="utf-8")
            for p in [ROOT / "README.md", ROOT / "AGENTS.md", ROOT / "HANDOFF.md"]
        )
        evidence = {
            "repository": "CochraneK/repo-auditor",
            "common_files": {"README.md": (ROOT / "README.md").exists()},
            "ai_readiness_files": {
                "AGENTS.md": (ROOT / "AGENTS.md").exists(),
                "HANDOFF.md": (ROOT / "HANDOFF.md").exists(),
                "STATUS.md": (ROOT / "STATUS.md").exists(),
                "DECISIONS.md": (ROOT / "DECISIONS.md").exists(),
                "architecture_docs": docs,
                "validation_documented": bool(re.search(r"python\s+-m\s+unittest|pytest|npm\s+test", validation_text, re.I)),
            },
            "readme_quality": {
                "has_visual": "mermaid" in readme.lower() or "<img" in readme.lower(),
                "has_quick_start": bool(re.search(r"(?im)^#{1,4}\s*(quick\s*start|getting\s*started|快速开始)", readme)),
            },
        }
        result = ar.assess(evidence)
        self.assertEqual(result["readiness_state"], "AI_READY", result)
        self.assertGreaterEqual(result["readiness_score"], 85, result)


if __name__ == "__main__":
    unittest.main()
