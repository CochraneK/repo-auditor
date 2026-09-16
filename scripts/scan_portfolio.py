#!/usr/bin/env python3
"""Account-wide evidence scan with privacy-safe coverage integrity reporting."""
from __future__ import annotations
import argparse,json,os
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
from collect_repo_evidence import collect,request_json
ROOT=Path(__file__).resolve().parents[1]; PRIVATE_OUT=ROOT/'private-evidence'/'portfolio-scan.json'; PUBLIC_OUT=ROOT/'docs'/'data'/'portfolio-overview.json'
def list_owned_repositories(owner:str)->list[dict[str,Any]]:
    repos=[];page=1
    while True:
        batch=request_json(f'/user/repos?affiliation=owner&per_page=100&page={page}&sort=full_name')
        if not isinstance(batch,list):raise RuntimeError('GitHub /user/repos did not return a list')
        repos.extend(r for r in batch if (r.get('owner') or {}).get('login','').lower()==owner.lower())
        if len(batch)<100:break
        page+=1
    return repos
def compact_evidence(e):
    common=e.get('common_files') or {};runs=e.get('head_workflow_runs') or {};conclusions=[r.get('conclusion') for r in runs.values() if isinstance(r,dict)]
    return {'repository':e['repository'],'visibility':e['visibility'],'head_sha':e['head_sha'],'file_count':e.get('file_count',0),'readme':bool(common.get('README.md')),'license':bool(common.get('LICENSE')),'security_policy':bool(common.get('SECURITY.md')),'contributing':bool(common.get('CONTRIBUTING.md')),'workflow_count':len(e.get('workflows') or []),'head_ci_green':bool(conclusions) and all(c=='success' for c in conclusions),'unpinned_action_refs':len((e.get('action_supply_chain') or {}).get('unpinned') or [])}
def public_summary(owner,records,failures,expected_total=None,expected_private=None,private_requested=False):
    public=[r for r in records if r['visibility']=='public'];private=[r for r in records if r['visibility']=='private'];observed=len(records)+len(failures);reasons=[]
    if failures:reasons.append('one or more repositories failed evidence collection')
    if expected_total is not None and observed<expected_total:reasons.append('authenticated inventory is smaller than expected inventory')
    if private_requested and expected_private and len(private)<expected_private:reasons.append('private repository coverage is below expected inventory')
    complete=not reasons
    return {'schema_version':2,'scope':'privacy-preserving-account-audit-summary','owner':owner,'generated_at':datetime.now(timezone.utc).isoformat(),'audit_status':'PASS' if complete else 'PARTIAL','inventory':{'observed_total':observed,'public':len(public),'private':len(private),'scan_failures':len(failures),'expected_total':expected_total,'expected_private':expected_private,'private_names_published':False},'coverage':{'status':'complete' if complete else 'partial','reasons':reasons,'evidence_collected':len(records),'readme_present':sum(r['readme'] for r in records),'license_present':sum(r['license'] for r in records),'security_policy_present':sum(r['security_policy'] for r in records),'repositories_with_workflows':sum(r['workflow_count']>0 for r in records),'repositories_with_unpinned_actions':sum(r['unpinned_action_refs']>0 for r in records),'head_ci_green':sum(r['head_ci_green'] for r in records)},'privacy':{'private_details_location':'private-evidence/portfolio-scan.json (gitignored; never Pages)','pages_contains_private_details':False},'self_audit':{'included':any(r['repository']==f'{owner}/repo-auditor' for r in records),'repository':'repo-auditor'}}
def scan(owner,allow_private,expected_total=None,expected_private=None):
    records=[];failures=[]
    for meta in list_owned_repositories(owner):
        full_name=str(meta['full_name']);is_private=bool(meta.get('private'))
        if is_private and not allow_private:failures.append({'repository':full_name,'error':'private scan not enabled'});continue
        try:records.append(compact_evidence(collect(full_name,allow_private=allow_private)))
        except Exception as exc:failures.append({'repository':full_name,'error':str(exc)})
    private={'schema_version':2,'scope':'authenticated-account-audit','owner':owner,'generated_at':datetime.now(timezone.utc).isoformat(),'repositories':records,'failures':failures}
    return private,public_summary(owner,records,failures,expected_total,expected_private,allow_private)
def main():
    p=argparse.ArgumentParser();p.add_argument('--owner',default=os.environ.get('GITHUB_REPOSITORY_OWNER','CochraneK'));p.add_argument('--allow-private',action='store_true');p.add_argument('--expected-total',type=int,default=int(os.environ['PORTFOLIO_EXPECTED_TOTAL']) if os.environ.get('PORTFOLIO_EXPECTED_TOTAL') else None);p.add_argument('--expected-private',type=int,default=int(os.environ['PORTFOLIO_EXPECTED_PRIVATE']) if os.environ.get('PORTFOLIO_EXPECTED_PRIVATE') else None);p.add_argument('--require-complete',action='store_true');p.add_argument('--private-out',type=Path,default=PRIVATE_OUT);p.add_argument('--public-out',type=Path,default=PUBLIC_OUT);a=p.parse_args()
    if not os.environ.get('GITHUB_TOKEN'):raise SystemExit('GITHUB_TOKEN is required for account-wide scanning')
    private,summary=scan(a.owner,a.allow_private,a.expected_total,a.expected_private);a.private_out.parent.mkdir(parents=True,exist_ok=True);a.private_out.write_text(json.dumps(private,ensure_ascii=False,indent=2)+'\n');a.public_out.parent.mkdir(parents=True,exist_ok=True);a.public_out.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=False,indent=2));return 2 if a.require_complete and summary['coverage']['status']!='complete' else 0
if __name__=='__main__':raise SystemExit(main())
