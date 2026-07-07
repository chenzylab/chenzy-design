---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
---

FloatButton：修徽章位置 + Group 椭圆，并将 Group 补齐为 Semi 胶囊工具条。

- **徽章位置**（bug）：此前 Badge 只包裹 icon 小框，徽章相对 icon 定位而非整个按钮，浮在按钮外偏上。现让 Badge 包裹层撑满按钮，并用 Semi 的几何公式将徽章定位到圆形边缘切点（`偏移 = 0.29 × 0.5 × 按钮宽`，按 size 三档分别计算；square 用 `0.29 × 圆角半径`），徽章正确咬合在按钮右上角。
- **Group 椭圆**（bug）：Group 里 icon-only 项此前误传空 children snippet，触发 FloatButton 的 `with-content`（宽度撑开），配合 round 的 50% 圆角渲染成椭圆。现仅在有 content 时才传 children；并给 round + with-content 用胶囊圆角（`border-radius-full`）而非 50%，避免宽矩形上变椭圆。
- **Group 胶囊工具条**（对齐 Semi）：`FloatButtonGroup` 由「纵向独立圆按钮」改为 Semi 形态——一个背景圆角条内横排（或竖排）多个「图标 + 文字」项（bg + shadow + padding + gap，item 有 padding/hover 背景/圆角）。新增 `direction` prop（`'horizontal'`（默认）/`'vertical'`）。新增 11 个 Group 相关 component token。demo 06 更新为胶囊工具条演示。
