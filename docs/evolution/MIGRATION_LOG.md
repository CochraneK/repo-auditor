# AI-Native Migration Log

This log records downstream repository migrations that fed new lessons back into repo-auditor. It is a public-safe summary, not a replacement for each repository's own Git history.

## 2026-09-20

### psy-exp

Adopted durable AGENTS / HANDOFF / STATUS / DECISIONS, architecture/trust-boundary docs and immutable CI Action refs.

**Generalized lesson:** research-software CI must not be described as psychometric or clinical validation.

### AI-Ques

Added durable multi-module handoff while preserving module-native files and the shared-profile boundary as canonical truth.

**Generalized lesson:** handoff files summarize state; they must not become a second product/data truth.

### ai-uni

Added cold-start agent handoff, reconciled stale STATUS/TODO state, documented syntax-only CI limits and pinned Actions.

**Generalized lesson:** stale project-state documentation is itself an AI-readiness defect.

### FLP-Webui

Added AI-native handoff, portable CI, trust-boundary diagrams and upstream FasterLivePortrait notices without choosing a license for owner-authored additions.

**Generalized lesson:** code license, model license, binary redistribution and owner license choice are orthogonal.

### RVC_factor

Added portable CI and explicit acoustic interpretation contracts.

**Generalized lesson:** acoustic heuristics must not silently become identity, biological-sex, psychological or clinical claims.

### VA_emotion

Added handoff/CI and preserved the boundary between computational affect estimates and direct internal-state or high-stakes conclusions.

**Generalized lesson:** model-output semantics and downstream human claims require a dedicated inference-claim review.

### Voice-compare

Remediated substantive issues in addition to handoff:
- removed F0-based male/female classification;
- replaced it with neutral pitch bands;
- narrowed similarity wording to an uncalibrated acoustic-feature cosine heuristic;
- removed wildcard CORS;
- added upload/session/sequence guards;
- removed a maintainer deployment endpoint from public config;
- made privacy copy acknowledge hosting/platform processing.

**Generalized lessons:** privacy-claim drift and inference-claim drift deserve reusable review skills.

### Voicemod_Portrait

Added handoff, pinned Pages Actions, portable quality CI and an explicit asset-provenance gate. Publicly downloadable datasets/assets are no longer described as automatically open for redistribution.

**Generalized lesson:** asset provenance is a release/IP dimension distinct from code quality.

## Meta-learning promoted from these migrations

New reusable skills:
- `privacy-boundary-review`
- `asset-provenance-review`
- `inference-claim-review`

Promotion rule remains:

```text
observed repository problem
→ evidence-backed generalized lesson
→ reusable skill / deterministic candidate
→ regression test where safely machine-checkable
→ re-audit
```

A single model suggestion is not sufficient to create a deterministic rule.
