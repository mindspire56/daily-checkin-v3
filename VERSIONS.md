# 版本记录

## 3.0.0
- 新建独立 3.0.0 实验站，使用全新仓库 `mindspire56/daily-checkin-v3`，不干扰 `daily-checkin`、`daily-checkin-v2`、`daily-checkin-v21` 三个老库。
- 基于 `daily-checkin-v2` 的 `2.0.0.3` 稳定版复制起步，保留其全部功能：自定义模式、自定义任务、鼓励语、音乐栏、打卡日历与日志、指引系统、一键灵感添加、emoji 语义图标库。
- 版本号升级至 `3.0.0`（`<meta app-version>` 与 `APP_VERSION` 两处）。
- localStorage 主键改为 `daily-checkin-v30`，与老库数据彻底隔离，不影响 2.0.0.3 / 2.1.x 用户数据。
- 音频（背景音乐、雨声）继续引用 `daily-checkin-v2` 已稳定上传的资源，避免重复上传大文件。
- 快照：`versions/3.0.0/index.html`
