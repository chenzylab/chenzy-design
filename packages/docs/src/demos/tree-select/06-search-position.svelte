<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeDataEnNoChengdu as treeData } from './_data';
</script>

<TreeSelect
  searchPosition="trigger"
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  filterTreeNode
  placeholder="单选"
/>
<br />
<br />
<TreeSelect
  searchPosition="trigger"
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  filterTreeNode
  maxTagCount={2}
  placeholder="多选"
/>
