<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '水果', value: 'fruit',
      children: [
        { label: '热带', value: 'tropical', children: [{ label: '芒果', value: 'mango' }, { label: '菠萝', value: 'pineapple' }] },
        { label: '浆果', value: 'berry', children: [{ label: '草莓', value: 'strawberry' }, { label: '蓝莓', value: 'blueberry' }] },
      ],
    },
  ];

  let value = $state<(string | number)[][]>([]);
</script>

<div style="width: 320px">
  <!-- checkRelation="unRelated"：父子勾选互不影响，可任意层级独立勾选 -->
  <Cascader
    {treeData}
    {value}
    multiple
    checkRelation="unRelated"
    showClear
    placeholder="节点选中互不联动（unRelated）"
    onChange={(p) => (value = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
  />
  <Text type="tertiary">已选 {value.length} 条</Text>
</div>
