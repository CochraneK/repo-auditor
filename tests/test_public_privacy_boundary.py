import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class PublicPrivacyBoundaryTests(unittest.TestCase):
    def test_known_private_audit_artifacts_are_not_public(self):
        # Regression for the visibility-drift incident: public audit storage must
        # never retain artifacts for repositories known to be private.
        self.assertFalse(any((ROOT/'audits').glob('long-gate-*')))
    def test_legacy_root_pages_sources_are_absent(self):
        for path in ('index.html','app.js','styles.css','data'):
            self.assertFalse((ROOT/path).exists(),f'legacy duplicate Pages source still exists: {path}')
if __name__=='__main__':unittest.main()
