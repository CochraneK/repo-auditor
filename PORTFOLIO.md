# GitHub 项目总控

> Snapshot: 2026-09-15 · 41 repositories

总控现在看三个字段：

1. **Visibility** — Public / Private
2. **Work status** — CONTINUE / STOP
3. **Priority score** — 0–100，表示“现在该不该花时间”，不是项目质量分

## Priority scale

| 分数 | 含义 |
|---:|---|
| 90–100 | P0 · 当前 / 下周明确要做 |
| 70–89 | P1 · 本月应推进 |
| 50–69 | P2 · 已计划，但不是当前主线 |
| 20–49 | P3 · 后续再做 |
| 1–19 | P4 · 极低优先级保留 |
| 0 | STOP · 当前不用做 |

评分综合：**当前紧迫性 + 战略/工作价值 + 下一步明确度 + 近期时间窗口**。

## 当前统计

- Public: **33**
- Private: **8**
- CONTINUE: **30**
- STOP: **11**
- TBD: **0**

## CONTINUE · 按优先级排序

| Score | Priority | Repo | Visibility | 当前判断 |
|---:|---|---|---|---|
| **100** | P0 · 现在 | `psy-exp` | public | 最近主打项目，当前最高优先级。 |
| **96** | P0 · 现在 | `AI-Ques` | public | 这几天要处理；当前结构较乱，需要决定大改、重构或重来。 |
| **95** | P0 · 现在 | `ai-uni` | public | 近期主打，但方向可能走偏；优先做去留/大改决策和路线校正。 |
| **93** | P0 · 现在 | `FLP-Webui` | public | 工作需要，下周可能大量操作，时间窗口明确。 |
| **93** | P0 · 现在 | `RVC_factor` | public | 工作需要，下周可能大量操作，时间窗口明确。 |
| **93** | P0 · 现在 | `VA_emotion` | public | 工作需要，下周可能大量操作，时间窗口明确。 |
| **93** | P0 · 现在 | `Voice-compare` | public | 工作需要，下周可能大量操作，时间窗口明确。 |
| **93** | P0 · 现在 | `Voicemod_Portrait` | public | 工作需要，下周可能大量操作，时间窗口明确。 |
| **85** | P1 · 接下来 | `dsh-gate-game-plugin` | public | 尚未完成真实测试；之后要测试并上线 Hub。 |
| **80** | P1 · 接下来 | `charity-intelligence` | private | 希望作为主打项目；当前暂放，但战略优先级很高。 |
| **78** | P1 · 接下来 | `red-map` | public | 计划月底前完善，时间窗口较明确。 |
| **72** | P1 · 接下来 | `pudding-skill` | public | 计划过几天不忙后继续完善。 |
| **72** | P1 · 接下来 | `scientist-calendar` | public | 计划过几天不忙后继续完善。 |
| **65** | P2 · 计划中 | `AI-persona` | private | 计划系统建设，但这几天暂不投入；战略价值高于时间紧迫度。 |
| **65** | P2 · 计划中 | `repo-auditor` | public | GitHub 总控基础设施；继续维护但不应抢占产品主线。 |
| **62** | P2 · 计划中 | `neuropharm` | public | 已较成熟，但需要系统检查一遍，之后还会持续增加药物。 |
| **58** | P2 · 计划中 | `we-read` | public | 产品已成熟，主要剩下可供其他人直接使用的 template。 |
| **50** | P2 · 计划中 | `persona-test` | public | 当前质量不满意，后续需要较大幅度重做。 |
| **45** | P3 · 后续 | `emperor-skill` | public | 尚未完成，但当前先放着，后续继续。 |
| **45** | P3 · 后续 | `ming` | public | 整体成熟，只差少量完善，后续处理。 |
| **35** | P3 · 后续 | `changan` | public | 后续还要继续打磨，但不是近期主线。 |
| **35** | P3 · 后续 | `fake_type` | public | 已可用但仍不满意，后续再改。 |
| **32** | P3 · 后续 | `academia-uni` | private | 保留继续；目前不打算写小说，低优先级等待重新进入创作期。 |
| **30** | P3 · 后续 | `Ji-Sui-Le` | public | 主仓保留，完善时间靠后。 |
| **30** | P3 · 后续 | `NewsMail` | public | 暂留；未来考虑与 yihot 一并整合进 charity-intelligence。 |
| **30** | P3 · 后续 | `yihot` | public | 暂留；未来考虑与 NewsMail 一并整合进 charity-intelligence。 |
| **25** | P3 · 后续 | `gray-walker` | public | 当前不完善，但计划以后再改；低优先级保留。 |
| **25** | P3 · 后续 | `mao-skill` | public | 当前不完善，后续再改；低优先级保留。 |
| **25** | P3 · 后续 | `survival-game-generator` | public | 与 gray-walker 同样处理：不完善但以后再改，低优先级保留。 |
| **18** | P4 · 低优先 | `anydoor` | public | 已有烂尾感，当前先放着；保留未来恢复可能。 |

## STOP · 当前不用做

| Repo | Visibility | 当前判断 |
|---|---|---|
| `Animal-Age` | public | 已由 Ji-Sui-Le 取代；用户希望后续直接删除，但总控不会自动执行删除。 |
| `ARIS-GCA-Bees` | public | 现阶段已完成，暂不继续投入。 |
| `cris` | public | 当前已经比较成熟，先不动。 |
| `CunyiKang_Web` | private | 个人网站已较成熟，当前无明确开发任务。 |
| `DingLab` | private | 已完善，当前不再投入。 |
| `DingWeb` | private | 已完善，当前不再投入。 |
| `dongassi` | private | 已完善，当前不再投入。 |
| `NaoDao_code` | public | 早期项目作为纪念保留；当前 GitHub 仍为 public，用户希望后续设为 private。 |
| `novel-white-corridor` | private | 作品已发布，当前不再投入修改。 |
| `Submit-forms-automatically` | public | 早期项目作为纪念保留；当前 GitHub 仍为 public，用户希望后续设为 private。 |
| `wechat-article-analysis` | public | 当前价值偏低且考虑删除；先停止投入，删除另行决定。 |

## 重要说明

- `STOP` 只表示**当前不用继续开发**，不等于 GitHub Archive，也不触发删除。
- 优先级分数可以随计划变化随时调整；它不是对项目质量或价值的永久评价。
- `NaoDao_code` 与 `Submit-forms-automatically` 当前实际仍是 public；“以后改 private”已记在判断理由中，但本次没有改仓库可见性。
- `Animal-Age` 的删除意图只记录在总控，本次没有执行删除。
