<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: 'src',
      key: 'src',
      children: [
        {
          label: 'components',
          key: 'components',
          children: [
            { label: 'Tree.svelte', key: 'tree' },
            { label: 'Input.svelte', key: 'input' },
          ],
        },
        { label: 'index.ts', key: 'index' },
      ],
    },
    {
      label: 'public',
      key: 'public',
      children: [{ label: 'favicon.ico', key: 'favicon' }],
    },
  ];
</script>

<div>
  <!-- directory：目录树模式（整行块 + 内置目录/文件图标 + 点击整行展开） -->
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    {treeData}
    directory
    defaultExpandAll
    ariaLabel="目录树"
  />
</div>
