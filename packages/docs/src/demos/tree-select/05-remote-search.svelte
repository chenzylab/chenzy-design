<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import { treeDataEn as initial, type TreeNode } from './_data';

  let treeData = $state<TreeNode[]>(initial);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const onSearch = (input: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!input) {
        treeData = initial;
        return;
      }
      // 模拟远程返回：按输入构造节点
      treeData = [
        {
          label: `${input} 地区`,
          value: `${input}-region`,
          key: `${input}-region`,
          children: [
            { label: `${input} 城市 A`, value: `${input}-a`, key: `${input}-a` },
            { label: `${input} 城市 B`, value: `${input}-b`, key: `${input}-b` },
          ],
        },
      ];
    }, 300);
  };
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  remote
  filterTreeNode
  searchAutoFocus
  emptyContent="输入以搜索远程数据"
  {onSearch}
  placeholder="远程搜索"
/>
