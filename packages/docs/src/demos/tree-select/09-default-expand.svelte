<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeData, type TreeNode } from './_data';

  let data = $state<TreeNode[]>([]);

  setTimeout(() => (data = treeData), 500);
</script>

<TreeSelect
  style="width: 300px; margin-bottom: 20px"
  expandAll
  treeData={data}
  placeholder="expandAll"
/>
<TreeSelect
  style="width: 300px"
  defaultExpandAll
  treeData={data}
  placeholder="defaultExpandAll"
/>
