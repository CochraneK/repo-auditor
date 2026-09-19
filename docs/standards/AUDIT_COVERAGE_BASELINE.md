# Audit Coverage Baseline Standard

## Problem

A workflow can run successfully while its credential sees only part of the owner's repository inventory. Hard-coded historical totals eventually become stale as repositories are created, deleted, or change visibility.

repo-auditor therefore separates **execution success** from **coverage completeness** and stores only a privacy-safe aggregate baseline.

## Baseline kinds

### `lower-bound`

A conservative minimum known to exist.

- may contain only aggregate counts;
- never contains private repository names, URLs or SHAs;
- can prove that a scan is incomplete when observed counts fall below the bound;
- **cannot produce full coverage PASS**, even when the scan meets the lower bound.

### `exact`

An aggregate inventory explicitly verified from a credential with complete owner visibility.

- requires an explicit complete-visibility assertion;
- cannot be generated while scan failures exist;
- may support coverage PASS when the observed inventory matches all exact expectations.

## Canonical file

`portfolio/coverage-baseline.json`

This file is privacy-safe and intentionally contains counts/basis only.

Runtime `PORTFOLIO_EXPECTED_TOTAL` / `PORTFOLIO_EXPECTED_PRIVATE` values remain supported as explicit exact overrides, but normal CI should use the repository baseline instead of stale hard-coded workflow constants.

## Candidate generation

From an authenticated scan:

```bash
python scripts/coverage_baseline.py private-evidence/portfolio-scan.json \
  --kind lower-bound \
  --out private-evidence/coverage-baseline-candidate.json
```

An exact candidate requires an explicit assertion:

```bash
python scripts/coverage_baseline.py private-evidence/portfolio-scan.json \
  --kind exact \
  --assert-complete-visibility \
  --out private-evidence/coverage-baseline-candidate.json
```

Promotion of a candidate to the canonical public aggregate baseline is a deliberate evidence decision. The baseline must never publish private repository identifiers.

## Current state

The checked-in baseline is deliberately a **lower bound** because current automation has not demonstrated complete Private-repository visibility. This keeps the system fail-closed rather than pretending an old exact total is still authoritative.
