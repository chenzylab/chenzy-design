<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import type { NavSelectData, NavClickData } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import { IconAvatar, IconDescriptions, IconTree } from '@chenzy-design/icons-lab';

  // 基本使用：传入 items 快速得到导航栏；子导航用 string[] 简写（每项作 text 与 itemKey）。
  // header 定义 logo + 文案；footer.collapseButton 开启底部收起按钮（仅 vertical 生效）。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconAvatar },
    { itemKey: 'union', text: '活动管理', icon: iconDescriptions },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconTree,
      items: ['任务管理', '用户任务查询'],
    },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconAvatar()}<IconAvatar />{/snippet}
{#snippet iconDescriptions()}<IconDescriptions />{/snippet}
{#snippet iconTree()}<IconTree />{/snippet}

<Nav
  {items}
  header={{ logo, text: '运营后台' }}
  footer={{ collapseButton: true }}
  bodyStyle="height: 320px;"
  onSelect={(d: NavSelectData) => console.log('trigger onSelect: ', d)}
  onClick={(d: NavClickData) => console.log('trigger onClick: ', d)}
/>
