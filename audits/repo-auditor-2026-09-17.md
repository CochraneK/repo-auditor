# repo-auditor 自审 · 2026-09-17

> 审计对象：`CochraneK/repo-auditor`  
> 审计基线：`871d701e68b8a8535a791c9c3eae19e4c59a9b5e`  
> Portfolio：**CONTINUE · 65 · P2-PLANNED**

## 结论

repo-auditor 已经可以按“**审 → 改 → 测 → 再审**”的 Agent 方式使用，而不只是语义层 reviewer。当前安全、可逆的 auto-fix 已收口；剩余两项都不是应该由 GO 模式擅自解决的工程缺陷：

- **LICENSE：owner-choice**
- **Private account coverage：external-blocked**（当前 Actions PAT 看不到预期的 9 个 private repositories）

最重要的变化是：**Audit Coverage 与 CI/Quality 已彻底解耦。** 私有覆盖不足会诚实显示 `PARTIAL`，但不会再把“凭据权限不足”伪装成代码失败；同样也绝不会因为 CI 绿色就谎称 private coverage 完整。

## 九维质量

| 维度 | 分数 |
|---|---:|
| Purpose & scope | **5/5** |
| Correctness | **5/5** |
| Security & privacy | **5/5** |
| Supply chain | **4/5** |
| Reproducibility | **5/5** |
| Release engineering | **4/5** |
| Documentation & onboarding | **5/5** |
| Maintainability | **5/5** |
| Community surface | **3/5** |

不计算总分或平均分；Priority 也不是 Quality。

## 已验证

- Portfolio Audit CI：**PASS**
- Python compile：**PASS**
- deterministic tests：**43/43 PASS**
- Visual UX static audit：**PASS**
- public registry validation：**PASS**
- public Pages bundle build：**PASS**
- structured audit schema：**PASS**
- remediation queue：**PASS**
- freshness checker：**PASS**
- public manifest：**34 repositories · 8 todos · 0 visibility exclusions**
- private evidence published to Pages：**NO**

## 当前开放项

### RA-P1-001 · LICENSE · owner-choice

仓库当前公开但没有 LICENSE。代码“看得到”不等于第三方自动取得明确复用权。

repo-auditor 不替 owner 猜 MIT / Apache-2.0 / 其他许可。

### RA-P1-004 · Private coverage · external-blocked

最新 Actions 扫描只能看到：

```text
observed: 34 public + 0 private
expected: 43 total / 9 private
Audit Coverage: PARTIAL
```

公开层只显示聚合 coverage，不出现任何 private repo 名称、URL、SHA、备注、代码证据或 findings。

真正的修复动作不是改代码，而是让 `PORTFOLIO_AUDIT_TOKEN` 获得目标 private repositories 的读取权限。

## 本轮已关闭的 auto-fix

- 新增 `SECURITY.md`，明确 private-evidence leak / publication-boundary bypass 属于安全问题；
- Public registry 恢复到当前真实的 34 个 public repositories；
- Todo → Pages 同步进入正式 build/sync；
- live visibility 继续 fail-closed；
- Private coverage PARTIAL 与工程 CI 解耦；
- `auditor-hardening` 与 `todo-page-sync` 两项 Todo 已完成。

## Publication / IP gate

**public-ok**

这是对 repo-auditor 本身的发布门判断，不是法律意见。当前没有记录到需要因专利候选、单位/客户/PI 指派、保密输入或权属不确定而转 Private 的触发条件。Private repo 的证据仍严格留在 private control layer。

## 下一阶段

不要继续为了“更满”而堆机制。后续只在真实使用中出现以下情况时再打开：

- 新 finding 暴露静态规则缺口；
- private PAT 权限补齐，需要验证 Coverage 从 PARTIAL → PASS；
- publication/IP gate 或 visibility 架构变化；
- 引入新的 evidence collector / language adapter；
- owner 明确 LICENSE / 对外复用策略。
