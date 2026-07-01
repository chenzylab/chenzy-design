---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

表单控件对齐 Semi 填充式样式（逐条按 Semi variables 值对齐）：

- **Input**：默认背景 bg-0→fill-0、边框 color-border→transparent、聚焦边框 primary→focus-border、新增 hover 背景 fill-1、聚焦回 fill-0、disabled 用 disabled-fill。Semi 表单控件是填充式（灰底无边框，聚焦才显蓝边），本次对齐。
- **Select**：同 Input 填充式对齐（bg fill-0、border transparent、focus focus-border、hover fill-1）。
- **Cascader / TreeSelect**：复用 Select token（已对齐），补触发器 hover/focus/展开态填充式 CSS。
- **TagInput**：复用 Input token（已对齐），补填充式 CSS；顺带修复背景引用了不存在的 `--cd-input-bg`（应为 `--cd-input-color-bg`）的 bug。
- **Upload**：拖拽区背景 fill-0→tertiary-light-default、hover 背景 primary-light-default、文件卡片 hover fill-0→fill-1，对齐 Semi upload。

均为按 Semi 源码 variables 逐条对齐值（不同则改、相同不动），无写死。Input 视觉基线已重生；971 单元 + 6 视觉全绿、perf 通过；Select 填充式浏览器实测（bg rgba(46,50,56,.05) / border transparent）。
