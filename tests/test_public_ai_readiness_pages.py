from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PublicAIReadinessPagesTests(unittest.TestCase):
    def test_pages_consumes_public_ai_readiness_map(self):
        js = (ROOT / "docs" / "app.js").read_text(encoding="utf-8")
        self.assertIn("overview?.public_ai_readiness", js)
        self.assertIn("aiReadinessChip", js)
        self.assertIn("enrichAIReadiness(repos)", js)

    def test_ai_readiness_styles_are_compact_badges(self):
        css = (ROOT / "docs" / "styles.css").read_text(encoding="utf-8")
        self.assertIn(".badge.ai-readiness.ready", css)
        self.assertIn(".badge.ai-readiness.partial", css)
        self.assertIn(".badge.ai-readiness.not-ready", css)


if __name__ == "__main__":
    unittest.main()
