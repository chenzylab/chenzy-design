<script lang="ts">
  import { TreeSelect, Button, Space } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  const datasetA: TreeNode[] = [
    { label: '亚洲', value: 'Asia', key: '0', children: [{ label: '中国', value: 'China', key: '0-0' }] },
  ];
  const datasetB: TreeNode[] = [
    { label: '欧洲', value: 'Europe', key: '1', children: [{ label: '法国', value: 'France', key: '1-0' }] },
  ];

  let treeData = $state<TreeNode[]>(datasetA);
</script>

<Space vertical align="start">
  <Button onclick={() => (treeData = treeData === datasetA ? datasetB : datasetA)}>切换数据源</Button>
  <TreeSelect style="width: 300px" dropdownStyle="max-height: 400px; overflow: auto" {treeData} defaultExpandAll placeholder="动态更新数据" />
</Space>
