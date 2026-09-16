# Execution Routing

repo-auditor does not assume that one AI surface is best for every task. After auditing and diagnosing a repository, it may recommend an **execution mode** and only then map that mode to currently available tools.

The routing layer is provider-agnostic: product names are adapters, not ontology.

## Execution modes

| Mode | Use when | Typical work |
| --- | --- | --- |
| `CHAT` | The task is bounded and benefits from interactive reasoning or targeted repository reads. | explain code, discuss design, inspect a known file, small documentation/metadata change |
| `PLAN` | Ambiguity or architectural coupling should be resolved before execution. | architecture, migration design, decomposition, acceptance criteria |
| `CODE` | The work is primarily repository engineering and needs edits plus executable verification. | multi-file changes, refactors, build/test/lint/debug loops |
| `WORK` | The goal spans systems or requires sustained autonomous orchestration. | research + browser + files + apps + repository + final deliverable |
| `WATCH` | Value comes from repeated future checks rather than a one-off run. | CI health, dependency/security drift, freshness, release monitoring |
| `HUMAN` | A decision requires authority, accountability, consent, unavailable credentials, or an irreversible/high-impact choice. | visibility/IP/license decisions, permissions, contractual commitments |

Modes can compose. A task may route as `CHAT -> PLAN -> CODE -> VERIFY`, or `PLAN -> WORK -> CODE -> VERIFY -> WATCH`.

## Requirement vector

Routing should be evidence-backed. Evaluate at least:

- `scope`: local / multi-file / repository-wide / cross-system
- `ambiguity`: how much must be decided before editing
- `repo_execution`: need for source edits, shell, build, test, lint, or debugging
- `iteration_depth`: expected observe-edit-run-fix cycles
- `cross_system_dependency`: browser, external apps, files, APIs, or human workflows
- `verification_cost`: difficulty of proving the result
- `context_cost`: likely context/token load and repeated repository exploration
- `autonomy_need`: whether the user benefits from long-horizon unattended progress
- `risk`: reversibility, permissions, publication/IP, money, and other owner-choice boundaries

Do not treat these as a single quality score. They are routing evidence.

## Cost-aware routing

Choose the **least expensive sufficient execution strategy**, not the most powerful available tool.

A stronger agent is not automatically the recommendation. If targeted repository access can solve a bounded task reliably, prefer that over an autonomous repository-wide loop. Escalate when the cheaper mode stops being sufficient.

A routing result should distinguish:

- `best_capability`: strongest fit without considering efficiency;
- `best_value`: sufficient fit with the lowest expected execution/context cost;
- `recommended`: the mode or composed route repo-auditor recommends;
- `escalate_when`: observable conditions that justify moving to a stronger mode.

## Tool capability registry

Concrete products are mapped through adapters. An adapter may describe:

```text
id
provider
surfaces
repo_read
repo_write
shell
browser
computer_use
cross_app
planning_depth
autonomous_iteration
verification
context_efficiency
cost_model
latency
user_control
```

Examples may include Chat + GitHub connector, Codex, ChatGPT Work, WorkBuddy, Claude Code, Cursor, Devin, or future tools. These examples must not become hard-coded assumptions in the core routing ontology.

When a provider changes product names, pricing, quotas, models, or capabilities, update the adapter/profile rather than the audit schema's conceptual model.

## Task-level routing

Route **tasks**, not repositories. A single repository can legitimately use different modes:

```text
architecture review       -> CHAT / PLAN
competitor research       -> WORK
multi-file implementation -> CODE
build + test + debug      -> CODE
README polish             -> CHAT
final repository audit    -> AUDIT / VERIFY
ongoing CI drift          -> WATCH
```

## BLOCKED is a transition, not a destination

When execution is blocked:

```text
BLOCKED
  -> identify blocker
  -> classify authority/dependency
  -> select another executor or route
  -> resolve if authorized and possible
  -> retry
  -> verify
```

Stop only when the remaining blocker genuinely requires `HUMAN`, unavailable external authority/evidence, or a prohibited/unsupported action. Record the blocker and the exact condition that would unblock it.

## Recommended lifecycle

```text
OBSERVE
  -> AUDIT
  -> DIAGNOSE
  -> PLAN (when needed)
  -> ROUTE
  -> EXECUTE
  -> VERIFY
  -> RE-AUDIT
  -> ESCALATE / WATCH / PASS
```

Routing never overrides the Publication / IP gate or the GO-mode stop conditions in `AGENTS.md` and `POLICY.md`.