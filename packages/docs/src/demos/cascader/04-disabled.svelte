<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '一线城市', value: 't1',
      children: [
        { label: '北京', value: 'bj', children: [{ label: '朝阳区', value: 'cy' }, { label: '海淀区', value: 'hd' }] },
        { label: '上海', value: 'sh', disabled: true, children: [{ label: '浦东新区', value: 'pd' }] },
      ],
    },
    {
      label: '新一线城市', value: 't2', disabled: true,
      children: [{ label: '成都', value: 'cd', children: [{ label: '武侯区', value: 'wh' }] }],
    },
  ];
</script>

<div style="width: 240px">
  <Cascader {treeData} showClear placeholder="部分选项禁用" />
</div>
