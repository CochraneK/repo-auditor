# repo-auditor · GitHub 总控中心

这个仓库现在只回答两个问题：

1. **它是 Public 还是 Private？**
2. **这个项目还要继续做，还是不用做了？**

不再使用 CORE / ACTIVE / INCUBATING / PARKED / ARCHIVED 这套生命周期。

## 唯一的行动状态

- `CONTINUE`：还要继续做
- `STOP`：不用做了

迁移期间允许临时出现 `TBD`，表示“还没判断”。目标是最终清零。

> **STOP 只是总控层的提示。**
> 它不会触发 GitHub Archive、Delete、改 Private/Public、改名或修改项目代码。

## 入口

- [`PORTFOLIO.md`](PORTFOLIO.md) — 人工查看的总控面板
- [`portfolio/registry.json`](portfolio/registry.json) — 机器可读项目清单
- [`POLICY.md`](POLICY.md) — 极简规则
- [`scripts/audit_registry.py`](scripts/audit_registry.py) — 自动校验

## 使用原则

以后看一个项目，只做一个判断：

> **我还要不要继续投入时间做它？**

如果要：`CONTINUE`

如果不要：`STOP`

Public / Private 只是仓库可见性，不影响这个判断。
