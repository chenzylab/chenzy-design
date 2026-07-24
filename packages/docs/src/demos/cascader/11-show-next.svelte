<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<div>
  <Cascader style="width: 300px" {treeData} showNext="hover" placeholder="hover 展开子菜单" />
  <br />
  <br />
  <Cascader
    style="width: 300px"
    {treeData}
    multiple
    showNext="hover"
    clickToSelect
    placeholder="hover 展开，点击任意节点选中"
  />
</div>
