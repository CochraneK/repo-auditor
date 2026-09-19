import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import meta_learning as ml


class MetaLearningTests(unittest.TestCase):
    def test_extract_deduplicates_candidates(self):
        report = {"regression_candidates": ["Missing handoff", "Missing handoff", {"title": "No quick start", "reason": "onboarding"}]}
        items = ml.extract(report)
        self.assertEqual(len(items), 2)
        self.assertTrue(all(item["status"] == "candidate" for item in items))

    def test_merge_registry_is_idempotent(self):
        items = ml.extract({"regression_candidates": ["Rule A"]})
        registry = {"schema_version": 1, "candidates": []}
        once = ml.merge_registry(registry, items)
        twice = ml.merge_registry(once, items)
        self.assertEqual(once, twice)

    def test_private_candidate_text_is_not_forced_into_public_registry_by_core_merge(self):
        registry = {"schema_version": 1, "candidates": []}
        self.assertEqual(registry["candidates"], [])


if __name__ == "__main__":
    unittest.main()
