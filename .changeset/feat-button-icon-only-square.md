---
"@chenzy-design/svelte": minor
---

Button：纯图标按钮（仅传 `icon`、无文字内容）自动收成正方形（宽=高、去水平内距），对所有 type/theme/size 生效，无需手动调样式。

colorful 语义收紧：所有 theme 均支持，`type` 仅 `primary`/`tertiary` 有意义，其余 type 在 colorful 下自动回退为 `primary`。spec §4 补全 `colorful` / `ariaLabel` 并说明纯图标规则。
