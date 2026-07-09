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
    /** 收起按钮文案（对齐 Semi collapseText，(collapsed)=>string；默认用 locale）。 */
    collapseText?: (collapsed: boolean) => string;
    /** 自定义类名。 */
    class?: string;
    /** 自定义内联样式。 */
    style?: string;
    /** 点击事件回调（对齐 Semi Nav.Footer onClick）。 */
    onClick?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    collapseButton = false,
    collapseText,
    class: className = '',
    style,
    onClick,
    children,
  }: Props = $props();

  const loc = useLocale();
  const nav = getNavContext();

  const showCollapseButton = $derived(
    collapseButton && !children && nav?.mode === 'vertical',
  );
  const collapsed = $derived(nav?.collapsed ?? false);
  // 展开态显示文案：优先 collapseText，回退 locale。折叠态仅留图标。
  const btnText = $derived(
    collapseText
      ? collapseText(collapsed)
      : collapsed
        ? loc().t('Sider.expand')
        : loc().t('Sider.collapse'),
  );
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
      onclick={(e) => {
        onClick?.(e);
        nav?.toggleCollapsed();
      }}
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
      {#if !collapsed}<span class="cd-nav__collapse-text">{btnText}</span>{/if}
    </button>
  {/if}
</div>

<style>
  .cd-nav__footer {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    padding: var(--cd-spacing-navigation-footer-paddingy) var(--cd-spacing-navigation-footer-paddingx);
    border-block-start: 1px solid var(--cd-color-navigation-border-default);
  }
  .cd-nav__collapse-btn {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--cd-spacing-navigation-vertical-footer-collapse-text-marginleft);
    width: 100%;
    height: var(--cd-height-navigation-item-base);
    border: none;
    background: transparent;
    color: var(--cd-color-navigation-footer-icon-default);
    cursor: pointer;
    border-radius: var(--cd-width-navigation-item-borderradius);
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-nav__collapse-btn:hover {
    background: var(--cd-color-navigation-iteml1-bg-active);
  }
  .cd-nav__collapse-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-nav__collapse-arrow {
    flex: 0 0 auto;
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-nav__collapse-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: var(--cd-font-size-regular);
  }
  /* 折叠态：按钮无文案，图标居中。 */
  :global(.cd-nav--collapsed) .cd-nav__collapse-btn {
    justify-content: center;
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
