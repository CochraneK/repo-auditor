# Private portfolio audit setup

repo-auditor 可以扫描 authenticated account 能访问的 Public + Private repositories，但 **Private 详情绝不进入公开 Pages**。

## 数据边界

```text
GitHub account
  ├─ public repositories  ─┐
  └─ private repositories ─┴─> scripts/scan_portfolio.py
                                  ├─ private-evidence/portfolio-scan.json  (gitignored, ephemeral)
                                  └─ docs/data/portfolio-overview.json    (aggregate only)
```

公开 summary 只允许包含总数、覆盖率和匿名聚合指标；禁止包含 private repository 的名称、URL、SHA、备注、finding、文件路径或代码证据。

## GitHub Actions

跨仓库 Private 扫描不能依赖 repo-auditor 自己的默认 `GITHUB_TOKEN`：它只对当前 repository 有效。若要让定时扫描真正覆盖 Private repositories，需要在 repo-auditor 的 Actions secrets 中配置：

`PORTFOLIO_AUDIT_TOKEN`

该 credential 只应授予完成读取审计所需的最小权限，并覆盖希望纳入审计的 repositories。workflow 不上传、不 commit `private-evidence/`；Private evidence 只存在于临时 runner。

配置后可以手动运行 `Portfolio Audit`，或等待每月 schedule。扫描命令：

```bash
GITHUB_TOKEN=... python scripts/scan_portfolio.py --allow-private
```

## 为什么 Pages 仍能体现 Private

Pages 展示 `All / Public / Private / coverage` 等聚合指标，所以你能确认 Private repositories 是否已纳入审计；但不会把 Private 项目反向公开。

如果未来需要浏览每个 Private repository 的详细审计，应把控制面迁入 Private repository / authenticated app，而不是把这些字段塞进 Public GitHub Pages。
