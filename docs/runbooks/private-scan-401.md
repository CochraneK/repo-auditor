# Private portfolio scan: GitHub 401 Unauthorized

## Symptom

A scheduled or dispatched `Portfolio Audit` may show:
- deterministic `audit` job succeeded;
- `private-portfolio-scan` failed with `HTTP Error 401: Unauthorized`.

This is **not** proof that the scanner's code tests failed, and **not** proof that private repository coverage succeeded.

## Observed checkpoint

2026-11-01 scheduled run: https://github.com/CochraneK/repo-auditor/actions/runs/41285245958

The private-scan job failed with HTTP 401. The exact credential configuration and root cause were **not verified**.

## Recovery (owner/admin settings required)

1. Open **repository Settings → Secrets and variables → Actions** (or the applicable organization secret policy). Confirm that the intended `PORTFOLIO_AUDIT_TOKEN` secret is present and available to this repo. Do not paste or print its value.
2. Check the token/service identity's current validity, expiry/revocation state, repo selection, read permissions and access to the repository inventory scope being audited.
3. Rotate/replace the credential through GitHub's secure secret editor if expired or revoked. Never place credentials in a commit, Issue, Pages artifact, report, or assistant output.
4. Re-run the `Portfolio Audit` workflow using owner-authorized settings. Keep private external-AI review **off** unless the owner explicitly approves that separate disclosure.
5. Check `private-portfolio-scan` logs for success without printed tokens, repository content, raw private evidence, or URLs. Validate expected coverage against the canonical `portfolio/coverage-baseline.json` semantics.
6. Do not promote a **lower-bound** inventory baseline to exact PASS merely because it matches; exact coverage needs complete authenticated visibility asserted and independently checked.
7. Verify the generated public Pages/report bundle contains no private repository name, path, URL, SHA, source snippets, security findings or private audit payload.
8. Only after a fresh confirmed scan should the issue move from `external-blocked` to re-audited/Done.

## Suggested error-handling improvement

A 401 should yield a compact machine-readable remediation record, for example:

```json
{
  "control": "private_repository_coverage",
  "state": "external-blocked",
  "category": "authentication_unauthorized",
  "coverage": "unverified",
  "retryable_after": "owner_restores_valid_github_credential",
  "public_artifact_safe": true
}
```

Do not include token, detailed private inventory or server response text if it might expose sensitive configuration.

## Distinguish failure classes

- **401:** unauthorized/invalid authentication; diagnose secret/token/account configuration.
- **403:** permission denied, policy or limit; distinguish from missing scope with sanitized evidence.
- **404:** private repo not visible or path absent; do not automatically interpret as repository deleted.
- **Rate limit / timeout:** retry with backoff and preserve PARTIAL coverage.
- **Some repositories inaccessible:** maintain explicit partial coverage and missing-evidence count; do not silently drop them.
