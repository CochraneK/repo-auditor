#!/usr/bin/env python3
import json,os,sys,urllib.error,urllib.request
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; REGISTRY=ROOT/'portfolio'/'registry.json'
STATUS={'CONTINUE','STOP'}; BANDS={'P0-NOW','P1-NEXT','P2-PLANNED','P3-LATER','P4-LOW','STOP'}
REQUIRED={'name','visibility','work_status','priority_score','priority_band','reason','last_commit_date'}
def expected_band(score,status):
    if status=='STOP':return 'STOP'
    if score>=90:return 'P0-NOW'
    if score>=70:return 'P1-NEXT'
    if score>=50:return 'P2-PLANNED'
    if score>=20:return 'P3-LATER'
    return 'P4-LOW'
def live_visibility(owner,name,token):
    headers={'Accept':'application/vnd.github+json','User-Agent':'repo-auditor'}
    if token:headers['Authorization']=f'Bearer {token}'
    req=urllib.request.Request(f'https://api.github.com/repos/{owner}/{name}',headers=headers)
    try:
        with urllib.request.urlopen(req,timeout=15) as r:return 'private' if json.load(r).get('private') else 'public'
    except urllib.error.HTTPError as e:
        if e.code==404:return 'non-public'
        raise
def validate(data,token=None):
    repos=data.get('repositories',[]);errors=[];owner=data.get('owner','')
    if data.get('scope')!='public-workbench':errors.append('registry scope must be public-workbench')
    names=[r.get('name') for r in repos];dupes=sorted(n for n,c in Counter(names).items() if c>1)
    if dupes:errors.append(f'duplicate repository names: {dupes}')
    for i,repo in enumerate(repos):
        missing=REQUIRED-repo.keys()
        if missing:errors.append(f"record {i} ({repo.get('name')}): missing {sorted(missing)}");continue
        name=repo['name'];status=repo['work_status'];score=repo['priority_score'];band=repo['priority_band']
        if repo['visibility']!='public':errors.append(f'{name}: PUBLIC registry must not contain non-public repositories')
        if token:
            try:
                if live_visibility(owner,name,token)!='public':errors.append(f'{name}: live GitHub visibility is not public; remove it from the public source registry')
            except Exception as exc:errors.append(f'{name}: live visibility could not be verified: {exc}')
        if status not in STATUS:errors.append(f'{name}: invalid work_status {status}')
        if not isinstance(score,int) or not 0<=score<=100:errors.append(f'{name}: priority_score must be integer 0..100')
        if band not in BANDS:errors.append(f'{name}: invalid priority_band {band}')
        if isinstance(score,int):
            if status=='STOP' and score!=0:errors.append(f'{name}: STOP must have score 0')
            if status=='CONTINUE' and score<=0:errors.append(f'{name}: CONTINUE must have score > 0')
            if band!=expected_band(score,status):errors.append(f'{name}: band {band} does not match score/status; expected {expected_band(score,status)}')
    return errors
def main():
    data=json.loads(REGISTRY.read_text(encoding='utf-8'));errors=validate(data,os.environ.get('GITHUB_TOKEN'))
    if errors:
        for e in errors:print('ERROR:',e,file=sys.stderr)
        return 1
    print(f"Public portfolio OK: {len(data.get('repositories',[]))} repositories");return 0
if __name__=='__main__':raise SystemExit(main())
