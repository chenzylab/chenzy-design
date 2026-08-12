<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import { IconChevronDown, IconMinus, IconPlus } from '@chenzy-design/icons';
  import type { TreeNodeData } from '@chenzy-design/core';

  const treeData: TreeNodeData[] = [
    {
      label: '亚洲',
      key: 'yazhou',
      children: [
        {
          label: '中国',
          key: 'zhongguo',
          children: [
            {
              label: '北京',
              key: 'beijing',
            },
            {
              label: '上海',
              key: 'shanghai',
            },
          ],
        },
        {
          label: '日本',
          key: 'riben',
        },
      ],
    },
    {
      label: '北美洲',
      key: 'beimeizhou',
    },
  ];
</script>

<p>expandIcon 是 Snippet</p>
<Tree
  multiple
  defaultExpandedKeys={['yazhou']}
  {treeData}
  style="width: 260px; height: 200px; border: 1px solid var(--cd-color-border)"
>
  {#snippet expandIcon()}
    <IconChevronDown size="small" />
  {/snippet}
</Tree>
<br />
<p>expandIcon 根据展开态返回不同图标</p>
<Tree
  multiple
  defaultExpandedKeys={['yazhou']}
  {treeData}
  style="width: 260px; height: 200px; border: 1px solid var(--cd-color-border)"
>
  {#snippet expandIcon({ expanded })}
    {#if expanded}
      <IconMinus size="small" />
    {:else}
      <IconPlus size="small" />
    {/if}
  {/snippet}
</Tree>
