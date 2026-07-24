<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<div>
  <Cascader style="width: 300px" {treeData} changeOnSelect placeholder="选择即改变" />
  <br />
  <br />
  <Cascader style="width: 300px" {treeData} changeOnSelect placeholder="可搜索的选择即改变" filterTreeNode />
</div>
