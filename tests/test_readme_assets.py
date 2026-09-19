import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import build_readme_assets as bra


class ReadmeAssetTests(unittest.TestCase):
    def test_readiness_uses_privacy_safe_aggregate(self):
        overview = {
            "audit_status": "PARTIAL",
            "inventory": {"observed_total": 10, "expected_total": 12},
            "coverage": {"ai_ready": 3, "agents_present": 4, "handoff_present": 2, "continuity_full": 1},
        }
        svg = bra.readiness(overview)
        self.assertIn("10/12", svg)
        self.assertIn("AI-ready", svg)
        self.assertIn("PARTIAL", svg)

    def test_build_writes_two_svg_assets(self):
        with tempfile.TemporaryDirectory() as tmp:
            paths = bra.build({"audit_status": "PASS", "inventory": {}, "coverage": {}}, Path(tmp))
            self.assertEqual({p.name for p in paths}, {"hero.svg", "portfolio-readiness.svg"})
            self.assertTrue(all(p.read_text(encoding="utf-8").startswith("<svg") for p in paths))


if __name__ == "__main__":
    unittest.main()
