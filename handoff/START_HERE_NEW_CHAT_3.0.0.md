# 新对话交接入口：每日打卡 3.0.0

这个文件用于给新的对话快速接手 3.0.0 实验站项目。新对话开始时请先读取本文件，再读取同目录其他 handoff 文档。

## 先说结论

- 3.0.0 是独立大版本线，使用全新仓库 `mindspire56/daily-checkin-v3`，不干扰以下三个老库：
  - 正式主站 `mindspire56/daily-checkin`（当前 1.4.4.2）
  - 稳定实验站 `mindspire56/daily-checkin-v2`（当前 2.0.0.3，已封存）
  - 2.1 突破实验站 `mindspire56/daily-checkin-v21`（当前 2.1.0.6）
- 3.0.0 基于 `daily-checkin-v2` 的 `2.0.0.3` 复制起步，是 2.0.0.x 线的延续与升级。
- 每次修改必须完整走发布流程：改版本号、保存快照、更新版本说明、本地检查、上传 GitHub、验证线上版本、最后发可点击链接。

## 仓库和网站分工

### 3.0.0 实验站（本线）
- 仓库：`mindspire56/daily-checkin-v3`
- 网站：`https://mindspire56.github.io/daily-checkin-v3/`
- 当前版本：`3.0.0`
- 本地工作区：`D:\每日打卡\index.html`
- 本地快照：`D:\每日打卡\versions\3.0.0\index.html`
- 定位：3.0.0 主突破线。

### 不干扰的老库（只读参考，勿改）
- 正式主站：`mindspire56/daily-checkin`（1.4.4.2）
- 稳定实验站：`mindspire56/daily-checkin-v2`（2.0.0.3，封存）
- 2.1 突破实验站：`mindspire56/daily-checkin-v21`（2.1.0.6）

## 数据隔离规则

GitHub Pages 不同仓库同属 `mindspire56.github.io` 源，localStorage key 不能乱复用。

- `daily-checkin-v2` 使用：`daily-checkin-v2`
- `daily-checkin-v21` 使用：`daily-checkin-v21`
- `daily-checkin-v3` 使用：`daily-checkin-v30`（3.0.0 专用，全新隔离）

这样 3.0.0 不会污染任何老库用户数据。

## 音频资源策略

`background.mp3` 与 `rain.mp3` 继续引用 `daily-checkin-v2` 已稳定上传的资源：

- `https://mindspire56.github.io/daily-checkin-v2/background.mp3`
- `https://mindspire56.github.io/daily-checkin-v2/rain.mp3`

不在本库重复上传大音频文件。

## 每次修改必须遵守的发布流程

1. 明确本次要改的版本号。
2. 从当前目标版本复制出新快照目录，例如 `versions/3.0.1/index.html`。
3. 修改新快照里的版本号：`<meta name="app-version" content="...">` 与 `APP_VERSION='...'`。
4. 如需新 localStorage 键，保持 `daily-checkin-v3x` 命名避免冲突。
5. 更新 `VERSIONS.md`，写清楚本次变化和快照路径。
6. 本地检查：JS 语法检查必须通过；检查版本号、关键功能字符串、localStorage 键。
7. 上传 GitHub：目标库 `index.html`、`VERSIONS.md`、`versions/<version>/index.html`、需要时同步 `handoff`、资源文件。
8. 验证 GitHub 远端内容：确认远端 `index.html` 包含新版本号。
9. 验证 GitHub Pages 线上页面：必须打开线上 URL 并确认包含新版本号；遇缓存带 `?v=30000&check=<timestamp>`。
10. 最后回复用户时必须给可点击链接，并放在明显位置。

## 最后回复用户必须包含

- 直接可点击的网站链接。
- 本地快照路径。
- 是否已更新 `VERSIONS.md`。
- 是否已上传 GitHub。
- 是否已验证线上版本。
- 任何未完成项必须明确说明。

## 安全规则

- 不要把 GitHub token、AI API Key、签名密钥等秘密写入任何项目文件。
- 上传用到的 token 仅在命令内存中使用，用后不写文件。
- 如果上传失败，不能假装发布成功。
- 如果 Pages 还没刷新，要继续验证直到确认线上版本或明确说明卡住。

## 新对话建议读取顺序

1. `handoff/START_HERE_NEW_CHAT_3.0.0.md`
2. `VERSIONS.md`
3. 其他 handoff 文档按需
