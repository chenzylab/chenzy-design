<script lang="ts">
  import { OverflowList, Text, Button } from '@chenzy-design/svelte';

  const overflowTags = ['设计', '研发', '测试', '产品', '运营', '市场', '财务', '法务'];
  const longTags = ['标签一', '标签二', '标签三', '标签四', '标签五', '标签六', '标签七', '标签八', '标签九', '标签十', '标签十一', '标签十二'];

  let overflowWidth = $state(400);
  let overflowHidden = $state(0);

  let overflowForceRef = $state<{ forceMeasure: () => void } | undefined>();
  let overflowScrollRef = $state<{ scrollTo: (i: number, o?: { align?: 'start' | 'center' | 'end' }) => void } | undefined>();
  let overflowHiddenBox = $state(false);
</script>

<Text type="tertiary">拖动滑块改变容器宽度，溢出标签自动收纳进 +N</Text>
<input type="range" min="120" max="640" bind:value={overflowWidth} style="width: 320px; display: block" aria-label="容器宽度" />
<div style="width: {overflowWidth}px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
  <OverflowList
    items={overflowTags}
    ariaLabel="部门标签"
    onOverflowChange={(info) => (overflowHidden = info.overflowCount)}
  >
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
  </OverflowList>
</div>
<Text type="tertiary">容器宽 {overflowWidth}px，已折叠 {overflowHidden} 项</Text>

<div style="margin-top:12px"><Text type="tertiary">collapseFrom="start"（从头部折叠，尾部最新项保留）</Text></div>
<div style="width: {overflowWidth}px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
  <OverflowList items={overflowTags} collapseFrom="start" ariaLabel="部门标签（头部折叠）">
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
  </OverflowList>
</div>

<div style="margin-top:12px"><Text type="tertiary">mode="scroll"（不折叠，横向滚动查看）</Text></div>
<div style="width: {overflowWidth}px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
  <OverflowList items={overflowTags} mode="scroll" ariaLabel="部门标签（滚动）">
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
  </OverflowList>
</div>

<div style="margin-top:12px"><Text type="tertiary">direction="vertical"（纵向折叠，容器高 120px）</Text></div>
<div style="height:120px; width:160px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
  <OverflowList items={overflowTags} direction="vertical" ariaLabel="部门标签（纵向）">
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
  </OverflowList>
</div>

<div style="margin-top:12px"><Text type="tertiary">forceMeasure()（命令式：父级 display 切回后手动重测）</Text></div>
<div style="display:flex;gap:8px;margin-bottom:8px">
  <Button onclick={() => (overflowHiddenBox = !overflowHiddenBox)}>{overflowHiddenBox ? '显示容器' : '隐藏容器'}</Button>
  <Button onclick={() => overflowForceRef?.forceMeasure()}>forceMeasure()</Button>
</div>
<div style="display:{overflowHiddenBox ? 'none' : 'block'}; width: 360px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px" data-testid="overflow-force-box">
  <OverflowList bind:this={overflowForceRef} items={overflowTags} ariaLabel="部门标签（forceMeasure）">
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
  </OverflowList>
</div>

<div style="margin-top:12px"><Text type="tertiary">scrollTo(index)（scroll 模式命令式滚动到指定项）</Text></div>
<div style="display:flex;gap:8px;margin-bottom:8px">
  <Button onclick={() => overflowScrollRef?.scrollTo(0)}>滚到首项</Button>
  <Button onclick={() => overflowScrollRef?.scrollTo(6, { align: 'center' })}>居中第 7 项</Button>
  <Button onclick={() => overflowScrollRef?.scrollTo(11, { align: 'end' })}>滚到末项</Button>
</div>
<div style="width: 300px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px" data-testid="overflow-scroll-box">
  <OverflowList bind:this={overflowScrollRef} items={longTags} mode="scroll" ariaLabel="标签（scrollTo）">
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
  </OverflowList>
</div>
