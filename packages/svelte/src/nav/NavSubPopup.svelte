<!--
  NavSubPopup — 浮层子导航（horizontal 顶部 / vertical 折叠态）。
  sub-title 作触发器，hover（带 open/close 延迟）弹出浮层 <ul>，浮层内递归渲染子项。
  顶层向下（bottomStart），嵌套向右（rightStart）。openKeys 受控时随 isOpen 显隐。
  浮层用 useFloating 定位并 portal 到容器（getPopupContainer）。命令式定时器/floating 带清理。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getNavContext } from './context.js';
  import { floating } from '../_floating/use-floating.js';
  import type { Placement } from '@chenzy-design/core';
  import type { NavItemDef } from './types.js';
  import Self from './NavItemRender.svelte';

  interface Props {
    item: NavItemDef;
    level: number;
    /** 是否处于某个 SubNav 内部（决定浮层弹出方向）。 */
    inSubNav?: boolean;
    /** sub-title 内部内容（图标 + 文案 + toggle 箭头，由 NavItemRender 提供）。 */
    titleContent: Snippet;
  }

  let { item, level, inSubNav = false, titleContent }: Props = $props();

  const ctx = getNavContext()!;

  const selected = $derived(ctx.isSelected(item.itemKey));
  const itemDisabled = $derived(ctx.disabled || !!item.disabled);
  // openKeys 受控（vertical 且未折叠时才有意义；浮层态一般用 hover，但受控时跟随 isOpen）。
  const controlledOpen = $derived(ctx.isOpen(item.itemKey));

  // 顶层（非 inSubNav）在 horizontal 下向下弹，其余向右弹。
  const placement = $derived<Placement>(
    ctx.mode === 'horizontal' && !inSubNav ? 'bottomStart' : 'rightStart',
  );

  let titleEl = $state<HTMLElement | null>(null);
  let hoverOpen = $state(false);

  const isOpen = $derived(itemDisabled ? false : hoverOpen || controlledOpen);

  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  function clearTimers(): void {
    if (openTimer !== undefined) clearTimeout(openTimer);
    if (closeTimer !== undefined) clearTimeout(closeTimer);
    openTimer = closeTimer = undefined;
  }
  function scheduleOpen(): void {
    if (itemDisabled) return;
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
    if (hoverOpen) return;
    openTimer = setTimeout(() => {
      hoverOpen = true;
      openTimer = undefined;
    }, ctx.subNavOpenDelay);
  }
  function scheduleClose(): void {
    if (openTimer !== undefined) {
      clearTimeout(openTimer);
      openTimer = undefined;
    }
    if (!hoverOpen) return;
    closeTimer = setTimeout(() => {
      hoverOpen = false;
      closeTimer = undefined;
    }, ctx.subNavCloseDelay);
  }
  function keepOpen(): void {
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  $effect(() => clearTimers);
</script>

<li
  class="cd-nav__item cd-nav__sub-wrap"
  class:cd-nav__item-disabled={itemDisabled}
  onmouseenter={scheduleOpen}
  onmouseleave={scheduleClose}
>
  <div
    bind:this={titleEl}
    class="cd-nav__sub-title"
    class:cd-nav__sub-title-selected={selected}
    class:cd-nav__sub-title-disabled={itemDisabled}
    role="button"
    tabindex={itemDisabled ? -1 : 0}
    aria-haspopup="true"
    aria-expanded={isOpen}
    aria-disabled={itemDisabled || undefined}
    onkeydown={(e) => {
      if (itemDisabled) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        hoverOpen = true;
      } else if (e.key === 'Escape') {
        hoverOpen = false;
      }
    }}
  >
    <div class="cd-nav__item-inner">{@render titleContent()}</div>
  </div>

  {#if isOpen}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <ul
      class="cd-nav__sub-popover"
      class:cd-nav__sub-popover--motion={ctx.subNavMotion}
      use:floating={{
        trigger: titleEl,
        placement,
        offset: 4,
        autoAdjust: true,
        padding: 8,
        ...(ctx.getPopupContainer !== undefined ? { getContainer: ctx.getPopupContainer } : {}),
      }}
      onmouseenter={keepOpen}
      onmouseleave={scheduleClose}
    >
      {#each item.items ?? [] as child (child.itemKey)}
        <Self item={child} level={level + 1} inSubNav={true} />
      {/each}
    </ul>
  {/if}
</li>

<style>
  /* 浮层子导航容器：portal 到 body 后由本组件 scope 样式着色（Svelte 作用域随组件而非 DOM 位置）。
     position/top/left 由 use:floating 动作写入内联样式，此处不设，避免冲突。 */
  .cd-nav__sub-popover {
    z-index: var(--cd-z-popover, 1030);
    margin: 0;
    padding: var(--cd-spacing-tight);
    list-style: none;
    min-inline-size: var(--cd-width-navigation-dropdown-item-nav-item-minwidth);
    background: var(--cd-color-navigation-bg-default);
    border-radius: var(--cd-border-radius-medium);
    box-shadow: var(--cd-shadow-elevated, 0 4px 14px rgba(0, 0, 0, 0.1));
  }
  /* 仅淡入 opacity；不可动画 transform——浮层位置由 use:floating 用 transform 定位，
     动画 transform 会覆盖定位使浮层错位到 (0,0)。 */
  .cd-nav__sub-popover--motion {
    animation: cd-nav-popup-in var(--cd-motion-duration-fast) var(--cd-motion-ease-standard) both;
  }
  @keyframes cd-nav-popup-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-nav__sub-popover--motion {
      animation: none;
    }
  }
  /* 折叠态：sub-title 内容居中，图标居中于图标轨（与 NavItemRender 叶子一致）。 */
  :global(.cd-nav--collapsed) .cd-nav__sub-title .cd-nav__item-inner {
    justify-content: center;
  }
</style>
