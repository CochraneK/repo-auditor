# Privacy Boundary Review Skill

## Purpose

Review whether a repository's stated privacy behavior matches its actual data flow, persistence, hosting and logging boundaries.

## Input

- repository evidence;
- README/privacy/consent copy;
- runtime and network code;
- storage paths;
- deployment docs;
- workflow/publication surfaces.

## Checklist

- What raw user data enters the system?
- What derived data is created?
- Which data is request-scoped, memory-only, browser-local, persisted, exported, or uploaded?
- Does the implementation contact a network service despite “local-only” wording?
- Does privacy copy distinguish application persistence from hosting/proxy/platform logs?
- Are retention/deletion/TTL statements backed by implementation?
- Are sensitive local/runtime paths excluded from Git?
- Are browser CORS/network origins broader than needed?
- Does a public demo accidentally use an owner-maintained production endpoint?
- Are consent statements accurate for the real deployment architecture?

## Output

Return:
- finding;
- evidence;
- severity;
- confidence;
- privacy boundary affected;
- mismatch between claim and implementation;
- remediation;
- auto-fixable;
- requires owner/external decision.

Do not turn absence of evidence into a privacy PASS. If hosting/logging behavior cannot be verified, mark it unverified.
