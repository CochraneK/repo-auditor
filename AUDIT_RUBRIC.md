# Repository Audit Rubric

repo-auditor deliberately separates **portfolio priority** from **repository quality**.

- **Priority score (0–100)** answers: “Should I spend time on this now?”
- **Quality dimensions (0–5 each)** answer: “How mature is the repository across distinct engineering dimensions?”
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

Severity is not a numeric quality score. Severity expresses issue urgency; dimension scores express maturity.

## Multi-dimensional quality scoring

Every structured audit must include `quality_dimensions`. Scores are **0–5 per dimension** and are never collapsed into a single repository-quality total.

| Score | Meaning |
|---:|---|
| **0** | Verified absent / critically deficient |
| **1** | Very weak; major gaps dominate |
| **2** | Weak; meaningful capability exists but is unreliable or incomplete |
| **3** | Adequate; usable baseline with known debt |
| **4** | Strong; well engineered with limited gaps |
| **5** | Excellent; unusually mature and evidence-backed |
| **null** | Unverified or genuinely not applicable — explain why in evidence |

Rules:

- Every score needs evidence; do not score from vibes.
- Do not treat `null` as zero.
- Do not calculate or display a weighted total or average as “the quality score.”
- Priority and quality remain orthogonal: a 5/5 mature repository can be low priority, and an immature 2/5 repository can be urgent.
- IP provenance/publication remains a **gate**, not a quality score: having patent-sensitive work is not “better” or “worse” repository quality.

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
10. **IP provenance & publication (gate, not scored)** — Is Public/Private a deliberate decision given prior disclosure, possible patent value, background IP, employer/client/PI requests, confidential inputs, and ownership uncertainty?

## Publication / IP disclosure gate

Every structured audit must record a `publication_gate`. This is a conservative release check, **not** a legal opinion, patentability decision, or ownership adjudication.

Required owner-supplied questions:

- Is the repository already public or private?
- Does it contain a technical mechanism that may be worth a patent search before further disclosure?
- Was any material requested by an employer, client, PI, funder, or other organization?
- Is there pre-existing/background IP that should be separated from project-specific work?
- Does it contain confidential, restricted, patient, client, employer, or otherwise non-public input?
- Is ownership or authorization unclear?
- Has an earlier version already been publicly disclosed?

Allowed recommendations:

- **public-ok** — no recorded publication blocker; this does not mean the work is patentable or legally cleared.
- **review-before-public** — keep the private working copy private until patent/ownership/publication review is complete.
- **keep-private** — confidential/restricted input or unresolved ownership/authorization makes publication inappropriate for now.
- **split-public-private** — keep already-public/background material public, while new potentially patentable or organization-specific work stays private until reviewed.

The gate must preserve provenance. Do not erase prior public history, rewrite evidence, or treat changing a repository from Public to Private as undoing an earlier disclosure. Do not publish personal employment/contract details in this public repository; record only the minimum abstract trigger needed for the audit.

A helper is available:

```bash
python scripts/publication_gate.py \
  --visibility private \
  --patent-candidate \
  --employer-or-client-requested \
  --background-ip-exists
```

## Remediation semantics

repo-auditor is not recommendation-only when GO mode is authorized. Every finding must declare a `remediation_class`:

- **auto-fix** — safe, reversible engineering/documentation remediation; execute it in GO mode, then test and re-audit.
- **owner-choice** — requires an explicit owner decision such as license, IP ownership, repository visibility, material cost, or an irreversible/contractual action.
- **external-blocked** — cannot be completed with current permissions/evidence or depends on an external system/person.
- **accepted-risk** — intentionally left unresolved for now; preserve rationale and recheck trigger.

GO mode loops over open `auto-fix` findings until none remain that can be completed safely with current authorization. A remediation must not be performed merely to improve a score; the underlying evidence must improve.

The default safe workflow is:

```text
audit -> classify -> branch -> remediate -> test -> re-audit -> PR -> merge when green
```

High-impact owner choices must remain visible as open findings rather than being silently "fixed."

## Rules

- Prefer evidence over impressions.
- Distinguish **not found** from **verified absent**.
- Distinguish a documented claim from an executable invariant.
- Do not call a benchmark pass a security/privacy certification.
- Record the audited commit. A report without a baseline SHA becomes stale silently.
- Re-audit when security boundaries, dependency/model supply chains, release workflows, or core architecture materially change.


## Freshness semantics

Structured audits are anchored to an exact `audited_commit`.

- **Current** — the repository HEAD still equals the audited commit.
- **Stale** — HEAD moved and at least one relevant file changed.
- **Current-equivalent** — optional, explicit exception for repositories whose only post-audit changes are audit/control metadata.

A sidecar may declare:

```json
{
  "freshness": {
    "ignore_paths": ["audits/**", "portfolio/registry.json"]
  }
}
```

This exception is fail-closed and per-audit. If HEAD moved, every changed file must match an explicit ignore path; otherwise the audit is stale. Do not ignore source code, CI/workflow files, release configuration, security policy, or user-facing product code merely to keep an audit green.
