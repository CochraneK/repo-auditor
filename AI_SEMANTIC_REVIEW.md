# AI Semantic Review (L4)

`repo-auditor` can optionally send an evidence package to an AI reviewer after deterministic triage. This is the L4 layer: semantic/product/research/UX/architecture judgment. It does **not** replace L0-L3 checks.

## Provider-neutral contract

The reviewer uses an OpenAI-compatible `POST /v1/chat/completions` endpoint. Configure only environment variables / GitHub Actions secrets:

```bash
export AI_REVIEW_BASE_URL="https://api.openai.com/v1"
export AI_REVIEW_API_KEY="..."
export AI_REVIEW_MODEL="..."
python scripts/semantic_review.py private-evidence/repository-evidence.json --out private-evidence/semantic-review.json
```

Never commit provider keys or private evidence.

## Free / aggregate gateways

Because the transport is OpenAI-compatible, the same reviewer can target FreeLLMAPI, OpenRouter-compatible gateways, LiteLLM, LM Studio, vLLM, llama.cpp, or another compatible router by changing `AI_REVIEW_BASE_URL`, `AI_REVIEW_API_KEY`, and `AI_REVIEW_MODEL`.

For a local FreeLLMAPI instance the base URL is commonly `http://localhost:3001/v1` and model `auto`. In GitHub-hosted Actions, `localhost` refers to the runner, not your home computer: run/deploy the gateway where the runner can reach it, use a self-hosted runner, or use a remote compatible endpoint.

Free-tier availability, quotas, privacy terms, retention and model quality can change. `repo-auditor` therefore treats the provider as configuration rather than hard-coding a supposedly-free service.

## Safety / assurance boundary

- AI output is evidence-backed advice, not ground truth.
- L4 output must never turn an incomplete L0/L1 inventory into PASS.
- Private repositories may only be sent to providers the owner explicitly authorizes.
- AI findings do not auto-merge owner decisions (visibility, licensing/IP, destructive changes, secrets, publication decisions).
- Generalizable findings should become deterministic regression rules; context-dependent findings stay L4.

## Output

The JSON report records `assurance_level: L4`, provider/model metadata, confidence, structured findings, and `regression_candidates`. Secrets are never included.
