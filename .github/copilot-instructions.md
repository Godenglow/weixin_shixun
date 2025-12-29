# Copilot 使用说明（面向 AI 代码代理）

目的：帮助 AI 代理快速上手并在本仓库中产出可靠、符合现有约定的更改。

## 项目概览（大致结构）
- 前端：`miniprogram/` — 微信小程序代码（pages、utils、app.json 等）。
- 后端：`cloudfunctions/` — 微信云函数，每个子目录对应一个云函数（例如 `tests`, `login`, `profile`）。
- 数据模型：`cloudfunctions/database-schema.json` 描述了主要集合（`users`, `tests`, `questions`, `records`, `reports`, `categories`）及字段。

## 关键约定与模式（必须遵守）
- 云函数通用接口：入口文件通常基于 `event.action` 做 switch 分发，并返回统一结构：
  - 成功：`{ success: true, data: ... }`
  - 失败：`{ success: false, message: '...' }`
  示例：`cloudfunctions/tests/index.js` 使用 `action: 'getList'/'getDetail'` 等。
- 客户端调用：前端多处直接使用 `wx.cloud.callFunction({ name, data })`，仓库还提供 `miniprogram/utils/util.js::callCloudFunction(name, data)` 返回 Promise 并基于 `res.result.success` 做统一处理。优先复用该 helper。
- 数据库访问：云函数使用 `wx-server-sdk` 的 `db`，常见习惯：`db.collection('tests').where(...).orderBy(...).skip(...).limit(...).get()`（分页/排序模式）。
- 时间与服务器时间：云端使用 `db.serverDate()` 来写入时间戳。
- 日志：云函数里普遍使用 `console.log` / `console.error` 记录关键信息以便在云控制台查看。

## 开发 & 调试 工作流（要点）
- 本地运行/构建：此仓库是微信小程序项目。使用「微信开发者工具」打开项目目录并上传/预览；没有 npm 脚本或 CI 用于构建前端。
- 部署云函数：在微信开发者工具内选择云开发并上传每个云函数，或使用微信云开发 CLI（若配置）。
- 日志与错误排查：查看云函数执行日志（云开发控制台），云函数里有丰富的 `console.*` 语句可供定位。
- 环境配置注意：
  - 云函数通常使用 `cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })`（动态环境）。
  - `miniprogram/app.js` 当前存在静态 `env: 'cloud1-...'`，修改此值前请先确认云环境是否应固定或改为动态引用。

## 代码样式与本地约定
- 错误提示多使用中文短语（例如：`'操作失败'`, `'网络错误，请重试'`），新增交互信息请延续中文风格。
- 云函数与前端间的字段命名遵循 `camelCase` 风格（例如 `testId`, `pageSize`）。
- 云函数命名与目录对应：新增云函数时，目录名即函数名（例如创建 `cloudfunctions/myFunc/index.js` 后可通过 name: 'myFunc' 调用）。

## 给 AI 代理的具体任务提示（示例）
- 若要新增 API：在 `cloudfunctions/` 添加新的函数目录，入口遵循 `action` 分发模式并返回 `{success:..., data/message...}`，同时更新前端调用点（优先使用 `util.callCloudFunction`）。
- 若要修改数据模型：先在 `cloudfunctions/database-schema.json` 中添加或更新字段注释；确认所有读取/写入该字段的云函数与前端都做了兼容性处理（回退或默认值）。
- 若涉及环境变更：不要随意改动 `app.js` 中的云环境 ID，先在 PR 描述中明确为什么需要更改，并在测试环境验证云函数是否仍能访问数据库。

## 参考文件（有代表性的实现）
- `cloudfunctions/tests/index.js` — tests 查询、分页、详情聚合（questions）示例
- `cloudfunctions/login/index.js` — 登录 / 用户档案管理 示例
- `miniprogram/utils/util.js` — `callCloudFunction` -> Promise + 错误提示 统一入口
- `cloudfunctions/database-schema.json` — 数据集合与字段说明
- `miniprogram/app.js` — 全局 init 与主题处理示例

---
请审阅这份草稿并告诉我是否需要补充关于部署、CI、或特定云函数的更多细节，我会根据反馈迭代文档。 ✅