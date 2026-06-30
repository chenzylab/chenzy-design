---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（第 1 批·核心控件）：

- **Button**：圆角 6px→3px（border-radius-small）、字重 medium(500)→bold(600)、padding-x 按尺寸分档（default/small=12px、large=16px）、全尺寸字号统一 regular(14)，对齐 Semi Button variables。
- **Input / Select / Tabs(卡片式) / Pagination(页码)**：控件圆角 6px→3px，对齐 Semi（Semi 表单控件/页签/页码用 border-radius-small）。
- 控件高度 token 统一引用全局 `--cd-control-height-*`。

面板类（dropdown/modal/table/toast/tooltip 等）保持 medium(6px)，本就对齐 Semi。Button 视觉回归基线已重生。
