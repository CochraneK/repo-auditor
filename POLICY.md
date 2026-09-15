# Portfolio Governance Policy

本仓库是 `CochraneK` GitHub 项目组合的总控中心。目标不是“保持所有仓库都活跃”，而是让每个仓库都有清晰的生命周期、用途和下一步。

## Lifecycle

| State | Definition | Expected behavior |
|---|---|---|
| `CORE` | 长期核心资产 | 持续维护；必须有明确目标、下一步和负责人 |
| `ACTIVE` | 当前明确推进 | 有近期交付目标；定期复盘 |
| `INCUBATING` | 原型 / 实验 / 探索 | 必须有验证问题；验证后转 ACTIVE、PARKED 或 ARCHIVED |
| `PARKED` | 暂停但保留 | 不要求持续提交；保留原因应清楚 |
| `ARCHIVED` | 已结束 | registry 状态与 GitHub archived 状态应最终一致 |
| `UNCLASSIFIED` | 迁移期临时状态 | 只用于尚未人工判断的既有仓库，不应长期保留 |

## WIP limits

- `CORE` 硬上限：**7**。
- `CORE + ACTIVE` 建议上限：**12**。
- 新建仓库默认不得直接进入 `CORE`；通常从 `INCUBATING` 开始。
- 若达到 WIP 上限，启动新项目之前应先降级、暂停或结束一个已有项目。

## Review rules

提交活跃度只是“提醒信号”，不是成熟度判断：

- 0–30 天：近期活跃，优先判断是否真的值得持续投入。
- 31–90 天：检查是否仍有明确下一步。
- 91–180 天：默认进入暂停/继续评审。
- 181–365 天：优先判断是否应 PARKED。
- >365 天：进入归档评审队列。

**任何规则都不得自动删除或自动归档仓库。** 归档必须是人工决定。

## Minimum metadata

每个稳定状态项目最终应补齐：

- `category`
- `lifecycle`
- `next_action`
- 清晰 README（用途、运行方式或项目说明）
- 若为公开项目：避免提交密钥、真实个人数据、研究敏感数据

## Monthly review

每月一次：

1. 先处理 `archive-review`。
2. 清理 `UNCLASSIFIED`。
3. 检查 `CORE + ACTIVE` 是否超过 WIP 上限。
4. 检查 CORE 是否仍然值得占用核心槽位。
5. 更新 `portfolio/registry.json` 和 `PORTFOLIO.md`。

## Safety principle

总控中心默认采取“无损管理”：

- 不自动删除仓库；
- 不自动改 visibility；
- 不自动 archive；
- 不自动重命名；
- 不自动修改其他仓库代码。

高影响操作必须单独确认。
