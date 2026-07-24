<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<Cascader
  style="width: 300px"
  {treeData}
  placeholder="可搜索的多选"
  multiple
  filterTreeNode
  maxTagCount={2}
/>
