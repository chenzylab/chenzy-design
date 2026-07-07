---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
---

Layout：Sider 补齐零宽收起触发器（zeroWidthTrigger）+ 修复 demo 高度塌缩。

Sider 新增能力：`collapsedWidth={0}` 且 `collapsible` 时，侧栏完全收起为 0 宽后，自动在侧栏外缘露出一个浮动触发块（`position:absolute` 逸出 0 宽 aside），使收起后仍可点击展开——否则 0 宽侧栏无处可点、无法恢复（对齐 Ant Design `zeroWidthTrigger` 行为）。新增 `zeroWidthTriggerStyle` prop 定制浮动块位置/样式；复用同一套 `toggle` 与 aria（`aria-expanded`/`aria-controls`/`aria-label` 走 i18n）；`prefers-reduced-motion` 降级。新增 2 个 component token `--cd-layout-sider-zero-trigger-width/height`。左右 placement 各自贴对应外缘。

demo 修复：Layout 的 `Content` 是 `flex:1` 弹性撑满，在 `Layout.Content` 上写 `height` 会被 `flex-basis` 覆盖而无效，且根 Layout 不自动继承父容器高度。修正 8 个受影响 demo（三行式 / 侧栏 / 横向）为正确写法——外层容器给固定高度 + `<Layout style="height:100%">` + Content 靠 `flex:1` 自然撑满，不再在 Content 上写死 height。新增「零宽收起」demo 演示 zeroWidthTrigger 闭环。
