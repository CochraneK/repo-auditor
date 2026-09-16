#!/usr/bin/env python3
"""Generate privacy-safe deterministic triage from account scan evidence.

Triage is deliberately not called a semantic/structured audit. It turns observed
engineering signals into actionable finding codes without pretending to judge
product, research, or UX meaning.
"""
from __future__ import annotations
import argparse,json
from pathlib import Path


def findings(record):
    out=[]
    def add(code,severity,message): out.append({'code':code,'severity':severity,'message':message})
    if not record.get('readme'): add('DOC-README-MISSING','P1','README is missing or was not detected.')
    if not record.get('license'): add('GOV-LICENSE-MISSING','P2','No LICENSE file detected; license choice remains an owner decision.')
    if not record.get('security_policy'): add('GOV-SECURITY-MISSING','P3','No SECURITY.md detected.')
    if record.get('workflow_count',0)>0 and not record.get('head_ci_green'): add('CI-HEAD-NOT-GREEN','P1','HEAD workflow evidence is not fully green.')
    if record.get('unpinned_action_refs',0)>0: add('SUPPLY-ACTION-UNPINNED','P1',f"{record['unpinned_action_refs']} unpinned GitHub Action reference(s) detected.")
    return out


def triage(report):
    rows=[]
    for r in report.get('repositories',[]):
        fs=findings(r); rows.append({'repository':r['repository'],'visibility':r['visibility'],'finding_count':len(fs),'findings':fs})
    return {'schema_version':1,'scope':'deterministic-repository-triage','repositories':rows,'note':'Triage findings are deterministic engineering signals, not full semantic structured audits.'}


def main():
    p=argparse.ArgumentParser(); p.add_argument('scan',type=Path); p.add_argument('--out',type=Path); a=p.parse_args()
    result=triage(json.loads(a.scan.read_text(encoding='utf-8'))); text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if a.out: a.out.parent.mkdir(parents=True,exist_ok=True); a.out.write_text(text,encoding='utf-8')
    else: print(text,end='')
    return 0
if __name__=='__main__': raise SystemExit(main())
