<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  type AnchorLinks = NonNullable<ComponentProps<typeof Anchor>['links']>;

  let active = $state('#guide');
  const links: AnchorLinks = [
    {
      key: '#guide',
      href: '#guide',
      title: '指南',
      children: [
        { key: '#guide-install', href: '#guide-install', title: '安装' },
        { key: '#guide-usage', href: '#guide-usage', title: '使用' },
      ],
    },
    {
      key: '#api',
      href: '#api',
      title: 'API',
      children: [{ key: '#api-props', href: '#api-props', title: 'Props' }],
    },
    { key: '#faq', href: '#faq', title: '常见问题' },
  ];

  const sections = [
    { id: 'guide', label: '指南' },
    { id: 'guide-install', label: '安装' },
    { id: 'guide-usage', label: '使用' },
    { id: 'api', label: 'API' },
    { id: 'api-props', label: 'Props' },
    { id: 'faq', label: '常见问题' },
  ];

  let scrollBox = $state<HTMLElement | null>(null);
</script>

<div style="display: flex; gap: 24px; align-items: flex-start">
  <div style="width: 160px">
    <Anchor
      {links}
      value={active}
      onChange={(link) => (active = link?.key ?? '')}
      getContainer={() => scrollBox}
    />
  </div>
  <div
    bind:this={scrollBox}
    style="height: 220px; overflow: auto; flex: 1; border: 1px solid var(--cd-color-border); border-radius: 8px; padding: 12px"
  >
    {#each sections as s (s.id)}
      <div id={s.id} style="min-height: 140px">
        <Text strong>{s.label}</Text>
        <Text type="tertiary">滚动以观察多级锚点的高亮联动。</Text>
      </div>
    {/each}
  </div>
</div>
