<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', children: [{ label: '海曙区', value: 'hs' }] },
      ],
    },
  ];

  let value = $state<(string | number)[][]>([]);
</script>

<div style="width: 320px">
  <!-- showNext="hover" 悬停展开子列 + clickToSelect 点击任意节点即选中 -->
  <Cascader
    {treeData}
    {value}
    multiple
    showNext="hover"
    clickToSelect
    clearable
    placeholder="悬停展开 + 点击即选"
    onChange={(p) => (value = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
  />
  <Text type="tertiary">已选 {value.length} 条</Text>
</div>
