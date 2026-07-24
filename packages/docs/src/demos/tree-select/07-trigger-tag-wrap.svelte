<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeDataEn as treeData } from './_data';
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  filterTreeNode
  searchPosition="trigger"
  triggerTagWrap
  defaultValue={['Beijing', 'Shanghai', 'Chengdu', 'Osaka']}
  placeholder="标签换行展示"
/>
