---
"@chenzy-design/tokens": major
"@chenzy-design/svelte": patch
---

对齐 Semi tokens（第 3 步·清理旧档，**破坏性**）：

- **shadow**：删除 `shadow-1/2/3` 三档，统一为 Semi 的 `shadow-elevated`（`0 0 1px rgba(0,0,0,.3), 0 4px 14px rgba(0,0,0,.1)`）。所有提升层级面（modal/tooltip/popover/card/drawer/toast/select/date-picker 浮层等）改用 `shadow-elevated`。
- **line-height**：删除无单位 `tight/normal/loose`，改为对齐 Semi `_font.scss` 的 font-size↔line-height 像素绑定：`line-height-small/regular/header-1~6 = 16/20/22/24/28/32/40/44`。无组件直接消费旧名。

`font-weight-medium`(500) 暂保留（Semi 无 500，但我们 14 组件用作 UI 强调，刻意保留）。tokens 升 major（删旧 token 名）。977 测试（含 6 视觉基线零偏移）通过；浏览器实测 card/modal 等浮层用新 elevated 阴影。
