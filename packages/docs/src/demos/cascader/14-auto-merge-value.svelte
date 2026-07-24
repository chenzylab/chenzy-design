<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<div>
  <Cascader
    style="width: 300px"
    {treeData}
    multiple
    defaultValue={['zhejiang', 'hangzhou', 'xihu']}
    placeholder="autoMergeValue=true（默认）"
  />
  <br />
  <br />
  <Cascader
    style="width: 300px"
    {treeData}
    multiple
    autoMergeValue={false}
    defaultValue={['zhejiang', 'hangzhou', 'xihu']}
    placeholder="autoMergeValue=false"
  />
</div>
