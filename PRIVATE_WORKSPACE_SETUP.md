# Private workspace setup

本文件只描述架构，不包含任何 Private 仓库名称或管理数据。

## 当前方式

Private 项目不写入本公开仓库，而是通过已授权 GitHub 连接按需读取。

## 推荐的持久化方式

建立独立 private 仓库，例如：

`repo-auditor-private`

建议结构：

```text
repo-auditor-private/
├── README.md
├── portfolio/
│   └── registry.json
└── docs/
    ├── index.html
    ├── app.js
    └── styles.css
```

私有 registry 可以复用公开工作台的字段：

- `name`
- `visibility`
- `work_status`
- `priority_score`
- `priority_band`
- `reason`
- `last_commit_date`

不要把 private registry 发布到 Public GitHub Pages。

当前连接器不能新建 GitHub 仓库；因此创建 private 管理仓库这一步需要在 GitHub UI 完成一次，然后再由总控工具继续维护。
