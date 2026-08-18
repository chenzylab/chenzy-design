<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import { IconBadge, IconBanner, IconForm } from '@chenzy-design/icons-lab';

  // 展开收起箭头位置：toggleIconPosition='left' 将子导航展开箭头置于文案前（默认 'right'）。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconBadge },
    { itemKey: 'union', text: '活动管理', icon: iconBanner },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconForm,
      items: [
        { itemKey: 'job-manage', text: '任务管理' },
        { itemKey: 'job-query', text: '用户任务查询' },
      ],
    },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconBadge()}<IconBadge />{/snippet}
{#snippet iconBanner()}<IconBanner />{/snippet}
{#snippet iconForm()}<IconForm />{/snippet}

<Nav
  mode="vertical"
  toggleIconPosition="left"
  defaultOpenKeys={['job']}
  {items}
  bodyStyle="height: 300px;"
  header={{ logo, text: '运营后台' }}
  footer={{ collapseButton: true }}
/>
