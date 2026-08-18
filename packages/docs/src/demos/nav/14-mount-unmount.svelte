<script lang="ts">
  import { Nav, Button } from '@chenzy-design/svelte';
  import { IconUser, IconStar, IconSetting } from '@chenzy-design/icons';

  // 反复卸载/重新挂载 Nav（对齐 Semi MountUnmount story），验证受控 selectedKeys 状态不会因卸载丢失/错乱。
  let shouldRender = $state(true);
  let selectedKeys = $state<string[]>([]);

  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '公会中心', icon: iconStar },
    { itemKey: 'job', text: '任务平台', icon: iconSetting, items: ['任务管理', '用户任务查询'] },
  ];

  function onSelect(data: { itemKey: string | number }): void {
    selectedKeys = [String(data.itemKey)];
  }
</script>

{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconSetting()}<IconSetting />{/snippet}

<Button onclick={() => (shouldRender = !shouldRender)}>{shouldRender ? '卸载' : '重新挂载'} Nav</Button>
{#if shouldRender}
  <Nav {items} {selectedKeys} {onSelect} bodyStyle="height: 200px;" />
{/if}
