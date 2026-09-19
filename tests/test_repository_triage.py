import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import repository_triage as t

class TriageTests(unittest.TestCase):
 def test_findings(self):
  r={
   'repository':'x/y','visibility':'public','readme':False,'license':False,
   'security_policy':False,'workflow_count':1,'head_ci_green':False,
   'unpinned_action_refs':2,'agents':False,'handoff':False,'status_file':False,
   'decisions':False,'architecture_doc':False,'validation_documented':False,
   'readme_visual':False,'readme_quickstart':False,
  }
  result=t.triage({'repositories':[r]})
  codes={x['code'] for x in result['repositories'][0]['findings']}
  self.assertIn('DOC-README-MISSING',codes)
  self.assertIn('CI-HEAD-NOT-GREEN',codes)
  self.assertIn('AI-HANDOFF-MISSING',codes)
  self.assertIn('AI-ARCHITECTURE-MISSING',codes)
  self.assertEqual(result['scope'],'deterministic-repository-triage')

 def test_ready_repo_avoids_ai_findings(self):
  r={
   'repository':'x/y','visibility':'public','readme':True,'license':True,
   'security_policy':True,'workflow_count':0,'head_ci_green':False,
   'unpinned_action_refs':0,'agents':True,'handoff':True,'status_file':True,
   'decisions':True,'architecture_doc':True,'validation_documented':True,
   'readme_visual':True,'readme_quickstart':True,
  }
  codes={x['code'] for x in t.triage({'repositories':[r]})['repositories'][0]['findings']}
  self.assertFalse(any(code.startswith('AI-') for code in codes))

if __name__=='__main__':unittest.main()
