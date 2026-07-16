<!-- 对齐 Semi「基本示例」：Link 创建锚点，点击跳转到指定位置。 -->
<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  const sections = [
    { id: 'b-basic', label: '基本示例' },
    { id: 'b-comp', label: '组件' },
    { id: 'b-lang', label: '设计语言' },
    { id: 'b-material', label: '物料平台' },
    { id: 'b-theme', label: '主题商店' },
  ];
  let scrollBox = $state<HTMLElement | null>(null);
</script>

<div style="display: flex; gap: 24px; align-items: flex-start">
  <Anchor maxWidth={160} getContainer={() => scrollBox}>
    <Anchor.Link href="#b-basic" title="基本示例" />
    <Anchor.Link href="#b-comp" title="组件" />
    <Anchor.Link href="#b-lang" title="设计语言" />
    <Anchor.Link href="#b-material" title="物料平台" />
    <Anchor.Link href="#b-theme" title="主题商店" />
  </Anchor>
  <div
    bind:this={scrollBox}
    style="height: 220px; overflow: auto; flex: 1; border: 1px solid var(--cd-color-border); border-radius: 8px; padding: 12px"
  >
    {#each sections as s (s.id)}
      <div id={s.id} style="min-height: 130px">
        <Text strong>{s.label}</Text>
      </div>
    {/each}
  </div>
</div>
