# repo-auditor · Public GitHub 工作台

`repo-auditor` 的公开层只管理和展示 **Public repositories**。

## Public workbench

GitHub Pages 源码位于 `docs/`，启用后地址：

`https://cochranek.github.io/repo-auditor/`

公开工作台包含：

- 当前执行队列
- NOW / NEXT / LATER / DON'T TOUCH 分区
- Public 项目的 CONTINUE / STOP 和优先级
- 搜索与优先级筛选
- 明暗主题
- 一键进入公开仓库

数据源：

- `portfolio/registry.json` — **Public-only**
- `PORTFOLIO.md` — **Public-only**

## Private workspace

Private 仓库不再写入本公开仓库：

- 不出现在 GitHub Pages；
- 不出现在当前 `registry.json`；
- 不出现在 `PORTFOLIO.md`；
- 公开页面不会显示 Private 数量、名称或备注。

当前 Private 项目由已授权的 GitHub 连接按需读取和汇总。若要建立持久的 Private Web 工作台，推荐单独建立一个 private 管理仓库（例如 `repo-auditor-private`），再复用同一套静态工作台结构。

> 当前 GitHub 连接器没有“新建仓库”动作，因此这里不会擅自把 Private 总控数据塞进某个无关的私有项目仓库。

## Work status

- `CONTINUE`：未来还要继续投入
- `STOP`：当前不用继续做

`STOP` 只是总控提示，不会触发 GitHub Archive、Delete、改可见性或修改项目代码。

## Priority score

分数表示“**现在该不该花时间**”，不是项目质量分。

| 分数 | 含义 |
|---:|---|
| 90–100 | P0 · 当前 / 下周明确要做 |
| 70–89 | P1 · 本月应推进 |
| 50–69 | P2 · 已计划，但不是当前主线 |
| 20–49 | P3 · 后续再做 |
| 1–19 | P4 · 极低优先级保留 |
| 0 | STOP · 当前不用做 |

## 一次性启用 GitHub Pages

`Settings → Pages → Deploy from a branch → main → /docs → Save`

之后页面直接读取 Public-only registry，无需手工重新生成。
