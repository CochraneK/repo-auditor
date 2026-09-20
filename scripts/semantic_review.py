#!/usr/bin/env python3
"""Provider-neutral L4 semantic review with explicit privacy boundaries."""
from __future__ import annotations

import argparse
import json
import os
import re
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

PROMPT = """You are the L4 Semantic Reviewer for repo-auditor. Review only supplied evidence. Return JSON only with summary, confidence, findings, regression_candidates. Each finding must include code, severity, title, evidence, reasoning, remediation, confidence, auto_fixable, requires_owner_decision. Do not invent evidence. Severity must be one of P0, P1, P2, P3."""

PROVIDERS = {
    "deepseek": {
        "base_url": "https://api.deepseek.com",
        "model": None,
        "key_env": "DEEPSEEK_API_KEY",
        "trust": "external",
    },
    "glm": {
        "base_url": "https://open.bigmodel.cn/api/paas/v4",
        "model": None,
        "key_env": "ZHIPU_API_KEY",
        "trust": "external",
    },
    "freellmapi": {
        "base_url": "http://localhost:3001/v1",
        "model": "auto",
        "key_env": "FREELLMAPI_API_KEY",
        "trust": "local",
    },
    "custom": {
        "base_url": None,
        "model": None,
        "key_env": "AI_REVIEW_API_KEY",
        "trust": "external",
    },
}

REQUIRED_FINDING_FIELDS = {
    "code",
    "severity",
    "title",
    "evidence",
    "reasoning",
    "remediation",
    "confidence",
    "auto_fixable",
    "requires_owner_decision",
}
VALID_SEVERITIES = {"P0", "P1", "P2", "P3"}


class SemanticReviewError(RuntimeError):
    def __init__(self, category: str, message: str):
        super().__init__(message)
        self.category = category


def is_local_url(base_url: str) -> bool:
    host = (urllib.parse.urlparse(base_url).hostname or "").lower()
    return host in {"localhost", "127.0.0.1", "::1"} or host.endswith(".local")


def endpoint(base_url: str) -> str:
    base = base_url.rstrip("/")
    if base.endswith("/chat/completions"):
        return base
    if base.endswith("/v1") or "/api/paas/v4" in base or "api.deepseek.com" in base:
        return base + "/chat/completions"
    return base + "/v1/chat/completions"


def extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    fence = chr(96) * 3
    if text.startswith(fence):
        text = re.sub(
            r"^" + re.escape(fence) + r"(?:json)?\s*|\s*" + re.escape(fence) + r"$",
            "",
            text,
            flags=re.S,
        )
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start < 0 or end <= start:
            raise
        value = json.loads(text[start : end + 1])
    if not isinstance(value, dict):
        raise ValueError("review output must be a JSON object")
    return value


def validate_result(result: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(result.get("summary"), str) or not result["summary"].strip():
        raise ValueError("summary must be a non-empty string")
    confidence = result.get("confidence")
    if not isinstance(confidence, (int, float)) or isinstance(confidence, bool) or not 0 <= confidence <= 1:
        raise ValueError("confidence must be a number between 0 and 1")
    findings = result.get("findings")
    if not isinstance(findings, list):
        raise ValueError("findings must be a list")
    if not isinstance(result.get("regression_candidates"), list):
        raise ValueError("regression_candidates must be a list")

    for index, finding in enumerate(findings):
        if not isinstance(finding, dict):
            raise ValueError(f"finding {index} must be an object")
        missing = REQUIRED_FINDING_FIELDS - set(finding)
        if missing:
            raise ValueError(f"finding {index} missing fields: {', '.join(sorted(missing))}")
        if finding.get("severity") not in VALID_SEVERITIES:
            raise ValueError(f"finding {index} has invalid severity")
        for key in ("code", "title", "reasoning", "remediation"):
            if not isinstance(finding.get(key), str) or not finding[key].strip():
                raise ValueError(f"finding {index}.{key} must be a non-empty string")
        f_conf = finding.get("confidence")
        if not isinstance(f_conf, (int, float)) or isinstance(f_conf, bool) or not 0 <= f_conf <= 1:
            raise ValueError(f"finding {index}.confidence must be between 0 and 1")
        for key in ("auto_fixable", "requires_owner_decision"):
            if not isinstance(finding.get(key), bool):
                raise ValueError(f"finding {index}.{key} must be boolean")
    return result


def resolve_provider(name: str, base_url: str | None = None, model: str | None = None, api_key: str | None = None) -> dict[str, Any]:
    preset = dict(PROVIDERS[name])
    resolved_base = base_url or os.getenv("AI_REVIEW_BASE_URL") or preset["base_url"]
    resolved_model = model or os.getenv("AI_REVIEW_MODEL") or preset["model"]
    resolved_key = api_key or os.getenv("AI_REVIEW_API_KEY") or os.getenv(preset["key_env"])
    if not resolved_base:
        raise ValueError("provider base URL is required")
    if not resolved_model:
        raise ValueError("provider model is required")
    trust = "local" if is_local_url(resolved_base) else preset["trust"]
    return {
        "name": name,
        "base_url": resolved_base,
        "model": resolved_model,
        "api_key": resolved_key,
        "trust": trust,
    }


def assert_private_policy(
    evidence: dict[str, Any],
    provider: dict[str, Any],
    allow_private_external_ai: bool = False,
) -> None:
    is_private = (
        str(evidence.get("visibility", "")).lower() == "private"
        or evidence.get("public") is False
    )
    if is_private and provider["trust"] != "local" and not allow_private_external_ai:
        raise PermissionError(
            "private repository evidence requires --allow-private-external-ai for external providers"
        )


def classify_exception(exc: Exception) -> str:
    if isinstance(exc, PermissionError):
        return "privacy-policy"
    if isinstance(exc, urllib.error.HTTPError):
        if exc.code in {401, 403}:
            return "auth"
        if exc.code == 429:
            return "rate-limit"
        if exc.code >= 500:
            return "provider-unavailable"
        return "provider-http-error"
    if isinstance(exc, (urllib.error.URLError, socket.timeout, TimeoutError)):
        return "provider-unavailable"
    if isinstance(exc, (json.JSONDecodeError, KeyError, IndexError)):
        return "malformed-output"
    if isinstance(exc, ValueError):
        message = str(exc).lower()
        if "api key" in message:
            return "auth"
        if any(term in message for term in ("summary", "confidence", "finding", "regression_candidates", "review output")):
            return "malformed-output"
        return "configuration"
    return "unknown"


def review(evidence: dict[str, Any], provider: dict[str, Any], timeout: int = 180) -> dict[str, Any]:
    if provider["trust"] != "local" and not provider.get("api_key"):
        raise ValueError("API key is required")

    body = {
        "model": provider["model"],
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": json.dumps(evidence, ensure_ascii=False)},
        ],
    }
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "repo-auditor-semantic-review",
    }
    if provider.get("api_key"):
        headers["Authorization"] = "Bearer " + str(provider["api_key"])

    request = urllib.request.Request(
        endpoint(str(provider["base_url"])),
        data=json.dumps(body).encode("utf-8"),
        headers=headers,
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            payload = json.load(response)
        raw_content = payload["choices"][0]["message"]["content"]
        result = validate_result(extract_json(raw_content))
    except Exception as exc:
        category = classify_exception(exc)
        raise SemanticReviewError(category, str(exc)) from exc

    result.update(
        {
            "schema_version": 2,
            "scope": "ai-semantic-review",
            "assurance_level": "L4",
            "provider": provider["name"],
            "provider_base_url": provider["base_url"],
            "model": provider["model"],
            "provider_trust": provider["trust"],
        }
    )
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("evidence", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument(
        "--provider",
        choices=sorted(PROVIDERS),
        default=os.getenv("AI_REVIEW_PROVIDER", "custom"),
    )
    parser.add_argument("--base-url")
    parser.add_argument("--model")
    parser.add_argument("--api-key")
    parser.add_argument("--timeout", type=int, default=180)
    parser.add_argument("--allow-private-external-ai", action="store_true")
    args = parser.parse_args()

    evidence = json.loads(args.evidence.read_text(encoding="utf-8"))
    try:
        provider = resolve_provider(args.provider, args.base_url, args.model, args.api_key)
        assert_private_policy(evidence, provider, args.allow_private_external_ai)
        result = review(evidence, provider, args.timeout)
    except Exception as exc:
        category = exc.category if isinstance(exc, SemanticReviewError) else classify_exception(exc)
        print(f"semantic review failed [{category}]: {exc}", file=sys.stderr)
        return 2

    output = json.dumps(result, ensure_ascii=False, indent=2) + chr(10)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(output, encoding="utf-8")
    else:
        print(output, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
