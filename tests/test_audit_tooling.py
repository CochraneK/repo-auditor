from __future__ import annotations

import io
import json
import sys
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import audit_freshness as af
import collect_repo_evidence as cre


class CollectorTests(unittest.TestCase):
    def test_action_refs_distinguish_sha_pin_from_mutable_tag(self):
        text = """
        steps:
          - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262
          - uses: actions/setup-python@v5
          - uses: docker://alpine@sha256:abc
        """
        with mock.patch.object(cre, "content_text", return_value=text):
            result = cre.action_refs("CochraneK/example", [".github/workflows/test.yml"], "deadbeef")
        self.assertEqual(len(result["references"]), 3)
        self.assertEqual([item["immutable_ref"] for item in result["references"]], [True, False, True])
        self.assertEqual(len(result["unpinned"]), 1)

    def test_collect_refuses_private_repository(self):
        with mock.patch.object(cre, "request_json", return_value={"private": True}):
            with self.assertRaisesRegex(RuntimeError, "refuses private repositories"):
                cre.collect("CochraneK/private-example")

    def test_collect_deduplicates_head_workflow_runs(self):
        sha = "a" * 40

        def fake_request(path):
            if path == "/repos/CochraneK/example":
                return {
                    "private": False,
                    "default_branch": "main",
                    "description": "demo",
                    "homepage": None,
                    "topics": [],
                    "license": {"spdx_id": "MIT"},
                    "has_issues": True,
                    "has_discussions": False,
                }
            if path == "/repos/CochraneK/example/branches/main":
                return {"commit": {"sha": sha}}
            if path == f"/repos/CochraneK/example/git/trees/{sha}?recursive=1":
                return {"tree": [{"path": "README.md", "type": "blob"}]}
            if path.startswith("/repos/CochraneK/example/actions/runs?"):
                return {
                    "workflow_runs": [
                        {"head_sha": sha, "name": "test", "status": "completed", "conclusion": "success", "html_url": "one"},
                        {"head_sha": sha, "name": "test", "status": "completed", "conclusion": "failure", "html_url": "older-duplicate"},
                        {"head_sha": "b" * 40, "name": "other", "status": "completed", "conclusion": "success", "html_url": "other"},
                    ]
                }
            raise AssertionError(path)

        with mock.patch.object(cre, "request_json", side_effect=fake_request):
            result = cre.collect("CochraneK/example")
        self.assertEqual(list(result["head_workflow_runs"]), ["test"])
        self.assertEqual(result["head_workflow_runs"]["test"]["conclusion"], "success")

    def test_request_json_wraps_http_error(self):
        error = urllib.error.HTTPError(
            "https://api.github.com/demo", 403, "Forbidden", hdrs=None, fp=io.BytesIO(b'{"message":"rate limited"}')
        )
        with mock.patch.object(cre.urllib.request, "urlopen", side_effect=error):
            with self.assertRaisesRegex(RuntimeError, "GitHub API 403"):
                cre.request_json("/demo")


class FreshnessTests(unittest.TestCase):
    def test_latest_sidecar_selected_per_repository(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            base = {
                "schema_version": 1,
                "repository": "CochraneK/example",
                "audited_commit": "a" * 40,
            }
            (root / "example-2026-09-15.json").write_text(
                json.dumps({**base, "audit_date": "2026-09-15"}), encoding="utf-8"
            )
            (root / "example-2026-09-16.json").write_text(
                json.dumps({**base, "audit_date": "2026-09-16", "audited_commit": "b" * 40}), encoding="utf-8"
            )
            latest = af.load_latest_sidecars(root)
        self.assertEqual(len(latest), 1)
        self.assertEqual(latest[0][1]["audited_commit"], "b" * 40)

    def test_check_marks_current_and_stale(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "a.json").write_text(
                json.dumps({
                    "repository": "CochraneK/a",
                    "audit_date": "2026-09-16",
                    "audited_commit": "a" * 40,
                }),
                encoding="utf-8",
            )
            (root / "b.json").write_text(
                json.dumps({
                    "repository": "CochraneK/b",
                    "audit_date": "2026-09-16",
                    "audited_commit": "b" * 40,
                }),
                encoding="utf-8",
            )

            heads = {"CochraneK/a": "a" * 40, "CochraneK/b": "c" * 40}
            with mock.patch.object(af, "default_head", side_effect=lambda repo: heads[repo]):
                result = af.check(root)

        self.assertEqual([item["state"] for item in result], ["current", "stale"])

    def test_metadata_only_changes_can_be_current_equivalent(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "self.json").write_text(
                json.dumps({
                    "repository": "CochraneK/repo-auditor",
                    "audit_date": "2026-09-16",
                    "audited_commit": "a" * 40,
                    "freshness": {"ignore_paths": ["audits/**", "portfolio/registry.json"]},
                }),
                encoding="utf-8",
            )
            with mock.patch.object(af, "default_head", return_value="b" * 40), mock.patch.object(
                af, "changed_files", return_value=[
                    "audits/repo-auditor-2026-09-16.json",
                    "audits/repo-auditor-2026-09-16.md",
                    "portfolio/registry.json",
                ]
            ):
                result = af.check(root)

        self.assertEqual(result[0]["state"], "current-equivalent")

    def test_nonignored_change_makes_metadata_aware_audit_stale(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "self.json").write_text(
                json.dumps({
                    "repository": "CochraneK/repo-auditor",
                    "audit_date": "2026-09-16",
                    "audited_commit": "a" * 40,
                    "freshness": {"ignore_paths": ["audits/**", "portfolio/registry.json"]},
                }),
                encoding="utf-8",
            )
            with mock.patch.object(af, "default_head", return_value="b" * 40), mock.patch.object(
                af, "changed_files", return_value=[
                    "audits/repo-auditor-2026-09-16.json",
                    "docs/app.js",
                ]
            ):
                result = af.check(root)

        self.assertEqual(result[0]["state"], "stale")

    def test_empty_compare_is_fail_closed_when_sha_moved(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "self.json").write_text(
                json.dumps({
                    "repository": "CochraneK/repo-auditor",
                    "audit_date": "2026-09-16",
                    "audited_commit": "a" * 40,
                    "freshness": {"ignore_paths": ["audits/**"]},
                }),
                encoding="utf-8",
            )
            with mock.patch.object(af, "default_head", return_value="b" * 40), mock.patch.object(
                af, "changed_files", return_value=[]
            ):
                result = af.check(root)

        self.assertEqual(result[0]["state"], "stale")


if __name__ == "__main__":
    unittest.main()
