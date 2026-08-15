<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeDataEnWithCities as treeData } from './_data';
</script>

<TreeSelect
  searchPosition="trigger"
  triggerTagWrap
  style="width: 260px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  filterTreeNode
  placeholder="请选择多个选项或输入长文本"
  defaultValue={['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou']}
/>
