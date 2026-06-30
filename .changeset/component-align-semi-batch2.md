---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（第 2 批·反馈/展示/导航）：

- **Modal**：标题字号 header-6(16)→regular(14)、新增标题字重 token（bold 600）、遮罩 `rgba(0,0,0,.45)`→`--cd-color-overlay-bg`（rgba(22,22,26,.6)，对齐 Semi overlay-bg）、`modal-z` 字面量 1000→引用 `--cd-z-modal`。
- **Menu**：菜单项高度 40px→36px（对齐 Semi navigation_item_base）、新增 `menu-item-radius`（border-radius-small），选中态高亮块带圆角。选中态配色对齐 Semi——文字 primary→text-0（深色）、新增 `menu-item-icon-color-selected`（图标/对勾保持 primary）、**移除垂直态左侧指示条**（靠蓝底+蓝图标区分）、**移除水平态底部下划线**（Semi 顶部导航选中态仅靠文字 text-2→text-0 深浅区分，无下划线）。删除不再被消费的 `menu-item-indicator` token。
- **Dropdown**：菜单项水平内边距 base-tight(12)→base(16)，对齐 Semi 下拉菜单项内边距。
- **Table**：默认行单元格垂直内边距 base-tight(12)→base(16)，对齐 Semi 默认尺寸 tbody 单元格。

均为回退 Alias/全局 token 的值/引用对齐，无写死。Modal/Menu/Table/Dropdown 无视觉回归基线，已浏览器人工核验；971 单元/DOM + 6 视觉用例全绿。
