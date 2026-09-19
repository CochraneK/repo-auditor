# Agent Handoff

## Current mission
Evolve repo-auditor from a deterministic repository scanner into an AI-native audit and remediation control plane.

## Completed in this sprint
- Deterministic AI-readiness assessment.
- Evidence collection for AGENTS/HANDOFF/STATUS/DECISIONS, architecture docs, validation commands, README quick-start and visuals.
- AI-readiness findings added to deterministic triage.
- Provider-neutral semantic-review router with explicit private-repository external-provider authorization.

## Next actions
1. Keep provider model names configurable and verify provider docs before production presets.
2. Surface privacy-safe AI-readiness aggregates on Pages.
3. Convert repeatable L4 findings into deterministic rules and tests.
4. Re-audit repo-auditor after each merged remediation.
5. Build a portfolio migration planner that turns AI-readiness gaps into bounded per-repository handoff/README upgrade batches.
6. Replace the temporary hard-coded account inventory expectation with a verified privacy-safe coverage baseline.
7. Add browser/screenshot runtime visual review without overstating static UX assurance.

## Validation
Run:

    python -m py_compile scripts/*.py
    python -m unittest discover -s tests -v
    python scripts/visual_ux_audit.py docs/index.html --json --fail-on-findings
    python scripts/audit_registry.py

## Do not break
- Private repository names, URLs, SHAs, evidence and findings must never enter public Pages.
- L4 AI review must never upgrade incomplete L0/L1 coverage to PASS.
- Owner-choice boundaries remain owner decisions.
