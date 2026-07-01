---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（反馈类）：

- **Skeleton**：圆角 medium(6)→small(3)、段落骨架高度 14→16。
- **Empty**：描述文字 text-2→text-1、新增标题字重 token（bold）。
- **Popconfirm**：正文文字 text-1→text-2、内边距 base(16)→loose(24)、警示图标 primary→warning、最大宽度 280→400、标题字重 token 化(bold)。
- **Banner**：圆角 medium(6)→small(3)、水平内边距 base(16)→base-tight(12)；四语义色背景改用正式 `*-light-default` alias——info 由 primary-light-default 改 info-light-default、success/danger 由 color-mix 改对应 alias。
- **Spin**：核对已对齐（primary 色、14/20/32 尺寸、track fill-1），无需改。

均为回退 Alias/全局 token 的值/引用对齐，无写死。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿，Banner 四语义色浏览器实测（info #eaf5ff / success #ecf7ec / danger #fef2ed）。
