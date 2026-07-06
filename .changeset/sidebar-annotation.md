---
'@chenzy-design/svelte': minor
'@chenzy-design/tokens': minor
'@chenzy-design/locale': minor
---

feat(sidebar): SideBar Annotation 引用溯源（P2）

新增 `SideBarAnnotation`——AI 侧边信息栏的参考来源/引用溯源折叠列表：外层复用
`SideBarContainer` 浮层壳（透传全部 Container props，`title` 默认走 i18n），内部用
`Collapse` 渲染 `info` 分组（每组一个折叠面板，`aria-expanded` 由 Collapse 落实），
展开区渲染 video（封面/时长/播放态，`duration` 走 locale 数值格式化为 mm:ss）/text
（站点 logo/名称/引用序号）卡片。可点击卡片（`url` 或 `onClick`）用原生 `<button>`
（键盘 Enter/Space + focus 环 + 时长/序号本地化可访问文本），`renderItem` 可整条覆盖。
新增 `--cd-sidebar-annotation-*` token 与 `SideBar` locale（annotationTitle/annotationEmpty/
videoDuration/citationOrder）。
