import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import sanitize_public_registry as s
class SanitizeRegistryTests(unittest.TestCase):
    def test_private_drift_is_removed(self):
        data={'owner':'x','repositories':[{'name':'a','visibility':'public'},{'name':'b','visibility':'public'}]}
        clean,removed=s.sanitize(data,lambda o,n:'private' if n=='b' else 'public')
        self.assertEqual([r['name'] for r in clean['repositories']],['a']);self.assertEqual(removed,['b'])
if __name__=='__main__':unittest.main()
