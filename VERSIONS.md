# 版本记录

## 3.1.0
- 新增「多功能工具箱」模块：秒表、计时器、计算器、单位换算、化学元素周期表五项功能。
- 工具箱在「个人头像抽屉（我的 → 工具箱）」与「学习页」两处均提供入口，共用同一 `#toolsView` DOM 实例与 localStorage 状态（`daily-checkin-v30:tools`），天然实现功能一致与数据同步。
- 统一调用 API：`window.Tools.open(tab)` / `close()` / `isOpen()` / `tab(name)`，两入口共用。
- 修复若干缺陷：秒表重置残留计次、原 app `computeCanBack()` 在 `composer` 未定义时抛错（已加守卫）、社交头像/昵称 XSS 防护（改 `textContent` + 头像上传前缀白名单）。
- 版本号 3.0.0 → 3.1.0（`<meta app-version>` 与 `APP_VERSION` 两处；`GUIDE_KEY` 保持 3.0.0 以不重置引导）。
- 配套：电脑端网页查询界面 `status.html`、安装包 `发布包/星火每日打卡-v3.1.0.apk`。
- 快照：`versions/3.1.0/index.html`

## 3.0.0
- 新建独立 3.0.0 实验站，使用全新仓库 `mindspire56/daily-checkin-v3`，不干扰 `daily-checkin`、`daily-checkin-v2`、`daily-checkin-v21` 三个老库。
- 基于 `daily-checkin-v2` 的 `2.0.0.3` 稳定版复制起步，保留其全部功能：自定义模式、自定义任务、鼓励语、音乐栏、打卡日历与日志、指引系统、一键灵感添加、emoji 语义图标库。
- 版本号升级至 `3.0.0`（`<meta app-version>` 与 `APP_VERSION` 两处）。
- localStorage 主键改为 `daily-checkin-v30`，与老库数据彻底隔离，不影响 2.0.0.3 / 2.1.x 用户数据。
- 音频（背景音乐、雨声）继续引用 `daily-checkin-v2` 已稳定上传的资源，避免重复上传大文件。
- 快照：`versions/3.0.0/index.html`
