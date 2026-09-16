import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import repository_triage as t
class TriageTests(unittest.TestCase):
 def test_findings(self):
  r={'repository':'x/y','visibility':'public','readme':False,'license':False,'security_policy':False,'workflow_count':1,'head_ci_green':False,'unpinned_action_refs':2};result=t.triage({'repositories':[r]});codes={x['code'] for x in result['repositories'][0]['findings']};self.assertIn('DOC-README-MISSING',codes);self.assertIn('CI-HEAD-NOT-GREEN',codes);self.assertEqual(result['scope'],'deterministic-repository-triage')
if __name__=='__main__':unittest.main()
