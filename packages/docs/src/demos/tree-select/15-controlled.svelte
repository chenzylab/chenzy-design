<script lang="ts">
  import { TreeSelect, Button, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'eng',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        { key: 'be', label: '后端' },
      ],
    },
    { key: 'design', label: '设计' },
    { key: 'pm', label: '产品' },
  ];

  // value 完全受控：组件不持有内部状态，一切以外部 value 为准
  let value = $state<string | number | null>('fe');
</script>

<div style="width: 260px">
  <TreeSelect
    {treeData}
    {value}
    showClear
    defaultExpandAll
    placeholder="选择部门"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
  <div style="display: flex; gap: 8px; margin-top: 8px">
    <Button size="small" onclick={() => (value = 'be')}>设为「后端」</Button>
    <Button size="small" onclick={() => (value = 'design')}>设为「设计」</Button>
    <Button size="small" theme="borderless" onclick={() => (value = null)}>重置</Button>
  </div>
  <Text type="tertiary">value 由外部完全受控，配合 onChange 回写。当前：{value ?? '（未选）'}</Text>
</div>
