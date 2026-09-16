import importlib.util
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("scan_portfolio", SCRIPTS / "scan_portfolio.py")
scan = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scan)


class PortfolioScanTest(unittest.TestCase):
    def test_public_summary_never_contains_private_names(self):
        records = [
            {"repository": "CochraneK/public-one", "visibility": "public", "readme": True, "license": True, "security_policy": False, "workflow_count": 1, "unpinned_action_refs": 0, "head_ci_green": True},
            {"repository": "CochraneK/secret-private-name", "visibility": "private", "readme": True, "license": False, "security_policy": True, "workflow_count": 0, "unpinned_action_refs": 0, "head_ci_green": False},
            {"repository": "CochraneK/repo-auditor", "visibility": "public", "readme": True, "license": False, "security_policy": True, "workflow_count": 1, "unpinned_action_refs": 1, "head_ci_green": False},
        ]
        summary = scan.public_summary("CochraneK", records, [])
        text = str(summary)
        self.assertNotIn("secret-private-name", text)
        self.assertEqual(summary["inventory"]["total"], 3)
        self.assertEqual(summary["inventory"]["private"], 1)
        self.assertTrue(summary["self_audit"]["included"])

    def test_failures_are_counted_without_names(self):
        summary = scan.public_summary("CochraneK", [], [{"repository": "CochraneK/hidden", "error": "x"}])
        self.assertEqual(summary["inventory"]["total"], 1)
        self.assertEqual(summary["inventory"]["scan_failures"], 1)
        self.assertNotIn("hidden", str(summary))


if __name__ == "__main__":
    unittest.main()
