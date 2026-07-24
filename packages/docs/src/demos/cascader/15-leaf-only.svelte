<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<Cascader style="width: 300px" {treeData} multiple leafOnly placeholder="leafOnly：value 仅含叶子节点" />
