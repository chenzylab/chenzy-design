---
"@chenzy-design/svelte": patch
---

修复 Dropdown 浮层定位与 SplitButtonGroup 下拉为空两处缺陷：

- Dropdown 进场动画的 keyframe 设置了 `transform: translateY(...)`，会覆盖 `use:floating` 写入 inline style 的定位 `translate(x,y)`（CSS animation 优先级高于 inline style），导致 click 触发的浮层飘到容器左上角。动画改为仅淡入 opacity，位移交由 floating 独占。
- SplitButtonGroup 在 Dropdown 标签体内放置 `{#if menu}` 内容，即便 menu 未传也会被 Svelte 收集成 children snippet 覆盖 items 渲染分支，使下拉菜单为空。改为按 menu 是否存在分叉传递。
