import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import semantic_review as sr


class SemanticReviewTests(unittest.TestCase):
    def test_endpoints(self):
        self.assertEqual(sr.endpoint("https://api.deepseek.com"), "https://api.deepseek.com/chat/completions")
        self.assertEqual(sr.endpoint("https://open.bigmodel.cn/api/paas/v4"), "https://open.bigmodel.cn/api/paas/v4/chat/completions")
        self.assertEqual(sr.endpoint("http://localhost:3001/v1"), "http://localhost:3001/v1/chat/completions")

    def test_json_extraction(self):
        self.assertEqual(sr.extract_json('{"confidence":0.8}')["confidence"], 0.8)
        self.assertEqual(sr.extract_json('result: {"summary":"ok"} done')["summary"], "ok")

    def test_private_external_fails_closed(self):
        with self.assertRaises(PermissionError):
            sr.assert_private_policy({"visibility": "private"}, {"trust": "external"}, False)

    def test_local_private_allowed(self):
        sr.assert_private_policy({"visibility": "private"}, {"trust": "local"}, False)

    def test_deepseek_preset_uses_env_key(self):
        with patch.dict(os.environ, {"DEEPSEEK_API_KEY": "secret"}, clear=False):
            provider = sr.resolve_provider("deepseek", model="deepseek-chat")
        self.assertEqual(provider["api_key"], "secret")
        self.assertEqual(provider["trust"], "external")

    def test_no_secret_in_safe_metadata(self):
        provider = sr.resolve_provider("custom", base_url="https://example.test/v1", model="m", api_key="secret")
        safe = {k: v for k, v in provider.items() if k != "api_key"}
        self.assertNotIn("secret", repr(safe))


if __name__ == "__main__":
    unittest.main()
