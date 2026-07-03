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
  ];

  let inset = $state<string | number | null>('fe');
  let custom = $state<string | number | null>(null);

  function labelOf(key: string | number | null): string {
    if (key === null) return '（未选）';
    for (const n of treeData) {
      if (n.key === key) return n.label;
      for (const c of n.children ?? []) if (c.key === key) return c.label;
    }
    return String(key);
  }
</script>

<div style="display: flex; flex-direction: column; gap: 20px; width: 280px">
  <!-- insetLabel：触发器内嵌标签，渲染在回填值前，消费 tree-select label token -->
  <div>
    <TreeSelect
      {treeData}
      value={inset}
      clearable
      insetLabel="部门"
      treeDefaultExpandedKeys={['eng']}
      placeholder="请选择"
      onChange={(k) => (inset = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
    <Text type="tertiary">insetLabel 内嵌标签，当前：{labelOf(inset)}</Text>
  </div>

  <!-- triggerRender：完全自定义触发器，替换默认选择框（与 Cascader 一致） -->
  <div>
    <TreeSelect
      {treeData}
      value={custom}
      treeDefaultExpandedKeys={['eng']}
      onChange={(k) => (custom = Array.isArray(k) ? (k[0] ?? null) : k)}
    >
      {#snippet triggerRender({ value, isOpen })}
        <Button type="tertiary">
          {value === null || value === undefined ? '自定义触发器 ▾' : `${labelOf(value as string)} ${isOpen ? '▴' : '▾'}`}
        </Button>
      {/snippet}
    </TreeSelect>
    <Text type="tertiary">triggerRender 自定义触发器，当前：{labelOf(custom)}</Text>
  </div>
</div>
