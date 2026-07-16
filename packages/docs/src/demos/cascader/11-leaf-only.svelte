<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', children: [{ label: '海曙区', value: 'hs' }, { label: '江北区', value: 'jb' }] },
      ],
    },
  ];

  let value = $state<(string | number)[][]>([]);
</script>

<div style="width: 320px">
  <!-- leafOnly：完全勾选的父级不折叠为父路径，value 仅含叶子 -->
  <Cascader
    {treeData}
    {value}
    multiple
    leafOnly
    showClear
    placeholder="value 仅含叶子节点（leafOnly）"
    onChange={(p) => (value = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
  />
  <Text type="tertiary">已选叶子 {value.length} 个</Text>
</div>
