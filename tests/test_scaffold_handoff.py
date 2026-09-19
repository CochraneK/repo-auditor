import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import scaffold_handoff as sh


class ScaffoldHandoffTests(unittest.TestCase):
    def test_dry_run_does_not_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            result = sh.scaffold(root, "lightweight", write=False)
            self.assertIn("HANDOFF.md", result["missing"])
            self.assertFalse((root / "HANDOFF.md").exists())

    def test_write_creates_missing_without_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            existing = root / "STATUS.md"
            existing.write_text("keep me", encoding="utf-8")
            result = sh.scaffold(root, "lightweight", write=True)
            self.assertTrue((root / "HANDOFF.md").exists())
            self.assertEqual(existing.read_text(encoding="utf-8"), "keep me")
            self.assertNotIn("STATUS.md", result["created"])

    def test_full_profile_contains_agent_handoff(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = sh.scaffold(Path(tmp), "full", write=False)
            self.assertIn("handoff/AGENT_HANDOFF.md", result["missing"])
            self.assertIn("handoff/SESSION_LOG.md", result["missing"])


if __name__ == "__main__":
    unittest.main()
