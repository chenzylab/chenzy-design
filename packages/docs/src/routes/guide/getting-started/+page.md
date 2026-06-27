# Getting Started 快速开始

## 环境要求

需要 **Svelte 5（runes）**。组件以 runes 模式编写，依赖 Svelte 5 的响应式系统。

## 安装

```bash
pnpm add @chenzy-design/svelte @chenzy-design/tokens
```

## 引入设计令牌

在应用入口（如 `+layout.svelte`）引入设计令牌 CSS。这一步是**必须**的，否则组件没有样式。

```svelte
<script>
  import '@chenzy-design/tokens/tokens.css';
  let { children } = $props();
</script>

{@render children()}
```

## 使用组件

在任意页面按需引入并使用组件：

```svelte
<script lang="ts">
  import { Button, Input } from '@chenzy-design/svelte';
  let text = $state('');
</script>

<Button type="primary">主要按钮</Button>
<Input bind:value={text} placeholder="请输入" />
```

## 暗色模式

给根元素 `html` 设置 `data-theme="dark"` 即可切换到暗色主题：

```js
document.documentElement.setAttribute('data-theme', 'dark');
```

去掉该属性或设为 `light` 即回到亮色主题。Token 体系会自动响应。

## 下一步

- 浏览 [Overview 组件总览](overview)，了解全部组件分类。
- 查看 [Accessibility 无障碍](accessibility)、[Internationalization 国际化](i18n) 等体验增强能力。
