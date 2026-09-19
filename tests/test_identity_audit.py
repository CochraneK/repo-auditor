import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import identity_audit as ia


class IdentityAuditTests(unittest.TestCase):
    def test_canonical_identity_passes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "README.md").write_text("Maintainer: CochraneK", encoding="utf-8")
            result = ia.audit(root)
            self.assertEqual(result["status"], "PASS")

    def test_legacy_variant_fails_without_echoing_value(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            legacy = "Cunyi" + "Kang"
            (root / "README.md").write_text("owner: " + legacy, encoding="utf-8")
            result = ia.audit(root)
            self.assertEqual(result["status"], "FAIL")
            self.assertEqual(result["findings"][0]["canonical"], "CochraneK")
            self.assertNotIn(legacy, repr(result["findings"]))

    def test_explicit_personal_site_exemption(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "README.md").write_text("owner: " + ("Cunyi" + "Kang"), encoding="utf-8")
            result = ia.audit(root, allow_legacy_identity=True)
            self.assertEqual(result["status"], "EXEMPT")
            self.assertEqual(result["findings"], [])


if __name__ == "__main__":
    unittest.main()
