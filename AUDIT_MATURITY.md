# Audit maturity model

A green workflow is not automatically a complete audit.

| Level | Name | Meaning |
|---|---|---|
| L0 | Inventory | Repository is known to the control plane. |
| L1 | Evidence | Deterministic repository evidence was collected. |
| L2 | Triage | High-confidence engineering findings were derived. |
| L3 | Structured audit | Full rubric + evidence-backed report exists. |
| L4 | Semantic review | Context-aware product/research/UX/architecture review exists. |
| L5 | Remediated | Safe findings were fixed, tested and re-audited. |
| L6 | AI-ready | Durable handoff, agent instructions, status, decisions, architecture and validation paths exist. |
| L7 | Self-improving | Repeatable misses are promoted into rules, tests, skills or routing policy. |

Coverage states are `PASS`, `PARTIAL`, `BLOCKED`, and `FAILED`. Pages must keep **Priority**, **Quality**, **Audit Coverage**, and **AI Readiness** separate. `STOP` is a portfolio decision, not a quality failure.

Repeatable semantic problems discovered by a human/LLM reviewer should become regression rules when they generalize. Context-dependent judgments stay in the semantic-review layer instead of being forced into brittle static checks.

A repository can be L6 AI-ready while still having engineering findings, and can have green CI while account-wide Audit Coverage is PARTIAL. Maturity levels describe which assurance layers exist; they are not a single quality score.
