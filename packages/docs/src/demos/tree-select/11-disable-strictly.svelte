<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeDataWithJapan } from './_data';

  // 节点「中国」开启 disabled，disableStrictly 后改父节点「亚洲」不影响中国的选中状态。
  const treeData = structuredClone(treeDataWithJapan);
  const china = treeData[0]!.children![0]!;
  china.disabled = true;
</script>

<div>
  <TreeSelect
    style="width: 300px"
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    disableStrictly
    multiple
    defaultValue={['Shanghai']}
  />
</div>
