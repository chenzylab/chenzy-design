<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconUser, IconStar, IconSetting, IconTriangleDown, IconArrowDown } from '@chenzy-design/icons';

  // expandIcon：Nav 级默认展开箭头（对齐 Semi expandIcon）；单个 Nav.Sub 可传自己的 expandIcon 覆盖 Nav 级。
  // subDropdownProps：Nav 级透传给所有子导航浮层 Dropdown 的默认属性（如自定义 spacing）。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '公会中心', icon: iconStar },
    {
      text: '任务平台（Sub 级覆盖箭头）',
      icon: iconSetting,
      itemKey: 'job',
      expandIcon: arrowDownIcon,
      items: ['任务管理', '用户任务查询'],
    },
    {
      text: '收藏夹（用 Nav 级默认箭头）',
      icon: iconStar,
      itemKey: 'star',
      items: ['我的喜欢', '点赞'],
    },
  ];
</script>

{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconSetting()}<IconSetting />{/snippet}
{#snippet triangleDownIcon()}<IconTriangleDown size="small" />{/snippet}
{#snippet arrowDownIcon()}<IconArrowDown size="small" />{/snippet}

<div style="display: flex; gap: 24px; align-items: flex-start;">
  <div>
    <p style="margin: 0 0 8px; color: var(--cd-color-text-2); font-size: 12px;">
      expandIcon：Nav 级三角箭头 + Sub 级覆盖箭头
    </p>
    <Nav {items} expandIcon={triangleDownIcon} defaultOpenKeys={['job', 'star']} bodyStyle="height: 280px;" />
  </div>
  <div>
    <p style="margin: 0 0 8px; color: var(--cd-color-text-2); font-size: 12px;">
      subDropdownProps：浮层子导航整体加大间距（spacing: 24）
    </p>
    <Nav mode="horizontal" {items} subDropdownProps={{ spacing: 24 }} defaultOpenKeys={['job']} />
  </div>
</div>
