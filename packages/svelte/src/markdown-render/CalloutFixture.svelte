<!-- 测试夹具：自定义标签 <callout> 对应的 Svelte 组件。
     HastNode 把 hast element 的 properties 透传为 props（此处 tone），children 为渲染后的子节点。 -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    tone?: string;
    children?: Snippet;
    [key: string]: unknown;
  }
  let { tone, children }: Props = $props();
</script>

<div data-testid="callout" data-tone={tone}>
  {#if children}{@render children()}{/if}
</div>
