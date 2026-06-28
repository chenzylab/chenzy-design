<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  type AnchorLinks = NonNullable<ComponentProps<typeof Anchor>['links']>;

  let active = $state('#off-1');
  const links: AnchorLinks = [
    { key: '#off-1', href: '#off-1', title: '段落一' },
    { key: '#off-2', href: '#off-2', title: '段落二' },
    { key: '#off-3', href: '#off-3', title: '段落三' },
  ];

  const sections = [
    { id: 'off-1', label: '段落一' },
    { id: 'off-2', label: '段落二' },
    { id: 'off-3', label: '段落三' },
  ];

  let scrollBox = $state<HTMLElement | null>(null);
</script>

<Text type="tertiary">
  targetOffset=48 让点击跳转时为吸顶栏预留 48px 间距，避免目标贴到容器顶部被遮挡。
</Text>
<div style="display: flex; gap: 24px; align-items: flex-start">
  <div style="width: 140px">
    <Anchor
      {links}
      targetOffset={48}
      bounds={48}
      value={active}
      onChange={(k) => (active = k)}
      getContainer={() => scrollBox}
    />
  </div>
  <div
    bind:this={scrollBox}
    style="position: relative; height: 240px; overflow: auto; flex: 1; border: 1px solid var(--cd-color-border); border-radius: 8px"
  >
    <div
      style="position: sticky; inset-block-start: 0; height: 40px; display: flex; align-items: center; padding: 0 12px; background: var(--cd-color-bg-2); border-bottom: 1px solid var(--cd-color-border)"
    >
      <Text strong>吸顶工具栏</Text>
    </div>
    <div style="padding: 12px">
      {#each sections as s (s.id)}
        <div id={s.id} style="min-height: 160px">
          <Text strong>{s.label}</Text>
          <Text type="tertiary">点击锚点：目标顶部对齐到工具栏下方。</Text>
        </div>
      {/each}
    </div>
  </div>
</div>
