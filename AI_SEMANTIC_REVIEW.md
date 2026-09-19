# AI Semantic Review

L4 semantic review is optional. Deterministic inventory, evidence, triage and coverage remain authoritative even when no model is configured.

## Providers

The runtime uses one OpenAI-compatible transport with configurable presets:

- `deepseek`
- `glm`
- `freellmapi`
- `custom`

Provider model names are intentionally not hard-coded for DeepSeek/GLM because aliases and availability change. Pass `--model` or `AI_REVIEW_MODEL`.

## Examples

```bash
AI_REVIEW_MODEL=<current-model> \
DEEPSEEK_API_KEY=... \
python scripts/semantic_review.py evidence.json --provider deepseek
```

```bash
AI_REVIEW_MODEL=<current-model> \
ZHIPU_API_KEY=... \
python scripts/semantic_review.py evidence.json --provider glm
```

Local FreeLLMAPI-compatible gateway:

```bash
python scripts/semantic_review.py evidence.json --provider freellmapi
```

Custom OpenAI-compatible endpoint:

```bash
AI_REVIEW_BASE_URL=https://provider.example/v1 \
AI_REVIEW_MODEL=<model> \
AI_REVIEW_API_KEY=... \
python scripts/semantic_review.py evidence.json --provider custom
```

## Privacy boundary

Public evidence may use an approved external provider. Private evidence may use a local provider by default. Sending private repository evidence to an external provider requires explicit `--allow-private-external-ai`.

No API key is written to the report. Provider name, base URL, model and trust class are recorded for auditability.

## Assurance rule

L4 findings may add context-aware issues. They may not erase deterministic failures, change incomplete coverage to PASS, or auto-decide licensing/IP/visibility/destructive owner choices.
