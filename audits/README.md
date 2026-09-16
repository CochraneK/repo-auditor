# Audits

This directory contains repository audit reports.

## Formats

Legacy audits may exist as Markdown only.

New structured audits should have:

```text
audits/<repo>-YYYY-MM-DD.md
audits/<repo>-YYYY-MM-DD.json
```

The JSON sidecar records the exact audited commit, CI evidence, a publication/IP gate, findings, limitations, and re-audit triggers. CI validates the sidecar with:

```bash
python scripts/audit_reports.py
```

## Publication / IP gate

Every new structured audit must explicitly record whether the repository is currently Public/Private and one recommendation: `public-ok`, `review-before-public`, `keep-private`, or `split-public-private`.

The gate is deliberately conservative. Potential patent value, employer/client/PI-requested work, background IP, confidential input, or unclear ownership should trigger review before new material is published. Keep personal contracts, employer names, private repository names, and other sensitive facts out of this public audit layer; record only the abstract trigger.

## Evidence collection

For a public repository:

```bash
python scripts/collect_repo_evidence.py CochraneK/long-gate \
  --out evidence/long-gate.json
```

The collector gathers GitHub facts such as repository metadata, head SHA, common project files, workflow status, lockfiles, and whether GitHub Action references use immutable commit SHAs.

It **does not** assign a quality score.

## Privacy

The public audit layer must not contain private repository names, private metadata, credentials, secrets, or private issue content.
