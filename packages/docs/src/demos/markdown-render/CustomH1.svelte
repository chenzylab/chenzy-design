<script lang="ts">
  // demo「仅纯 Markdown」用：覆盖 h1 为主色 Title（对齐 Semi components['h1'] 覆盖）。
  import type { Snippet } from 'svelte';
  import { Title } from '@chenzy-design/svelte';

  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }
  let { children }: Props = $props();
</script>

<Title heading={1} style="color: var(--cd-color-primary)">
  {#if children}{@render children()}{/if}
</Title>
