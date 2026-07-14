<script lang="ts">
  // onOverflow 回调：collapse 模式下溢出项集合变化时触发（去重），可用于同步外部状态
  //（对齐 Semi stories onOverflow / FixFirstLongTag 场景）。
  import { OverflowList, Tag, Slider, Text } from '@chenzy-design/svelte';

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
  ];

  let width = $state(50);
  let overflowKeys = $state<string[]>([]);
</script>

<Text type="tertiary">onOverflow 上报当前被折叠的项；缩小容器观察折叠项列表变化</Text>
<Slider value={width} step={1} min={0} max={100} onChange={(v) => (width = typeof v === 'number' ? v : v[0])} />
<br />
<div style="width:{width}%">
  <OverflowList {items} onOverflow={(rest) => (overflowKeys = rest.map((it) => it.key))}>
    {#snippet visibleItemRenderer(item)}
      <Tag color="blue" style="margin-right:8px;flex:0 0 auto">{item.key}</Tag>
    {/snippet}
    {#snippet overflowRenderer(rest)}
      {#if rest.length}<Tag style="flex:0 0 auto;font-variant-numeric:tabular-nums">+{rest.length}</Tag>{/if}
    {/snippet}
  </OverflowList>
</div>
<Text type="tertiary">已折叠：{overflowKeys.length ? overflowKeys.join('、') : '（无）'}</Text>
