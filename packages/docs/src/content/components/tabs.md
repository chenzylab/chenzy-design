---
title: Tabs 标签页
name: tabs
category: navigation
brief: 在同一区域内组织并切换多组对等内容，让用户在有限空间中按主题分区浏览。
---

## 使用场景

标签页（Tabs）用于在同一区域内组织并切换多组对等内容，让用户在有限空间中按主题分区浏览。适用于设置面板、详情页多视图、表单分步浏览等场景。

核心能力：三种视觉风格（line 下划线默认/card 卡片/button 分段按钮）；四个标签栏位置（top 默认/left/right/bottom）；可关闭（closable，每个面板出现关闭叉）与可新增（addable，标签栏尾部出现新增按钮），覆盖动态标签场景；受控（value + on:change）与非受控（defaultValue）双模式；标签溢出处理（横向溢出可滚动或折叠进"更多"下拉）；惰性渲染与缓存（lazy 首次激活才挂载、destroyInactiveTabPane 切走即销毁）。

## 何时使用

同一区域内有多组对等内容需要在有限空间中切换浏览时使用。

不负责路由联动（由使用方监听 `on:change` 自行同步 URL）；不内置可拖拽排序。关闭标签为潜在数据丢失操作，若面板含未保存内容，应在 `on:close` 中拦截并弹出确认。

## 无障碍

- TabList 容器 `role="tablist"`，`left/right` 时附加 `aria-orientation="vertical"`；每个标签 `role="tab"`，`aria-selected="true|false"`，`aria-controls="<panelId>"`；每个面板 `role="tabpanel"`，`aria-labelledby="<tabId>"`，`tabindex="0"`。
- 键盘：`Tab` 从 tablist 跳到当前面板；`←/→`（horizontal）或 `↑/↓`（vertical）在标签间移动焦点（auto 模式移动即激活，manual 模式需 Enter/Space 激活）；`Home/End` 聚焦首/末可用标签；`Delete` 在聚焦标签上触发关闭。
- 标签删除后焦点回退至相邻可用标签，避免焦点丢失到 body；关闭/新增使用 `aria-live="polite"` 播报变更。
- `prefers-reduced-motion` 下禁用 ink-bar 滑动与面板淡入。
