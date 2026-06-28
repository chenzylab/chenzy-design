<script lang="ts">
  import { OverflowList, Dropdown, Text } from '@chenzy-design/svelte';

  const items = ['设计', '研发', '测试', '产品', '运营', '市场', '财务', '法务', '行政', '采购'];
  let width = $state(300);
</script>

<Text type="tertiary">overflow snippet 自定义折叠节点：把 +N 渲染为可展开溢出项的下拉菜单</Text>
<input type="range" min="120" max="640" bind:value={width} style="width:320px; display:block; margin:8px 0" aria-label="容器宽度" />
<div style="width:{width}px; border:1px dashed var(--cd-color-border); padding:8px; border-radius:6px">
  <OverflowList {items} ariaLabel="部门标签">
    {#snippet item({ item })}
      <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
    {/snippet}
    {#snippet overflow({ overflowItems, overflowCount })}
      <Dropdown
        trigger="click"
        items={overflowItems.map((label, i) => ({ key: i, label }))}
      >
        {#snippet triggerContent()}
          <button
            type="button"
            style="flex:0 0 auto;padding:2px 10px;background:var(--cd-color-fill-2);border:none;border-radius:4px;white-space:nowrap;cursor:pointer"
          >
            +{overflowCount} 更多
          </button>
        {/snippet}
      </Dropdown>
    {/snippet}
  </OverflowList>
</div>
