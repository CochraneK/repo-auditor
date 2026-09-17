from __future__ import annotations

import sys
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import collect_repo_evidence as cre


def test_unprotected_branch_is_decisive_without_privileged_calls():
    branch_data = {
        "protected": False,
        "protection": {
            "enabled": False,
            "required_status_checks": {
                "enforcement_level": "off",
                "contexts": [],
                "checks": [],
            },
        },
    }
    with mock.patch.object(cre, "optional_request_json") as optional:
        evidence = cre.branch_governance("CochraneK/example", "main", branch_data)
    optional.assert_not_called()
    assert evidence["assessment"] == "unprotected"
    assert evidence["protected"] is False


def test_protected_branch_records_enforced_review_and_status_checks():
    branch_data = {
        "protected": True,
        "protection": {
            "enabled": True,
            "required_status_checks": {
                "enforcement_level": "everyone",
                "contexts": ["test"],
                "checks": [],
            },
        },
    }

    def optional(path: str):
        if path.endswith("/branches/main/protection"):
            return {
                "status": "verified",
                "value": {
                    "required_pull_request_reviews": {"required_approving_review_count": 0},
                    "required_status_checks": {"contexts": ["test", "security"]},
                    "required_conversation_resolution": {"enabled": True},
                    "required_linear_history": {"enabled": False},
                    "enforce_admins": {"enabled": True},
                    "allow_force_pushes": {"enabled": False},
                    "allow_deletions": {"enabled": False},
                },
            }
        if "/rulesets?" in path:
            return {
                "status": "verified",
                "value": [
                    {
                        "id": 1,
                        "name": "Protect main",
                        "target": "branch",
                        "enforcement": "active",
                        "source_type": "Repository",
                    }
                ],
            }
        raise AssertionError(path)

    with mock.patch.object(cre, "optional_request_json", side_effect=optional):
        evidence = cre.branch_governance("CochraneK/example", "main", branch_data)

    assert evidence["assessment"] == "protected-verified"
    assert evidence["protection_detail"]["required_pull_request_reviews"] is True
    assert evidence["protection_detail"]["required_status_checks"] is True
    assert evidence["protection_detail"]["allow_force_pushes"] is False
    assert evidence["rulesets"]["count"] == 1


def test_protected_branch_permission_gap_stays_unverified():
    branch_data = {"protected": True, "protection": {"enabled": True}}

    with mock.patch.object(
        cre,
        "optional_request_json",
        return_value={"status": "unverified", "reason": "GitHub API 403"},
    ):
        evidence = cre.branch_governance("CochraneK/example", "main", branch_data)

    assert evidence["assessment"] == "protected-details-unverified"
    assert evidence["protection_detail"]["status"] == "unverified"
    assert evidence["rulesets"]["status"] == "unverified"
