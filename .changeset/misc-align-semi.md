---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（展示/交互）：

- **Rating**：星色 warning(橙)→**yellow-5(金黄 #fac800)**——镜像 Semi 两层结构：palette 补 `yellow-5`（对应 `--semi-yellow-5`）+ alias 补 `color-rating-icon-default`（对应 Semi `$color-rating-icon-default`），亮 #fac800/暗 #fdde43；未填色 fill-1→fill-0。
- **Tree**：选中态文字 primary→text-0（bg primary-light-default 区分，同 Menu 逻辑）。
- **Calendar**：今日标识 primary-light-default+primary → primary 实底+bg-1 浅字（对齐 Semi $color-calendar-bg-active/text-active）。
- **Image**：圆角 medium(6)→small(3)（Semi $radius-image）。
- **Carousel**：指示器/箭头半透明度对齐 Semi（light 指示器 .5→.4、dark 箭头 .4→.5）。
- **List**：核对边框/文字层级已对齐，无需改。

均按 Semi 源码逐条对齐值（不同则改、相同不动）。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过，Rating 金黄星色浏览器实测（#fac800）。
