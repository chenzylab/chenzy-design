---
"@chenzy-design/svelte": major
"@chenzy-design/tokens": major
---

Space：破坏性重写严格对齐 Semi（无向后兼容）。

- **组件**：破坏性移除超集 `block` / `tag` / `role` / `ariaLabel`，根元素恒 `<div>`，props 仅保留 Semi 的 `vertical` / `spacing` / `align` / `wrap` / `class` / `style` / `children`。
- **DOM/样式**：gap 与 align 改为 class 驱动（不再用 inline style），完整镜像 Semi scss —— `cd-space` + `cd-space-vertical` / `-horizontal` + `cd-space-align-{center|start|end|baseline}` + `cd-space-wrap` + `cd-space-{tight|medium|loose}-horizontal` / `-vertical`；仅 number / 数组中的 number 元素走 inline `column-gap` / `row-gap`。补齐 `...rest` 透传（对齐 Semi getDataAttr 的 data-* 透传）与 RTL `direction`。
- **tokens**：删除多余中间变量 `--cd-space-tight` / `-medium` / `-loose`，仅保留对齐 Semi variables.scss 的 3 个 `--cd-spacing-space-tight` / `-medium` / `-loose`。
- **CardGroup（消费方先对齐 Semi）**：不再向 Space 传 `block` / `align` / `role` / `ariaLabel`（Semi CardGroup 亦不传），并移除 CardGroup 自身的 `ariaLabel` prop；grid 布局靠 `.cd-card-group--grid` scss + Space inline-flex/wrap。
- **demos**：对齐 Semi 5 例（基本用法 / 对齐方式 / 间距尺寸含 array / 间距方向 / 设置换行），移除依赖已删超集能力的自造 demo。
- meta / spec / content 全量对齐新 API。
