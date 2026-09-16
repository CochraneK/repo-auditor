import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"scripts"))
import visual_ux_audit

class VisualUXAuditTests(unittest.TestCase):
    def test_unbounded_repo_copy_is_detected(self):
        html='<style>.repo{display:block}.repo p{min-height:54px}</style><div class="repo"><p>long</p></div>'
        ids={x['id'] for x in visual_ux_audit.audit_text(html)}
        self.assertIn('UI-TEXT-001',ids); self.assertIn('UI-WRAP-001',ids)
    def test_bounded_copy_passes_text_rules(self):
        html='<style>.repo{height:100%}.repo p{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}</style>'
        ids={x['id'] for x in visual_ux_audit.audit_text(html)}
        self.assertNotIn('UI-TEXT-001',ids); self.assertNotIn('UI-WRAP-001',ids); self.assertNotIn('UI-CARD-001',ids)

if __name__=='__main__': unittest.main()
