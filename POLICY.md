# GitHub 总控规则

## Public / Private 分层

### Public audit layer

公开审计数据（`portfolio/registry.json`、`PORTFOLIO.md`、`docs/data/`）仍然只记录 **Public repositories**。Private repository 的审计证据、SHA、内部备注、findings 和源码不得进入公开审计 payload。

### Public showcase layer

允许把 Private repository 中**经过明确筛选、适合公开的静态展示产物**镜像到 `docs/showcase/`。这与源仓库 visibility 解耦：

- 源 repository 可以继续保持 Private；
- 公开层可以出现项目展示名称以及运行该静态页面所必需的 HTML/CSS/JS/公开演示数据；
- 每个镜像必须进入 `docs/showcase/manifest.json` allowlist；
- 只发布展示副本，不提供 Private repository URL、Git SHA、内部审计证据、内部 TODO/备注或完整源码；
- 不发布 secret/token、真实用户或研究数据、患者/客户资料、后台管理面、未审查的研究/IP/专利候选内容；
- 发现不确定项时 fail closed：不镜像，直到完成公开安全审查。

Private 源仓库的静态展示页公开，**不等于源仓库公开**，也不改变其访问权限。

### Private control layer

授权审计 Private repositories 时，private evidence 只留在私有/临时控制层。即使某项目有 public showcase，其 Private 审计证据仍不得进入 `docs/data/`、`portfolio/registry.json` 或 showcase bundle。

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

### Branch governance / change control

`CI green` 不能自动等价为 `merge gate enforced`。审计必须检查默认分支治理，并把结果写入 `branch_governance` evidence：

- default branch 是否 `protected=true`；
- PR-before-merge 是否强制；
- required status checks 是否真正强制；
- force-push / branch deletion 是否允许；
- admin/bypass 是否受约束；
- ruleset / branch-protection 细节是否因权限不足而无法验证。

规则：

- `protected=false` 是已验证的治理缺口，不得因为 CI 当前是绿色而降格成“安全”。
- `protected=true` 但细节 API 无权限读取时，必须记录 `unverified`，不能默认视为通过。
- 有 workflow 但没有 required check enforcement 时，CI 只能记为 advisory control。
- 对成熟、公开、安全敏感或承担 release 的仓库，默认分支可绕过 CI 通常应形成 P1 finding；早期原型可按证据降到 P2。
- owner 尚未批准目标 merge policy 时，设置 branch protection/ruleset 为 `owner-choice`；owner 已明确批准具体策略后，如果当前连接拥有 administration 写权限，可转为 `auto-fix`；若缺权限则为 `external-blocked`，并输出精确剩余人工操作。


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
python scripts/remediation_queue.py --repository CochraneK/repo-auditor
```
