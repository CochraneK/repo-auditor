# repo-auditor

**Evidence-backed Repository Audit + Remediation Agent · 审、改、再审。**

[工作台](https://cochranek.github.io/repo-auditor/) · [Portfolio](PORTFOLIO.md) · [Audit Rubric](AUDIT_RUBRIC.md)

## 定位

`repo-auditor` 是 GitHub portfolio 的审计控制面：Public + 授权 Private 仓库进入统一扫描，Public Pages 只输出公开仓库详情和隐私安全的聚合统计。它不是只给建议的 reviewer；GO mode 的目标闭环是：

```text
Audit → classify → auto-fix safe findings → test → re-audit → merge
```

## 审计层

- **Repository evidence**：commit SHA、CI、workflows、工程结构与 freshness。
- **9-dimensional quality**：独立维度 0–5，不压成误导性的单一质量总分。
- **Publication / IP gate**：识别公开披露、潜在专利、Background IP、保密和权属边界。
- **Privacy gate**：live GitHub visibility fail-closed；Private 名称、URL、SHA、备注、代码证据和 findings 不进入公开 Pages。
- **Visual & UX audit**：检查 text overflow、缺少 line clamp、长字符串 wrapping、卡片高度、severity 层级、raw loading/error copy 等高置信 UI regression；这些 finding 可进入 GO auto-fix。
- **Portfolio control plane**：NOW / NEXT / LATER / STOP、Priority、结构化审计和 account-wide aggregate。

Visual UX 本地检查：

```bash
python scripts/visual_ux_audit.py docs/index.html --json --fail-on-findings
```

CI 会执行同一检查。用户实际发现的 UI bug 应转化为 regression rule/test，而不是只做一次性 CSS 修补。

> 当前 Visual & UX audit 的 deterministic 层负责高置信静态规则。浏览器多 viewport、运行时 overflow measurement 与 screenshot/AI visual review 是下一层能力，不应把静态规则冒充完整视觉测试。

## Public / Private 边界

Private evidence 仅在显式授权时采集：

```bash
GITHUB_TOKEN=... python scripts/collect_repo_evidence.py owner/private-repo --allow-private --out private-evidence/private-repo.json
```

`private-evidence/` 被 gitignore。公开 bundle 在生成时再次查询 live visibility；不可验证时 fail closed。Pages 运行时只读取 `docs/data/` 的隐私安全快照。

## Audit Coverage ≠ CI status

Account-wide Private 扫描属于独立的 **Audit Coverage**。如果 Actions credential 无法看到全部 Private repositories，控制面应显示 `PARTIAL / external-blocked`，而不是把代码工程 CI 伪装成失败或伪装成完整覆盖。

- 工程 CI：验证 repo-auditor 自己的代码、schema、Pages privacy boundary 与 deterministic checks。
- Audit Coverage：说明当前凭据实际覆盖了多少账户仓库。
- `PARTIAL` 可以和工程 CI 绿色同时存在；这表示“工具正常，但外部授权覆盖不足”。
- Pages 只允许展示聚合覆盖数量与状态，永不发布 Private 仓库名称、URL、SHA、备注、代码证据或 findings。

## Structured audits

```text
audits/<repo>-YYYY-MM-DD.md
audits/<repo>-YYYY-MM-DD.json
```

校验与队列：

```bash
python scripts/audit_reports.py
python scripts/remediation_queue.py
python scripts/audit_freshness.py
```

## Priority ≠ Quality

Priority 只表示“现在是否值得投入时间”：P0 NOW、P1 NEXT、P2 PLANNED、P3 LATER、P4 LOW、STOP。工程质量使用独立多维评分。Pages 也必须明确标注 Priority，避免用户把大数字误认为质量总分。

## GO 边界

安全、可逆、低风险 finding 可以自动整改并重审。`LICENSE / IP / visibility / delete/archive / destructive history rewrite / material cost` 等 owner-choice 不自动决定。完整边界见 [AGENTS.md](AGENTS.md) 与 [POLICY.md](POLICY.md)。

## Pages

Portfolio Command Center: https://cochranek.github.io/repo-auditor/

源码在 `docs/`。Public Pages 是展示层，不是 private control plane；任何新功能都必须保持这个边界。
