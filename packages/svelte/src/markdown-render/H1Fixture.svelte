<!-- 测试夹具：覆盖 h1 的自定义 Svelte 组件。接收 HastNode 透传的 children snippet。 -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }
  let { children }: Props = $props();
</script>

<div data-testid="custom-h1">
  {#if children}{@render children()}{/if}
</div>
