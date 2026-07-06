<script lang="ts">
  import { UserGuide, Button } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);

  let newBtn = $state<HTMLElement | null>(null);
  let filterBtn = $state<HTMLElement | null>(null);
  let moreBtn = $state<HTMLElement | null>(null);

  const steps: UserGuideStep[] = [
    {
      target: () => newBtn,
      title: '新建',
      description: '点击这里创建一条新记录，支持快捷键 N。',
    },
    {
      target: () => filterBtn,
      title: '筛选',
      description: '按条件过滤当前列表，条件会被记住。',
    },
    {
      target: () => moreBtn,
      title: '更多操作',
      description: '导出、批量操作等高级功能都收纳在这里。',
    },
  ];
</script>

<div style="display:flex; gap:8px; align-items:center; margin-bottom:16px">
  <button
    bind:this={newBtn}
    style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px; background:var(--cd-color-bg-1)"
  >
    新建
  </button>
  <button
    bind:this={filterBtn}
    style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px; background:var(--cd-color-bg-1)"
  >
    筛选
  </button>
  <button
    bind:this={moreBtn}
    style="padding:6px 12px; border:1px solid var(--cd-color-border); border-radius:6px; background:var(--cd-color-bg-1)"
  >
    更多
  </button>
</div>

<Button onclick={() => (visible = true)}>开始引导</Button>

<UserGuide
  {steps}
  {visible}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
