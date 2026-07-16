<script lang="ts">
  import { Cascader, Button, Text } from '@chenzy-design/svelte';
  import type { CascaderNode } from '@chenzy-design/svelte';

  const dataV1: CascaderNode[] = [
    { label: '浙江', value: 'zj', children: [{ label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] }] },
  ];
  const dataV2: CascaderNode[] = [
    { label: '浙江', value: 'zj', children: [{ label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] }] },
    { label: '江苏', value: 'js', children: [{ label: '南京', value: 'nj', children: [{ label: '玄武区', value: 'xw' }] }] },
  ];

  let treeData = $state<CascaderNode[]>(dataV1);
  let value = $state<(string | number)[]>([]);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 260px">
  <Button onClick={() => (treeData = treeData === dataV1 ? dataV2 : dataV1)}>
    切换数据源（当前 {treeData === dataV1 ? 'V1' : 'V2'}）
  </Button>
  <Cascader
    {treeData}
    {value}
    showClear
    placeholder="运行时更新 treeData"
    onChange={(p) => (value = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
  />
  <Text type="tertiary">已选：{value.join(' / ') || '（未选）'}</Text>
</div>
