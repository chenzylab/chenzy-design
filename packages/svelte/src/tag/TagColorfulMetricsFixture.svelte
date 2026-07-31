<!--
  browser project 夹具（真实 chromium）：AI 多彩标签（colorful）四种形态。
  用于把配色与 Semi 官网实测值逐项比对（见 semi-metrics.ts 的 TAG_COLORFUL_*）。
-->
<script lang="ts">
  // 不引则 var(--cd-*) 全失效、颜色读数恒为 transparent、断言恒真
  import '@chenzy-design/tokens/tokens.css';
  import Tag from './Tag.svelte';
</script>

<div data-testid="solid-gradient"><Tag colorful gradient type="solid">AI</Tag></div>
<div data-testid="solid"><Tag colorful type="solid">AI</Tag></div>
<div data-testid="light"><Tag colorful type="light">AI</Tag></div>
<div data-testid="ghost"><Tag colorful type="ghost">AI</Tag></div>
