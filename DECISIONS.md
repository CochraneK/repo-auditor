# Decisions

## Canonical identity
Use **CochraneK** for repository-facing identity.

## Assurance separation
Engineering CI, Audit Coverage, Priority, Quality, AI Readiness and Semantic Review are separate concepts. A green CI run does not imply complete audit coverage.

## Privacy boundary
Private evidence remains in gitignored private-evidence storage. Public Pages may expose only privacy-safe aggregates.

## AI review policy
Deterministic evidence remains authoritative for L0-L3. L4 semantic review may add context-aware findings but cannot erase deterministic failures or incomplete coverage.

Private repository evidence may be sent to a local model by default. Sending it to an external provider requires explicit authorization.

## Agent workflow
Use separate responsibilities for exploration/evidence, building, reviewing and final merge judgment. A single model may fill multiple roles only when the role transition and evidence are explicit.

## Learning loop
Generalizable human/AI findings should become deterministic rules plus regression tests. Context-dependent judgments stay in semantic review.


## Generated public progress surfaces

README status visuals and `PROGRESS_REPORT.md` are derived from the public registry plus privacy-safe account aggregate. They must not become a manually maintained second source of truth.

The progress report separates operating priority, repository quality, audit coverage, AI readiness, and semantic review. Generated visuals may summarize only privacy-safe aggregates.


## Coverage baseline semantics

Historical exact repository totals are not authoritative indefinitely. Normal automation uses a privacy-safe checked-in baseline. A lower-bound baseline is fail-closed and cannot produce Audit Coverage PASS. An exact baseline requires explicit evidence of complete owner visibility.

## Portfolio migration semantics

AI-readiness gaps generate a migration plan, not automatic truth-bearing documentation. Scaffolding may create missing structure, but repository-specific status, decisions, architecture and README claims must be contextualized and re-audited before they count as ready.


## Manual semantic review

External L4 review is opt-in and manual in GitHub Actions. Normal CI never calls an external model.

Private repository collection permission and Private evidence disclosure to an external AI are two independent authorizations. The workflow stores full Private semantic artifacts only on the ephemeral runner and exposes aggregate-only summaries for Private targets.

Provider/model provenance is recorded. Cross-provider fallback is not automatic because silent fallback would change privacy, cost and model-behavior assumptions.


## Public per-repository AI readiness

Pages may expose AI-readiness details for repositories whose live/public registry identity is already public. The privacy-safe account summary must exclude all Private repository identifiers from the per-repository readiness map.

AI readiness remains an onboarding/continuity dimension. It must not be presented as repository quality, scientific validity, priority, or Audit Coverage.

## 2026-09-23 — Public showcase mirrors from private repositories

- `repo-auditor` is the intended public showcase/control repository.
- Source repositories may remain Private while selected, reviewed static artifacts are mirrored under `docs/showcase/`.
- `docs/showcase/manifest.json` is the canonical publication allowlist.
- Private repo URLs, SHAs, audit evidence, internal notes, credentials, real user/research data, admin surfaces and unreviewed IP are excluded.
- The public audit registry remains public-repository-only; showcase publication is a separate layer.
- Repository visibility itself remains an owner/admin action; the current ChatGPT GitHub connector can write files but does not expose the visibility mutation.
