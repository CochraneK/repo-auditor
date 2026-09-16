from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import build_public_pages as bpp
import collect_repo_evidence as cre


class VisibilityGateTests(unittest.TestCase):
    def test_stale_public_record_is_excluded_when_live_repo_is_private(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            registry = root / "registry.json"
            audits = root / "audits"
            out = root / "out"
            audits.mkdir()
            registry.write_text(json.dumps({
                "owner": "CochraneK",
                "repositories": [
                    {"name": "public-one", "visibility": "public"},
                    {"name": "became-private", "visibility": "public"},
                ],
            }), encoding="utf-8")

            def visibility(repo: str) -> str:
                return "private" if repo.endswith("became-private") else "public"

            manifest = bpp.build(registry, audits, out, visibility_resolver=visibility)
            bundle = json.loads((out / "registry.json").read_text(encoding="utf-8"))
            serialized = json.dumps(bundle)

        self.assertEqual(manifest["repository_count"], 1)
        self.assertEqual(manifest["live_visibility_exclusions"], 1)
        self.assertNotIn("became-private", serialized)
        self.assertIn("public-one", serialized)

    def test_visibility_lookup_failure_fails_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            registry = root / "registry.json"
            audits = root / "audits"
            audits.mkdir()
            registry.write_text(json.dumps({"owner": "CochraneK", "repositories": [{"name": "example", "visibility": "public"}]}), encoding="utf-8")

            def unavailable(_: str) -> str:
                raise bpp.PublicBundleError("verification unavailable")

            with self.assertRaises(bpp.PublicBundleError):
                bpp.build(registry, audits, root / "out", visibility_resolver=unavailable)

    def test_cli_passes_allow_private_to_collector(self):
        argv = ["collect_repo_evidence.py", "CochraneK/private-example", "--allow-private"]
        fixture = {"repository": "CochraneK/private-example", "visibility": "private"}
        with mock.patch.object(sys, "argv", argv), mock.patch.object(cre, "collect", return_value=fixture) as collect:
            cre.main()
        collect.assert_called_once_with("CochraneK/private-example", allow_private=True)


if __name__ == "__main__":
    unittest.main()
