# Portfolio Dashboard

> Snapshot: 2026-09-15 · Owner: `CochraneK` · 41 repositories

这是 `repo-auditor` 的人工可读总览。机器可读的唯一事实源是 [`portfolio/registry.json`](portfolio/registry.json)。

## Current snapshot

| Activity | Count | Meaning |
|---|---:|---|
| 0–30 days | 21 | recently active |
| 31–90 days | 7 | recent |
| 91–180 days | 6 | cooling down / review |
| 181–365 days | 3 | parked-review zone |
| >365 days | 4 | archive-review candidates |

Lifecycle 状态目前采取保守初始化：`repo-auditor = CORE`，其余仓库先标记为 `UNCLASSIFIED`，避免仅凭提交时间误判项目成熟度。

## Review queue

### Archive review first

这只是“需要决定是否归档”，**不会自动归档**：

- `DingLab`
- `DingWeb`
- `NaoDao_code`
- `Submit-forms-automatically`

### Park / continuation review

- `ARIS-GCA-Bees`
- `CunyiKang_Web`
- `dongassi`
- `gray-walker`
- `mao-skill`
- `NewsMail`
- `red-map`
- `survival-game-generator`
- `wechat-article-analysis`

### Recent projects to classify

- `academia-uni`
- `AI-persona`
- `AI-Ques`
- `ai-uni`
- `anydoor`
- `changan`
- `charity-intelligence`
- `cris`
- `dsh-gate-game-plugin`
- `emperor-skill`
- `fake_type`
- `ming`
- `neuropharm`
- `novel-white-corridor`
- `persona-test`
- `psy-exp`
- `pudding-skill`
- `repo-auditor`
- `scientist-calendar`
- `we-read`
- `yihot`
- `Animal-Age`
- `FLP-Webui`
- `Ji-Sui-Le`
- `RVC_factor`
- `VA_emotion`
- `Voice-compare`
- `Voicemod_Portrait`

## Target portfolio shape

- **CORE:** 5–7 个真正长期投入的项目。
- **ACTIVE:** 当前明确推进，但不是长期核心资产。
- **INCUBATING:** 原型、实验、探索项目；有明确验证目标。
- **PARKED:** 暂停推进但仍需保留。
- **ARCHIVED:** 已结束，GitHub 仓库应实际设置为 archived。
- **UNCLASSIFIED:** 仅用于迁移期，应该逐步清零。

## Next review

优先顺序：`>365d` → `181–365d` → `91–180d` → 最近项目。每次只做分类和记录，不自动删除仓库。
