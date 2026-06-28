<script lang="ts">
  import { OverflowList, Text } from '@chenzy-design/svelte';

  const items = ['设计', '研发', '测试', '产品', '运营', '市场', '财务', '法务'];
  let width = $state(320);
  let collapseFrom = $state<'end' | 'start'>('end');
</script>

<Text type="tertiary">collapseFrom 控制折叠方向：end 折叠尾部、start 折叠头部（+N 出现在头部）</Text>
<div style="display:flex;gap:8px;margin:8px 0" role="group" aria-label="折叠方向">
  <label><input type="radio" value="end" bind:group={collapseFrom} /> 从尾部折叠（end）</label>
  <label><input type="radio" value="start" bind:group={collapseFrom} /> 从头部折叠（start）</label>
</div>
<input type="range" min="120" max="640" bind:value={width} style="width:320px; display:block; margin-bottom:8px" aria-label="容器宽度" />
<div style="width:{width}px; border:1px dashed var(--cd-color-border); padding:8px; border-radius:6px">
  <OverflowList {items} {collapseFrom} ariaLabel="部门标签">
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
  </OverflowList>
</div>
<Text type="tertiary">容器宽 {width}px，折叠方向 {collapseFrom}</Text>
