# Repository Audit Rubric

repo-auditor deliberately separates **portfolio priority** from **repository quality**.

- **Priority score (0–100)** answers: “Should I spend time on this now?”
- **Audit findings** answer: “What is strong, risky, missing, or unverified?”

A repository can be high priority and low quality, or low priority and excellent.

## Audit evidence

Every new structured audit should record:

- repository name;
- exact audited commit SHA;
- audit date;
- current portfolio decision;
- observed CI / quality gates;
- concrete strengths;
- P0–P3 findings;
- evidence for each finding;
- limitations / things that could not be verified;
- re-audit triggers.

Do not write private-repository names or private metadata into this public audit layer.

## Severity

| Severity | Meaning |
|---|---|
| **P0** | Blocking correctness, security, privacy, data-loss, or release issue |
| **P1** | High-priority weakness that should be addressed before calling the project mature |
| **P2** | Important maintainability, reproducibility, release, UX, or documentation debt |
| **P3** | Polish / nice-to-have |

Severity is not a numeric quality score.

## Core dimensions

1. **Purpose & scope** — Is the repository clear about what it is and is not?
2. **Correctness** — Are core behavior and failure modes tested?
3. **Security & privacy** — Are trust boundaries executable rather than documentation-only?
4. **Supply chain** — Are external code, actions, models, and artifacts pinned or verifiable?
5. **Reproducibility** — Can another machine reproduce builds/tests/results?
6. **Release engineering** — Are build, metadata, changelog, licensing, provenance, and release steps coherent?
7. **Documentation & onboarding** — Can a new user reach a safe first success without tribal knowledge?
8. **Maintainability** — Are architecture, tests, workflows, and docs aligned rather than drifting?
9. **Community surface** — Security reporting, contribution guidance, issues/templates, citation, and repository metadata.

## Rules

- Prefer evidence over impressions.
- Distinguish **not found** from **verified absent**.
- Distinguish a documented claim from an executable invariant.
- Do not call a benchmark pass a security/privacy certification.
- Record the audited commit. A report without a baseline SHA becomes stale silently.
- Re-audit when security boundaries, dependency/model supply chains, release workflows, or core architecture materially change.
