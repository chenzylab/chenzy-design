<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  size="small"
  placeholder="small"
/>
<br />
<br />
<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  size="default"
  placeholder="default"
/>
<br />
<br />
<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  size="large"
  placeholder="large"
/>
