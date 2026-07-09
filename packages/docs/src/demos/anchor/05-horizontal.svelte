<script lang="ts">
  import { Anchor, Text, type AnchorLink } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  type AnchorLinks = NonNullable<ComponentProps<typeof Anchor>['links']>;

  let active = $state('#h-1');
  let log = $state('#h-1');
  const links: AnchorLinks = [
    { key: '#h-1', href: '#h-1', title: '介绍' },
    { key: '#h-2', href: '#h-2', title: '安装' },
    { key: '#h-3', href: '#h-3', title: '示例' },
    { key: '#h-4', href: '#h-4', title: '更新日志' },
  ];

  const sections = [
    { id: 'h-1', label: '介绍' },
    { id: 'h-2', label: '安装' },
    { id: 'h-3', label: '示例' },
    { id: 'h-4', label: '更新日志' },
  ];

  let scrollBox = $state<HTMLElement | null>(null);

  function handleChange(link: AnchorLink | null) {
    const key = link?.key ?? '';
    active = key;
    log = key;
  }
</script>

<Text type="tertiary">
  horizontal 横向布局，ink 走底部下划线；onChange 监听激活变更，当前：{log}
</Text>
<Anchor
  {links}
  horizontal
  value={active}
  onChange={handleChange}
  getContainer={() => scrollBox}
/>
<div
  bind:this={scrollBox}
  style="height: 220px; overflow: auto; border: 1px solid var(--cd-color-border); border-radius: 8px; padding: 12px; margin-block-start: 8px"
>
  {#each sections as s (s.id)}
    <div id={s.id} style="min-height: 150px">
      <Text strong>{s.label}</Text>
      <Text type="tertiary">滚动观察底部下划线随激活段落移动。</Text>
    </div>
  {/each}
</div>
