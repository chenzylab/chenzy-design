<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  // autoCollapse：滚动到哪个分支，才展开它的子级；其它分支子级折叠。
  const links = [
    {
      key: '#ac-1',
      href: '#ac-1',
      title: '第一章',
      children: [
        { key: '#ac-1-1', href: '#ac-1-1', title: '1.1 小节' },
        { key: '#ac-1-2', href: '#ac-1-2', title: '1.2 小节' },
      ],
    },
    {
      key: '#ac-2',
      href: '#ac-2',
      title: '第二章',
      children: [
        { key: '#ac-2-1', href: '#ac-2-1', title: '2.1 小节' },
        { key: '#ac-2-2', href: '#ac-2-2', title: '2.2 小节' },
      ],
    },
  ];

  const sections = [
    { id: 'ac-1', label: '第一章' },
    { id: 'ac-1-1', label: '1.1 小节' },
    { id: 'ac-1-2', label: '1.2 小节' },
    { id: 'ac-2', label: '第二章' },
    { id: 'ac-2-1', label: '2.1 小节' },
    { id: 'ac-2-2', label: '2.2 小节' },
  ];

  let scrollBox = $state<HTMLElement | null>(null);
</script>

<Text type="tertiary">autoCollapse：滚动到某章才展开其小节，其它章的小节折叠。</Text>
<div style="display: flex; gap: 24px; align-items: flex-start; margin-block-start: 8px">
  <div style="width: 160px">
    <Anchor {links} autoCollapse getContainer={() => scrollBox} />
  </div>
  <div
    bind:this={scrollBox}
    style="height: 220px; overflow: auto; flex: 1; border: 1px solid var(--cd-color-border); border-radius: 8px; padding: 12px"
  >
    {#each sections as s (s.id)}
      <div id={s.id} style="min-height: 120px">
        <Text strong>{s.label}</Text>
      </div>
    {/each}
  </div>
</div>
