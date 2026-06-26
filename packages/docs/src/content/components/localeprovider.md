---
title: LocaleProvider 国际化
name: localeprovider
category: other
brief: 纯上下文注入组件，用于在组件树的某个子范围内覆盖当前语言环境（locale）与区域格式化策略（日期/数字/货币）。
---

## 使用场景

LocaleProvider 是一个纯上下文注入组件，用于在组件树的某个子范围内覆盖当前语言环境（locale）与区域格式化策略（日期/数字/货币）。它不渲染任何可见 DOM，仅通过 Svelte Context 向下传递 locale 包与 `Intl` 格式化器，供 DatePicker、Pagination、Table（空态/筛选）、Modal（确认/取消按钮）、Upload、Form 校验等组件消费可见文案。

**与 ConfigProvider 的关系（核心定位）**：
- `ConfigProvider` 是全局/大范围配置容器，承载 locale、theme、组件默认 props 等多维配置，通常包裹整个应用一次
- `LocaleProvider` 是 ConfigProvider 的 locale 维度子集，专用于**局部覆盖**：例如整站为中文，但某个对账区块需强制 en-US
- 当用户只需切换语言而无需其它配置时，使用 LocaleProvider；需要整体配置时用 ConfigProvider 并传 locale

适用场景：
- 多语言混排页面，某个子区块需要强制独立语种
- 嵌入式 widget 需要与宿主页面语言不同
- Storybook/测试中隔离 locale
- SSR 时按请求注入 locale

## 何时使用

- 整站语言已由 ConfigProvider 设定，但局部区域（如对账表格、国际汇款流程）需强制不同语种
- 需要在同一页面内并排展示不同语言的相同组件（对比演示场景）
- 测试时需隔离特定语言包验证文案

就近覆盖（nearest-wins）：子组件消费 locale 时取离自己最近的 LocaleProvider/ConfigProvider，符合 Svelte context 的层叠直觉。

回退链（fallback chain）：`zh-HK` 缺失 key → 回退 `zh-CN` → 回退内置 `defaultLocale`（默认 `en-US`），保证永不出现裸 key。

## 无障碍

- 本组件无 DOM，不持有 role/aria 属性
- **lang / dir 同步（关键）**：推荐宿主监听 `on:localeChange` 将 `lang`、`dir` 同步到对应子树根元素或 `<html>`，满足 WCAG 3.1.2 Language of Parts，屏幕阅读器据 `lang` 切换发音引擎
- RTL：`direction` 推断并下传，消费组件使用逻辑属性（`margin-inline-start` 等）实现镜像；本组件保证语种与方向一致
- locale 切换为纯文本替换，不移动/丢失焦点；实现保证 slot 内元素引用稳定（不重建子树），避免焦点丢失（WCAG 3.2 一致性）
