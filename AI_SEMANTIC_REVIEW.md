# AI Semantic Review

L4 semantic review is optional. Deterministic inventory, evidence, triage, privacy gates and coverage remain authoritative even when no model is configured.

## Runtime contract

`scripts/semantic_review.py` sends one evidence package to one explicitly selected OpenAI-compatible provider. There is **no automatic cross-provider fallback**.

The model must return structured JSON with:

- `summary`
- `confidence`
- `findings[]`
- `regression_candidates[]`

Each finding must include:

- `code`
- `severity` — P0 / P1 / P2 / P3
- `title`
- `evidence`
- `reasoning`
- `remediation`
- `confidence`
- `auto_fixable`
- `requires_owner_decision`

The runtime validates this contract before marking the L4 review complete. The machine-readable companion schema is [`schemas/semantic_review.schema.json`](schemas/semantic_review.schema.json).

## Providers

The CLI supports these OpenAI-compatible presets:

- `deepseek`
- `glm`
- `freellmapi`
- `custom`

Provider model names are deliberately configurable rather than permanently hard-coded. Pass `--model` or `AI_REVIEW_MODEL`.

### DeepSeek

```bash
AI_REVIEW_MODEL=<current-model> \
DEEPSEEK_API_KEY=... \
python scripts/semantic_review.py evidence.json --provider deepseek
```

### GLM

```bash
AI_REVIEW_MODEL=<current-model> \
ZHIPU_API_KEY=... \
python scripts/semantic_review.py evidence.json --provider glm
```

### Local FreeLLMAPI-compatible gateway

```bash
python scripts/semantic_review.py evidence.json --provider freellmapi
```

A GitHub-hosted runner cannot normally reach a gateway running on your own computer at `localhost`. Use the local CLI for that case, or provide an explicitly approved reachable endpoint.

### Custom OpenAI-compatible endpoint

```bash
AI_REVIEW_BASE_URL=https://provider.example/v1 \
AI_REVIEW_MODEL=<model> \
AI_REVIEW_API_KEY=... \
python scripts/semantic_review.py evidence.json --provider custom
```

## Manual GitHub Actions review

Normal push / pull-request CI does **not** call an external LLM.

Use **Actions → Portfolio Audit → Run workflow** and enable `semantic_review`. The manual form requires an explicit repository, provider and current model name.

For a Public repository, the workflow may use the normal repository token to collect evidence.

For a Private repository, two separate permissions exist:

1. `allow_private_repository` — permits authenticated evidence collection.
2. `allow_private_external_ai` — separately permits sending that Private evidence to the selected external model.

The second switch is intentionally independent. Merely allowing Private GitHub collection does not authorize external AI disclosure.

Provider credentials remain GitHub Actions secrets:

- `DEEPSEEK_API_KEY`
- `ZHIPU_API_KEY`
- `AI_REVIEW_API_KEY`
- `AI_REVIEW_BASE_URL` for `custom`
- `PORTFOLIO_AUDIT_TOKEN` when the normal workflow token cannot see the target repository

The full evidence, semantic report and meta-learning candidate details stay in `private-evidence/` on the ephemeral runner and are neither committed nor uploaded by the workflow.

For Public repositories, the workflow summary may show finding titles and remediation. For Private repositories, the summary is aggregate-only: provider/model, confidence, finding count and severity counts.

## Failure categories

Provider/runtime failures are classified so a red job is actionable:

- `auth`
- `rate-limit`
- `provider-unavailable`
- `provider-http-error`
- `malformed-output`
- `configuration`
- `privacy-policy`
- `unknown`

This avoids treating all external-model failures as the same problem.

## Privacy boundary

Public evidence may use an approved external provider.

Private evidence may use a local provider by default. Sending Private repository evidence to an external provider requires explicit `--allow-private-external-ai` in the CLI or the corresponding manual-workflow switch.

No API key is written to the report. Provider name, base URL, model and trust class are recorded for auditability.

## Assurance rule

L4 findings may add context-aware issues. They may not:

- erase deterministic failures;
- convert incomplete L0/L1 coverage to PASS;
- auto-decide licensing, IP, visibility, deletion/archive or destructive-history owner choices;
- become deterministic rules merely because one model suggested them.

Generalizable findings go through the L7 meta-learning promotion gate.
