import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class PrivacyBoundaryTests(unittest.TestCase):
 def test_known_private_audit_artifacts_are_not_public(self):self.assertFalse(any((ROOT/'audits').glob('long-gate-*')))
if __name__=='__main__':unittest.main()
