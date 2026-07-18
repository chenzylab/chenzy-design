<script lang="ts">
  // demo「修改元素样式」用：覆盖 h2 为自定义颜色的 Title（对齐 Semi components['h2'] 覆盖）。
  import type { Snippet } from 'svelte';
  import { Title } from '@chenzy-design/svelte';

  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }
  let { children }: Props = $props();
</script>

<Title heading={2} style="color: var(--cd-color-text-2)">
  {#if children}{@render children()}{/if}
</Title>
