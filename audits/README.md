# Audits

This directory contains repository audit reports.

## Formats

Legacy audits may exist as Markdown only.

New structured audits should have:

```text
audits/<repo>-YYYY-MM-DD.md
audits/<repo>-YYYY-MM-DD.json
```

The JSON sidecar records the exact audited commit, CI evidence, findings, limitations, and re-audit triggers. CI validates the sidecar with:

```bash
python scripts/audit_reports.py
```

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
