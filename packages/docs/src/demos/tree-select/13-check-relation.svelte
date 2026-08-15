<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<TreeSelect
  multiple
  defaultValue="Asia"
  checkRelation="unRelated"
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
/>
