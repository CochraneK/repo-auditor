# GitHub 总控规则

## Public / Private 分层

### Public layer

本公开仓库只允许保存：

- Public 仓库名称；
- Public 仓库的工作状态；
- Public 仓库的优先级；
- 适合公开的管理备注。

禁止把 Private 仓库名称、备注或其他 Private 总控元数据写入：

- `portfolio/registry.json`
- `PORTFOLIO.md`
- `docs/` GitHub Pages 资源

### Private layer

Private 项目必须在公开仓库之外管理。当前通过授权的 GitHub 连接按需读取；未来建议迁移到独立 private 管理仓库。

## Work status

- `CONTINUE` — 未来还会继续投入
- `STOP` — 当前不用继续做

`STOP` 不等于 Archive，也不等于 Delete。

## Priority score

优先级为 0–100，衡量“现在该不该花时间”，参考：

- 当前紧迫性
- 战略或工作价值
- 下一步明确度
- 近期时间窗口

### 分档

- `90–100` — P0 NOW
- `70–89` — P1 NEXT
- `50–69` — P2 PLANNED
- `20–49` — P3 LATER
- `1–19` — P4 LOW
- `0` — STOP

## 自动校验

公开 registry 必须满足：

- 每个项目 `visibility = public`；
- `STOP` 必须为 0 分；
- `CONTINUE` 必须大于 0 分；
- 分数与 priority band 一致；
- 不出现重复仓库。

任何删除、改 visibility、归档等高影响操作都必须单独执行。


## Repository audit

Public audit reports may contain only evidence obtainable from public repositories and public CI metadata.

Every new structured audit should record the exact audited commit and separate:

- portfolio priority;
- audit severity;
- verified facts;
- unverified/unknown settings.

Priority score is never a project quality score.

The public evidence collector must refuse private repositories.
