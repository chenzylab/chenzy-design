<script lang="ts">
  import { Cascader, Title } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<div>
  <Cascader style="width: 300px" {treeData} placeholder="默认对 label 值进行搜索" filterTreeNode />
  <br />
  <br />
  <Cascader
    style="width: 300px"
    {treeData}
    placeholder="对 value 值进行搜索"
    filterTreeNode
    treeNodeFilterProp="value"
  />
  <br />
  <br />
  <Title heading={6}>filterLeafOnly=false:</Title>
  <Cascader style="width: 300px" {treeData} placeholder="filterLeafOnly=false" filterTreeNode filterLeafOnly={false} />
</div>
