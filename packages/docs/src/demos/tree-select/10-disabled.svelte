<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<div>
  <TreeSelect
    style="width: 300px"
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    disabled
    placeholder="禁用下拉菜单"
  />
  <br />
  <br />
  <TreeSelect
    style="width: 300px"
    defaultValue="Shanghai"
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    disabled
  />
  <br />
  <br />
  <TreeSelect
    style="width: 300px"
    defaultValue={['Shanghai', 'North America']}
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    multiple
    disabled
  />
</div>
