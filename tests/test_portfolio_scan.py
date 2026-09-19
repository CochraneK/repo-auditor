import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import scan_portfolio as scan


def rec(name, visibility="public"):
    return {
        "repository": name,
        "visibility": visibility,
        "readme": True,
        "license": False,
        "security_policy": False,
        "workflow_count": 0,
        "unpinned_action_refs": 0,
        "head_ci_green": False,
    }


class PortfolioScanTest(unittest.TestCase):
    def test_private_names_never_publish(self):
        summary = scan.public_summary(
            "CochraneK",
            [rec("CochraneK/public"), rec("CochraneK/secret-private-name", "private")],
            [],
        )
        self.assertNotIn("secret-private-name", str(summary))

    def test_exact_expected_inventory_can_detect_partial(self):
        summary = scan.public_summary(
            "CochraneK",
            [rec(f"CochraneK/r{i}") for i in range(33)],
            [],
            42,
            9,
            True,
        )
        self.assertEqual(summary["audit_status"], "PARTIAL")
        self.assertEqual(summary["coverage"]["status"], "partial")

    def test_exact_complete_inventory_can_pass(self):
        rows = [rec(f"CochraneK/r{i}") for i in range(33)]
        rows += [rec(f"CochraneK/p{i}", "private") for i in range(9)]
        summary = scan.public_summary("CochraneK", rows, [], 42, 9, True)
        self.assertEqual(summary["audit_status"], "PASS")

    def test_lower_bound_never_claims_complete_coverage(self):
        rows = [rec(f"CochraneK/r{i}") for i in range(36)]
        rows += [rec("CochraneK/p", "private")]
        summary = scan.public_summary(
            "CochraneK",
            rows,
            [],
            37,
            1,
            True,
            baseline_kind="lower-bound",
            baseline_verified_at="2026-09-19",
        )
        self.assertEqual(summary["audit_status"], "PARTIAL")
        self.assertIn("lower bound", " ".join(summary["coverage"]["reasons"]))
        self.assertEqual(summary["inventory"]["baseline_kind"], "lower-bound")

    def test_load_baseline_uses_privacy_safe_aggregate_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "baseline.json"
            path.write_text(
                json.dumps({
                    "kind": "lower-bound",
                    "minimum_total": 37,
                    "minimum_private": 1,
                    "verified_at": "2026-09-19",
                }),
                encoding="utf-8",
            )
            baseline = scan.load_baseline(path)
            self.assertEqual(baseline["minimum_total"], 37)
            self.assertNotIn("repositories", baseline)


if __name__ == "__main__":
    unittest.main()
