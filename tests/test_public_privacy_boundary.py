import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

class PublicPrivacyBoundaryTests(unittest.TestCase):
    def test_public_audits_are_subset_of_live_public_registry(self):
        registry=json.loads((ROOT/'docs/data/registry.json').read_text(encoding='utf-8'))
        public_names={r['name'] for r in registry.get('repositories',[])}
        for p in (ROOT/'audits').glob('*.json'):
            if p.name.startswith('schema-'): continue
            data=json.loads(p.read_text(encoding='utf-8'))
            repo=data.get('repository') or data.get('repo') or ''
            short=repo.split('/')[-1] if repo else p.name.rsplit('-',3)[0]
            self.assertIn(short,public_names,f'audit is not eligible for the public control plane: {p.name}')
    def test_legacy_root_pages_sources_are_absent(self):
        for path in ('index.html','app.js','styles.css','data'):
            self.assertFalse((ROOT/path).exists(),f'legacy duplicate Pages source still exists: {path}')

if __name__=='__main__': unittest.main()
