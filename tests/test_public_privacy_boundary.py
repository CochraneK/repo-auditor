import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class PublicPrivacyBoundaryTests(unittest.TestCase):
    def test_public_audits_do_not_contain_known_private_repo_names(self):
        # Regression contract for the public control plane. This list contains
        # names already known to this repository's maintainer; no private file
        # content is read by this test.
        private_names={'academia-uni','AI-persona','charity-intelligence','CunyiKang_Web','DingLab','DingWeb','dongassi','long-gate','novel-white-corridor'}
        text='\n'.join(p.name for p in (ROOT/'audits').glob('*') if p.is_file())
        for name in private_names: self.assertNotIn(name,text,f'private repository name leaked through public audits/: {name}')
    def test_legacy_root_pages_sources_are_absent(self):
        for path in ('index.html','app.js','styles.css','data'):
            self.assertFalse((ROOT/path).exists(),f'legacy duplicate Pages source still exists: {path}')

if __name__=='__main__': unittest.main()
