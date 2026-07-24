<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData as initial, type TreeNode } from './_data';

  let treeData = $state<TreeNode[]>(initial);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const handleSearch = (input: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!input) {
        treeData = initial;
        return;
      }
      // 模拟远程返回：按输入构造一条路径
      treeData = [
        {
          label: `${input}省`,
          value: `${input}-p`,
          children: [{ label: `${input}市`, value: `${input}-c`, children: [{ label: `${input}区`, value: `${input}-d` }] }],
        },
      ];
    }, 300);
  };
</script>

<Cascader
  style="width: 300px"
  {treeData}
  remote
  filterTreeNode
  onSearch={handleSearch}
  placeholder="远程搜索（输入触发 onSearch）"
/>
