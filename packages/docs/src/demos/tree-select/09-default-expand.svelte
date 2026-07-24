<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  defaultExpandAll
  placeholder="默认展开所有节点"
/>
