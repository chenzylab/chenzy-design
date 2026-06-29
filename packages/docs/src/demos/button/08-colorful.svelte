<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  type Theme = NonNullable<ComponentProps<typeof Button>['theme']>;
  const themes: Theme[] = ['solid', 'light', 'outline', 'borderless'];
</script>

<!-- 设 colorful 即获得多彩按钮：蓝→紫→粉渐变。覆盖 4 种 theme × primary/tertiary × 普通/加载/禁用/图标 -->
<div style="display: flex; flex-direction: column; gap: 16px;">
  {#each themes as theme (theme)}
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <Button colorful {theme} type="primary">
        {#snippet icon()}
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z" />
          </svg>
        {/snippet}
        AI 生成
      </Button>
      <Button colorful {theme} type="primary" loading>处理中</Button>
      <Button colorful {theme} type="primary" disabled>禁用</Button>
      <Button colorful {theme} type="tertiary">
        {#snippet icon()}
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          </svg>
        {/snippet}
        智能优化
      </Button>
      <Button colorful {theme} type="tertiary" loading>加载</Button>
      <Button colorful {theme} type="tertiary" disabled>禁用</Button>
    </div>
  {/each}
</div>
