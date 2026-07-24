<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeDataEn as treeData } from './_data';
</script>

<div>
  <TreeSelect
    style="width: 300px"
    multiple
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    placeholder="请选择"
  />
  <br />
  <br />
  <TreeSelect
    style="width: 300px"
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    multiple
    leafOnly
    placeholder="只渲染叶子节点"
  />
</div>
