---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
---

FloatButton：`shape="round"` 改为正圆对齐 Semi，并新增自定义圆角能力。

- **round 正圆**：`floatbutton-radius-round` token 由 `border-radius-large`（12px 圆角矩形）改为 `border-radius-circle`（50% 正圆），对齐 Semi 及 icon-only 悬浮按钮惯例。此前 round 只有 12px 圆角、视觉上「没有圆形」。
- **自定义圆角**（本库相较 Semi 额外提供）：`shape` 类型扩展为 `'round' | 'square' | string`，接受任意 CSS border-radius 字符串（如 `'8px'`、`'30%'`）直接作为圆角，在正圆与方形之间自由过渡。`round`/`square` 仍走语义预设 class + token，自定义值走 inline `border-radius`。
- docs demo：修正「形状与尺寸」的描述/aria（此前把 12px 圆角误标为「圆角」，现明确 round=正圆）；修「href 链接」demo 源码里 `&lt;a&gt;` HTML 实体显示问题与示例链接（原硬编码指向 Semi 官网，改为本库仓库）；新增「自定义圆角」demo 演示 round/square/8px/30%。
