<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeDataEn as treeData } from './_data';
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  checkRelation="unRelated"
  maxTagCount={3}
  defaultExpandAll
  placeholder="checkRelation=unRelated"
/>
