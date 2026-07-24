<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<Cascader
  style="width: 300px"
  {treeData}
  multiple
  checkRelation="unRelated"
  placeholder="checkRelation=unRelated：节点选中互不影响"
/>
