<script lang="ts">
  import { TreeSelect, Button, Space } from '@chenzy-design/svelte';
  import { treeData } from './_data';

  let ref = $state<ReturnType<typeof TreeSelect>>();
</script>

<Space vertical align="start">
  <Button onclick={() => ref?.search('北')}>外部触发搜索「北」</Button>
  <TreeSelect
    bind:this={ref}
    style="width: 300px"
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    filterTreeNode
    placeholder="命令式搜索"
  />
</Space>
