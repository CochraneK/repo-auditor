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
import build_public_pages as bpp
import audit_reports as ar
import collect_repo_evidence as cre
import publication_gate as pg
import remediation_queue as rq


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
            with self.assertRaisesRegex(RuntimeError, "unless --allow-private"):
                cre.collect("CochraneK/private-example")

    def test_collect_can_explicitly_read_private_repository(self):
        sha = "a" * 40

        def fake_request(path):
            if path == "/repos/CochraneK/private-example":
                return {
                    "private": True,
                    "default_branch": "main",
                    "description": "private demo",
                    "homepage": None,
                    "topics": [],
                    "license": None,
                    "has_issues": True,
                    "has_discussions": False,
                }
            if path == "/repos/CochraneK/private-example/branches/main":
                return {"commit": {"sha": sha}}
            if path == f"/repos/CochraneK/private-example/git/trees/{sha}?recursive=1":
                return {"tree": [{"path": "README.md", "type": "blob"}]}
            if path.startswith("/repos/CochraneK/private-example/actions/runs?"):
                return {"workflow_runs": []}
            raise AssertionError(path)

        with mock.patch.object(cre, "request_json", side_effect=fake_request):
            result = cre.collect(
                "CochraneK/private-example",
                allow_private=True,
            )
        self.assertFalse(result["public"])
        self.assertEqual(result["visibility"], "private")

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


class PublicPagesBundleTests(unittest.TestCase):
    def _audit(self, repository: str, visibility: str = "public"):
        return {
            "repository": repository,
            "publication_gate": {
                "current_visibility": visibility,
            },
        }

    def test_build_public_bundle_copies_only_public_records(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            registry = root / "registry.json"
            audits = root / "audits"
            out = root / "docs" / "data"
            audits.mkdir()
            registry.write_text(
                json.dumps({
                    "scope": "public-workbench",
                    "repositories": [{
                        "name": "example",
                        "visibility": "public",
                        "latest_audit": "audits/example-2026-09-16.md",
                    }],
                }),
                encoding="utf-8",
            )
            (audits / "example-2026-09-16.json").write_text(
                json.dumps(self._audit("CochraneK/example")),
                encoding="utf-8",
            )
            manifest = bpp.build(registry, audits, out)
            bundled = json.loads(
                (out / "registry.json").read_text(encoding="utf-8")
            )
        self.assertEqual(manifest["repository_count"], 1)
        self.assertEqual(bundled["repositories"][0]["name"], "example")
        self.assertFalse(manifest["private_repository_metadata_included"])

    def test_build_public_bundle_refuses_private_record(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            registry = root / "registry.json"
            audits = root / "audits"
            audits.mkdir()
            registry.write_text(
                json.dumps({
                    "repositories": [{
                        "name": "secret",
                        "visibility": "private",
                    }],
                }),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(
                bpp.PublicBundleError,
                "refuses non-public",
            ):
                bpp.build(registry, audits, root / "out")

    def test_build_public_bundle_refuses_private_audit_sidecar(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            registry = root / "registry.json"
            audits = root / "audits"
            audits.mkdir()
            registry.write_text(
                json.dumps({
                    "repositories": [{
                        "name": "example",
                        "visibility": "public",
                        "latest_audit": "audits/example-2026-09-16.md",
                    }],
                }),
                encoding="utf-8",
            )
            (audits / "example-2026-09-16.json").write_text(
                json.dumps(
                    self._audit(
                        "CochraneK/example",
                        visibility="private",
                    )
                ),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(
                bpp.PublicBundleError,
                "non-public audit sidecar",
            ):
                bpp.build(registry, audits, root / "out")


class QualityDimensionTests(unittest.TestCase):
    def complete_profile(self):
        return {
            name: {"score": 3, "evidence": ["fixture evidence"]}
            for name in ar.QUALITY_DIMENSIONS
        }

    def test_complete_quality_profile_is_valid(self):
        self.assertEqual(ar.validate_quality_dimensions(self.complete_profile()), [])

    def test_unknown_dimension_is_rejected(self):
        profile = self.complete_profile()
        profile["mystery"] = {"score": 5, "evidence": ["nope"]}
        errors = ar.validate_quality_dimensions(profile)
        self.assertTrue(any("unknown dimensions" in error for error in errors))

    def test_null_score_is_allowed_but_needs_evidence(self):
        profile = self.complete_profile()
        profile["community_surface"] = {
            "score": None,
            "evidence": ["Repository administration state was not verifiable."],
        }
        self.assertEqual(ar.validate_quality_dimensions(profile), [])

    def test_out_of_range_score_is_rejected(self):
        profile = self.complete_profile()
        profile["correctness"]["score"] = 6
        errors = ar.validate_quality_dimensions(profile)
        self.assertTrue(any("0..5 or null" in error for error in errors))


class RemediationQueueTests(unittest.TestCase):
    def test_queue_only_returns_open_auto_fix_findings(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "a.json").write_text(
                json.dumps({
                    "repository": "CochraneK/example",
                    "audit_date": "2026-09-16",
                    "findings": [
                        {
                            "id": "EX-P1-001",
                            "severity": "P1",
                            "title": "Auto",
                            "status": "open",
                            "recommendation": "Fix it",
                            "remediation_class": "auto-fix",
                        },
                        {
                            "id": "EX-P1-002",
                            "severity": "P1",
                            "title": "Owner choice",
                            "status": "open",
                            "recommendation": "Choose",
                            "remediation_class": "owner-choice",
                        },
                        {
                            "id": "EX-P2-001",
                            "severity": "P2",
                            "title": "Already fixed",
                            "status": "fixed",
                            "recommendation": "Done",
                            "remediation_class": "auto-fix",
                        },
                    ],
                }),
                encoding="utf-8",
            )
            queue = rq.remediation_queue(root)
        self.assertEqual([item["id"] for item in queue], ["EX-P1-001"])

    def test_queue_can_filter_repository(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for name in ("a", "b"):
                (root / f"{name}.json").write_text(
                    json.dumps({
                        "repository": f"CochraneK/{name}",
                        "audit_date": "2026-09-16",
                        "findings": [{
                            "id": f"{name.upper()}-P2-001",
                            "severity": "P2",
                            "title": "Auto",
                            "status": "open",
                            "recommendation": "Fix",
                            "remediation_class": "auto-fix",
                        }],
                    }),
                    encoding="utf-8",
                )
            queue = rq.remediation_queue(root, "CochraneK/b")
        self.assertEqual([item["repository"] for item in queue], ["CochraneK/b"])


class PublicationGateTests(unittest.TestCase):
    def test_private_patent_candidate_requires_review(self):
        result = pg.evaluate(current_visibility="private", patent_candidate=True)
        self.assertEqual(result.recommendation, "review-before-public")

    def test_existing_public_background_can_split_new_work(self):
        result = pg.evaluate(
            current_visibility="public",
            patent_candidate=True,
            employer_or_client_requested=True,
            background_ip_exists=True,
        )
        self.assertEqual(result.recommendation, "split-public-private")
        self.assertTrue(any("background IP" in reason for reason in result.reasons))

    def test_unclear_ownership_fails_closed_private(self):
        result = pg.evaluate(current_visibility="private", ownership_unclear=True)
        self.assertEqual(result.recommendation, "keep-private")


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

    def test_unreachable_repository_is_unverifiable_without_aborting_batch(self):
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
            (root / "private.json").write_text(
                json.dumps({
                    "repository": "CochraneK/private",
                    "audit_date": "2026-09-16",
                    "audited_commit": "b" * 40,
                }),
                encoding="utf-8",
            )

            def resolve(repo):
                if repo == "CochraneK/private":
                    raise RuntimeError("GitHub API 404: Not Found")
                return "a" * 40

            with mock.patch.object(af, "default_head", side_effect=resolve):
                result = af.check(root)

        by_repo = {item["repository"]: item for item in result}
        self.assertEqual(by_repo["CochraneK/a"]["state"], "current")
        self.assertEqual(by_repo["CochraneK/private"]["state"], "unverifiable")
        self.assertIsNone(by_repo["CochraneK/private"]["head_commit"])
        self.assertIn("404", by_repo["CochraneK/private"]["error"])

    def test_compare_failure_is_unverifiable_not_current_equivalent(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "self.json").write_text(
                json.dumps({
                    "repository": "CochraneK/example",
                    "audit_date": "2026-09-16",
                    "audited_commit": "a" * 40,
                    "freshness": {"ignore_paths": ["audits/**"]},
                }),
                encoding="utf-8",
            )
            with mock.patch.object(af, "default_head", return_value="b" * 40), mock.patch.object(
                af, "changed_files", side_effect=RuntimeError("GitHub API 403: Forbidden")
            ):
                result = af.check(root)

        self.assertEqual(result[0]["state"], "unverifiable")
        self.assertIn("403", result[0]["error"])

    def test_authenticated_404_retries_anonymous_public_api(self):
        error = urllib.error.HTTPError(
            "https://api.github.com/demo",
            404,
            "Not Found",
            hdrs=None,
            fp=io.BytesIO(b'{"message":"Not Found"}'),
        )
        with mock.patch.dict(
            af.os.environ,
            {"GITHUB_TOKEN": "scoped-token"},
        ), mock.patch.object(
            af,
            "_request",
            side_effect=[error, {"ok": True}],
        ) as request:
            result = af.request_json("/demo")

        self.assertEqual(result, {"ok": True})
        self.assertEqual(
            request.call_args_list[0].args,
            ("/demo", "scoped-token"),
        )
        self.assertEqual(
            request.call_args_list[1].args,
            ("/demo", None),
        )

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
