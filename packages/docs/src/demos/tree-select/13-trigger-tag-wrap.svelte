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
            { key: 'su', label: '苏州' },
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

  let value = $state<Array<string | number>>(['sh', 'hz', 'nj', 'su', 'gz']);
</script>

<div style="width: 260px">
  <!-- triggerTagWrap：trigger 内多选标签超出宽度时自动换行，而非折叠 -->
  <TreeSelect
    {treeData}
    {value}
    multiple
    showClear
    filterTreeNode
    searchPosition="trigger"
    triggerTagWrap
    defaultExpandAll
    placeholder="选择城市"
    onChange={(k) => (value = Array.isArray(k) ? k : k == null ? [] : [k])}
  />
  <Text type="tertiary">triggerTagWrap 让多选标签在 trigger 内自动换行。已选 {value.length} 项</Text>
</div>
