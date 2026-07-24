<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo, IconUser, IconApps, IconStar, IconList } from '@chenzy-design/icons';

  // 导航缩进：默认仅一级导航缩进；limitIndent=false 时多级导航按层级逐级缩进（仅垂直生效）。
  // 以 items 传入时无需关心 level，缩进层级自动推导。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconApps,
      items: [
        { itemKey: 'job-list', text: '任务管理' },
        {
          itemKey: 'mission1',
          text: '任务一',
          icon: iconStar,
          items: [
            { itemKey: 'task2', text: '任务二' },
            {
              itemKey: 'mission3',
              text: '任务三拆解',
              icon: iconList,
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
{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconApps()}<IconApps />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconList()}<IconList />{/snippet}

<div style="width: 240px; height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    limitIndent={false}
    defaultOpenKeys={['job', 'mission1']}
    {items}
    header={{ logo, text: '运营后台' }}
    footer={{ collapseButton: true }}
    style="height: 100%;"
  />
</div>
