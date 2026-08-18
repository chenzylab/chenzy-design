<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import type { NavSelectData, NavOpenChangeData } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import { IconBadge, IconBanner, IconForm, IconTree } from '@chenzy-design/icons-lab';

  // 受控属性：selectedKeys / openKeys / isCollapsed 全部受控，配合回调回写。
  let selectedKeys = $state<string[]>(['notice']);
  let openKeys = $state<string[]>(['union-management', 'job']);
  let isCollapsed = $state(true);

  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconBadge },
    { itemKey: 'union', text: '活动管理', icon: iconBanner },
    {
      itemKey: 'union-management',
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
  {selectedKeys}
  {openKeys}
  {isCollapsed}
  {items}
  bodyStyle="height: 300px;"
  header={{ logo, text: '运营后台' }}
  footer={{ collapseButton: true }}
  onSelect={(d: NavSelectData) => (selectedKeys = d.selectedKeys as string[])}
  onOpenChange={(d: NavOpenChangeData) => (openKeys = d.openKeys as string[])}
  onCollapseChange={(c) => (isCollapsed = c)}
/>
