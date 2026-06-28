<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'cn',
      label: '中国',
      children: [
        {
          key: 'east',
          label: '华东',
          children: [
            { key: 'sh', label: '上海' },
            { key: 'hz', label: '杭州' },
            { key: 'nj', label: '南京' },
          ],
        },
        {
          key: 'south',
          label: '华南',
          children: [
            { key: 'gz', label: '广州' },
            { key: 'sz', label: '深圳' },
          ],
        },
      ],
    },
  ];

  let value = $state<Array<string | number>>(['sh', 'hz']);
</script>

<div style="width: 300px">
  <TreeSelect
    {treeData}
    {value}
    multiple
    clearable
    defaultExpandAll
    maxTagCount={2}
    placeholder="选择城市"
    onChange={(k) => (value = Array.isArray(k) ? k : k == null ? [] : [k])}
  />
  <Text type="tertiary">已选 {value.length} 项：{value.join('、') || '（未选）'}</Text>
</div>
