---
title: Tabs 标签页
name: tabs
category: navigation
brief: 在同一区域内组织并切换多组对等内容，让用户在有限空间中按主题分区浏览。
---

## 使用场景

Tabs（标签页）用于在同一区域内组织并切换多组对等内容，让用户在有限空间中按主题分区浏览。适用于设置面板、详情页多视图、表单分步浏览等场景。

核心能力（对齐 Semi Design）：四种视觉风格（line 线条默认/card 卡片/button 分段按钮/slash 斜线，slash 仅横向）；两个标签栏位置（top 默认/left 垂直）；三档尺寸（small/medium/large，默认 large）；可关闭（closable，卡片样式面板出现关闭叉）；受控（activeKey + onChange）与非受控（defaultActiveKey）双模式；数据驱动 tabList 或声明式 `<Tabs.Pane>` 自动收集；标签溢出处理（collapsible 滚动折叠含 auto 自动检测、more 折叠进"更多"下拉）；渲染策略（keepDOM 默认保留隐藏面板 DOM、lazyRender 首次激活才挂载）。

## 何时使用

同一区域内有多组对等内容需要在有限空间中切换浏览时使用。

不负责路由联动（由使用方监听 `onChange` 自行同步 URL）；拖拽排序可结合 `renderTabBar` 与第三方拖拽库实现。关闭标签为潜在数据丢失操作，若面板含未保存内容，应在 `onTabClose` 中拦截并弹出确认。

## 无障碍

- TabList 容器 `role="tablist"`，`left` 时附加 `aria-orientation="vertical"`；每个标签 `role="tab"`，`aria-selected="true|false"`，`aria-controls="<panelId>"`；每个面板 `role="tabpanel"`，`aria-labelledby="<tabId>"`，`tabindex="0"`。
- 键盘（对齐 Semi 手动激活）：`Tab` 从 tablist 跳到当前面板；`←/→`（horizontal）或 `↑/↓`（vertical）在标签间移动焦点（仅移动焦点不激活）；`Enter/Space` 激活聚焦标签；`Home/End` 聚焦首/末可用标签。
- 溢出滚动箭头带 `aria-label` 且不入 Tab 序，激活标签自动滚入可视区；`more` 收纳下拉 `aria-haspopup="menu"`。
- `prefers-reduced-motion` 下禁用标签过渡动画。
