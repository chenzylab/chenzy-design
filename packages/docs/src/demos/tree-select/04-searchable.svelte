<script lang="ts">
  import { TreeSelect, Switch, Text } from '@chenzy-design/svelte';
  import { treeDataEn as treeData } from './_data';

  let showFilteredOnly = $state(false);

  const onSearch = (input: string) => console.log('onSearch', input);
</script>

<Text>showFilteredOnly</Text>
<Switch checked={showFilteredOnly} onChange={(v) => (showFilteredOnly = v)} size="small" />
<br />
<br />
<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  filterTreeNode
  {showFilteredOnly}
  placeholder="单选可搜索的"
  {onSearch}
/>
<br />
<br />
<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  filterTreeNode
  maxTagCount={2}
  {showFilteredOnly}
  placeholder="多选可搜索的"
  searchPlaceholder="请输入关键字开始搜索"
  {onSearch}
/>
