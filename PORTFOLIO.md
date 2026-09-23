# Public GitHub 项目总控

> Snapshot: 2026-09-23 · Public repositories only

这个文件和 GitHub Pages 工作台只包含**当前实时仍为 Public 的仓库**。Private 项目的名称、URL、SHA、优先级、管理备注和 findings 不进入公开控制层；经过单独审查的静态 Showcase 走 `docs/showcase/` 独立白名单。

## 当前统计

- Public repositories: **7**
- CONTINUE: **6**
- STOP: **1**
- P0 NOW: **2**

## CONTINUE · 按优先级排序

| Score | Priority | Repo | 当前判断 |
|---:|---|---|---|
| **96** | P0-NOW | `AI-Ques` | 2026-09-15 审计：继续保持 P0；先冻结功能扩张，修正“baseline”效度边界、收紧研究问题、拆分 Future Me、补版本化/测试，并修复 Future Me 渲染与本地数据隐私问题。 |
| **95** | P0-NOW | `ai-uni` | 近期主打，但方向可能走偏；优先做去留/大改决策和路线校正。 |
| **65** | P2-PLANNED | `repo-auditor` | 2026-09-17 自审：GO remediation、live visibility fail-closed、Public/Private publication boundary 与 Coverage/CI 分离均已收口；当前仅剩 LICENSE owner-choice 与 private PAT coverage external-blocked。 |
| **50** | P2-PLANNED | `persona-test` | 当前质量不满意，后续需要较大幅度重做。 |
| **35** | P3-LATER | `changan` | 后续还要继续打磨，但不是近期主线。 |
| **35** | P3-LATER | `we-read-template` | 可复刻的 WeRead sanitized starter 已建立；后续主要随上游 we-read 的接口、隐私策略和兼容性变化维护。 |

## STOP · 当前不用做

| Repo | 当前判断 |
|---|---|
| `ming` | 2026-09-17 双层审查：产品与工程均已成熟，暂停主动开发并进入 maintenance；仅在真实 bug、史实/数据纠错或兼容性破坏时重新打开，不做无证据 UI 重构。 |

## Privacy boundary

- Public control data只记录当前仍为 Public 的仓库。
- Private 项目的详细证据留在 private control layer，不写入 registry / Todo / audit sidecar。
- Private 项目若需要对外展示，只能通过 `docs/showcase/manifest.json` 白名单发布审查后的静态副本。
- `STOP` 只是总控提示，不等于 Archive / Delete。
