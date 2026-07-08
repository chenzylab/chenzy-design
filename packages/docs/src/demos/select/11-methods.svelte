<script lang="ts">
  import { Select, Button, Space, Text } from '@chenzy-design/svelte';

  let sel = $state<ReturnType<typeof Select> | undefined>(undefined);
  let val = $state<string[]>([]);
  const options = [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
    { label: '选项 C', value: 'c' },
    { label: '选项 D', value: 'd' },
  ];
</script>

<Space vertical align="start">
  <!-- 命令式 Methods：bind:this 拿实例调用 -->
  <Space>
    <Button size="small" onclick={() => sel?.open()}>展开</Button>
    <Button size="small" onclick={() => sel?.close()}>收起</Button>
    <Button size="small" onclick={() => sel?.focus()}>聚焦</Button>
    <Button size="small" type="primary" onclick={() => sel?.selectAll()}>全选</Button>
    <Button size="small" type="tertiary" onclick={() => sel?.deselectAll()}>清空</Button>
  </Space>
  <div style="width:320px">
    <Select
      bind:this={sel}
      {options}
      multiple
      value={val}
      onChange={(v) => (val = v as string[])}
      placeholder="用上方按钮命令式操作"
    />
  </div>
  <Text type="tertiary">已选 {val.length} 项</Text>
</Space>
