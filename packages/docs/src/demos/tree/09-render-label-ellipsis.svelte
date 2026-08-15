<script lang="ts">
  import { Tree, Button, Text, Toast } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import type { TreeNodeData } from '@chenzy-design/core';

  const treeData: TreeNodeData[] = [
    {
      label: '亚洲亚洲亚洲亚洲亚洲亚洲亚洲亚洲',
      value: 'yazhou',
      key: 'yazhou',
      children: [
        {
          label: '中国中国中国中国中国中国中国中国',
          value: 'zhongguo',
          key: 'zhongguo',
        },
        {
          label: '日本日本日本日本日本日本日本日本',
          value: 'riben',
          key: 'riben',
        },
      ],
    },
  ];

  function onMore(key: string) {
    return (e: MouseEvent) => {
      Toast.info({ content: key });
      e.stopPropagation();
    };
  }
</script>

<Tree {treeData} style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)">
  {#snippet renderLabel({ node })}
    <div style="display:flex">
      <Text ellipsis={{ showTooltip: true }} style="width: calc(100% - 48px)">
        {node.label}
      </Text>
      <Button onclick={onMore(String(node.key))} size="small">
        {#snippet icon()}
          <IconMore />
        {/snippet}
      </Button>
    </div>
  {/snippet}
</Tree>
