import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import progress_report as pr


class ProgressReportTests(unittest.TestCase):
    def test_report_keeps_orthogonal_signals_and_public_focus(self):
        overview = {
            "generated_at": "2026-01-01T00:00:00Z",
            "audit_status": "PARTIAL",
            "inventory": {"observed_total": 2, "expected_total": 3, "private": 0, "expected_private": 1},
            "coverage": {
                "reasons": ["private coverage incomplete"],
                "evidence_collected": 2,
                "ai_ready": 1,
                "agents_present": 1,
                "handoff_present": 1,
                "continuity_full": 0,
                "repositories_with_unpinned_actions": 1,
                "readme_present": 2,
            },
        }
        registry = {
            "snapshot_date": "2026-01-01",
            "repositories": [
                {"name": "alpha", "visibility": "public", "work_status": "CONTINUE", "priority_score": 90, "priority_band": "P0-NOW"},
                {"name": "beta", "visibility": "public", "work_status": "STOP", "priority_score": 0, "priority_band": "STOP"},
            ],
        }
        text = pr.render(overview, registry)
        self.assertIn("Audit coverage: **PARTIAL**", text)
        self.assertIn("**alpha**", text)
        self.assertIn("Priority", text)
        self.assertIn("AI Readiness", text)
        self.assertNotIn("beta — STOP", text)

    def test_lower_bound_is_labeled_as_minimum(self):
        overview = {
            "generated_at": "2026-01-01T00:00:00Z",
            "audit_status": "PARTIAL",
            "inventory": {
                "observed_total": 10,
                "expected_total": 11,
                "private": 0,
                "expected_private": 1,
                "baseline_kind": "lower-bound",
            },
            "coverage": {"evidence_collected": 10, "reasons": []},
        }
        text = pr.render(overview, {"snapshot_date": "x", "repositories": []})
        self.assertIn("Coverage baseline: **lower-bound**", text)
        self.assertIn("10 / ≥11 baseline", text)


if __name__ == "__main__":
    unittest.main()
