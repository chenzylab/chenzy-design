---
title: Anchor 锚点导航
name: anchor
category: navigation
brief: 在长页面内提供章节级目录与快速跳转能力，并在滚动时自动高亮当前可视区域对应的锚点项。
---

## 使用场景

锚点导航（Anchor）用于在长页面内提供章节级目录与快速跳转能力，并在滚动时自动高亮当前可视区域对应的锚点项。典型场景：长文档/详情页右侧目录、Setting 页分组导航、API 文档侧栏。

核心能力：多级锚点（嵌套 AnchorLink），点击平滑滚动到目标节点；滚动联动高亮（scroll-spy）：基于 IntersectionObserver 监听目标元素，计算「当前激活项」并高亮；跟随滑块（rail/ink bar）随激活项移动；支持自定义滚动容器、滚动偏移 `offsetTop`（避开固定头部）；受控/非受控当前激活项（`value` + `on:change`）；可选锚点变更同步到地址栏 hash。

与原生 `<a href="#id">` 的差异：Anchor 接管滚动行为（平滑 + 偏移）、提供受控高亮、跨容器联动，并保证键盘与读屏可用。

## 何时使用

适用于长页面内章节间的目录导航与跳转，帮助用户快速定位内容区域。

Anchor 只负责「页面内导航」，不负责路由级导航（那是 Menu/Breadcrumb 的职责）；不渲染目标内容本身。

## 无障碍

- 根 `<nav aria-label="...">`，链接列表用 `<ul>/<li>`，链接为原生 `<a href="#id">`；激活项加 `aria-current="location"`。
- 键盘：`Tab` 进入链接列表（roving tabindex，整体一个 Tab stop）；`↑/↓`（vertical）或 `←/→`（horizontal）在链接间移动焦点；`Home/End` 跳到首/末链接；`Enter/Space` 激活并滚动。
- disabled 链接：`aria-disabled="true"` 且从 roving 序列移除。
- `prefers-reduced-motion` 下禁用滑块过渡与平滑滚动，改为瞬时跳转。

## 文案规范

- **链接文本与目标标题一致**：用名词短语、简洁，建议 ≤ 20 字符，避免「点击这里」。
- **nav 标签简洁**：`aria-label` 简洁描述用途（"页面导航"），不重复页面标题。
- **播报句式一致**：保持「当前：章节名」一致句式。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 快速开始 | 点击这里查看快速开始 |
| 页面导航（aria-label） | 本页面的目录导航区域 |
| 当前：安装指南 | 现在你在安装指南这一节 |

- Anchor 为纯导航组件，不涉及任何破坏性/不可逆操作，无危险文案。
