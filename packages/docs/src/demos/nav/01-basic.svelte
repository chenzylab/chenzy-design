<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import type { NavSelectData, NavClickData } from '@chenzy-design/svelte';

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

{#snippet logo()}
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
    <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
  </svg>
{/snippet}
{#snippet iconAvatar()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
{/snippet}
{#snippet iconDescriptions()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="14" y2="17" /></svg>
{/snippet}
{#snippet iconTree()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="3" width="6" height="4" rx="1" /><rect x="3" y="17" width="6" height="4" rx="1" /><rect x="15" y="17" width="6" height="4" rx="1" /><path d="M12 7v4M6 17v-2h12v2M12 11v4" /></svg>
{/snippet}

<div style="width: 240px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    {items}
    header={{ logo, text: '运营后台' }}
    footer={{ collapseButton: true }}
    bodyStyle="height: 320px;"
    onSelect={(d: NavSelectData) => console.log('trigger onSelect: ', d)}
    onClick={(d: NavClickData) => console.log('trigger onClick: ', d)}
  />
</div>
