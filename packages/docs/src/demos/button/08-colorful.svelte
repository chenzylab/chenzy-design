<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  type Theme = NonNullable<ComponentProps<typeof Button>['theme']>;
  const themes: Theme[] = ['solid', 'light', 'outline', 'borderless'];
</script>

{#snippet sparkle()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z" />
  </svg>
{/snippet}
{#snippet star()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
  </svg>
{/snippet}

<!-- 设 colorful 即获得多彩按钮：蓝→紫渐变。带文字 4 行 + 纯图标 4 行，各覆盖 4 theme × primary/tertiary × 普通/加载/禁用 -->
<div style="display: flex; flex-direction: column; gap: 12px;">
  <!-- 带文字 -->
  {#each themes as theme (theme)}
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <Button colorful {theme} type="primary" icon={sparkle}>AI 生成</Button>
      <Button colorful {theme} type="primary" loading>处理中</Button>
      <Button colorful {theme} type="primary" disabled>禁用</Button>
      <Button colorful {theme} type="tertiary" icon={star}>智能优化</Button>
      <Button colorful {theme} type="tertiary" loading>加载</Button>
      <Button colorful {theme} type="tertiary" disabled>禁用</Button>
    </div>
  {/each}

  <!-- 纯图标 -->
  {#each themes as theme (`${theme}-icon`)}
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <Button colorful {theme} type="primary" icon={sparkle} ariaLabel="AI 生成" />
      <Button colorful {theme} type="primary" loading ariaLabel="处理中" />
      <Button colorful {theme} type="primary" disabled icon={sparkle} ariaLabel="禁用" />
      <Button colorful {theme} type="tertiary" icon={star} ariaLabel="智能优化" />
      <Button colorful {theme} type="tertiary" loading ariaLabel="加载" />
      <Button colorful {theme} type="tertiary" disabled icon={star} ariaLabel="禁用" />
    </div>
  {/each}
</div>
