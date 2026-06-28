<script lang="ts">
  import { OverflowList, Text } from '@chenzy-design/svelte';

  const items = ['设计', '研发', '测试', '产品', '运营', '市场', '财务', '法务'];
  let width = $state(400);
  let hiddenCount = $state(0);
</script>

<Text type="tertiary">拖动滑块改变容器宽度，溢出标签自动折叠进 +N</Text>
<input type="range" min="120" max="640" bind:value={width} style="width:320px; display:block; margin-bottom:8px" aria-label="容器宽度" />
<div style="width:{width}px; border:1px dashed var(--cd-color-border); padding:8px; border-radius:6px">
  <OverflowList {items} ariaLabel="部门标签" onOverflowChange={(info) => (hiddenCount = info.overflowCount)}>
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
  </OverflowList>
</div>
<Text type="tertiary">容器宽 {width}px，已折叠 {hiddenCount} 项</Text>
