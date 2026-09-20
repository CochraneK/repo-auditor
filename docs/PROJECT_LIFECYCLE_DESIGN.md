# Project Lifecycle Design

## Purpose

Extend repo-auditor from repository inspection toward portfolio-aware management.

This is a design document, not an automatic lifecycle enforcement system.

## Responsibilities

### Audit

Question:

> Is this repository healthy?

Examples:
- security
- secrets
- license
- quality
- dependency risks
- documentation

### Portfolio Management

Question:

> What is the current role of this project?

Suggested states:

- seed: valuable idea, not currently active
- active: receiving current investment
- maintenance: completed but maintained
- archived: preserved for future reference

## Project relationships

Projects may have relationships:

- main
- derivative
- experiment
- analysis
- archive

Example:

ARIS4C

├── main research project
├── paper repository
├── analysis repository
└── experimental tools

## Boundary

repo-auditor should manage project metadata and relationships.
It should not become a replacement for individual project systems.

Research continuity remains handled by project-specific systems such as ARIS4C.
