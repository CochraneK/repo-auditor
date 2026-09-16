# repo-auditor 自审

> 审计日期：2026-09-16  
> 审计对象：`CochraneK/repo-auditor`  
> 审计基线：`main` @ `cdfc87e99bb31ed636df9505596e70e4a62a9f9a`  
> Portfolio 决策：**CONTINUE · 65 · P2-PLANNED**

## 一句话结论

**repo-auditor 已经从“项目优先级看板”升级成“Portfolio + Structured Audit”双层工具，但它现在最需要的是把审计结果产品化，而不是继续堆新的管理概念。**

本轮已经完成：

- Audit Rubric；
- 结构化 JSON sidecar；
- audit schema validator；
- public GitHub evidence collector；
- Long Gate 正式审计；
- CI 校验 structured audits；
- 退役失败的一次性 bootstrap workflow。

## P1

### 1. 还没有 LICENSE

这是公开工具仓库最明显的发布缺口。

没有 LICENSE 时，别人“看得到代码”不等于“获得明确复用授权”。

**这项不能由自动审计替你选择。** 建议你之后明确决定 MIT / Apache-2.0 / 其他许可。

### 2. 审计结果还没进入工作台 UI

现在 Pages 工作台擅长回答：

> 我现在该推进哪个项目？

但还不能直观看到：

- latest audit date；
- audited SHA；
- open P0/P1；
- audit stale / current。

建议增加第二视觉层：

```text
Priority: P0 NOW
Audit: Current · 0 P0 · 3 P1
```

二者必须视觉上明确分开，避免“Priority 94”被误读为“质量 94”。

### 3. 没有 audit staleness detection

现在 sidecar 已记录 `audited_commit`，这是正确第一步。

下一步应增加：

> 当前 default branch SHA != audited_commit → 标记 STALE

但不建议“每次 commit 都强制全量重审”，应结合 `recheck_triggers` 和路径/风险变化。

## P2

### 4. Pages 源码重复

目前同时存在：

- root `index.html / app.js / styles.css`
- `docs/index.html / app.js / styles.css`

README 又说明 Pages 以 `docs/` 为源。

建议只保留一个 canonical source，防止两个 UI 慢慢漂移。

### 5. evidence collector 还缺单测

目前 CI 会：

- py_compile；
- 校验 registry；
- 校验 structured audit sidecar。

但 `collect_repo_evidence.py` 还没有 mock fixture tests。

应测试：

- public repo 正常解析；
- private repo 拒绝；
- workflow action pin 判定；
- API 失败；
- missing metadata；
- duplicate workflow runs。

### 6. legacy bootstrap archive 还留着

高权限 bootstrap workflow 已经退役，这是正确的。

但 `.repo-auditor-bootstrap/source.part-*` 仍然存在。

建议确认不再需要恢复后，用单独 cleanup commit 删除，避免和功能提交混在一起。

## 做得好的地方

1. Public / Private 边界非常明确；
2. STOP 不自动 Archive/Delete；
3. priority 明确不是 quality；
4. 现在 audit 也不再试图用单一总分代替 findings；
5. audit 有 exact commit baseline；
6. 新 collector 明确拒绝 private repository；
7. Long Gate audit 已经开始 dogfood 新体系；
8. 一次性 bootstrap 高权限入口已经退役。

## 下一步顺序

1. 你明确 LICENSE；
2. audit status 进入 Pages；
3. staleness detection；
4. collector fixture tests；
5. 清理 root/docs duplication；
6. 删除 legacy bootstrap archive；
7. 再考虑语言/框架-specific audit adapters。

## Repo-auditor 决策

**CONTINUE · 65 · P2-PLANNED**

它值得长期保留并持续变强，但它是基础设施，不应该为了“把审计工具做到无限复杂”而抢走 Long Gate、AI-Ques 等主项目的时间。
