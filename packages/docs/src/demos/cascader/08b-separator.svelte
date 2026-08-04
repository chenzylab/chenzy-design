<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<Cascader
  style="width: 300px"
  {treeData}
  defaultValue={['zhejiang', 'ningbo', 'jiangbei']}
  filterTreeNode
  separator=" > "
/>
