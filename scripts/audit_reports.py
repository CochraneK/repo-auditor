#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDITS = ROOT / "audits"

SEVERITIES = {"P0", "P1", "P2", "P3"}
STATUSES = {"open", "fixed", "accepted", "not-applicable"}
WORK = {"CONTINUE", "STOP"}
BANDS = {"P0-NOW", "P1-NEXT", "P2-PLANNED", "P3-LATER", "P4-LOW", "STOP"}
GATES = {"pass", "fail", "unknown", "in-progress"}
PUBLICATION_RECOMMENDATIONS = {"public-ok", "review-before-public", "keep-private", "split-public-private"}
VISIBILITIES = {"public", "private"}
QUALITY_DIMENSIONS = (
    "purpose_scope",
    "correctness",
    "security_privacy",
    "supply_chain",
    "reproducibility",
    "release_engineering",
    "documentation_onboarding",
    "maintainability",
    "community_surface",
)


def validate_quality_dimensions(value: object, label: str = "quality_dimensions") -> list[str]:
    errors: list[str] = []
    if not isinstance(value, dict):
        return [f"{label} must be an object"]
    missing = set(QUALITY_DIMENSIONS) - value.keys()
    extra = value.keys() - set(QUALITY_DIMENSIONS)
    if missing:
        errors.append(f"{label} missing {sorted(missing)}")
    if extra:
        errors.append(f"{label} has unknown dimensions {sorted(extra)}")
    for dimension in QUALITY_DIMENSIONS:
        if dimension not in value:
            continue
        item = value[dimension]
        prefix = f"{label}.{dimension}"
        if not isinstance(item, dict):
            errors.append(f"{prefix} must be an object")
            continue
        if "score" not in item or "evidence" not in item:
            errors.append(f"{prefix} must contain score and evidence")
            continue
        score = item["score"]
        if score is not None and (not isinstance(score, int) or isinstance(score, bool) or not 0 <= score <= 5):
            errors.append(f"{prefix}.score must be integer 0..5 or null")
        evidence = item["evidence"]
        if not isinstance(evidence, list) or not evidence or not all(isinstance(x, str) and x.strip() for x in evidence):
            errors.append(f"{prefix}.evidence must be a non-empty list of strings")
    return errors



def expected_band(score: int, status: str) -> str:
    if status == "STOP":
        return "STOP"
    if score >= 90:
        return "P0-NOW"
    if score >= 70:
        return "P1-NEXT"
    if score >= 50:
        return "P2-PLANNED"
    if score >= 20:
        return "P3-LATER"
    return "P4-LOW"


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"{path.name}: invalid JSON: {exc}"]

    required = {
        "schema_version",
        "repository",
        "audit_date",
        "audited_commit",
        "markdown",
        "decision",
        "quality_gates",
        "quality_dimensions",
        "publication_gate",
        "findings",
        "limitations",
        "recheck_triggers",
    }
    missing = required - data.keys()
    if missing:
        errors.append(f"{path.name}: missing {sorted(missing)}")
        return errors

    if data["schema_version"] != 1:
        errors.append(f"{path.name}: schema_version must be 1")

    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", str(data["repository"])):
        errors.append(f"{path.name}: repository must be owner/name")

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(data["audit_date"])):
        errors.append(f"{path.name}: invalid audit_date")

    if not re.fullmatch(r"[0-9a-f]{40}", str(data["audited_commit"])):
        errors.append(f"{path.name}: audited_commit must be a full 40-char SHA")

    markdown = ROOT / str(data["markdown"])
    if not markdown.is_file():
        errors.append(f"{path.name}: markdown report does not exist: {data['markdown']}")

    decision = data["decision"]
    for key in ("work_status", "priority_score", "priority_band"):
        if key not in decision:
            errors.append(f"{path.name}: decision missing {key}")
    if not errors:
        status = decision["work_status"]
        score = decision["priority_score"]
        band = decision["priority_band"]
        if status not in WORK:
            errors.append(f"{path.name}: invalid work_status {status}")
        if not isinstance(score, int) or not 0 <= score <= 100:
            errors.append(f"{path.name}: priority_score must be integer 0..100")
        if band not in BANDS:
            errors.append(f"{path.name}: invalid priority_band {band}")
        if isinstance(score, int) and status in WORK:
            expected = expected_band(score, status)
            if band != expected:
                errors.append(f"{path.name}: priority band should be {expected}, got {band}")

    gates = data["quality_gates"]
    if not isinstance(gates, dict) or not gates:
        errors.append(f"{path.name}: quality_gates must be a non-empty object")
    else:
        for gate, state in gates.items():
            if state not in GATES:
                errors.append(f"{path.name}: gate {gate} has invalid state {state}")

    errors.extend(
        f"{path.name}: {error}"
        for error in validate_quality_dimensions(data["quality_dimensions"])
    )

    publication_gate = data["publication_gate"]
    if not isinstance(publication_gate, dict):
        errors.append(f"{path.name}: publication_gate must be an object")
    else:
        for key in ("current_visibility", "recommendation", "reasons"):
            if key not in publication_gate:
                errors.append(f"{path.name}: publication_gate missing {key}")
        visibility = publication_gate.get("current_visibility")
        recommendation = publication_gate.get("recommendation")
        reasons = publication_gate.get("reasons")
        if visibility not in VISIBILITIES:
            errors.append(f"{path.name}: invalid publication visibility {visibility}")
        if recommendation not in PUBLICATION_RECOMMENDATIONS:
            errors.append(f"{path.name}: invalid publication recommendation {recommendation}")
        if not isinstance(reasons, list) or not reasons:
            errors.append(f"{path.name}: publication_gate reasons must be a non-empty list")

    findings = data["findings"]
    if not isinstance(findings, list):
        errors.append(f"{path.name}: findings must be a list")
    else:
        seen: set[str] = set()
        for index, finding in enumerate(findings):
            prefix = f"{path.name}: finding {index}"
            for key in ("id", "severity", "title", "status", "evidence", "recommendation"):
                if key not in finding:
                    errors.append(f"{prefix} missing {key}")
            if "id" not in finding:
                continue
            fid = str(finding["id"])
            if fid in seen:
                errors.append(f"{prefix}: duplicate id {fid}")
            seen.add(fid)
            if finding.get("severity") not in SEVERITIES:
                errors.append(f"{prefix}: invalid severity {finding.get('severity')}")
            if finding.get("status") not in STATUSES:
                errors.append(f"{prefix}: invalid status {finding.get('status')}")
            evidence = finding.get("evidence")
            if not isinstance(evidence, list) or not evidence:
                errors.append(f"{prefix}: evidence must be a non-empty list")

    for key in ("limitations", "recheck_triggers"):
        value = data[key]
        if not isinstance(value, list):
            errors.append(f"{path.name}: {key} must be a list")

    return errors


def main() -> int:
    sidecars = sorted(
        path for path in AUDITS.glob("*.json")
        if path.name not in {"index.json", "schema-v1.json"}
    )
    errors: list[str] = []
    for path in sidecars:
        errors.extend(validate(path))

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(f"Structured audits OK: {len(sidecars)} sidecar(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
