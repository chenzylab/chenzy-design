<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconUser, IconStar, IconSetting } from '@chenzy-design/icons';

  // getPopupContainer 指定浮层挂载容器（对齐 Semi Popup story）：折叠/水平模式下子导航浮层
  // 挂到本例的 #nav-popup-container 内，而非默认的 document.body。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '公会中心', icon: iconStar },
    {
      text: '任务平台',
      icon: iconSetting,
      itemKey: 'job',
      items: ['任务管理', '用户任务查询'],
    },
  ];

  let container: HTMLElement | undefined = $state();
</script>

{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconSetting()}<IconSetting />{/snippet}

<div
  id="nav-popup-container"
  bind:this={container}
  style="position: relative; border: 1px dashed var(--cd-color-border); border-radius: 8px; padding: 16px;"
>
  <p style="margin: 0 0 12px; color: var(--cd-color-text-2); font-size: 12px;">
    浮层子导航挂载在此虚线容器内（getPopupContainer）
  </p>
  <Nav
    mode="horizontal"
    {items}
    defaultOpenKeys={['job']}
    defaultSelectedKeys={['user']}
    getPopupContainer={() => container ?? null}
  />
</div>
