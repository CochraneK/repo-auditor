import io
import json
import os
import sys
import unittest
import urllib.error
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import semantic_review as sr


def valid_result():
    return {
        "summary": "ok",
        "confidence": 0.8,
        "findings": [
            {
                "code": "DOC-001",
                "severity": "P2",
                "title": "Missing context",
                "evidence": ["README.md"],
                "reasoning": "The evidence package lacks project context.",
                "remediation": "Add a concise project context section.",
                "confidence": 0.9,
                "auto_fixable": False,
                "requires_owner_decision": False,
            }
        ],
        "regression_candidates": [],
    }


class SemanticReviewTests(unittest.TestCase):
    def test_endpoints(self):
        self.assertEqual(
            sr.endpoint("https://api.deepseek.com"),
            "https://api.deepseek.com/chat/completions",
        )
        self.assertEqual(
            sr.endpoint("https://open.bigmodel.cn/api/paas/v4"),
            "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        )
        self.assertEqual(
            sr.endpoint("http://localhost:3001/v1"),
            "http://localhost:3001/v1/chat/completions",
        )

    def test_json_extraction(self):
        self.assertEqual(sr.extract_json('{"confidence":0.8}')["confidence"], 0.8)
        self.assertEqual(
            sr.extract_json('result: {"summary":"ok"} done')["summary"],
            "ok",
        )

    def test_validate_result_accepts_contract(self):
        self.assertEqual(sr.validate_result(valid_result())["summary"], "ok")

    def test_validate_result_rejects_missing_field(self):
        result = valid_result()
        del result["findings"][0]["remediation"]
        with self.assertRaises(ValueError):
            sr.validate_result(result)

    def test_validate_result_rejects_invalid_severity(self):
        result = valid_result()
        result["findings"][0]["severity"] = "critical"
        with self.assertRaises(ValueError):
            sr.validate_result(result)

    def test_private_external_fails_closed(self):
        with self.assertRaises(PermissionError):
            sr.assert_private_policy(
                {"visibility": "private"},
                {"trust": "external"},
                False,
            )

    def test_local_private_allowed(self):
        sr.assert_private_policy(
            {"visibility": "private"},
            {"trust": "local"},
            False,
        )

    def test_deepseek_preset_uses_env_key(self):
        with patch.dict(os.environ, {"DEEPSEEK_API_KEY": "secret"}, clear=False):
            provider = sr.resolve_provider("deepseek", model="deepseek-chat")
        self.assertEqual(provider["api_key"], "secret")
        self.assertEqual(provider["trust"], "external")

    def test_no_secret_in_safe_metadata(self):
        provider = sr.resolve_provider(
            "custom",
            base_url="https://example.test/v1",
            model="m",
            api_key="secret",
        )
        safe = {key: value for key, value in provider.items() if key != "api_key"}
        self.assertNotIn("secret", repr(safe))

    def test_error_categories(self):
        self.assertEqual(
            sr.classify_exception(
                urllib.error.HTTPError(
                    "https://example.test",
                    401,
                    "unauthorized",
                    {},
                    io.BytesIO(b""),
                )
            ),
            "auth",
        )
        self.assertEqual(
            sr.classify_exception(
                urllib.error.HTTPError(
                    "https://example.test",
                    429,
                    "rate limit",
                    {},
                    io.BytesIO(b""),
                )
            ),
            "rate-limit",
        )
        self.assertEqual(
            sr.classify_exception(
                urllib.error.HTTPError(
                    "https://example.test",
                    503,
                    "down",
                    {},
                    io.BytesIO(b""),
                )
            ),
            "provider-unavailable",
        )
        self.assertEqual(
            sr.classify_exception(ValueError("summary must be a string")),
            "malformed-output",
        )


if __name__ == "__main__":
    unittest.main()
