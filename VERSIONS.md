# 版本记录

> **当前版本：3.5.1.0**（学习助手形态：今日 / 阅读 / 星火 / 练习 / 休闲）。
> 保留的历史快照：`versions/3.2.2.9`（最后一版含社交功能的稳定版）、`versions/3.5.1.0`。
> 「联网社交版（大飞跃）」在独立分支 **`social-dev`** 开发，不影响 main；该方向因暂无云服务暂搁置。

---

## 3.5.1.0（导览重构 + 阅读模块 + 星火空间；当前版）

**版本隔离**
- 存储键 `daily-checkin-v30` → **`daily-checkin-v35`**（主题键、引导键、工具箱键同步迁移；与 3.2.2.9 数据完全隔离，互不覆盖）。
- 引导键 `daily-checkin-guide-3.0.0` → `daily-checkin-guide-3.5.0`。
- 安卓：同包名 `com.dailycheckin.v3`，显示名 **「星火 · 学习」**（区别于旧版「星火」），versionCode 8 → 9，versionName 3.5.1.0。

**导览行**
- 旧：今日 / 学习 / 花火(悬浮+) / 练习 / 休闲
- 新：**今日 / 阅读 / 星火 / 练习 / 休闲**（星火转为正式导览项，悬浮 `+` 按钮移除）

**阅读（新增）**
- 支持导入 **epub（原生解析）** 与 **txt / md**。
  - epub：手写 ZIP 中央目录解析 + `DecompressionStream('deflate-raw')` 解压，读 `container.xml` → `content.opf` → spine 章节顺序；XHTML 经 `sanitizeHtml` 剥离 `<script>`/`<style>`/`on*` 事件属性。
  - txt/md：按空行与章节标题切分章节。
- 书架分组（在读 / 想读 / 读完）、阅读进度、目录跳转、上一章 / 下一章。
- **书签**、**划线**、**读书笔记**（按书归档，`DB.ns('reading')`）。

**星火（原花火改名，学习模式二合一）**
四个分区：
1. **专注模式** — 番茄钟（25 / 45 / 5 分钟档），环形进度、暂停 / 重置、完成计数。
2. **工具栏** — 复用既有工具箱 + 新增计算器 / 白噪音 / 屏幕常亮（`navigator.wakeLock`，安卓走 `AndroidBridge.keepScreenOn`），预留扩展位。
3. **学科学习** — 小学 / 初中 / 高中 → 10 个学科 → 「年级 + 学科」专属资料空间，资料增删改查（独立数据域 `DB.ns('subjects')`，与背诵卡片互不干扰）。
4. **背诵** — 三模式：
   - **自定义背诵**：牌组 / 正面 / 背面 / 提示 / 例句，完整增删改。
   - **抽查式背诵**：Leitner 间隔重复翻转卡（BOX_DAYS `[0,1,3,7,16]`）。
   - **正常背诵**：随机推荐常识 / 古诗 / 名言，纯浏览、**不计分不测验**。

**练习**
- 自建测验，答错自动回流星火错题（`DB.ns('wrong')`）。

**返回栈**
- `computeCanBack` / `appBack` 面板键修正为 `['reading','spark','practice','leisure']`（旧键 `study`/`recite` 会导致 `panels[k]` 为 `undefined` 崩溃）。
- 新增 `window.__subBack()`：星火子页 / 阅读器 / 学科空间 / 卡片编辑器**逐级返回**，不再一步退到今日。
- 修正 `window.__activate` 的定义位置（此前在星火模块引用了不存在的 `activate`，会抛 ReferenceError）。

**质量校验**
- `devlog/3.5.1.0/smoke.js`：jsdom 全流程 60 项断言，**全部 PASS，0 JS 错误**。
- `devlog/3.5.1.0/smoke_epub.js`：手工构造真实 epub（ZIP + deflate）导入验证 9 项，**全部 PASS**，含 XSS sanitize 校验。

---

## 3.5.0.0（去社交 + 火花背诵雏形）
- 切除全部社交 / 好友 / 朋友空间功能；新增「火花」Leitner 背诵（23 张种子卡）与「练习」自测。
- 已部署线上，后被 3.5.1.0 取代。

## 3.2.2.9（最后一版含社交功能的稳定版）
- **问题**：深色模式下「编辑资料」抽屉与聊天页仍为浅色。
- **修复**：补充 `[data-theme="dark"]` 下 `.profile-drawer`、`.chat-view`、`.chat-body`、`.msg-row .m-bubble` 等深色规则。
- 快照保留于 `versions/3.2.2.9/index.html`。
