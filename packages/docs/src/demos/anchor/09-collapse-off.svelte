<!-- 对齐 Semi「动态展示」autoCollapse=false（默认）：始终全展开。 -->
<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  const sections = [
    { id: 'cf-dynamic', label: '1. 动态展示' },
    { id: 'cf-comp', label: '1.1 组件' },
    { id: 'cf-avatar', label: '1.1.1 Avatar' },
    { id: 'cf-button', label: '1.1.2 Button' },
    { id: 'cf-icon', label: '1.1.3 Icon' },
    { id: 'cf-material', label: '1.2 物料' },
    { id: 'cf-theme', label: '1.3 主题商店' },
    { id: 'cf-lang', label: '2. 设计语言' },
  ];
  let scrollBox = $state<HTMLElement | null>(null);
</script>

<div style="display: flex; gap: 24px; align-items: flex-start">
  <Anchor autoCollapse={false} maxWidth={180} getContainer={() => scrollBox}>
    <Anchor.Link href="#cf-dynamic" title="1. 动态展示">
      <Anchor.Link href="#cf-comp" title="1.1 组件">
        <Anchor.Link href="#cf-avatar" title="1.1.1 Avatar" />
        <Anchor.Link href="#cf-button" title="1.1.2 Button" />
        <Anchor.Link href="#cf-icon" title="1.1.3 Icon" />
      </Anchor.Link>
      <Anchor.Link href="#cf-material" title="1.2 物料" />
      <Anchor.Link href="#cf-theme" title="1.3 主题商店" />
    </Anchor.Link>
    <Anchor.Link href="#cf-lang" title="2. 设计语言" />
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
