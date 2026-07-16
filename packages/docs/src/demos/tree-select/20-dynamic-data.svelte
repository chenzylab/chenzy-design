<script lang="ts">
  import { TreeSelect, Button } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const datasetA: TreeNode[] = [
    {
      key: 'asia',
      label: '亚洲',
      children: [
        { key: 'bj', label: '北京' },
        { key: 'sh', label: '上海' },
      ],
    },
  ];
  const datasetB: TreeNode[] = [
    {
      key: 'europe',
      label: '欧洲',
      children: [
        { key: 'paris', label: '巴黎' },
        { key: 'london', label: '伦敦' },
      ],
    },
    { key: 'na', label: '北美洲' },
  ];

  // 运行时替换 treeData：切换数据源，选择器随之更新。
  let useA = $state(true);
  let treeData = $derived(useA ? datasetA : datasetB);
  let value = $state<string | number | null>(null);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 300px">
  <Button onClick={() => { useA = !useA; value = null; }}>
    切换数据源（当前：{useA ? '亚洲' : '欧洲'}）
  </Button>
  <TreeSelect
    {treeData}
    {value}
    defaultExpandAll
    showClear
    placeholder="选择地区"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
</div>
