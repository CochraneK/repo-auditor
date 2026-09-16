import importlib.util
from pathlib import Path
import sys,unittest
ROOT=Path(__file__).resolve().parents[1]; SCRIPTS=ROOT/'scripts'; sys.path.insert(0,str(SCRIPTS)); spec=importlib.util.spec_from_file_location('scan_portfolio',SCRIPTS/'scan_portfolio.py'); scan=importlib.util.module_from_spec(spec); spec.loader.exec_module(scan)

def record(name,visibility='public'):
    return {'repository':name,'visibility':visibility,'readme':True,'license':False,'security_policy':False,'workflow_count':0,'unpinned_action_refs':0,'head_ci_green':False}
class PortfolioScanTest(unittest.TestCase):
    def test_public_summary_never_contains_private_names(self):
        records=[record('CochraneK/public-one'),record('CochraneK/secret-private-name','private'),record('CochraneK/repo-auditor')]
        summary=scan.public_summary('CochraneK',records,[],3,1,True); self.assertNotIn('secret-private-name',str(summary)); self.assertEqual(summary['inventory']['private'],1); self.assertEqual(summary['audit_status'],'PASS'); self.assertTrue(summary['self_audit']['included'])
    def test_failures_make_coverage_partial_without_names(self):
        summary=scan.public_summary('CochraneK',[],[{'repository':'CochraneK/hidden','error':'x'}],1,0,False); self.assertEqual(summary['audit_status'],'PARTIAL'); self.assertNotIn('hidden',str(summary))
    def test_missing_private_coverage_cannot_report_success(self):
        records=[record(f'CochraneK/public-{i}') for i in range(33)]
        summary=scan.public_summary('CochraneK',records,[],42,9,True); self.assertEqual(summary['audit_status'],'PARTIAL'); self.assertEqual(summary['coverage']['status'],'partial'); self.assertIn('private repository coverage is below expected inventory',summary['coverage']['reasons'])
if __name__=='__main__': unittest.main()
