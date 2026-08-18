<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import { IconBadge, IconBanner, IconForm, IconTabs } from '@chenzy-design/icons-lab';

  // 导航缩进：默认仅一级导航缩进；limitIndent=false 时多级导航按层级逐级缩进（仅垂直生效）。
  // 以 items 传入时无需关心 level，缩进层级自动推导。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconBadge },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconBanner,
      items: [
        { itemKey: 'job-list', text: '任务管理' },
        {
          itemKey: 'mission1',
          text: '任务一',
          icon: iconForm,
          items: [
            { itemKey: 'task2', text: '任务二' },
            {
              itemKey: 'mission3',
              text: '任务三拆解',
              icon: iconTabs,
              items: [
                { itemKey: 'sub1', text: '子任务一' },
                { itemKey: 'sub2', text: '子任务二' },
              ],
            },
          ],
        },
      ],
    },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconBadge()}<IconBadge />{/snippet}
{#snippet iconBanner()}<IconBanner />{/snippet}
{#snippet iconForm()}<IconForm />{/snippet}
{#snippet iconTabs()}<IconTabs />{/snippet}

<Nav
  mode="vertical"
  limitIndent={false}
  defaultOpenKeys={['job', 'mission1']}
  {items}
  bodyStyle="height: 300px;"
  header={{ logo, text: '运营后台' }}
  footer={{ collapseButton: true }}
/>
