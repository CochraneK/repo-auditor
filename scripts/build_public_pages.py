#!/usr/bin/env python3
"""Build a privacy-safe GitHub Pages data bundle."""
from __future__ import annotations
import json, os, shutil, urllib.error, urllib.request
from pathlib import Path
from typing import Any, Callable
ROOT=Path(__file__).resolve().parents[1]; REGISTRY=ROOT/"portfolio"/"registry.json"; TODOS=ROOT/"portfolio"/"todos.json"; AUDITS=ROOT/"audits"; OUT=ROOT/"docs"/"data"; API="https://api.github.com"
class PublicBundleError(ValueError): pass
def _load(path: Path)->dict[str,Any]:
    data=json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data,dict): raise PublicBundleError(f"{path} must contain a JSON object")
    return data
def live_visibility(repository:str)->str:
    req=urllib.request.Request(f"{API}/repos/{repository}",headers={"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"repo-auditor-public-bundle"})
    token=os.environ.get("GITHUB_TOKEN")
    if token: req.add_header("Authorization",f"Bearer {token}")
    try:
        with urllib.request.urlopen(req,timeout=20) as response: payload=json.load(response)
    except urllib.error.HTTPError as exc:
        if exc.code==404: return "non-public"
        raise PublicBundleError(f"Cannot verify live visibility for {repository}; refusing publication") from exc
    except (urllib.error.URLError,TimeoutError) as exc:
        raise PublicBundleError(f"Cannot verify live visibility for {repository}; refusing publication") from exc
    return "private" if bool(payload.get("private")) else "public"
def _safe_todos(todos_path:Path, public_names:set[str])->dict[str,Any]:
    todos=_load(todos_path); items=todos.get("items")
    if not isinstance(items,list): raise PublicBundleError("todos.items must be a list")
    allowed_status={"TODO","DOING","BLOCKED","DECISION","DONE"}; allowed_priority={"P0","P1","P2","P3"}
    seen=set()
    for item in items:
        if not isinstance(item,dict) or not item.get("id") or not item.get("title"): raise PublicBundleError("Every public todo needs id and title")
        if item["id"] in seen: raise PublicBundleError(f"Duplicate todo id: {item['id']}")
        seen.add(item["id"])
        if item.get("status") not in allowed_status or item.get("priority") not in allowed_priority: raise PublicBundleError(f"Invalid todo state: {item['id']}")
        repo=item.get("repo")
        if repo and repo not in public_names: raise PublicBundleError(f"Todo references a repository outside the verified public registry: {item['id']}")
    return todos
def build(registry_path:Path=REGISTRY,audits_dir:Path=AUDITS,out_dir:Path=OUT,visibility_resolver:Callable[[str],str]|None=None,todos_path:Path|None=None)->dict[str,Any]:
    registry=_load(registry_path); repos=registry.get("repositories")
    if not isinstance(repos,list): raise PublicBundleError("registry.repositories must be a list")
    resolver=visibility_resolver
    if resolver is None: resolver=live_visibility if registry_path.resolve()==REGISTRY.resolve() else (lambda _:"public")
    owner=str(registry.get("owner") or "CochraneK"); safe=[]; excluded=0
    for item in repos:
        if not isinstance(item,dict) or item.get("visibility")!="public" or not item.get("name"): raise PublicBundleError("Public Pages bundle refuses non-public repository records")
        if resolver(f"{owner}/{item['name']}")!="public": excluded+=1; continue
        safe.append(item)
    public_registry=dict(registry); public_registry["repositories"]=safe
    out_audits=out_dir/"audits"; out_audits.mkdir(parents=True,exist_ok=True)
    for old in out_audits.glob("*.json"): old.unlink()
    copied=[]
    for repo in safe:
        latest=repo.get("latest_audit")
        if not latest: continue
        path=Path(str(latest))
        if path.is_absolute() or ".." in path.parts or path.suffix.lower()!=".md" or not str(path).startswith("audits/"): raise PublicBundleError(f"Unsafe latest_audit path for {repo['name']}: {latest}")
        sidecar=audits_dir/(path.stem+".json")
        if not sidecar.is_file(): raise PublicBundleError(f"Missing audit sidecar for {repo['name']}: {sidecar.name}")
        audit=_load(sidecar)
        if audit.get("repository")!=f"{owner}/{repo['name']}": raise PublicBundleError(f"Audit sidecar repository mismatch for {repo['name']}")
        publication=audit.get("publication_gate")
        if not isinstance(publication,dict) or publication.get("current_visibility")!="public": raise PublicBundleError(f"Public bundle refuses non-public audit sidecar: {sidecar.name}")
        shutil.copyfile(sidecar,out_audits/sidecar.name); copied.append(sidecar.name)
    out_dir.mkdir(parents=True,exist_ok=True)
    (out_dir/"registry.json").write_text(json.dumps(public_registry,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    source_todos=todos_path or (TODOS if registry_path.resolve()==REGISTRY.resolve() else None)
    todo_count=0
    if source_todos and source_todos.is_file():
        public_todos=_safe_todos(source_todos,{str(r["name"]) for r in safe})
        (out_dir/"todos.json").write_text(json.dumps(public_todos,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        todo_count=len(public_todos["items"])
    manifest={"schema_version":3,"scope":"public-pages-bundle","repository_count":len(safe),"todo_count":todo_count,"live_visibility_exclusions":excluded,"audit_sidecars":sorted(copied),"private_repository_metadata_included":False,"visibility_policy":"live-github-fail-closed"}
    (out_dir/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); return manifest
def main()->int:
    m=build(); print(f"Public Pages bundle OK: {m['repository_count']} repositories, {m['todo_count']} todos, {m['live_visibility_exclusions']} stale/private records excluded"); return 0
if __name__=="__main__": raise SystemExit(main())
