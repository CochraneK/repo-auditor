# Audit reliability & remediation roadmap · 2026-11-02

## Why this checkpoint exists

repo-auditor is an evidence-backed repository auditing **and remediation** agent. Its output must distinguish test execution success from complete inventory coverage, evidence freshness, private-data safety, and actual remediation. A scheduled scan that receives GitHub 401 is **not** an account-wide PASS even when local unit tests succeed.

This plan is intentionally **public-safe**. It contains no private repository names, URLs, commit SHAs, evidence snippets or unpublished findings.

## Verified event

- 2026-11-01 scheduled `Portfolio Audit` run: `https://github.com/CochraneK/repo-auditor/actions/runs/41285245958`.
- `audit` job: **success**.
- `private-portfolio-scan` job: **failure** with GitHub REST `401 Unauthorized` during authenticated data collection.
- Therefore: deterministic audit code checks passed, while authenticated private-inventory completeness is **NOT VERIFIED**. Private coverage must remain PARTIAL/BLOCKED/FAILED as appropriate, never inferred PASS from the successful audit job.
- Root cause of 401 (expired, revoked, wrong credential, authorization scope, or service config) is **unverified** until the owner inspects authentication settings. Never print token values or authorization headers.

## Prioritized improvements

| Priority | Work | Verification / acceptance |
|---|---|---|
| P0 | Restore authenticated private scan with least-privileged appropriately scoped credential | Fresh workflow returns valid authenticated inventory; record aggregate coverage only; no private identifiers in public outputs |
| P0 | Make credential failures operationally actionable | Structured `external-blocked` with HTTP category, affected capability, precise unblock step; fail-closed; no token bodies in logs |
| P1 | Exact-commit audit status | All L0–L5 findings, CI checks, governance and generated pages carry exact scanned SHA; reject stale green workflows as evidence for another head |
| P1 | Audit closure discipline | Finding closure requires code fix + tests + exact-SHA re-audit; `implemented` is distinct from `verified` |
| P1 | Separate dimensions | Keep Priority, 0–5 Quality **vector**, Audit Coverage, AI Readiness, and Publication/IP gate orthogonal; no magic aggregated quality score |
| P1 | Branch governance enforcement | Distinguish workflows existing from required checks actually enforced; protected flag/details permission gaps must remain visible |
| P1 | Supply chain expansion | Check immutable GitHub Actions refs, model revision/file hash, SBOM/dependency pins, generated artifacts, signed/integrity manifests, and dependency-license claims; mark unknown rather than assuming safe |
| P1 | Documentation/code claim parity | Validate README commands, working links/relative paths, bilingual claims, report figures, demos, generated assets and release status against code/tests/manifest |
| P1 | Privacy-safe audit artifacts | Private inputs/evidence/findings stay in private or ignored paths; public Pages only aggregate sanctioned values; test for accidental name/URL/SHA leakage |
| P2 | Cold-start agent handoff audit | Prove a new agent can identify current SHA, canonical source, known blockers, exact next action, and safe validation without earlier chats |
| P2 | Multi-stage GO remediation | Classify `auto-fix`, `owner-choice`, `external-blocked`, `accepted-risk`; route blocked to concrete unblock workflow; retry and re-audit |
| P2 | Adversarial repository fixtures | Deliberately broken TOML, escaped literal `\\n`, mis-pinned action tag, date-only source vs fresh CI, model checksum mismatch, README command drift |
| P2 | Runtime visual review | Browser/screenshot evaluation of landing pages and local reports; do not call static HTML lint a visual audit |

## End-to-end audit contract

1. L0 inventory of all repositories visible to authenticated token; if visibility is incomplete, state **PARTIAL**, not PASS.
2. L1 collect precise immutable evidence: `owner/repo`, exact SHA in **private evidence only** when repository is private; files, CI, branch/ruleset status, supply-chain refs.
3. L2 derive high-confidence deterministic findings with proof, priority and remediation class.
4. L3 structured report: 0–5 for each evidenced quality dimension, or `null` with why; separate portfolio priority, publication/IP gate, limitations.
5. L4 optional semantic review with explicit private-to-external-provider consent; never upgrade incomplete L0/L1 to PASS.
6. L5 remediate reversible owner-authorized items and **re-audit the new SHA**. Owner choices and credential problems return exact remaining action without fake completion.
7. L6/L7 handoff/self-improvement: convert repeatable misses into regression tests and skills, retaining canonical references.

## Credential recovery / private scan

Use [the private-scan 401 runbook](../runbooks/private-scan-401.md). It is safe to publish; it does not record any credentials.

## Publication safety / privacy

Keep private repository identifiers, SHA, URLs, issue evidence, snapshots, tool inputs and detailed findings out of the public repo's Pages bundle and public audit files. Even an apparently innocuous CI URL can reveal the existence of private work. Store full private evidence only in authorized private or gitignored locations.

## Next audit checkpoint

After authentication is fixed, perform fresh exact-SHA private collection, test the public-safe output contract, close only findings backed by re-run evidence, and update the handoff at this canonical repository head.
