# Introduction 介绍

`chenzy-design` 是一套对标 Semi Design 的高质量 Svelte 组件库，目标是为 Svelte 5 应用提供可生产、可访问、可定制的 UI 组件。

无障碍 · 主题化 · i18n · 多框架适配 · 性能基准 · AI 友好。

## 特性

- **无障碍（Accessibility）**：以 WCAG 2.1 AA 为基线。所有交互组件键盘可达、对屏幕阅读器可理解、可见焦点、对比度达标，遵循 WAI-ARIA APG 模式。
- **主题化（Theming）**：基于三层 Design Token 体系，支持暗色模式、`prefers-reduced-motion`、品牌色定制与局部主题。
- **国际化（i18n）**：组件内置文案集中到独立的 Locale 包，通过 `ConfigProvider` / `LocaleProvider` 注入，运行时切换语言；日期、数字、货币统一走 `Intl`，支持 RTL。
- **性能基准（Performance）**：对大数据渲染、浮层、高频事件设有性能预算，并在质量门禁中校验体积与运行时表现。
- **AI 友好（AI-friendly）**：组件元数据可被工具消费，便于代码生成与文档自动化。

## 技术栈

Svelte 5（runes）· Vite · UnoCSS · pnpm monorepo · TypeScript（strict）。

## Monorepo 结构

| 包 | 说明 |
| --- | --- |
| `@chenzy-design/tokens` | 设计令牌（源真相，三层） |
| `@chenzy-design/unocss-preset` | token 到 UnoCSS theme |
| `@chenzy-design/core` | headless 原语（框架无关） |
| `@chenzy-design/locale` | i18n 语言包与格式化 |
| `@chenzy-design/icons` | 图标 |
| `@chenzy-design/svelte` | Svelte 组件实现（主包） |

依赖方向：`tokens → unocss-preset → core → svelte`；`icons` / `locale` 被 `svelte` 依赖。

## 当前进度

- M0 基建：monorepo、tokens 三层体系（暗色 + reduced-motion）、unocss-preset、core 原语、locale（zh_CN / en_US）、CI / 质量门禁。
- 69 个组件实现（基础 / 输入 / 导航 / 展示 / 反馈 / 其他），含 meta、token、a11y。
- 文档站（SvelteKit SSG）：API 表自动生成、调试面板、使用场景、暗色模式、Pagefind 搜索。
- npm 发布：6 个 `@chenzy-design/*` 包，Changesets 自动化版本管理。
