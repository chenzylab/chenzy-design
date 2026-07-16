<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', children: [{ label: '海曙区', value: 'hs' }] },
      ],
    },
    {
      label: '江苏', value: 'js',
      children: [{ label: '南京', value: 'nj', children: [{ label: '玄武区', value: 'xw' }] }],
    },
  ];
</script>

<div style="width: 240px">
  <Cascader
    {treeData}
    defaultValue={['zj', 'hz', 'xh']}
    changeOnSelect
    showClear
    placeholder="选择地区"
  />
</div>
