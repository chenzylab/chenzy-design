<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import { IconBadge, IconBanner, IconForm, IconTree } from '@chenzy-design/icons-lab';

  // 非受控属性：defaultSelectedKeys / defaultOpenKeys / defaultIsCollapsed
  // 仅设初值，之后由组件内部维护状态。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconBadge },
    { itemKey: 'union', text: '活动管理', icon: iconBanner },
    {
      itemKey: 'mgmt',
      text: '任务管理',
      icon: iconForm,
      items: [
        { itemKey: 'notice', text: '公告设置' },
        { itemKey: 'query', text: '任务查询' },
        { itemKey: 'input', text: '信息录入' },
      ],
    },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconTree,
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
{#snippet iconTree()}<IconTree />{/snippet}

<Nav
  mode="vertical"
  defaultOpenKeys={['mgmt']}
  defaultSelectedKeys={['input']}
  {items}
  bodyStyle="height: 300px;"
  header={{ logo, text: '运营后台' }}
  footer={{ collapseButton: true }}
/>
