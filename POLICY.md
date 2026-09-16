# GitHub 总控规则

## Public / Private 分层

### Public layer

`repo-auditor` 控制仓库可以是 Private；**GitHub Pages 公开层仍只能保存和发布 Public 仓库信息**。公开运行时只读取 `docs/data/` 的构建快照，不读取 private GitHub raw content。

Public Pages bundle 只允许保存：

- Public 仓库名称；
- Public 仓库的工作状态；
- Public 仓库的优先级；
- 适合公开的管理备注。

禁止把 Private 仓库名称、备注或其他 Private 总控元数据写入：

- `portfolio/registry.json`
- `PORTFOLIO.md`
- `docs/` GitHub Pages 资源

### Private layer

当控制仓库为 Private 时，可以在授权边界内审计 Private repository；但 private evidence 不得进入 `docs/`、`portfolio/registry.json` 或其他 Pages payload。`collect_repo_evidence.py --allow-private` 需要显式认证，并禁止把 private evidence 写入 `docs/` 或 `portfolio/`。

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

The evidence collector refuses private repositories by default. Authenticated private collection requires explicit `--allow-private`; public Pages export still refuses every non-public record.


## GO remediation mode

默认工作方式是 **Audit → Remediate → Re-audit**，而不是只输出建议。

当 owner 已授权 GO mode 时：

- `auto-fix` findings 直接进入修复队列；
- 使用独立 branch / PR；
- 修改后运行相关测试与 CI；
- CI 通过后重新审计 exact commit；
- 在现有授权范围内、且变更可逆时可继续合并，不需要重复询问。

以下情况必须停在 `owner-choice` 或 `external-blocked`，不能为了“审计全绿”擅自处理：

- 删除/Archive repository；
- Public / Private visibility 变更；
- force-push 或重写公开历史；
- 选择/变更 LICENSE；
- 版权、专利、IP 转让/许可/放弃；
- 发布潜在专利或保密材料；
- 暴露 secret、Private 仓库元数据、个人合同、患者/客户资料；
- 产生重要外部费用或合同承诺；
- 缺少必要的仓库/组织管理权限。

完整 agent contract 见 `AGENTS.md`。

开放的自动修复队列：

```bash
python scripts/remediation_queue.py
python scripts/remediation_queue.py --repository CochraneK/long-gate
```
