<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<TreeSelect style="width: 300px" {treeData} disabled defaultValue="Shanghai" placeholder="请选择" />
