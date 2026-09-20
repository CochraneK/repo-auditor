# Inference Claim Review Skill

## Purpose

Detect when a product or README turns a weak proxy, heuristic, model score or descriptive statistic into a stronger human claim than the evidence supports.

## Input

- user-facing copy;
- API/report fields;
- model/scoring code;
- research/validation docs;
- tests and examples.

## Checklist

Compare implementation semantics with user-facing claims:

- heuristic similarity vs identity/authentication probability;
- pitch/F0 vs sex/gender identity;
- affect-model labels vs direct internal emotion measurement;
- correlation/synchrony vs causation;
- prototype/reworded questionnaire output vs validated diagnosis;
- software test success vs psychometric/scientific validity;
- future-self generation vs prediction;
- model confidence vs real-world certainty.

For each mismatch ask:
1. What is actually computed?
2. What construct is claimed?
3. What validation would be required to bridge that gap?
4. Can wording be safely narrowed without changing the feature?
5. Does the issue generalize into a deterministic rule or regression contract?

## Output

Return:
- computed signal;
- claimed construct;
- evidence gap;
- severity;
- confidence;
- safer wording;
- code/data validation needed;
- deterministic-rule candidate, if generalizable.

Prefer narrowing unsupported claims over deleting useful measurements.
