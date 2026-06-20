<!--
  MenuPopupNode — vertical 模式下的单个菜单项（递归）。
  叶子: 普通 menuitem; SubMenu: title + hover 弹出浮层 (use:floating, rightStart)。
  浮层内继续递归 MenuPopupNode，形成多级 hover 子菜单。
  hover 意图: 进入 title 延迟开、离开 title 与浮层组延迟关 (closeDelay)，
  指针移入浮层时取消关闭计时，避免 title→浮层 缝隙抖动。
  定时器/floating 均命令式管理 + cleanup (红线 #3)。
-->
<script lang="ts">
  import { floating } from '../_floating/use-floating.js';
  import type { Placement } from '@chenzy-design/core';
  import type { MenuItemDef, MenuKey } from './types.js';
  import Self from './MenuPopupNode.svelte';

  interface Props {
    item: MenuItemDef;
    /** 顶层节点用 bottomStart 弹出向下，嵌套层用 rightStart 向右 */
    placement: Placement;
    isSelected: (key: MenuKey) => boolean;
    onSelectLeaf: (item: MenuItemDef) => void;
    /** 选中叶子后自顶向下逐级关闭浮层 */
    onCloseAll: () => void;
    openDelay?: number;
    closeDelay?: number;
  }

  let {
    item,
    placement,
    isSelected,
    onSelectLeaf,
    onCloseAll,
    openDelay = 100,
    closeDelay = 200,
  }: Props = $props();

  const hasChildren = $derived(!!item.children && item.children.length > 0);

  let titleEl = $state<HTMLButtonElement | null>(null);
  let open = $state(false);

  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function clearTimers() {
    if (openTimer !== undefined) {
      clearTimeout(openTimer);
      openTimer = undefined;
    }
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function scheduleOpen() {
    if (item.disabled || !hasChildren) return;
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
    if (open) return;
    openTimer = setTimeout(() => {
      open = true;
      openTimer = undefined;
    }, openDelay);
  }

  function scheduleClose() {
    if (openTimer !== undefined) {
      clearTimeout(openTimer);
      openTimer = undefined;
    }
    if (!open) return;
    closeTimer = setTimeout(() => {
      open = false;
      closeTimer = undefined;
    }, closeDelay);
  }

  // 指针移入浮层 → 取消关闭计时，保持打开。
  function keepOpen() {
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function closeNow() {
    clearTimers();
    open = false;
  }

  function onLeafClick() {
    if (item.disabled) return;
    onSelectLeaf(item);
    onCloseAll();
  }

  // 卸载兜底清理定时器。
  $effect(() => clearTimers);
</script>

{#if hasChildren}
  <li
    class="cd-menu__item cd-menu__item--submenu"
    role="none"
    onpointerenter={scheduleOpen}
    onpointerleave={scheduleClose}
  >
    <button
      type="button"
      class="cd-menu__title"
      role="menuitem"
      aria-haspopup="true"
      aria-expanded={open}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled || undefined}
      bind:this={titleEl}
      onkeydown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (hasChildren && !item.disabled) open = true;
        } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
          closeNow();
        }
      }}
    >
      {#if item.icon}<span class="cd-menu__icon" aria-hidden="true">{@render item.icon()}</span>{/if}
      <span class="cd-menu__label">{item.label}</span>
      <span class="cd-menu__arrow cd-menu__arrow--popup" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
          <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
        </svg>
      </span>
    </button>

    {#if open && titleEl}
      <ul
        class="cd-menu__sub cd-menu__sub--popup"
        role="menu"
        use:floating={{ trigger: titleEl, placement, offset: 2, autoAdjust: true }}
        onpointerenter={keepOpen}
        onpointerleave={scheduleClose}
      >
        {#each item.children ?? [] as child (child.key)}
          <Self
            item={child}
            placement="rightStart"
            {isSelected}
            {onSelectLeaf}
            onCloseAll={() => {
              closeNow();
              onCloseAll();
            }}
            {openDelay}
            {closeDelay}
          />
        {/each}
      </ul>
    {/if}
  </li>
{:else}
  {@const selected = isSelected(item.key)}
  <li class="cd-menu__item" role="none">
    <button
      type="button"
      class="cd-menu__link"
      class:cd-menu__link--selected={selected}
      role="menuitem"
      aria-current={selected ? 'true' : undefined}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled || undefined}
      onclick={onLeafClick}
    >
      {#if item.icon}<span class="cd-menu__icon" aria-hidden="true">{@render item.icon()}</span>{/if}
      <span class="cd-menu__label">{item.label}</span>
    </button>
  </li>
{/if}

<style>
  .cd-menu__item {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-menu__link,
  .cd-menu__title {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    inline-size: 100%;
    block-size: var(--cd-menu-item-height);
    padding-inline: var(--cd-menu-item-padding);
    border: none;
    background: transparent;
    color: var(--cd-menu-item-color);
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-menu__link:hover,
  .cd-menu__title:hover {
    background: var(--cd-menu-item-bg-hover);
  }
  .cd-menu__link:focus-visible,
  .cd-menu__title:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-menu__link--selected {
    position: relative;
    color: var(--cd-menu-item-color-selected);
    background: var(--cd-menu-item-bg-selected);
  }
  .cd-menu__link--selected::before {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: 3px;
    background: var(--cd-menu-item-indicator);
  }
  .cd-menu__link[aria-disabled='true'],
  .cd-menu__title[aria-disabled='true'] {
    color: var(--cd-menu-item-color-disabled);
    cursor: not-allowed;
  }
  .cd-menu__label {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-menu__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--cd-menu-item-color);
  }
  .cd-menu__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-menu-submenu-arrow-color);
  }
  /* hover 浮层子菜单：脱离内联缩进，独立卡片 */
  .cd-menu__sub--popup {
    margin: 0;
    padding: 0;
    list-style: none;
    min-inline-size: 8rem;
    padding-block: var(--cd-spacing-1);
    background: var(--cd-menu-bg);
    border-radius: var(--cd-select-dropdown-radius, 6px);
    box-shadow: var(--cd-select-dropdown-shadow, 0 4px 12px rgba(0, 0, 0, 0.12));
    z-index: var(--cd-select-dropdown-z, 1050);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-menu__link,
    .cd-menu__title {
      transition: none;
    }
  }
</style>
