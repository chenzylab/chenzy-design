<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  // 「宁波」严格禁用：改父级「浙江」的勾选不会带动它
  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', disabled: true, children: [{ label: '海曙区', value: 'hs' }] },
      ],
    },
  ];

  let value = $state<(string | number)[][]>([]);
</script>

<div style="width: 320px">
  <!-- disableStrictly：禁用节点不随父/子联动改变选中态 -->
  <Cascader
    {treeData}
    {value}
    multiple
    disableStrictly
    showClear
    placeholder="严格禁用（宁波不受父级联动）"
    onChange={(p) => (value = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
  />
  <Text type="tertiary">已选 {value.length} 条</Text>
</div>
