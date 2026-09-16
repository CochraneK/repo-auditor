# Audit maturity model

repo-auditor reports **what level of assurance was actually achieved**. A green workflow is not automatically a complete audit.

| Level | Name | Meaning |
|---|---|---|
| L0 | Inventory | Repository is known to the control plane. |
| L1 | Evidence | Deterministic repository evidence was collected. |
| L2 | Triage | High-confidence engineering findings were derived from evidence. |
| L3 | Structured audit | Repository received the full rubric and evidence-backed report. |
| L4 | Semantic review | Context-aware review covers product/research/UX/architecture intent. |
| L5 | Remediated | Safe findings were fixed, tested, and re-audited. |

## Coverage states

- `PASS`: requested inventory is complete and no collection failure exists.
- `PARTIAL`: some requested inventory is invisible/uncollected, or only a lower maturity level was achieved.
- `BLOCKED`: an external credential/owner decision prevents required progress.
- `FAILED`: tooling or evidence validation failed.

Pages must show coverage independently from **Priority** and **Quality**. `STOP` is a portfolio decision, not a failing quality grade.

## Escalation

Deterministic rules should handle repeatable facts. New semantic problems discovered by a human/LLM reviewer should become regression rules when they generalize. Problems that depend on project intent remain in the semantic-review layer rather than being forced into brittle static checks.
