<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<div>
  <Cascader
    style="width: 300px"
    {treeData}
    defaultValue={['zhejiang', 'ningbo', 'jiangbei']}
    filterTreeNode
    separator=" > "
  />
  <br />
  <br />
  <Cascader
    style="width: 300px"
    {treeData}
    defaultValue={['zhejiang', 'ningbo', 'jiangbei']}
    displayRender={(labels) => `所在地区：${labels.join(' / ')}`}
  />
</div>
