<script lang="ts">
  import { FloatButtonGroup, Text } from '@chenzy-design/svelte';
  import type { FloatButtonGroupItem } from '@chenzy-design/svelte';

  let last = $state('');

  const items: FloatButtonGroupItem[] = [
    { value: 'edit', content: '编辑', icon: edit },
    { value: 'search', content: '搜索', icon: search },
    { value: 'help', content: '帮助', icon: help },
  ];
</script>

{#snippet edit()}
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
{/snippet}
{#snippet search()}
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
{/snippet}
{#snippet help()}
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" /><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M9 9a3 3 0 1 1 4 2.8c-.8.4-1 .9-1 1.7M12 17h.01" /></svg>
{/snippet}

<Text type="tertiary">FloatButtonGroup 胶囊工具条：一个圆角条内横排「图标+文字」，点击委托回传 value。</Text>
<div style="position:relative; height:120px">
  <FloatButtonGroup
    ariaLabel="快捷入口"
    onClick={(value) => (last = value)}
    style="position:absolute; inset-inline-end:16px; inset-block-end:16px"
    {items}
  />
</div>
<Text type="tertiary">最近点击：{last || '（无）'}</Text>
