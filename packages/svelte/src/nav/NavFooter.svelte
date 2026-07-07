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
      <!-- 折叠时箭头指向「展开」（右），反之指向「收起」（左）。用 SVG 保证清晰可见。 -->
      <svg
        class="cd-nav__collapse-arrow"
        class:cd-nav__collapse-arrow--collapsed={collapsed}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
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
    border-radius: var(--cd-nav-collapse-btn-radius);
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
    flex: 0 0 auto;
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  /* 折叠态：箭头翻转指向「展开」方向（右）。 */
  .cd-nav__collapse-arrow--collapsed {
    transform: rotate(180deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-nav__collapse-arrow {
      transition: none;
    }
  }
</style>
