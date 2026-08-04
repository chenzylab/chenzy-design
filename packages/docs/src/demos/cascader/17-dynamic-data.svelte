<script lang="ts">
  import { Cascader, Button, Space } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  const dataV1: TreeNode[] = [
    {
      label: '浙江省',
      value: 'zhejiang',
      children: [{ label: '杭州市', value: 'hangzhou', children: [{ label: '西湖区', value: 'xihu' }] }],
    },
  ];
  const dataV2: TreeNode[] = [
    {
      label: '江苏省',
      value: 'jiangsu',
      children: [{ label: '南京市', value: 'nanjing', children: [{ label: '玄武区', value: 'xuanwu' }] }],
    },
  ];

  let isV1 = $state(true);
  const treeData = $derived(isV1 ? dataV1 : dataV2);
</script>

<Space vertical align="start">
  <Button onclick={() => (isV1 = !isV1)}>切换数据源</Button>
  <Cascader style="width: 300px" {treeData} placeholder="动态更新数据" />
</Space>
