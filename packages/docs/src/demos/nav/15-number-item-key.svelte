<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconAvatar, IconDescriptions, IconTree } from '@chenzy-design/icons-lab';

  // itemKey 支持 number 类型（对齐 Semi NumberItemKey story），openKeys/selectedKeys 数组元素同样为 number。
  // 图标对齐 Semi 原 story（IconAvatar/IconDescriptions/IconTree 属 icons-lab 系列，非 icons 通用图标）。
  let openKeys = $state<number[]>([]);

  const items = [
    { itemKey: 1, text: '用户管理', icon: iconAvatar },
    { itemKey: 2, text: '活动管理', icon: iconDescriptions },
    {
      itemKey: 3,
      text: '任务平台',
      icon: iconTree,
      items: [
        { itemKey: 31, text: '任务管理' },
        { itemKey: 32, text: '用户任务查询' },
      ],
    },
  ];

  function onOpenChange(data: { openKeys: (string | number)[] }): void {
    openKeys = data.openKeys as number[];
  }
</script>

{#snippet iconAvatar()}<IconAvatar />{/snippet}
{#snippet iconDescriptions()}<IconDescriptions />{/snippet}
{#snippet iconTree()}<IconTree />{/snippet}

<Nav {items} {openKeys} {onOpenChange} bodyStyle="height: 240px;" />
