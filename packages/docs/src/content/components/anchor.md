---
title: Anchor 锚点导航
name: anchor
category: navigation
brief: 在长页面内提供章节级目录与快速跳转能力，并在滚动时自动高亮当前可视区域对应的锚点项。
---

## 使用场景

Anchor（锚点导航）用于在长页面内提供章节级目录与快速跳转能力，并在滚动时自动高亮当前可视区域对应的锚点项。典型场景：长文档/详情页右侧目录、Setting 页分组导航、API 文档侧栏。

核心能力：组合式 API（对齐 Semi）——`children` + `<Anchor.Link>` 子组件，无 `links` 数组 prop；多级锚点（嵌套 `<Anchor.Link>`），点击平滑滚动到目标节点；滚动联动高亮（scroll-spy）：命令式监听滚动容器 scroll 事件（rAF 节流），计算「当前激活项」并高亮；跟随滑轨条（slide bar）据激活链接标题 `offsetTop` 定位；支持自定义滚动容器 `getContainer`、滚动偏移 `offsetTop`/`targetOffset`（避开固定头部）；`defaultAnchor` 默认高亮；`onChange`/`onClick` 回调传 href 字符串；`autoCollapse` 滚动时动态展开激活路径子级；`showTooltip` 文字缩略时浮层显示完整标题。

与原生 `<a href="#id">` 的差异：Anchor 接管滚动行为（平滑 + 偏移）、提供激活高亮、跨容器联动，并保证键盘与读屏可用。

## 何时使用

适用于长页面内章节间的目录导航与跳转，帮助用户快速定位内容区域。

Anchor 只负责「页面内导航」，不负责路由级导航（那是 Menu/Breadcrumb 的职责）；不渲染目标内容本身。

## 无障碍

- 根 `<nav aria-label="...">`，链接为 `role="link"`；激活项加 `aria-current="location"`。
- 键盘：`Tab` 进入链接列表（roving tabindex，整体一个 Tab stop）；`↑/↓` 在链接间移动焦点；`Home/End` 跳到首/末链接；`Space` 激活并滚动。
- disabled 链接：`aria-disabled="true"` 且从 roving 序列移除。
- `prefers-reduced-motion` 下禁用滑轨过渡与平滑滚动，改为瞬时跳转。
