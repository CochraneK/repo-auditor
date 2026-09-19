# Canonical Identity Review Skill

## Purpose

Keep repository-facing identity consistent across README, Pages, badges, metadata, generated reports and documentation.

## Canonical value

`CochraneK`

## Rules

- Flag legacy personal-name variants in current repository text.
- Do not rewrite Git history merely to remove historical occurrences.
- Do not report the legacy string back into generated findings; report path, line and the canonical replacement.
- The single pre-existing personal-site repository may use an explicit exemption.
- GitHub URLs and repository references should use the canonical account owner.
- Generated Pages/data must not reintroduce a legacy identity after source cleanup.

## Validation

```bash
python scripts/identity_audit.py . --json --fail-on-findings
```

Identity consistency is a governance/metadata rule, not a quality score.
