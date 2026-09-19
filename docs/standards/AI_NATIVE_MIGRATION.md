# Portfolio AI-native Migration Standard

## Goal

Move repositories toward durable agent continuity without blindly dropping generic boilerplate into every project.

The migration path is evidence-driven:

```text
portfolio scan
→ AI-readiness signals
→ migration plan
→ bounded repository-specific edit
→ validation
→ handoff checkpoint
→ re-audit
```

## Planner

```bash
python scripts/ai_native_migration_plan.py \
  private-evidence/portfolio-scan.json \
  --out private-evidence/ai-native-migration-plan.json
```

The detailed plan remains private because it may contain Private repository identifiers.

The planner can use the public registry to prioritize public CONTINUE work while preserving AI-readiness as a separate dimension.

## Action classes

- **scaffold-then-contextualize** — safe to create missing handoff/status/decision structure, but content must be filled from real repository state before treating it as ready.
- **contextual-edit** — README, architecture, validation and AGENTS instructions require repository-specific understanding.
- **auto_merge = false** by default for migration-plan items; documentation that claims project state must be reviewed against evidence.

## Migration order

When no repository is explicitly selected:

1. public P0/P1 CONTINUE repositories with low AI readiness;
2. currently active strategic repositories;
3. P2/P3 repositories when their next gate is already clear;
4. STOP repositories only for minimal safety/continuity maintenance, not cosmetic expansion;
5. Private repositories remain in private planning output and follow provider/privacy boundaries.

## Done gate

A migration batch is not complete merely because files exist. Re-audit must verify:

- instructions are repository-specific;
- current status matches evidence;
- next action is executable;
- validation commands are real;
- architecture claims match implementation;
- README visual/quick-start is useful rather than decorative;
- canonical identity is CochraneK;
- no private evidence leaked to public surfaces.
