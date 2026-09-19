# ARIS4C Learning Report

## Purpose

This document records design lessons adopted from ARIS-style agent workflows and maps them into repo-auditor.

## Adopted principles

### 1. Agent workflow over one-shot review

A repository review should become a loop:

Inventory → Evidence → Review → Remediation → Validation → Learning

### 2. Persistent context

Important project knowledge should live in the repository rather than only in chat history.

Planned artifacts:

- AGENTS.md
- HANDOFF.md
- STATUS.md
- DECISIONS.md

### 3. Skill-based expansion

New audit abilities should be modular skills rather than hard-coded one-off checks.

### 4. Multi-agent separation

Future architecture separates:

- Scanner: collects evidence
- Reviewer: reasons about issues
- Executor: applies safe changes
- Validator: verifies outcomes

## Not adopted blindly

repo-auditor remains fail-closed for security, privacy, and destructive operations. AI suggestions do not automatically override owner decisions.

## Roadmap impact

ARIS-inspired concepts become part of the AI-native repository roadmap:

- Skills
- Memory
- Handoff
- Meta-audit
- Self-improving rules
