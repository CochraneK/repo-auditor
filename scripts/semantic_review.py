#!/usr/bin/env python3
"""Provider-agnostic L4 semantic reviewer for repo-auditor.

Uses an OpenAI-compatible endpoint so OpenAI, FreeLLMAPI, OpenRouter-compatible
routers, local gateways and other compatible providers can share one path.
Secrets are read only from environment variables and are never written to output.
"""
from __future__ import annotations
import argparse, json, os, re, sys, urllib.error, urllib.request
from pathlib import Path

PROMPT = """You are repo-auditor's L4 Semantic Reviewer. Review the supplied repository evidence, not just code style. Examine purpose-vs-implementation alignment, architecture, product/research logic, UX where relevant, testing quality, privacy/security/publication/IP risk, maintainability, misleading claims, obsolete/duplicate design, and important gaps missed by deterministic checks. Do not invent evidence. Return JSON only with keys: summary, confidence, findings, regression_candidates. Each finding must contain code, severity (P0-P3), title, evidence, reasoning, remediation, confidence (0-1), auto_fixable (boolean), requires_owner_decision (boolean). regression_candidates contains only repeatable/generalizable problems that could become deterministic checks. If evidence is insufficient, say so explicitly and lower confidence."""

def endpoint(base: str) -> str:
    base=base.rstrip('/')
    return base if base.endswith('/chat/completions') else base + ('/chat/completions' if base.endswith('/v1') else '/v1/chat/completions')

def extract_json(text: str):
    text=text.strip()
    if text.startswith('```'):
        text=re.sub(r'^```(?:json)?\s*|\s*```$', '', text, flags=re.S)
    try:return json.loads(text)
    except json.JSONDecodeError:
        a=text.find('{'); b=text.rfind('}')
        if a>=0 and b>a:return json.loads(text[a:b+1])
        raise

def review(evidence, base_url, api_key, model, timeout=180):
    body={'model':model,'temperature':0.1,'messages':[{'role':'system','content':PROMPT},{'role':'user','content':json.dumps(evidence,ensure_ascii=False)}]}
    req=urllib.request.Request(endpoint(base_url),data=json.dumps(body).encode(),headers={'Authorization':f'Bearer {api_key}','Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=timeout) as r: payload=json.load(r)
    result=extract_json(payload['choices'][0]['message']['content'])
    result.update({'schema_version':1,'scope':'ai-semantic-review','assurance_level':'L4','provider':base_url,'model':model})
    return result

def main():
    p=argparse.ArgumentParser(); p.add_argument('evidence',type=Path); p.add_argument('--out',type=Path)
    p.add_argument('--base-url',default=os.getenv('AI_REVIEW_BASE_URL','https://api.openai.com/v1'))
    p.add_argument('--model',default=os.getenv('AI_REVIEW_MODEL','gpt-5.6'))
    p.add_argument('--api-key',default=os.getenv('AI_REVIEW_API_KEY')); p.add_argument('--timeout',type=int,default=180)
    a=p.parse_args()
    if not a.api_key: p.error('AI_REVIEW_API_KEY is required (never commit API keys).')
    evidence=json.loads(a.evidence.read_text(encoding='utf-8'))
    try: result=review(evidence,a.base_url,a.api_key,a.model,a.timeout)
    except (urllib.error.URLError,KeyError,json.JSONDecodeError) as e:
        print(f'semantic review failed: {e}',file=sys.stderr); return 2
    text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if a.out:a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_text(text,encoding='utf-8')
    else:print(text,end='')
    return 0
if __name__=='__main__':raise SystemExit(main())
