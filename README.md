# repo-auditor

**Evidence-backed Repository Audit + Remediation Agent · 审、改、再审。**

[工作台](https://cochranek.github.io/repo-auditor/) · [Portfolio](PORTFOLIO.md) · [Audit Rubric](AUDIT_RUBRIC.md)

## 它做什么

`repo-auditor` 是 GitHub portfolio 的审计控制面。目标闭环：

```text
Inventory → Evidence Scan → Deterministic Triage → Structured/Semantic Audit
         → GO Remediation → Test → Re-audit → Publish safe summary
```

这里刻意区分三种结果，避免“跑完了”被误解为“审完了”：

- **Evidence scan**：README、LICENSE、workflow、CI、Actions pinning、文件结构等可观测证据。
- **Deterministic triage**：把高置信工程信号转成 finding codes；它不是完整语义审核。
- **Structured / semantic audit**：结合产品目标、研究语境、UX、架构与 owner context 的深审报告。

只有覆盖完整时，account-wide scan 才允许标记 `PASS`；缺少 Private inventory 或存在 collection failure 时必须 `PARTIAL`/失败关闭。

## 审计层

- Repository evidence + freshness
- 9-dimensional engineering quality
- Publication / IP gate
- Privacy + live visibility fail-closed
- Visual & UX regression audit
- Account-wide coverage integrity
- Deterministic per-repository triage
- Structured semantic audit + GO remediation queue

## Public / Private 边界

Private evidence 只写入 `private-evidence/`（gitignored / ephemeral）。Public Pages **禁止**出现 Private 仓库名称、URL、SHA、备注、代码证据和具体 findings，只能显示匿名聚合覆盖信息。

当前完整账户扫描要求：

```bash
GITHUB_TOKEN=... \
PORTFOLIO_EXPECTED_TOTAL=42 \
PORTFOLIO_EXPECTED_PRIVATE=9 \
python scripts/scan_portfolio.py --allow-private --require-complete
```

随后可生成 deterministic triage：

```bash
python scripts/repository_triage.py private-evidence/portfolio-scan.json \
  --out private-evidence/repository-triage.json
```

## Visual UX

```bash
python scripts/visual_ux_audit.py docs/index.html --json --fail-on-findings
```

用户实际发现的可泛化 UI bug 应转化为 regression rule/test。当前是 deterministic static 层；浏览器多 viewport、runtime overflow measurement、screenshots 与 AI visual review 属于后续 runtime/semantic 层，不能把静态规则冒充完整视觉测试。

## Priority ≠ Quality

Priority 只表示投入时序；工程质量是独立多维评分。STOP 也不代表“质量差”。Pages 与报告必须保持这三个概念分离：**priority / quality / audit coverage**。

## GO 边界

安全、可逆、低风险 finding 可以自动整改并重审。`LICENSE / IP / visibility / delete/archive / destructive history rewrite / material cost` 等 owner-choice 不自动决定。完整边界见 [AGENTS.md](AGENTS.md) 与 [POLICY.md](POLICY.md)。

## Canonical layout

- `portfolio/registry.json` — Public portfolio source
- `audits/` — Public-safe structured audits only
- `scripts/` — Audit/triage/remediation tooling
- `tests/` — Regression contracts
- `docs/` — **唯一 GitHub Pages source**
- `private-evidence/` — gitignored authenticated evidence

历史根目录 `index.html / app.js / styles.css / data/` 不再作为第二套 Pages source，避免双源漂移。
