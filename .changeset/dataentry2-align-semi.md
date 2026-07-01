---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（数据录入·面板/表单）：

- **DatePicker**：日期格圆角 medium(6)→small(3)、新增 footer 背景 fill-0（对齐 Semi 确认 footer）、新增快捷操作按钮色 token(primary)。触发器复用 Input 填充式 token（已对齐）。
- **Form**：可选标记/extra 文字色 text-2→tertiary，对齐 Semi form label optional/extra。
- **TimePicker**：复用 DatePicker token（面板/输入圆角已对齐）。
- **AutoComplete**：复用 Select 选项 token（已对齐）。
- **Transfer**：核对圆角 medium、条目 hover fill-0、文字层级 text-0/1/2 已对齐，无需改。

均按 Semi 源码 variables 逐条对齐值（不同则改、相同不动），无写死。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过，DatePicker 面板浏览器实测（日期格 radius 3px / footer fill-0 / 填充式触发器）。
