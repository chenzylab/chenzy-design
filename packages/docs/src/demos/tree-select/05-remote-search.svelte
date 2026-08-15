<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  let value = $state<string | undefined>(undefined);
  let treeData = $state<TreeNode[]>([]);

  // 模拟远程搜索
  function handleSearch(inputValue: string) {
    if (!inputValue) {
      treeData = [];
      return;
    }
    // 模拟网络请求
    setTimeout(() => {
      treeData = [
        { label: `${inputValue} - 结果1`, value: `${inputValue}-1`, key: `${inputValue}-1` },
        { label: `${inputValue} - 结果2`, value: `${inputValue}-2`, key: `${inputValue}-2` },
        { label: `${inputValue} - 结果3`, value: `${inputValue}-3`, key: `${inputValue}-3` },
      ];
    }, 500);
  }
</script>

<TreeSelect
  style="width: 300px"
  placeholder="请输入关键字进行远程搜索"
  {treeData}
  filterTreeNode
  remote
  {value}
  onChange={(v) => (value = v as string | undefined)}
  onSearch={handleSearch}
/>
