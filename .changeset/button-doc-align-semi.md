---
'@chenzy-design/svelte': patch
---

fix(button): SplitButtonGroup 主按钮与箭头间隔对齐 Semi（5px → 1px）

`.cd-button-split` 容器由 `inline-block` 改 `inline-flex`，消除主按钮与 Dropdown 触发器 span 之间的 HTML 空白符间隙（此前叠加 1px margin 后间隔达 ~5px，与 Semi 的 1px 细缝不符）。新增 SplitButtonGroup 视觉回归测试锁住 solid/light/borderless 三组的 1px 缝 + 首尾圆角基线。

同时整页对齐 Semi 的 Button 组件文档（inline 化 + demo 逐字对齐），并修正过时的 Input 视觉基线（66px → 64px，对齐 Semi 的 32px 灰底透明边框 Input）。
