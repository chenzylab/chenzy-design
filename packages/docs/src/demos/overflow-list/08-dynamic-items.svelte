<script lang="ts">
  // 动态切换 items：collapse / scroll 模式下 items 引用变化后重新测量、重新划分可见/溢出
  //（对齐 Semi stories fix #1362：切换数据源后折叠结果正确更新，不残留旧项）。
  import { OverflowList, Tag, Button, Text } from '@chenzy-design/svelte';

  interface Item {
    key: string;
  }

  const itemsA: Item[] = [
    { key: 'alarm' },
    { key: 'bookmark' },
    { key: 'camera' },
    { key: 'duration' },
    { key: 'edit' },
    { key: 'folder' },
  ];
  const itemsB: Item[] = [
    { key: 'newAlarm' },
    { key: 'newBookmark' },
    { key: 'newCamera' },
    { key: 'newDuration' },
  ];

  let flag = $state(false);
  const items = $derived(flag ? itemsB : itemsA);
</script>

<Text type="tertiary">点击切换数据源，观察折叠结果随新 items 重新计算</Text>
<br />
<Button onclick={() => (flag = !flag)}>切换 items（当前 {flag ? 'B' : 'A'}）</Button>
<br />
<br />
<div style="width:320px">
  <OverflowList {items}>
    {#snippet visibleItemRenderer(item)}
      <Tag color="primary" style="margin-right:8px;flex:0 0 auto">{item.key}</Tag>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}<Tag style="flex:0 0 auto;font-variant-numeric:tabular-nums">+{rest.length}</Tag>{/if}
    {/snippet}
  </OverflowList>
</div>
