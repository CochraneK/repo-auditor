# Audit maturity model

A green workflow is not automatically a complete audit.

| Level | Name | Meaning |
|---|---|---|
| L0 | Inventory | Repository is known to the control plane. |
| L1 | Evidence | Deterministic repository evidence was collected. |
| L2 | Triage | High-confidence engineering findings were derived. |
| L3 | Structured audit | Full rubric + evidence-backed report exists. |
| L4 | Semantic review | Context-aware product/research/UX/architecture review exists. |
| L5 | Remediated | Safe findings were fixed, tested and re-audited. |\n| L6 | AI-ready | Durable handoff, agent instructions, status, decisions, architecture and validation paths exist. |\n| L7 | Self-improving | Repeatable misses are promoted into rules, tests, skills or routing policy. |

Coverage states are `PASS`, `PARTIAL`, `BLOCKED`, and `FAILED`. Pages must keep **Priority**, **Quality**, and **Audit Coverage** separate. `STOP` is a portfolio decision, not a quality failure.

Repeatable semantic problems discovered by a human/LLM reviewer should become regression rules when they generalize. Context-dependent judgments stay in the semantic-review layer instead of being forced into brittle static checks.
