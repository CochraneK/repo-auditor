#!/usr/bin/env python3
"""Remove records that are no longer live-public from the public source registry."""
from __future__ import annotations
import argparse,json
from pathlib import Path
from audit_registry import live_visibility
ROOT=Path(__file__).resolve().parents[1]

def sanitize(data,resolver):
    owner=data.get('owner','CochraneK'); kept=[]; removed=[]
    for r in data.get('repositories',[]):
        if r.get('visibility')=='public' and resolver(owner,r.get('name',''))=='public': kept.append(r)
        else: removed.append(r.get('name','<unknown>'))
    out=dict(data);out['repositories']=kept;return out,removed

def main():
    p=argparse.ArgumentParser();p.add_argument('--registry',type=Path,default=ROOT/'portfolio'/'registry.json');a=p.parse_args()
    data=json.loads(a.registry.read_text(encoding='utf-8')); clean,removed=sanitize(data,lambda o,n:live_visibility(o,n,'__ENV__'))
    if removed:a.registry.write_text(json.dumps(clean,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Sanitized public registry: removed {len(removed)} non-public/stale record(s)')
    return 0
if __name__=='__main__':raise SystemExit(main())
