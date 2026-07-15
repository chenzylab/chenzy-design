<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import type { NavOpenChangeData } from '@chenzy-design/svelte';

  // number 类型 itemKey：itemKey 用数字（覆盖 NavKey 的 number 分支）。
  // 对齐 Semi NumberItemKey story。
  let openKeys = $state<number[]>([]);

  const items = [
    { itemKey: 1, text: '用户管理', icon: iconUser },
    { itemKey: 2, text: '活动管理', icon: iconStar },
    {
      itemKey: 3,
      text: '任务平台',
      icon: iconGear,
      items: [
        { itemKey: 31, text: '任务管理' },
        { itemKey: 32, text: '用户任务查询' },
      ],
    },
  ];
</script>

{#snippet iconUser()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
{/snippet}
{#snippet iconStar()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
{/snippet}
{#snippet iconGear()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
{/snippet}

<div style="width: 240px; height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    defaultSelectedKeys={[1]}
    {openKeys}
    {items}
    onOpenChange={(d: NavOpenChangeData) => (openKeys = d.openKeys as number[])}
    style="height: 100%;"
  />
</div>
