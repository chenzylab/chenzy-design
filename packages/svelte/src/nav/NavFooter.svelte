<!--
  Nav.Footer — 导航底部（对齐 Semi Footer.tsx）。
  collapseButton 仅 mode='vertical'（非 horizontal）生效，点击经 Nav context toggle 折叠态。
  收起按钮由 NavCollapseButton（复用 Button + Tooltip + IconSidebar）渲染。
  collapseButton 可为 boolean 或 Snippet（自定义节点，对齐 Semi React.isValidElement 分支）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getNavContext } from './context.js';
  import NavCollapseButton from './NavCollapseButton.svelte';

  interface Props {
    /** 是否展示收起按钮，或传自定义节点（仅 vertical 生效）。 */
    collapseButton?: boolean | Snippet;
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

  const nav = getNavContext();

  // collapseButton 为 Snippet 时视为自定义节点（对齐 Semi isValidElement 分支）。
  const customButton = $derived(
    typeof collapseButton === 'function' ? (collapseButton as Snippet) : undefined,
  );
  const showCollapseButton = $derived(
    !!collapseButton && !children && nav?.mode !== 'horizontal',
  );
  const collapsed = $derived(nav?.collapsed ?? false);
</script>

<div
  class={['cd-nav__footer', className].filter(Boolean).join(' ')}
  class:cd-nav__footer-collapsed={collapsed}
  {style}
  onclick={onClick}
  role="presentation"
>
  {#if children}
    {@render children()}
  {:else if customButton}
    {@render customButton()}
  {:else if showCollapseButton}
    <NavCollapseButton
      isCollapsed={collapsed}
      {...collapseText !== undefined ? { collapseText } : {}}
      onClick={() => nav?.toggleCollapsed()}
    />
  {/if}
</div>

<style>
  .cd-nav__footer {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    /* 侧边（vertical）态左右内边距 8px（对齐 Semi $spacing-navigation_vertical_footer-paddingLeft/Right）。 */
    padding: var(--cd-spacing-navigation-footer-paddingy) var(--cd-spacing-navigation-vertical-footer-paddingx);
    border-block-start: 1px solid var(--cd-color-navigation-border-default);
    color: var(--cd-color-navigation-footer-icon-default);
  }
</style>
