<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  type AnchorLinks = NonNullable<ComponentProps<typeof Anchor>['links']>;

  let active = $state('#affix-a');
  const links: AnchorLinks = [
    { key: '#affix-a', href: '#affix-a', title: '概览' },
    { key: '#affix-b', href: '#affix-b', title: '特性' },
    { key: '#affix-c', href: '#affix-c', title: '定价' },
    { key: '#affix-d', href: '#affix-d', title: '联系' },
  ];

  const sections = [
    { id: 'affix-a', label: '概览' },
    { id: 'affix-b', label: '特性' },
    { id: 'affix-c', label: '定价' },
    { id: 'affix-d', label: '联系' },
  ];

  let scrollBox = $state<HTMLElement | null>(null);
</script>

<Text type="tertiary">affix 让锚点在容器内吸顶停留，滚动内容时导航始终可见。</Text>
<div
  bind:this={scrollBox}
  style="height: 240px; overflow: auto; border: 1px solid var(--cd-color-border); border-radius: 8px; padding: 0 12px"
>
  <div style="display: flex; gap: 24px; align-items: flex-start">
    <div style="width: 140px">
      <Anchor
        {links}
        affix
        offsetTop={8}
        value={active}
        onChange={(k) => (active = k)}
        getContainer={() => scrollBox}
      />
    </div>
    <div style="flex: 1">
      {#each sections as s (s.id)}
        <div id={s.id} style="min-height: 160px; padding-block: 12px">
          <Text strong>{s.label}</Text>
          <Text type="tertiary">向下滚动，左侧锚点保持吸顶。</Text>
        </div>
      {/each}
    </div>
  </div>
</div>
