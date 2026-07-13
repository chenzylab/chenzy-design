<script lang="ts">
  // 虚拟化无限长列表：组合 VirtualList 只渲染视口内行，支撑万级数据（等价 Semi 集成
  // react-virtualized 的场景；chenzy 用自带的 VirtualList 组件渲染 List.Item 实现同等能力）。
  import { ListItem, VirtualList, Avatar } from '@chenzy-design/svelte';

  const data = Array.from({ length: 10000 }, (_, i) => ({
    key: i,
    title: `Item ${i}`,
    color: 'grey' as const,
  }));
</script>

<div style="border:1px solid var(--cd-color-border);">
  <VirtualList {data} itemSize={56} height={360} getKey={(d) => d.key}>
    {#snippet renderItem(item)}
      <ListItem
        style="height:56px; box-sizing:border-box; border-bottom:1px solid var(--cd-color-border);"
      >
        {#snippet header()}
          <Avatar color={item.color} size="small">{item.key % 100}</Avatar>
        {/snippet}
        {#snippet main()}
          <span style="color:var(--cd-color-text-0);">{item.title}</span>
        {/snippet}
      </ListItem>
    {/snippet}
  </VirtualList>
</div>
