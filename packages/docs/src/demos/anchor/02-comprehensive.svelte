<!-- 对齐 Semi「综合使用」：getContainer + targetOffset + offsetTop + 嵌套。 -->
<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  const sections = [
    { id: 'c-basic', label: '综合使用' },
    { id: 'c-size', label: '尺寸' },
    { id: 'c-rail', label: '滑轨主题' },
    { id: 'c-dynamic', label: '动态展示' },
    { id: 'c-api', label: 'API 参考' },
    { id: 'c-anchor', label: 'Anchor' },
    { id: 'c-link', label: 'Anchor.Link' },
  ];
  let scrollBox = $state<HTMLElement | null>(null);
</script>

<div style="display: flex; gap: 24px; align-items: flex-start">
  <Anchor
    maxWidth={180}
    offsetTop={12}
    targetOffset={12}
    getContainer={() => scrollBox}
  >
    <Anchor.Link href="#c-basic" title="综合使用" />
    <Anchor.Link href="#c-size" title="尺寸" />
    <Anchor.Link href="#c-rail" title="滑轨主题" />
    <Anchor.Link href="#c-dynamic" title="动态展示" />
    <Anchor.Link href="#c-api" title="API 参考">
      <Anchor.Link href="#c-anchor" title="Anchor" />
      <Anchor.Link href="#c-link" title="Anchor.Link" />
    </Anchor.Link>
  </Anchor>
  <div
    bind:this={scrollBox}
    style="height: 240px; overflow: auto; flex: 1; border: 1px solid var(--cd-color-border); border-radius: 8px; padding: 12px"
  >
    {#each sections as s (s.id)}
      <div id={s.id} style="min-height: 120px">
        <Text strong>{s.label}</Text>
      </div>
    {/each}
  </div>
</div>
