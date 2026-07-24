<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import type { TreeKey } from '@chenzy-design/svelte';
  import { treeDataEn as treeData } from './_data';

  let expandedKeys = $state<TreeKey[]>([]);
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  filterTreeNode
  {expandedKeys}
  onExpand={(keys) => (expandedKeys = keys)}
  onSearch={(_input, filteredExpandedKeys) => {
    if (filteredExpandedKeys) expandedKeys = filteredExpandedKeys;
  }}
  placeholder="展开受控 + 搜索展开"
/>
