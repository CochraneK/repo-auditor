# repo-auditor · GitHub Portfolio Control Center

`repo-auditor` 是 CochraneK GitHub 项目组合的总控中心，用来解决三个问题：

1. **我现在到底在维护什么？**
2. **哪些项目是真正核心，哪些只是实验或暂存？**
3. **什么时候应该暂停、归档，而不是继续让仓库无限增长？**

当前已登记 **41 个仓库**。本仓库不自动删除、归档或修改其他项目。

## Start here

- [`PORTFOLIO.md`](PORTFOLIO.md) — 当前项目组合总览与评审队列
- [`POLICY.md`](POLICY.md) — 生命周期、WIP 上限和归档规则
- [`portfolio/registry.json`](portfolio/registry.json) — 41 个仓库的机器可读登记表
- [`scripts/audit_registry.py`](scripts/audit_registry.py) — 登记表校验器

## Lifecycle

```text
UNCLASSIFIED
     │
     ├──> CORE
     ├──> ACTIVE
     ├──> INCUBATING
     ├──> PARKED
     └──> ARCHIVED
```

`UNCLASSIFIED` 只用于第一次整理已有仓库。稳定运行后，目标是把它清零。

### CORE
真正长期投入的核心资产。硬上限 **7 个**。

### ACTIVE
当前明确推进、有近期交付目标的项目。

### INCUBATING
原型、实验、探索项目。必须有验证问题，不应永久停留。

### PARKED
暂时不推进，但有保留价值。

### ARCHIVED
项目已结束；最终应与 GitHub 仓库的 archived 状态一致。

## Automation

`Portfolio Audit` GitHub Action 会在 registry / policy / audit script 变更时运行，并支持手动运行。它会：

- 检查 41 个仓库记录是否重名；
- 检查 lifecycle / activity band / required fields；
- 检查 `CORE <= 7`；
- 输出各生命周期和活跃度统计；
- 列出 archive-review 候选。

它**不会**自动操作其他仓库。

## Operating rule

新增项目之前先问：

> 这是 CORE、ACTIVE，还是只是 INCUBATING？

如果 `CORE + ACTIVE` 已经很多，优先结束一个旧项目，而不是继续增加 WIP。

---

Snapshot initialized: **2026-09-15**
