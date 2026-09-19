#!/usr/bin/env python3
"""Turn evidence into deterministic findings without pretending it is semantic review."""
import argparse,json
from pathlib import Path
def findings(r):
    out=[]
    def add(code,severity,message):out.append({'code':code,'severity':severity,'message':message})
    if not r.get('readme'):add('DOC-README-MISSING','P1','README is missing or was not detected.')
    if not r.get('license'):add('GOV-LICENSE-MISSING','P2','No LICENSE detected; license choice remains an owner decision.')
    if not r.get('security_policy'):add('GOV-SECURITY-MISSING','P3','No SECURITY.md detected.')
    if r.get('workflow_count',0)>0 and not r.get('head_ci_green'):add('CI-HEAD-NOT-GREEN','P1','HEAD workflow evidence is not fully green.')
    if r.get('unpinned_action_refs',0)>0:add('SUPPLY-ACTION-UNPINNED','P1',f"{r['unpinned_action_refs']} unpinned GitHub Action reference(s) detected.")
    if r.get('readme') and not r.get('readme_quickstart',False):add('DOC-README-QUICKSTART-MISSING','P2','README does not expose a deterministic quick-start path.')
    if r.get('readme') and not r.get('readme_visual',False):add('DOC-README-VISUAL-MISSING','P3','README lacks a Mermaid diagram or meaningful visual.')
    if not r.get('agents',False):add('AI-AGENTS-MISSING','P2','AGENTS.md was not detected.')
    if not r.get('handoff',False):add('AI-HANDOFF-MISSING','P2','HANDOFF.md was not detected.')
    if not r.get('status_file',False):add('AI-STATUS-MISSING','P3','STATUS.md was not detected.')
    if not r.get('decisions',False):add('AI-DECISIONS-MISSING','P3','DECISIONS.md was not detected.')
    if not r.get('architecture_doc',False):add('AI-ARCHITECTURE-MISSING','P2','Architecture documentation was not detected.')
    if not r.get('validation_documented',False):add('AI-VALIDATION-MISSING','P2','Validation commands were not detected in README/AGENTS/HANDOFF.')
    return out
def triage(report):
    rows=[]
    for r in report.get('repositories',[]):
        fs=findings(r);rows.append({'repository':r['repository'],'visibility':r['visibility'],'finding_count':len(fs),'findings':fs})
    return {'schema_version':1,'scope':'deterministic-repository-triage','repositories':rows,'note':'Deterministic engineering triage is not a full semantic structured audit.'}
def main():
    p=argparse.ArgumentParser();p.add_argument('scan',type=Path);p.add_argument('--out',type=Path);a=p.parse_args();result=triage(json.loads(a.scan.read_text(encoding='utf-8')));text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if a.out:a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_text(text,encoding='utf-8')
    else:print(text,end='')
    return 0
if __name__=='__main__':raise SystemExit(main())
