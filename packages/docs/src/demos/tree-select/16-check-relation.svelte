<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'cn',
      label: '中国',
      children: [
        { key: 'sh', label: '上海' },
        { key: 'hz', label: '杭州' },
        { key: 'gz', label: '广州' },
      ],
    },
  ];

  let related = $state<Array<string | number>>([]);
  let unrelated = $state<Array<string | number>>([]);
</script>

<div style="display: flex; gap: 24px; flex-wrap: wrap">
  <div style="width: 240px">
    <Text type="tertiary">related（默认）：父子级联</Text>
    <TreeSelect
      {treeData}
      value={related}
      multiple
      defaultExpandAll
      maxTagCount={3}
      placeholder="父子联动"
      onChange={(k) => (related = Array.isArray(k) ? k : k == null ? [] : [k])}
    />
  </div>
  <div style="width: 240px">
    <Text type="tertiary">unRelated：父子互不影响</Text>
    <TreeSelect
      {treeData}
      value={unrelated}
      multiple
      checkRelation="unRelated"
      defaultExpandAll
      maxTagCount={3}
      placeholder="互不影响"
      onChange={(k) => (unrelated = Array.isArray(k) ? k : k == null ? [] : [k])}
    />
  </div>
</div>
