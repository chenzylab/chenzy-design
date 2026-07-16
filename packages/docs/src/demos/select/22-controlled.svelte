<script lang="ts">
  import { Select, Button, Space, Text } from '@chenzy-design/svelte';

  const optionList = [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
    { label: '选项 C', value: 'c' },
  ];
  // 受控：value 由外部 state 驱动，onChange 回填（受控组件不 bind:）
  let val = $state<string | undefined>('a');
</script>

<Space vertical align="start">
  <Space>
    <Button size="small" onclick={() => (val = 'a')}>设为 A</Button>
    <Button size="small" onclick={() => (val = 'b')}>设为 B</Button>
    <Button size="small" type="tertiary" onclick={() => (val = undefined)}>清空</Button>
  </Space>
  <div style="width:240px">
    <Select {optionList} value={val} onChange={(v) => (val = v as string)} placeholder="受控选择" />
  </div>
  <Text type="tertiary">外部 value：{val ?? '（空）'}</Text>
</Space>
