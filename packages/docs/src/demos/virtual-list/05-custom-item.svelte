<script lang="ts">
  import { VirtualList, Tag, Text } from '@chenzy-design/svelte';

  type Row = { id: number; name: string; level: 'P0' | 'P1' | 'P2'; done: boolean };
  const levels = ['P0', 'P1', 'P2'] as const;
  const data: Row[] = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `任务 ${i + 1}`,
    level: levels[i % 3],
    done: i % 4 === 0,
  }));

  const colorOf = (lv: Row['level']): 'danger' | 'warning' | 'success' =>
    lv === 'P0' ? 'danger' : lv === 'P1' ? 'warning' : 'success';
</script>

<Text type="tertiary">自定义项渲染（renderItem 内组合 Tag + 富结构，固定行高 52px）</Text>
<div style="width:380px; border:1px solid var(--cd-color-border); border-radius:8px; margin-top:8px">
  <VirtualList {data} height={260} itemSize={52} getKey={(it) => (it as Row).id}>
    {#snippet renderItem(item)}
      {@const row = item as Row}
      <div
        style="display:flex; align-items:center; gap:10px; padding:0 14px; height:52px; border-bottom:1px solid var(--cd-color-border)"
      >
        <Tag color={colorOf(row.level)} size="small">{row.level}</Tag>
        <span style="flex:1; text-decoration:{row.done ? 'line-through' : 'none'}">
          {row.name}
        </span>
        <Text type={row.done ? 'success' : 'tertiary'} size="small">
          {row.done ? '已完成' : '进行中'}
        </Text>
      </div>
    {/snippet}
  </VirtualList>
</div>
