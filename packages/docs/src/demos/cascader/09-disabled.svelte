<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<div>
  <Cascader style="width: 300px" {treeData} placeholder="请选择所在地区" disabled />
  <br />
  <br />
  <Cascader
    style="width: 300px"
    {treeData}
    placeholder="请选择所在地区"
    defaultValue={['zhejiang', 'hangzhou', 'xihu']}
    filterTreeNode
    disabled
  />
</div>
