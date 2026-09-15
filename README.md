# repo-auditor · GitHub 总控中心

这个仓库只回答三个问题：

1. **它是 Public 还是 Private？**
2. **这个项目现在还要继续做，还是不用做？**
3. **如果要继续，当前优先级是多少？**

不使用 CORE / ACTIVE / PARKED / ARCHIVED 这类复杂生命周期。

## Workbench

GitHub Pages 工作台源码已经放在 `docs/`：

- `docs/index.html` — 工作台页面
- `docs/styles.css` — 响应式界面
- `docs/app.js` — 从 registry 读取并渲染项目
- `docs/.nojekyll` — 直接按静态站点发布

启用 Pages 后，默认地址应为：

`https://cochranek.github.io/repo-auditor/`

工作台包含：

- 当前执行队列（Top 8）
- NOW / NEXT / LATER / DON'T TOUCH 四个分区
- Public / Private、CONTINUE / STOP 统计
- 搜索
- 状态、可见性、优先级筛选
- 明暗主题
- 一键进入具体仓库
- 一键打开 `portfolio/registry.json` 编辑页

页面每次打开都会读取 `main/portfolio/registry.json` 的最新数据，因此调整总控分数后不需要重新生成页面。

### 一次性启用 GitHub Pages

当前连接器不能修改仓库的 Pages 设置。需要在 GitHub 仓库页面做一次：

`Settings → Pages → Deploy from a branch → main → /docs → Save`

之后无需再手动发布。

> 注意：`repo-auditor` 当前是 public，因此 Pages 工作台也应当视为公开展示面。当前 registry 本身已经位于公开仓库中，并包含 private 仓库的名称和管理备注；如果未来不希望这些信息公开，应先调整总控数据的公开范围或仓库可见性。

## Work status

- `CONTINUE`：未来还要继续投入
- `STOP`：当前不用继续做

> `STOP` 只是总控提示，不会触发 GitHub Archive、Delete、改 Public/Private、改名或修改项目代码。

## Priority score

分数表示：

> **现在该不该花时间。**

它不是项目质量分，也不是长期价值评分。

| 分数 | 含义 |
|---:|---|
| 90–100 | P0 · 当前 / 下周明确要做 |
| 70–89 | P1 · 本月应推进 |
| 50–69 | P2 · 已计划，但不是当前主线 |
| 20–49 | P3 · 后续再做 |
| 1–19 | P4 · 极低优先级保留 |
| 0 | STOP · 当前不用做 |

评分主要参考：当前紧迫性、战略/工作价值、下一步明确度和近期时间窗口。

## 入口

- [`PORTFOLIO.md`](PORTFOLIO.md) — 按分数排序的人工总控面板
- [`portfolio/registry.json`](portfolio/registry.json) — 机器可读事实源
- [`POLICY.md`](POLICY.md) — 总控规则
- [`scripts/audit_registry.py`](scripts/audit_registry.py) — 自动校验

## 使用方式

项目计划变化时，只需要调整：

- `work_status`
- `priority_score`
- `reason`

Public / Private 记录 GitHub 当前真实状态，不因分数自动改变。
