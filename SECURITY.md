# Security policy

repo-auditor treats **publication-boundary failures** and **private-evidence leaks** as security issues.

## Report privately when appropriate

Do not put secrets, private-repository identities, private source code, employment/contract material, patient/client data, or unpublished IP evidence into a public issue.

If a finding could expose private evidence or bypass the Public/Private boundary, use GitHub private vulnerability reporting when available or another trusted private channel.

## In scope

Examples include:

- Private repository names, URLs, SHAs, notes, evidence, or findings appearing in GitHub Pages or other public artifacts;
- `private-evidence/` being committed, uploaded, or copied into `docs/` / `portfolio/`;
- live visibility verification failing open;
- a non-public repository entering the public registry or Pages bundle;
- a credential/token being printed, committed, or exposed in generated output;
- a path or workflow allowing private evidence to bypass `--allow-private`;
- deterministic audit checks reporting PASS when required evidence is unavailable.

## Safe reproductions

Use synthetic repository names and synthetic/minimal fixtures whenever possible. A normal bug report should not require real private-repository evidence.

## Coverage is not secrecy

A `PARTIAL` account-wide scan is not itself a security failure. It means the current credential cannot prove complete coverage. repo-auditor must preserve that uncertainty rather than claiming PASS.

## Boundary

Public Pages may contain:

- public repository details;
- privacy-safe aggregate inventory/coverage counts;
- public audit findings.

Public Pages must never contain identifiable details about private repositories.

See [POLICY.md](POLICY.md), [AUDIT_RUBRIC.md](AUDIT_RUBRIC.md), and [AGENTS.md](AGENTS.md).
