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
