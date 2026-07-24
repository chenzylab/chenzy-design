<script lang="ts">
  import { TreeSelect, Title } from '@chenzy-design/svelte';
  import { treeDataEn as treeData } from './_data';
</script>

<div>
  <Title heading={6} style="margin: 20px 0 10px">maxTagCount=2:</Title>
  <TreeSelect
    multiple
    maxTagCount={2}
    style="width: 300px"
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    placeholder="当选中标签超过两个将折叠"
    defaultValue={['Beijing', 'Chengdu', 'Canada']}
  />
  <Title heading={6} style="margin: 20px 0 10px">maxTagCount=2, showRestTagsPopover:</Title>
  <TreeSelect
    showRestTagsPopover={true}
    restTagsPopoverProps={{ position: 'top' }}
    multiple
    maxTagCount={2}
    style="width: 300px"
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    placeholder="hover +N 查看"
    defaultValue={['Beijing', 'Chengdu', 'Canada']}
  />
</div>
