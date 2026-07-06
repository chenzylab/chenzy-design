<script lang="ts">
  import { FloatButtonGroup, Text } from '@chenzy-design/svelte';
  import type { FloatButtonGroupItem } from '@chenzy-design/svelte';

  let last = $state('');

  const items: FloatButtonGroupItem[] = [
    { value: 'help', ariaLabel: '帮助', icon: help },
    { value: 'chat', ariaLabel: '客服', icon: chat },
    { value: 'star', ariaLabel: '收藏', icon: star },
  ];
</script>

{#snippet help()}
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M9 9a3 3 0 1 1 4 2.8c-.8.4-1 .9-1 1.7M12 17h.01" /></svg>
{/snippet}
{#snippet chat()}
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-4A8.4 8.4 0 1 1 21 11.5Z" /></svg>
{/snippet}
{#snippet star()}
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z" /></svg>
{/snippet}

<Text type="tertiary">FloatButtonGroup 平铺一组，点击委托回传 value。</Text>
<div style="position:relative; height:200px">
  <FloatButtonGroup
    ariaLabel="快捷入口"
    onClick={(value) => (last = value)}
    style="position:absolute; inset-inline-end:16px; inset-block-end:16px"
    {items}
  />
</div>
<Text type="tertiary">最近点击：{last || '（无）'}</Text>
