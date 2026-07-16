<!-- 对齐 Semi「动态展示」autoCollapse=true：滚动时仅展开激活路径的子级。 -->
<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  const sections = [
    { id: 'co-dynamic', label: '1. 动态展示' },
    { id: 'co-comp', label: '1.1 组件' },
    { id: 'co-avatar', label: '1.1.1 Avatar' },
    { id: 'co-button', label: '1.1.2 Button' },
    { id: 'co-icon', label: '1.1.3 Icon' },
    { id: 'co-material', label: '1.2 物料' },
    { id: 'co-theme', label: '1.3 主题商店' },
    { id: 'co-lang', label: '2. 设计语言' },
  ];
  let scrollBox = $state<HTMLElement | null>(null);
</script>

<div style="display: flex; gap: 24px; align-items: flex-start">
  <Anchor autoCollapse maxWidth={180} getContainer={() => scrollBox}>
    <Anchor.Link href="#co-dynamic" title="1. 动态展示">
      <Anchor.Link href="#co-comp" title="1.1 组件">
        <Anchor.Link href="#co-avatar" title="1.1.1 Avatar" />
        <Anchor.Link href="#co-button" title="1.1.2 Button" />
        <Anchor.Link href="#co-icon" title="1.1.3 Icon" />
      </Anchor.Link>
      <Anchor.Link href="#co-material" title="1.2 物料" />
      <Anchor.Link href="#co-theme" title="1.3 主题商店" />
    </Anchor.Link>
    <Anchor.Link href="#co-lang" title="2. 设计语言" />
  </Anchor>
  <div
    bind:this={scrollBox}
    style="height: 240px; overflow: auto; flex: 1; border: 1px solid var(--cd-color-border); border-radius: 8px; padding: 12px"
  >
    {#each sections as s (s.id)}
      <div id={s.id} style="min-height: 110px">
        <Text strong>{s.label}</Text>
      </div>
    {/each}
  </div>
</div>
