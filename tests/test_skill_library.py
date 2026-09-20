from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_SKILLS = (
    "security-review",
    "README-review",
    "agent-handoff-review",
    "ai-readiness-review",
    "canonical-identity-review",
    "privacy-boundary-review",
    "asset-provenance-review",
    "inference-claim-review",
)


class SkillLibraryTests(unittest.TestCase):
    def test_required_skills_exist_and_define_purpose_and_output(self):
        for name in REQUIRED_SKILLS:
            path = ROOT / "skills" / name / "SKILL.md"
            self.assertTrue(path.is_file(), name)
            text = path.read_text(encoding="utf-8")
            self.assertIn("## Purpose", text, name)
            self.assertIn("## Output", text, name)

    def test_new_privacy_and_claim_skills_preserve_uncertainty(self):
        privacy = (ROOT / "skills" / "privacy-boundary-review" / "SKILL.md").read_text(encoding="utf-8")
        provenance = (ROOT / "skills" / "asset-provenance-review" / "SKILL.md").read_text(encoding="utf-8")
        claims = (ROOT / "skills" / "inference-claim-review" / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn("unverified", privacy)
        self.assertIn("unresolved", provenance)
        self.assertIn("evidence gap", claims)


if __name__ == "__main__":
    unittest.main()
