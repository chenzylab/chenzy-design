<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<TreeSelect style="width: 300px" size="small" {treeData} placeholder="small" />
<br />
<br />
<TreeSelect style="width: 300px" {treeData} placeholder="default" />
<br />
<br />
<TreeSelect style="width: 300px" size="large" {treeData} placeholder="large" />
