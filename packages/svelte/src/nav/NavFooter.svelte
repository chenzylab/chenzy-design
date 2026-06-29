<!--
  Nav.Footer — 导航底部（对齐 Semi footer={{collapseButton}}）。
  collapseButton 仅 mode='vertical' 生效，点击经 Nav context toggle 折叠态。
  aria-label 文案复用 locale 包 Sider.expand/collapse。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { getNavContext } from './context.js';

  interface Props {
    /** 是否展示收起按钮（仅 vertical 生效）。 */
    collapseButton?: boolean;
    /** 自定义类名。 */
    class?: string;
    /** 自定义内联样式。 */
    style?: string;
    children?: Snippet;
  }

  let { collapseButton = false, class: className = '', style, children }: Props = $props();

  const loc = useLocale();
  const nav = getNavContext();

  const showCollapseButton = $derived(
    collapseButton && !children && nav?.mode === 'vertical',
  );
  const collapsed = $derived(nav?.collapsed ?? false);
  // 折叠时箭头指向「展开」方向，反之指向「收起」。
  const arrow = $derived(collapsed ? '›' : '‹');
</script>

<div class={['cd-nav__footer', className].filter(Boolean).join(' ')} {style}>
  {#if children}
    {@render children()}
  {:else if showCollapseButton}
    <button
      type="button"
      class="cd-nav__collapse-btn"
      aria-expanded={!collapsed}
      aria-label={collapsed ? loc().t('Sider.expand') : loc().t('Sider.collapse')}
      onclick={() => nav?.toggleCollapsed()}
    >
      <span class="cd-nav__collapse-arrow" aria-hidden="true">{arrow}</span>
    </button>
  {/if}
</div>

<style>
  .cd-nav__footer {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    padding: var(--cd-nav-footer-padding);
    border-block-start: 1px solid var(--cd-nav-footer-border);
  }
  .cd-nav__collapse-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: var(--cd-nav-collapse-btn-height);
    border: none;
    background: transparent;
    color: var(--cd-nav-collapse-btn-color);
    cursor: pointer;
    border-radius: var(--cd-radius-1);
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-nav__collapse-btn:hover {
    background: var(--cd-nav-collapse-btn-hover-bg);
  }
  .cd-nav__collapse-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-nav__collapse-arrow {
    font-size: 18px;
    line-height: 1;
  }
</style>
