<script lang="ts">
  // 文档站「注意事项」提示块 —— 严格对齐 Semi src/components/Notice：
  // flex 布局，左 IconInfoCircle + 右 caption（title + body），
  // primary/warning/danger 三态（左 4px 竖条 + 浅色底 + 主色标题）。
  import type { Snippet } from 'svelte';
  import { IconInfoCircle } from '@chenzy-design/icons';

  const {
    type = 'primary',
    title,
    children,
  }: {
    type?: 'primary' | 'warning' | 'danger';
    title?: string;
    children: Snippet;
  } = $props();
</script>

<div class="notice {type}">
  <div class="notice-icon">
    <IconInfoCircle />
  </div>
  <div class="notice-caption">
    {#if title}<div class="notice-title">{title}</div>{/if}
    <div class="notice-body">{@render children()}</div>
  </div>
</div>

<style>
  /* 对齐 Semi Notice/index.scss（$bf=16px、$h4=19.2px） */
  .notice {
    display: flex;
    align-items: flex-start;
    padding: 24px;
    margin-bottom: 32px; /* 2 * $bf */
    border-radius: 3px 6px 6px 3px;
  }

  .notice-icon :global(svg) {
    font-size: 22px;
    width: 22px;
    height: 22px;
  }

  .notice.primary {
    background: var(--cd-color-primary-light-default, #e6f0ff);
    border-left: 4px solid var(--cd-color-primary, #0064fa);
  }
  .notice.primary .notice-icon,
  .notice.primary .notice-title {
    color: var(--cd-color-primary, #0064fa);
  }

  .notice.warning {
    background: var(--cd-color-warning-light-default, #fff7e6);
    border-left: 4px solid var(--cd-color-warning, #fa8c16);
  }
  .notice.warning .notice-icon,
  .notice.warning .notice-title {
    color: var(--cd-color-warning, #fa8c16);
  }

  .notice.danger {
    background: var(--cd-color-danger-light-default, #ffece8);
    border-left: 4px solid var(--cd-color-danger, #f5222d);
  }
  .notice.danger .notice-icon,
  .notice.danger .notice-title {
    color: var(--cd-color-danger, #f5222d);
  }

  .notice-caption {
    padding-left: 12px;
    line-height: 1.15;
  }

  .notice-title {
    font-size: 19.2px; /* $h4 = $bf * 1.2 */
    font-weight: bold;
    margin-bottom: 12.8px; /* $bf * 0.8 */
  }

  .notice-body {
    line-height: 1.8;
    color: var(--cd-color-text-1, #4e5969);
  }

  /* md 段落/内联代码在 body 内应保持行内流，避免每个 code 单独换行（对齐 Semi） */
  .notice-body :global(p) {
    display: inline;
    margin: 0;
  }
  .notice-body :global(code) {
    display: inline;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 3px;
  }
  /* mdsvex 将多个块级子项之间以 <p> 分隔时，相邻块留出行距 */
  .notice-body :global(ol),
  .notice-body :global(ul) {
    margin: 0;
    padding-left: 20px;
  }
  .notice-body :global(li) {
    line-height: 1.8;
  }
</style>
