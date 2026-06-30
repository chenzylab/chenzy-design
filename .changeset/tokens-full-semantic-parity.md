---
"@chenzy-design/tokens": minor
"@chenzy-design/svelte": patch
---

颜色语义层 1:1 对齐 Semi design tokens（以本地 Semi 源码 semi-theme-default/scss/global.scss 为准），light + dark 两套：

- **状态色补全四档 + 浅版三态**：primary/secondary/tertiary/success/warning/danger/info 各补 `hover`/`active`/`disabled` 与浅版 `light-default`/`light-hover`/`light-active`。
- **secondary 改为 light-blue 青蓝**（对齐 Semi，原为中性灰；该 alias 无组件依赖灰色行为）；tertiary 改为 grey-5 三态。
- **新增 disabled-text/border/bg/fill、shadow、nav-bg、overlay-bg、bg-4、bg-inverse、focus-border、link-hover/active/visited**。
- **修复 dangling token**：`danger-light-default`/`warning-light-default`/`link-hover`/`bg-inverse` 此前被组件引用但从未定义（同 #356 的 primary-light-default 问题，解析为 transparent），现补齐。
- Popover OK 按钮 hover 从未定义的 `--cd-color-primary-6` 改用 `--cd-color-primary-hover`。

未纳入（无组件消费、避免膨胀）：data-*（vchart 数据色板）、ai-*、highlight、default-*。全量 971 测试 + contrast-check + typecheck 通过，Banner/Layout/Table 实测无回归。
