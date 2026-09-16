import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import repository_triage as t

class RepositoryTriageTests(unittest.TestCase):
    def test_deterministic_findings_are_separate_from_semantic_audit(self):
        r={'repository':'CochraneK/x','visibility':'public','readme':False,'license':False,'security_policy':False,'workflow_count':1,'head_ci_green':False,'unpinned_action_refs':2}
        result=t.triage({'repositories':[r]}); codes={x['code'] for x in result['repositories'][0]['findings']}
        self.assertEqual(result['scope'],'deterministic-repository-triage')
        self.assertIn('DOC-README-MISSING',codes); self.assertIn('CI-HEAD-NOT-GREEN',codes); self.assertIn('SUPPLY-ACTION-UNPINNED',codes)
    def test_clean_engineering_record_can_have_zero_triage_findings(self):
        r={'repository':'CochraneK/x','visibility':'public','readme':True,'license':True,'security_policy':True,'workflow_count':1,'head_ci_green':True,'unpinned_action_refs':0}
        self.assertEqual(t.triage({'repositories':[r]})['repositories'][0]['finding_count'],0)
if __name__=='__main__': unittest.main()
