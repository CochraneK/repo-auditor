# repo-auditor

**Evidence-backed Repository Audit + Remediation Agent · 审、改、再审。**

[工作台](https://cochranek.github.io/repo-auditor/) · [Portfolio](PORTFOLIO.md) · [Audit Rubric](AUDIT_RUBRIC.md) · [Audit Maturity](AUDIT_MATURITY.md)

## 它做什么

`repo-auditor` 是 GitHub portfolio 的审计控制面。目标闭环：

```text
Inventory → Evidence Scan → Deterministic Triage → Structured/Semantic Audit
         → GO Remediation → Test → Re-audit → Publish safe summary
```

它刻意区分结果层级，避免“workflow 跑完”被误解为“仓库审完”：Evidence scan 只代表证据采集；Deterministic triage 只代表可重复的工程 finding；Structured / semantic audit 才覆盖项目目标、研究语境、UX、架构与 owner context。完整 assurance 分级见 [AUDIT_MATURITY.md](AUDIT_MATURITY.md)。

只有请求的 inventory 覆盖完整时，account-wide scan 才允许标记 `PASS`；缺少 Private inventory 或存在 collection failure 时必须 `PARTIAL` / fail closed。

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

Private evidence 只写入 `private-evidence/`（gitignored / ephemeral）。Public Pages **禁止**出现 Private 仓库名称、URL、SHA、备注、代码证据和具体 findings，只能显示匿名聚合覆盖信息。Public source registry 会在 CI 中用 live GitHub visibility 自动清洗，避免 stale public record 泄露已经转为 Private 的仓库。

完整账户扫描示例：

```bash
GITHUB_TOKEN=... \
PORTFOLIO_EXPECTED_TOTAL=42 \
PORTFOLIO_EXPECTED_PRIVATE=9 \
python scripts/scan_portfolio.py --allow-private --require-complete
```

随后生成 deterministic triage：

```bash
python scripts/repository_triage.py private-evidence/portfolio-scan.json \
  --out private-evidence/repository-triage.json
```

## Visual UX

```bash
python scripts/visual_ux_audit.py docs/index.html --json --fail-on-findings
```

用户实际发现的可泛化 UI bug 应转化为 regression rule/test。当前是 deterministic static 层；浏览器多 viewport、runtime overflow measurement、screenshots 与 AI visual review 属于后续 runtime/semantic 层，不能把静态规则冒充完整视觉测试。

## Priority ≠ Quality ≠ Coverage

Priority 只表示投入时序；Quality 是独立多维工程质量；Coverage 表示审计做到哪一层、覆盖了多少仓库。STOP 也不代表“质量差”。

## GO 边界

安全、可逆、低风险 finding 可以自动整改并重审。`LICENSE / IP / visibility / delete/archive / destructive history rewrite / material cost` 等 owner-choice 不自动决定。完整边界见 [AGENTS.md](AGENTS.md) 与 [POLICY.md](POLICY.md)。

## Canonical layout

- `portfolio/registry.json` — Public portfolio source
- `audits/` — Public-safe structured audits only
- `scripts/` — Audit / triage / remediation tooling
- `tests/` — Regression contracts
- `docs/` — **唯一 GitHub Pages source**
- `private-evidence/` — gitignored authenticated evidence

历史根目录 `index.html / app.js / styles.css / data/` 不再作为第二套 Pages source，避免双源漂移。
