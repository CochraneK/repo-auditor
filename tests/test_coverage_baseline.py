import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import coverage_baseline as cb


class CoverageBaselineTests(unittest.TestCase):
    def test_lower_bound_contains_counts_not_names(self):
        scan = {"repositories": [
            {"repository": "CochraneK/public", "visibility": "public"},
            {"repository": "CochraneK/private-secret", "visibility": "private"},
        ], "failures": []}
        result = cb.build_baseline(scan, "lower-bound")
        self.assertEqual(result["minimum_total"], 2)
        self.assertEqual(result["minimum_private"], 1)
        self.assertNotIn("private-secret", repr(result))
        self.assertFalse(result["private_names_published"])

    def test_exact_requires_explicit_complete_visibility(self):
        with self.assertRaises(ValueError):
            cb.build_baseline({"repositories": [], "failures": []}, "exact", False)

    def test_exact_refuses_failures(self):
        with self.assertRaises(ValueError):
            cb.build_baseline(
                {"repositories": [], "failures": [{"repository": "x", "error": "failed"}]},
                "exact",
                True,
            )


if __name__ == "__main__":
    unittest.main()
