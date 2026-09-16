# repo-auditor 自审

> 审计日期：2026-09-16  
> 审计对象：`CochraneK/repo-auditor`  
> 审计基线：`main` @ `4429a9a416e5f46c4587fb90cbda1f1ec5c4899e`  
> Portfolio 决策：**CONTINUE · 65 · P2-PLANNED**

## 一句话结论

**repo-auditor 的“Portfolio + Structured Audit”双层结构已经收口成可用产品，并新增结构化 Publication / IP gate：每次审计都要明确 Public、Private、review-before-public 或 split-public-private。当前唯一开放的高优先项仍是 LICENSE。**

## 2026-09-16 remediation recheck

本次整改后：

- **Portfolio Audit：PASS**
- **GitHub Pages deployment：PASS**
- **RA-P1-002 · FIXED** — Pages 已显示 `Audit · Current / Current* / Stale · P0/P1`
- **RA-P1-003 · FIXED** — exact-SHA freshness + 显式 metadata-only `current-equivalent`
- **RA-P2-001 · FIXED** — 删除 root UI 重复源，`docs/` 成为唯一 canonical Pages source
- **RA-P2-002 · FIXED** — collector / freshness fixture tests 已进入 CI
- **RA-P2-003 · FIXED** — 退役且不完整的 bootstrap archive 已删除
- **Publication / IP gate · PASS** — schema、validator、deterministic helper、fixture tests 与 CI 均已接入；不会把个人合同或单位敏感信息写入 public audit layer
- **仍开放：RA-P1-001 · LICENSE**

### 为什么有 `Current*`

repo-auditor 会审计自己。若“提交审计报告”本身就让审计立刻过期，会形成自审悖论。

现在的规则是：

1. 默认仍要求 `HEAD == audited_commit`；
2. 只有 sidecar **显式**声明 `freshness.ignore_paths` 时才考虑例外；
3. 从 audited commit 到 HEAD 的**每一个** changed file 都必须落在允许的审计/总控元数据路径内；
4. 一旦出现代码、CI、UI 或其他未允许路径，立即回到 **Stale**；
5. SHA 已变化但 compare 结果为空时也 fail closed 为 **Stale**。

因此 `Current*` 不是“忽略变化”，而是“仅发生了明确声明的审计元数据变化”。

## P1

### 1. 还没有 LICENSE · **OPEN**

这是现在最明确的发布缺口。

没有 LICENSE 时，别人“看得到代码”不等于“获得明确复用授权”。

**这项不应由自动审计替你选择。** 后续由仓库所有者明确决定 MIT / Apache-2.0 / 其他许可即可。

### 2. 审计结果进入工作台 UI · **FIXED**

工作台现在会对含 `latest_audit` 的仓库读取 structured audit sidecar，并展示：

```text
Priority: P0 NOW
Audit: Current · 0 P0 · 1 P1
```

两者继续保持独立：

- Priority = 现在是否值得投入时间；
- Audit = 当前仓库有哪些已知风险/缺口。

### 3. Audit staleness detection · **FIXED**

`scripts/audit_freshness.py` 已进入 CI，并支持：

- exact-SHA Current；
- Stale；
- 显式、窄范围的 Current-equivalent；
- `--strict` 模式；
- GitHub Actions warning / notice 输出。

## P2

### 4. Pages 源码重复 · **FIXED**

root 的 `index.html / app.js / styles.css` 已删除。

`docs/` 现在是唯一 canonical Pages source，避免两套 UI 漂移。

### 5. Evidence collector 单测 · **FIXED**

现有 deterministic fixture tests 覆盖：

- action SHA pin / mutable tag 判定；
- private repo 拒绝；
- duplicate workflow run 去重；
- GitHub API failure；
- latest sidecar selection；
- exact current / stale；
- metadata-only current-equivalent；
- 非 ignore 路径触发 stale；
- 空 compare fail closed。

### 6. Legacy bootstrap archive · **FIXED**

`.repo-auditor-bootstrap/` 已确认无现行引用，且旧 source archive 本身不完整，因此已从当前树删除。

恢复仍可依赖 Git 历史，而无需把一次性 bootstrap 碎片留在公开运行树中。

## 当前强项

1. Public / Private 边界明确且 registry validator 会执行约束；
2. STOP 不自动 Archive/Delete；
3. priority 明确不是 quality；
4. audit 不用单一总分替代 findings；
5. audit 有 exact commit baseline；
6. freshness 有可执行、fail-closed 的 stale 检测；
7. Pages 已把审计状态产品化；
8. collector 明确拒绝 private repository；
9. collector / freshness 有自动化 fixture tests；
10. Long Gate 已经 dogfood “审计 → 整改 → recheck”闭环；
11. Pages source 已唯一化；
12. 高权限一次性 bootstrap 入口和遗留 archive 都已退役；
13. Publication / IP gate 会在 Public 前检查潜在专利、Background IP、单位/客户/PI 请求、保密输入和权属不确定性。

## 下一步

现在不建议继续给 repo-auditor 堆新概念。

只保留：

1. 你明确 LICENSE；
2. 需要时再增加 language/framework-specific adapters；
3. 随真实仓库审计暴露出的需求渐进增强，而不是预先造复杂体系。

## Repo-auditor 决策

**CONTINUE · 65 · P2-PLANNED**

它已经足够承担公开项目总控与结构化审计基础设施；接下来应更多用于 **dogfood 其他仓库**，而不是继续抢占 Long Gate、AI-Ques 等主项目的时间。
