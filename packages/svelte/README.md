# @chenzy-design/svelte

基于 Svelte 5 的企业级组件库，对标 Semi Design。69 个组件，无障碍 · 主题化 · i18n · 性能基准。

📖 文档站：<https://chenzylab.github.io/chenzy-design/>

## 安装

```bash
pnpm add @chenzy-design/svelte @chenzy-design/tokens
```

> `@chenzy-design/core` / `@chenzy-design/locale` 会作为依赖自动安装。`@chenzy-design/tokens` 需显式安装，因为它提供组件所需的 CSS 变量（见下）。

## 快速开始

### 1. 引入设计令牌 CSS（必须）

组件的颜色、间距、圆角等都基于 CSS 变量（`--cd-*`）。**不引入 `tokens.css` 组件将没有任何样式。** 在应用入口引入一次即可：

```svelte
<!-- src/routes/+layout.svelte（SvelteKit）或应用根组件 -->
<script>
  import '@chenzy-design/tokens/tokens.css';
  let { children } = $props();
</script>

{@render children()}
```

### 2. 使用组件

```svelte
<script lang="ts">
  import { Button, Input, Switch } from '@chenzy-design/svelte';

  let text = $state('');
  let on = $state(false);
</script>

<Button type="primary" onclick={() => alert('clicked')}>主要按钮</Button>
<Input bind:value={text} placeholder="请输入" />
<Switch bind:value={on} />
```

## 暗色模式

`tokens.css` 内置暗色变量。给 `<html>` 设置 `data-theme="dark"` 即可切换：

```js
document.documentElement.setAttribute('data-theme', 'dark'); // 暗色
document.documentElement.setAttribute('data-theme', 'light'); // 亮色
```

## 要求

- **Svelte 5**（使用 runes，`peerDependency: svelte >= 5.0.0`）
- 任意支持 Svelte 的打包器（Vite / SvelteKit 等）

## 组件清单

69 个组件，覆盖基础 / 输入 / 导航 / 展示 / 反馈 / 其他六大类。完整 API、设计文档与在线演示见 [文档站](https://chenzylab.github.io/chenzy-design/)。

## 许可

MIT
