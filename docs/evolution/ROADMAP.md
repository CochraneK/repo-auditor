# repo-auditor Evolution Roadmap

## Current direction

repo-auditor is evolving from repository scanner into an AI-native repository operating system.

## Milestones

### Phase 1: Foundation

- [x] ARIS4C learning record
- [x] AI-native repository model
- [x] AI readiness audit
- [x] Agent handoff checks

### Phase 2: Agent collaboration

- [x] Skill system
- [ ] Reviewer / Executor separation
- [ ] Persistent audit memory

### Phase 3: Self improvement

- [ ] Meta-audit reports
- [x] Rule candidates
- [ ] Regression generation

## Principles

- Evidence before conclusions
- AI assists decisions, does not silently override owners
- New lessons should become tests or rules when possible


## Downstream migration loop

The control plane is now being dogfooded across active repositories:

1. scan / rank;
2. migrate durable handoff and validation;
3. remediate safe concrete findings;
4. run CI;
5. merge;
6. feed generalizable lessons back into skills/rules;
7. rescan portfolio.

Current promoted skill areas include privacy boundaries, asset provenance, inference-claim drift, security, README quality, agent handoff, AI readiness and canonical identity.


## 2026-11-02 reliability checkpoint

- [ ] Restore private-scan authentication after the scheduled HTTP 401 and prove complete/partial coverage honestly.
- [ ] Turn 401/403/incomplete inventory into explicit fail-closed `external-blocked` outputs with safe unblock instructions.
- [ ] Enforce exact-head CI evidence and re-audit after remediation; never inherit stale green results.
- [ ] Extend attack fixtures for packaging/config escapes, pinning/version drift and README/runtime mismatch.
- [ ] Preserve orthogonality of priority, quality vector, coverage, AI readiness and publication/IP gate.

See [2026-11-02 audit reliability roadmap](2026-11-02-audit-reliability.md).
