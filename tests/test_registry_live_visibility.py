import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import audit_registry

class RegistryLiveVisibilityTests(unittest.TestCase):
    def test_validation_can_flag_live_private_drift(self):
        data={'scope':'public-workbench','owner':'CochraneK','repositories':[{'name':'x','visibility':'public','work_status':'CONTINUE','priority_score':50,'priority_band':'P2-PLANNED','reason':'x','last_commit_date':'2026-01-01'}]}
        old=audit_registry.live_visibility
        try:
            audit_registry.live_visibility=lambda owner,name,token:'private'
            errors=audit_registry.validate(data,'token')
        finally:audit_registry.live_visibility=old
        self.assertTrue(any('live GitHub visibility is not public' in e for e in errors))
if __name__=='__main__':unittest.main()
