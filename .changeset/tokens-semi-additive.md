---
"@chenzy-design/tokens": minor
---

对齐 Semi tokens（第 1 步·纯新增，不破坏）：

- **spacing** 补 `none`(0) / `super-tight`(2px)。
- **font-size** 补 `18` / `28`（对齐 Semi header-5/header-2）。
- **font-weight** 补 `light`(200)。
- **radius** 补 `circle`(50%) / `extra-small`(3px)。
- **shadow** 新增 `elevated`（`0 0 1px rgba(0,0,0,.3), 0 4px 14px rgba(0,0,0,.1)`，对齐 Semi `$shadow-elevated`）。
- **新增 foundation 尺寸全局 token**：`control-height-small/default/large`(24/32/40)、`width-icon-extra-small…extra-large`(8/12/16/20/24)、`border-thickness`(0)/`border-thickness-control`(1px)。Radio 的 `--cd-control-height-*` 悬空引用现已激活（修正为 small/default/large 命名）。
- **z-index 对齐 Semi 值**：tooltip 1070→1060、toast 1080→1010，补 notification(1010)/table-fixed(101)/image-preview(1070)/drag(2000)。

本步骤只增不改名、不删旧 token，零破坏（旧名仍在）。后续步骤再做语义重命名与旧档清理。
