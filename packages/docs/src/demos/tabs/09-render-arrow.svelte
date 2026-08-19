<script lang="ts">
  import { Tabs, TabPane, Dropdown } from '@chenzy-design/svelte';
  import type { PlainTab } from '@chenzy-design/svelte';

  const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let active = $state<string | number>('Tab-0');

  const btnStyle =
    'width: 32px; height: 32px; margin: 0 8px; display: flex; justify-content: center; align-items: center; border-radius: 100%; border: none; background: var(--cd-color-fill-1); color: var(--cd-color-text-0); cursor: pointer;';
</script>

{#snippet menu(items: PlainTab[])}
  <Dropdown.Menu>
    {#each items as item (item.itemKey)}
      <Dropdown.Item onClick={() => (active = item.itemKey)}>{item.tab}</Dropdown.Item>
    {/each}
  </Dropdown.Menu>
{/snippet}

{#snippet arrow({
  type,
  items,
  onClick,
}: {
  type: 'start' | 'end';
  items: PlainTab[];
  onClick: () => void;
  defaultNode: unknown;
})}
  <!-- renderArrow 四参数（对齐 Semi）：type 前/后、items 该端溢出的标签、onClick 默认滚动行为、
       defaultNode 内置默认箭头（Snippet，可在自定义内容基础上叠加渲染）。这里用 Dropdown 展示
       溢出的 items，点击箭头本体走 onClick 滚动到相邻标签；items 为空（暂无溢出）时不渲染
       Dropdown，仅保留可点击箭头，避免打开空白菜单。 -->
  {#if items.length === 0}
    <button type="button" onclick={onClick} style={btnStyle}>
      {type === 'start' ? '←' : '→'}
    </button>
  {:else}
    <Dropdown trigger="hover" showTick position={type === 'start' ? 'bottomStart' : 'bottomEnd'}>
      <button type="button" onclick={onClick} style={btnStyle}>
        {type === 'start' ? '←' : '→'}
      </button>
      {#snippet render()}{@render menu(items)}{/snippet}
    </Dropdown>
  {/if}
{/snippet}

<div style="width: 50%; min-width: 320px;">
  <!-- renderArrow：自定义滚动折叠模式下的前/后切换箭头。 -->
  <Tabs type="card" collapsible renderArrow={arrow} activeKey={active} onChange={(k) => (active = k)}>
    {#each keys as i (i)}
      <TabPane tab={`Tab-${i}`} itemKey={`Tab-${i}`}>Content of card tab {i}</TabPane>
    {/each}
  </Tabs>
</div>
