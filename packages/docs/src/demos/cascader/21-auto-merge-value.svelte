<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '亚洲', value: 'asia',
      children: [
        { label: '中国', value: 'cn', children: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] },
        { label: '日本', value: 'jp', children: [{ label: '东京', value: 'tokyo' }, { label: '大阪', value: 'osaka' }] },
      ],
    },
  ];

  let merged = $state<(string | number)[][]>([]);
  let unmerged = $state<(string | number)[][]>([]);
</script>

<div style="display: flex; flex-direction: column; gap: 16px; width: 320px">
  <div>
    <Cascader
      {treeData}
      value={merged}
      multiple
      autoMergeValue
      placeholder="autoMergeValue（默认 true）"
      onChange={(p) => (merged = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
    />
    <Text type="tertiary">父级全选 → value 只保留父路径，不含后代（共 {merged.length} 条）</Text>
  </div>
  <div>
    <Cascader
      {treeData}
      value={unmerged}
      multiple
      autoMergeValue={false}
      placeholder="autoMergeValue=false"
      onChange={(p) => (unmerged = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
    />
    <Text type="tertiary">父级全选 → value 同时包含父与全部后代路径（共 {unmerged.length} 条）</Text>
  </div>
</div>
