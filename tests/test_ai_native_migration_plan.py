import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import ai_native_migration_plan as mp


class MigrationPlanTests(unittest.TestCase):
    def test_plan_prioritizes_public_registry_priority(self):
        scan = {"repositories": [
            {"repository": "CochraneK/low", "visibility": "public", "ai_readiness_score": 20, "ai_readiness_state": "NOT_READY"},
            {"repository": "CochraneK/high", "visibility": "public", "ai_readiness_score": 40, "ai_readiness_state": "NOT_READY"},
        ]}
        registry = {"repositories": [
            {"name": "high", "priority_score": 95, "priority_band": "P0-NOW", "work_status": "CONTINUE"},
            {"name": "low", "priority_score": 10, "priority_band": "P4-LOW", "work_status": "CONTINUE"},
        ]}
        plan = mp.build_plan(scan, registry)
        self.assertEqual(plan["repositories"][0]["repository"], "CochraneK/high")

    def test_private_names_not_in_public_summary(self):
        plan = {"repositories": [
            {"repository": "CochraneK/public", "visibility": "public", "ai_readiness_state": "AI_READY", "action_count": 0},
            {"repository": "CochraneK/secret-name", "visibility": "private", "ai_readiness_state": "NOT_READY", "action_count": 3},
        ]}
        summary = mp.public_summary(plan)
        self.assertNotIn("secret-name", repr(summary))
        self.assertFalse(summary["private_names_published"])

    def test_missing_handoff_creates_contextual_action(self):
        actions = mp.action_plan({"handoff": False})
        handoff = next(item for item in actions if item["code"] == "AI-HANDOFF")
        self.assertFalse(handoff["auto_merge"])
        self.assertEqual(handoff["mode"], "scaffold-then-contextualize")


if __name__ == "__main__":
    unittest.main()
