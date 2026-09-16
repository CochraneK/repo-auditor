<div align="center">

# repo-auditor

**Evidence-backed Repository Audit + Remediation Agent · 审、改、再审。**

<p>
  <img alt="Private control plane" src="https://img.shields.io/badge/control%20plane-private--ready-6C63FF">
  <img alt="GitHub Pages" src="https://img.shields.io/badge/UI-GitHub%20Pages-222222">
  <img alt="Priority system" src="https://img.shields.io/badge/planning-NOW%20%C2%B7%20NEXT%20%C2%B7%20LATER-6C63FF">
  <img alt="Private safe" src="https://img.shields.io/badge/private%20repos-not%20published-27AE60">
</p>

[**打开工作台**](https://cochranek.github.io/repo-auditor/) · [**查看 Portfolio**](PORTFOLIO.md) · [**数据源**](portfolio/registry.json)

</div>

---

## 它解决什么问题

当仓库越来越多，真正困难的往往不是“找到代码”，而是：

- 哪些项目正在推进；
- 哪些应该排到下一步；
- 哪些已经暂停；
- 哪些只是值得保留，但暂时不值得继续投入；
- 如何把这些状态放在一个公开、可浏览、不会泄露私有项目的工作台里。

`repo-auditor` 现在按 **Private control plane + Public Pages snapshot** 设计：控制仓库可以设为 Private、审计授权范围内的 private repositories；对外页面仍只发布 Public repositories，并且浏览器不需要读取 private GitHub raw content。

## Public Workbench

GitHub Pages 源码位于 `docs/`，线上入口：

**https://cochranek.github.io/repo-auditor/**

当前公开工作台包含：

| 能力 | 说明 |
| --- | --- |
| **执行队列** | 聚合当前真正需要推进的项目 |
| **NOW / NEXT / LATER / DON'T TOUCH** | 按行动时序分区，而不是只按仓库列表展示 |
| **CONTINUE / STOP** | 标记是否继续投入 |
| **Priority score** | 表达“现在该不该花时间”，不是项目质量评分 |
| **搜索 / 筛选** | 快速缩小项目范围 |
| **明暗主题** | 适配不同浏览环境 |
| **Repository jump** | 一键进入对应公开仓库 |
| **Publication / IP gate** | 审计时明确给出 Public / Private / split 的发布建议，提醒专利披露、Background IP、单位/客户请求与权属不确定性 |
| **Multi-dimensional quality** | 9 个独立工程质量维度各自 0–5 分；不合并成单一质量总分，也不与 Priority 混淆 |
| **GO remediation** | 对安全、可逆的 `auto-fix` finding 自动 branch → 修复 → 测试 → re-audit → PR；只在 owner-choice / external-blocked 时停 |

控制层数据源：

- `portfolio/registry.json` — **Public-only source of truth**
- `PORTFOLIO.md` — **Public-only**
- authenticated private evidence — 仅在显式 `--allow-private` 时采集，禁止写入 Pages 路径

Pages 运行时数据来自 `docs/data/` 的**构建快照**，而不是 `raw.githubusercontent.com`。因此控制仓库转 Private 后，公开 Pages 仍可工作，同时不会获得读取 private repository 内容的能力。

## Repository Audit Layer

`repo-auditor` 现在同时维护第二层：**可复现的 repository audit**。

它不把项目质量压成一个总分，而是保存：

- 精确 audited commit SHA；
- CI / quality-gate evidence；
- P0 / P1 / P2 / P3 findings；
- 未能验证的边界；
- 触发重审的条件。

新审计使用 Markdown + JSON sidecar：

```text
audits/<repo>-YYYY-MM-DD.md
audits/<repo>-YYYY-MM-DD.json
```

每份 structured audit 还必须记录 `publication_gate`：它不替代律师或专利代理师，而是避免把 Public/Private 当作纯技术设置。若出现潜在专利、单位/客户/PI 请求、Background IP、保密输入或权属不清，会提示先 review、keep private 或拆成 public/private 两层。

本地辅助判断：

```bash
python scripts/publication_gate.py --visibility private --patent-candidate
```

自动校验：

```bash
python scripts/audit_reports.py
```

公共仓库证据采集：

```bash
python scripts/collect_repo_evidence.py CochraneK/long-gate
```

详见 [Audit Rubric](AUDIT_RUBRIC.md) 和 [audits/](audits/README.md)。

## GO Agent

repo-auditor 默认不是“只给建议”的 reviewer。Owner 授权 GO mode 后，它会持续执行：

```text
Audit → classify findings → remediate auto-fix → test → re-audit → merge
```

查看当前可自动整改项：

```bash
python scripts/remediation_queue.py
```

`LICENSE / IP / visibility / delete/archive / destructive history rewrite / material cost` 等仍属于 owner choice，不会为了审计变绿自动决定。完整行为边界见 [AGENTS.md](AGENTS.md) 与 [POLICY.md](POLICY.md)。

## Public / Private 边界

> [!IMPORTANT]
> Private 仓库不会写入这个公开仓库，也不会因为总控需求而被间接暴露。

Private 仓库：

- 不出现在 GitHub Pages；
- 不出现在当前 public `registry.json`；
- 不出现在 `PORTFOLIO.md`；
- 不进入 `docs/data/`；
- 公开页面不会显示 Private 数量、名称或备注。

显式私有证据采集：

```bash
GITHUB_TOKEN=... python scripts/collect_repo_evidence.py owner/private-repo \\
  --allow-private --out private-evidence/private-repo.json
```

`--allow-private` 默认关闭；private evidence 禁止输出到 `docs/` 或 `portfolio/`。

## Work Status

| 状态 | 含义 |
| --- | --- |
| `CONTINUE` | 未来还要继续投入 |
| `STOP` | 当前不用继续做 |

> [!NOTE]
> `STOP` 只是总控提示，不会触发 GitHub Archive、Delete、可见性修改或项目代码变更。

## Priority Score

分数表示 **“现在该不该花时间”**，不是项目质量分。

| 分数 | 含义 |
| ---: | --- |
| **90–100** | P0 · 当前 / 下周明确要做 |
| **70–89** | P1 · 本月应推进 |
| **50–69** | P2 · 已计划，但不是当前主线 |
| **20–49** | P3 · 后续再做 |
| **1–19** | P4 · 极低优先级保留 |
| **0** | STOP · 当前不用做 |

## Private 控制仓库 + Public GitHub Pages

个人账户需要 **GitHub Pro** 才能从 Private repository 发布 Pages。Pages 本身仍是公开网站，因此 `docs/data/` 必须保持 public-only。

发布前先构建并校验公开 bundle：

```bash
python scripts/build_public_pages.py
python scripts/audit_registry.py
```

首次启用一次即可：

```text
Settings → Pages → Deploy from a branch → main → /docs → Save
```

之后页面直接读取 Public-only registry，无需手工重新生成。

---

<div align="center">

**A small control plane for a growing GitHub portfolio.**

</div>
