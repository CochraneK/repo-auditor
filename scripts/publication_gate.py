#!/usr/bin/env python3
"""Deterministic publication/IP disclosure gate.

This helper is a conservative release check, not a legal opinion and not a
patentability determination. It turns a small set of owner-supplied facts into
a visibility recommendation so repository audits do not treat "public" as a
purely technical choice.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass


RECOMMENDATIONS = {
    "public-ok",
    "review-before-public",
    "keep-private",
    "split-public-private",
}


@dataclass(frozen=True)
class PublicationGate:
    current_visibility: str
    recommendation: str
    reasons: list[str]


def evaluate(
    *,
    current_visibility: str,
    patent_candidate: bool = False,
    ownership_unclear: bool = False,
    confidential_input: bool = False,
    employer_or_client_requested: bool = False,
    background_ip_exists: bool = False,
) -> PublicationGate:
    reasons: list[str] = []

    if confidential_input:
        reasons.append("Confidential or restricted input is involved.")
    if ownership_unclear:
        reasons.append("Ownership or authorization is not yet clear.")

    if confidential_input or ownership_unclear:
        return PublicationGate(current_visibility, "keep-private", reasons)

    if employer_or_client_requested:
        reasons.append("An employer, client, PI, or external organization requested part of the work.")
        if background_ip_exists:
            reasons.append("Pre-existing/background IP should be separated from project-specific foreground work.")

    if patent_candidate:
        reasons.append("A potentially patentable technical mechanism has been identified.")

    if current_visibility == "public":
        if patent_candidate or employer_or_client_requested:
            reasons.append("Keep already-public background material stable; review new material before disclosure.")
            return PublicationGate(current_visibility, "split-public-private", reasons)
        return PublicationGate(current_visibility, "public-ok", ["No publication blocker was recorded."])

    if patent_candidate or employer_or_client_requested:
        return PublicationGate(current_visibility, "review-before-public", reasons)

    return PublicationGate(current_visibility, "public-ok", ["No publication blocker was recorded."])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--visibility", choices=("public", "private"), required=True)
    parser.add_argument("--patent-candidate", action="store_true")
    parser.add_argument("--ownership-unclear", action="store_true")
    parser.add_argument("--confidential-input", action="store_true")
    parser.add_argument("--employer-or-client-requested", action="store_true")
    parser.add_argument("--background-ip-exists", action="store_true")
    args = parser.parse_args()

    result = evaluate(
        current_visibility=args.visibility,
        patent_candidate=args.patent_candidate,
        ownership_unclear=args.ownership_unclear,
        confidential_input=args.confidential_input,
        employer_or_client_requested=args.employer_or_client_requested,
        background_ip_exists=args.background_ip_exists,
    )
    print(json.dumps(asdict(result), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
