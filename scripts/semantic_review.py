#!/usr/bin/env python3
"""Provider-neutral L4 semantic review with explicit privacy boundaries."""
from __future__ import annotations
import argparse, json, os, re, sys, urllib.parse, urllib.request
from pathlib import Path

PROMPT = """You are the L4 Semantic Reviewer for repo-auditor. Review only supplied evidence. Return JSON only with summary, confidence, findings, regression_candidates. Each finding must include code, severity, title, evidence, reasoning, remediation, confidence, auto_fixable, requires_owner_decision. Do not invent evidence."""

PROVIDERS = {
    "deepseek": {"base_url": "https://api.deepseek.com", "model": None, "key_env": "DEEPSEEK_API_KEY", "trust": "external"},
    "glm": {"base_url": "https://open.bigmodel.cn/api/paas/v4", "model": None, "key_env": "ZHIPU_API_KEY", "trust": "external"},
    "freellmapi": {"base_url": "http://localhost:3001/v1", "model": "auto", "key_env": "FREELLMAPI_API_KEY", "trust": "local"},
    "custom": {"base_url": None, "model": None, "key_env": "AI_REVIEW_API_KEY", "trust": "external"},
}

def is_local_url(base_url):
    host = (urllib.parse.urlparse(base_url).hostname or "").lower()
    return host in {"localhost", "127.0.0.1", "::1"} or host.endswith(".local")

def endpoint(base_url):
    base = base_url.rstrip("/")
    if base.endswith("/chat/completions"):
        return base
    if base.endswith("/v1") or "/api/paas/v4" in base or "api.deepseek.com" in base:
        return base + "/chat/completions"
    return base + "/v1/chat/completions"

def extract_json(text):
    text = text.strip()
    fence = chr(96) * 3
    if text.startswith(fence):
        text = re.sub(r"^" + re.escape(fence) + r"(?:json)?\s*|\s*" + re.escape(fence) + r"$", "", text, flags=re.S)
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        a, b = text.find("{"), text.rfind("}")
        if a < 0 or b <= a:
            raise
        value = json.loads(text[a:b+1])
    if not isinstance(value, dict):
        raise ValueError("review output must be a JSON object")
    return value

def resolve_provider(name, base_url=None, model=None, api_key=None):
    preset = dict(PROVIDERS[name])
    resolved_base = base_url or os.getenv("AI_REVIEW_BASE_URL") or preset["base_url"]
    resolved_model = model or os.getenv("AI_REVIEW_MODEL") or preset["model"]
    resolved_key = api_key or os.getenv("AI_REVIEW_API_KEY") or os.getenv(preset["key_env"])
    if not resolved_base:
        raise ValueError("provider base URL is required")
    if not resolved_model:
        raise ValueError("provider model is required")
    trust = "local" if is_local_url(resolved_base) else preset["trust"]
    return {"name": name, "base_url": resolved_base, "model": resolved_model, "api_key": resolved_key, "trust": trust}

def assert_private_policy(evidence, provider, allow_private_external_ai=False):
    is_private = str(evidence.get("visibility", "")).lower() == "private" or evidence.get("public") is False
    if is_private and provider["trust"] != "local" and not allow_private_external_ai:
        raise PermissionError("private repository evidence requires --allow-private-external-ai for external providers")

def review(evidence, provider, timeout=180):
    if provider["trust"] != "local" and not provider.get("api_key"):
        raise ValueError("API key is required")
    body = {"model": provider["model"], "temperature": 0.1, "messages": [{"role": "system", "content": PROMPT}, {"role": "user", "content": json.dumps(evidence, ensure_ascii=False)}]}
    headers = {"Content-Type": "application/json", "User-Agent": "repo-auditor-semantic-review"}
    if provider.get("api_key"):
        headers["Authorization"] = "Bearer " + provider["api_key"]
    req = urllib.request.Request(endpoint(provider["base_url"]), data=json.dumps(body).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        payload = json.load(response)
    result = extract_json(payload["choices"][0]["message"]["content"])
    result.update({"schema_version": 2, "scope": "ai-semantic-review", "assurance_level": "L4", "provider": provider["name"], "provider_base_url": provider["base_url"], "model": provider["model"], "provider_trust": provider["trust"]})
    return result

def main():
    p = argparse.ArgumentParser()
    p.add_argument("evidence", type=Path)
    p.add_argument("--out", type=Path)
    p.add_argument("--provider", choices=sorted(PROVIDERS), default=os.getenv("AI_REVIEW_PROVIDER", "custom"))
    p.add_argument("--base-url")
    p.add_argument("--model")
    p.add_argument("--api-key")
    p.add_argument("--timeout", type=int, default=180)
    p.add_argument("--allow-private-external-ai", action="store_true")
    a = p.parse_args()
    evidence = json.loads(a.evidence.read_text(encoding="utf-8"))
    try:
        provider = resolve_provider(a.provider, a.base_url, a.model, a.api_key)
        assert_private_policy(evidence, provider, a.allow_private_external_ai)
        result = review(evidence, provider, a.timeout)
    except Exception as exc:
        print("semantic review failed: " + str(exc), file=sys.stderr)
        return 2
    output = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(output, encoding="utf-8")
    else:
        print(output, end="")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
