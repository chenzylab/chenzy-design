<script lang="ts">
  import { Tree, Button, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: 'asia',
      children: [
        { label: '中国', key: 'china', children: [{ label: '北京', key: 'beijing' }] },
        { label: '日本', key: 'japan' },
      ],
    },
    { label: '北美洲', key: 'na', children: [{ label: '美国', key: 'us' }] },
  ];

  // 受控展开集 + 受控选中值：组件不回写，由外部 state 驱动
  let expanded = $state<(string | number)[]>(['asia']);
  let value = $state<string | number | null>(null);
</script>

<div style="display:flex; flex-direction:column; gap:12px; width:260px">
  <div style="display:flex; gap:8px">
    <Button size="small" onclick={() => (expanded = ['asia', 'china', 'na'])}>展开全部</Button>
    <Button size="small" onclick={() => (expanded = [])}>收起全部</Button>
  </div>
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    {treeData}
    expandedKeys={expanded}
    value={value}
    onExpand={(keys) => (expanded = keys)}
    onChange={(v) => (value = v as string | number)}
    ariaLabel="受控树"
  />
  <Text type="tertiary" size="small">已选：{value ?? '（未选）'}</Text>
</div>
