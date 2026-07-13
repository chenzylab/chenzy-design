<script lang="ts">
  // 自定义折叠节点：overflowRenderer 可返回任意内容——这里把 +N 渲染为可展开溢出项的下拉菜单
  //（补全场景，超出 Semi 文档的基础 Tag +N；对齐 Semi「overflowRenderer 返回自定义节点」的能力）。
  import { OverflowList, Tag, Dropdown, Slider, Text } from '@chenzy-design/svelte';

  interface Item {
    key: string;
  }

  const items: Item[] = [
    { key: 'alarm' },
    { key: 'bookmark' },
    { key: 'camera' },
    { key: 'duration' },
    { key: 'edit' },
    { key: 'folder' },
    { key: 'image' },
    { key: 'settings' },
  ];

  let width = $state(45);
</script>

<Text type="tertiary">overflowRenderer 返回下拉菜单：点击 +N 展开被折叠的项</Text>
<Slider value={width} step={1} min={0} max={100} onChange={(v) => (width = typeof v === 'number' ? v : v[0])} />
<br />
<div style="width:{width}%">
  <OverflowList {items}>
    {#snippet visibleItemRenderer(item)}
      <Tag color="primary" style="margin-right:8px;flex:0 0 auto">{item.key}</Tag>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}
        <Dropdown
          trigger="click"
          menu={rest.map((it) => ({ node: 'item' as const, name: it.key, key: it.key }))}
        >
          <Tag style="flex:0 0 auto;cursor:pointer;font-variant-numeric:tabular-nums">+{rest.length}</Tag>
        </Dropdown>
      {/if}
    {/snippet}
  </OverflowList>
</div>
