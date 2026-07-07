---
title: Icon 图标
name: icon
category: basic
brief: 组件库最底层的视觉原语，负责以统一的尺寸、颜色、对齐方式渲染矢量图标。
---

## 使用场景

Icon 是组件库最底层的视觉原语，负责以统一的尺寸、颜色、对齐方式渲染矢量图标。它有两个使用层级：内置图标（配合 `@chenzy-design/icons` 包导出的具名图标组件，按需引入、tree-shaking 友好）；自定义图标（通过 `<Icon>` 容器 + slot 或 `svg`/`component` prop，把外部图标纳入统一的尺寸/颜色/旋转/状态体系）。

它解决三个一致性问题：尺寸统一（通过 `size` 枚举映射到 token，保证与同行 Button/Input 文本基线对齐）；颜色继承（默认 `fill: currentColor`，跟随父级文本色）；a11y 默认正确（装饰性图标默认对屏幕阅读器隐藏，语义图标强制要求 `label`）。

## 两种图标用法

本设计系统提供两条并行的图标路径，按需选用：

### 一、`<Icon>` 组件（推荐用于需统一控制的场景）

自己封装的 `<Icon>` 容器，把图标纳入统一的 `size` / `color` / `status` / `spin` / `rotate` / a11y 体系。适合需要语义状态色、加载旋转、或与表单控件基线严格对齐的场景。用法见上方各示例。

### 二、UnoCSS `preset-icons`（纯 class，轻量）

无需经过组件，直接写一个图标 class 即可渲染任意 [Iconify](https://icon-sets.iconify.design/) 图标（30 万+ 图标）。图标以**纯 CSS** 形式渲染，不是 img 也不是字体。本站已内置 [Lucide](https://lucide.dev/) 图标集：

```svelte
<span class="i-lucide-house"></span>
<span class="i-lucide-star text-amber-500"></span>
<span class="i-lucide-bell" role="img" aria-label="通知"></span>
```

#### class 命名规则

格式为 `<前缀><图标集>-<图标名>`，默认前缀 `i-`。两种分隔写法等价：

```html
<span class="i-lucide-house"></span>   <!-- 连字符写法 -->
<span class="i-lucide:house"></span>   <!-- 冒号写法 -->
```

#### 渲染模式（mask / bg / auto）

preset-icons 有三种渲染策略，用 query 后缀切换：

```html
<!-- auto（默认）：按图标自身样式自动选 mask 或 bg -->
<span class="i-lucide-house"></span>

<!-- ?mask：以 background-color + CSS mask 渲染，单色，自动继承 currentColor -->
<span class="i-lucide-house?mask text-red-500"></span>

<!-- ?bg：以 background-image 渲染，保留图标原始多色，无法改色 -->
<span class="i-vscode-icons-file-type-pnpm?bg"></span>
```

- **单色图标**用 mask 模式，可随 `currentColor` / `text-*` 改色。
- **多色图标**（如品牌 logo、文件类型图标）用 bg 模式，保留原色。

#### 颜色与尺寸

```html
<!-- 尺寸：默认 1em，用 text-* / font-size 控制 -->
<span class="i-lucide-house text-2xl"></span>

<!-- 颜色（mask 模式）：继承文本色，直接用 text-* 改色 -->
<span class="i-lucide-house text-orange-500"></span>
```

也可在 `presetIcons()` 里用 `scale` 统一放大倍数、`extraProperties` 统一附加样式（本站已设 `display:inline-block` + `vertical-align:middle`）。

#### 注意事项

- 图标数据来自本地 `@iconify-json/lucide` 包，**离线可用、可预渲染**，不依赖 CDN。
- **a11y 需自理**：装饰性图标加 `aria-hidden="true"`；语义图标加 `role="img"` + `aria-label`（`<Icon>` 组件路径会自动处理，class 路径不会）。
- ⚠️ class 必须**静态出现在源码**中，UnoCSS 才能在构建期生成对应 CSS——不要用运行时字符串拼接 class 名。若图标名确实动态，需加入 `safelist`（见下）。

### 如何换用 / 追加其它图标库

`preset-icons` 支持所有 Iconify 图标集，只需装对应的 `@iconify-json/<图标集>` 包。以追加 [Tabler](https://tabler.io/icons) 为例：

```bash
pnpm add -D @iconify-json/tabler
```

装好后即可直接使用 `i-tabler-*`，**无需改配置**——Node 环境下 preset-icons 会按 `i-<图标集>-*` 前缀自动从对应包解析。常见图标集：`@iconify-json/lucide`、`@iconify-json/tabler`、`@iconify-json/carbon`、`@iconify-json/material-symbols`。

想一次性装齐所有图标集（体积较大，仅建议在图标不确定的探索期用）：

```bash
pnpm add -D @iconify/json
```

浏览器/无本地包场景可走 CDN 动态获取（本站不用，因为要离线预渲染）：

```ts
import presetIcons from '@unocss/preset-icons/browser';
presetIcons({ cdn: 'https://esm.sh/' });
```

### 动态图标名（safelist）

当图标名在运行时才确定、无法静态出现在源码时，把可能用到的 class 显式列进 `safelist`，强制生成：

```ts
// vite.config.ts → UnoCSS({ ... })
UnoCSS({
  safelist: ['i-lucide-house', 'i-lucide-settings', 'i-lucide-bell'],
  presets: [/* ... */],
});
```

### 关键配置项

配置位于 `packages/docs/vite.config.ts` 的 `presetIcons()`：

```ts
presetIcons({
  prefix: 'i-',          // class 前缀，默认 'i-'
  mode: 'auto',          // 'mask' | 'bg' | 'auto'，默认 'auto'
  scale: 1.2,            // 尺寸倍数，默认 1（乘以 1em）
  unit: 'em',            // 尺寸单位，默认 'em'
  extraProperties: {     // 附加到所有图标的 CSS
    display: 'inline-block',
    'vertical-align': 'middle',
  },
  warn: true,            // 图标缺失时告警，默认 false
  // autoInstall: true,  // 缺包时自动安装（仅 Node，默认 false）——本站关闭，依赖显式声明
});
```

## 何时使用

在需要矢量图标的任意场景使用。被点击的场景应由外层 Button/可聚焦容器承载，Icon 不自带点击语义角色，避免给非交互元素绑定 `on:click`。

## 无障碍

- 装饰性图标（无 `label`/无 `title` slot）：根元素 `aria-hidden="true"`，内部 `<svg>` 设 `focusable="false"`，对辅助技术完全透明。
- 语义图标（有 `label` 或 `title` slot）：根元素 `role="img"`；`label` → `aria-label`；`title` slot → 生成 `<title>` 并 `aria-labelledby` 指向它。
- `@media (prefers-reduced-motion: reduce)` 下禁用 `spin` 动画，保持静态。
- Icon 本身不可聚焦，不进入 tab 序列。
