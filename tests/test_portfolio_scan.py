import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import scan_portfolio as scan

def rec(name,visibility='public'):
 return {'repository':name,'visibility':visibility,'readme':True,'license':False,'security_policy':False,'workflow_count':0,'unpinned_action_refs':0,'head_ci_green':False}
class PortfolioScanTest(unittest.TestCase):
 def test_private_names_never_publish(self):
  s=scan.public_summary('CochraneK',[rec('CochraneK/public'),rec('CochraneK/secret-private-name','private')],[]);self.assertNotIn('secret-private-name',str(s))
 def test_33_public_zero_private_is_partial_when_42_9_expected(self):
  s=scan.public_summary('CochraneK',[rec(f'CochraneK/r{i}') for i in range(33)],[],42,9,True);self.assertEqual(s['audit_status'],'PARTIAL');self.assertEqual(s['coverage']['status'],'partial')
 def test_complete_inventory_can_pass(self):
  rows=[rec(f'CochraneK/r{i}') for i in range(33)]+[rec(f'CochraneK/p{i}','private') for i in range(9)];s=scan.public_summary('CochraneK',rows,[],42,9,True);self.assertEqual(s['audit_status'],'PASS')
if __name__=='__main__':unittest.main()
