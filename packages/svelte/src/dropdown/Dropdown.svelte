<!--
  Dropdown — see specs/components/navigation/Dropdown.spec.md
  基础子集：click/hover 触发、bottomStart/bottomEnd/topStart 位置、菜单项、
  useDismiss、closeOnSelect、键盘导航。
  TODO(延后): contextMenu、12 位置矩阵全集、destroyOnClose、嵌套子菜单、
  portal/getPopupContainer、autoAdjustOverflow 碰撞检测。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useDismiss } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import type { DropdownItem } from './types.js';

  type ItemKey = string | number;
  type Trigger = 'hover' | 'click';
  type Position = 'bottomStart' | 'bottomEnd' | 'topStart';
  type Size = 'small' | 'default' | 'large';

  interface Props {
    items?: DropdownItem[];
    trigger?: Trigger;
    open?: boolean;
    defaultOpen?: boolean;
    position?: Position;
    size?: Size;
    disabled?: boolean;
    closeOnSelect?: boolean;
    closeOnEsc?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    onSelect?: (key: ItemKey) => void;
    onOpenChange?: (open: boolean) => void;
    triggerContent?: Snippet;
    children?: Snippet;
  }

  let {
    items = [],
    trigger = 'hover',
    open,
    defaultOpen = false,
    position = 'bottomStart',
    size = 'default',
    disabled = false,
    closeOnSelect = true,
    closeOnEsc = true,
    mouseEnterDelay = 150,
    mouseLeaveDelay = 150,
    onSelect,
    onOpenChange,
    triggerContent,
    children,
  }: Props = $props();

  const loc = useLocale();

  const menuId = useId('cd-dropdown-menu');

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isControlled) innerOpen = next;
    onOpenChange?.(next);
    if (!next) activeIndex = -1;
  }

  // --- roving 高亮 (红线 #2)：activeIndex 本地 $state，不读挂载 registry ---
  let activeIndex = $state(-1);

  const activeItemId = $derived(
    activeIndex >= 0 && activeIndex < items.length
      ? `${menuId}-item-${activeIndex}`
      : undefined,
  );

  function enabledNext(from: number, delta: number): number {
    const len = items.length;
    if (len === 0) return -1;
    let idx = from;
    for (let i = 0; i < len; i += 1) {
      idx = (idx + delta + len) % len;
      if (!items[idx]?.disabled) return idx;
    }
    return -1;
  }

  function selectItem(item: DropdownItem) {
    if (item.disabled || disabled) return;
    onSelect?.(item.key);
    if (closeOnSelect) setOpen(false);
  }

  // --- hover 延迟开关：setTimeout 存普通变量，cleanup 清除 ---
  let enterTimer: ReturnType<typeof setTimeout> | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;

  function clearTimers() {
    if (enterTimer !== undefined) {
      clearTimeout(enterTimer);
      enterTimer = undefined;
    }
    if (leaveTimer !== undefined) {
      clearTimeout(leaveTimer);
      leaveTimer = undefined;
    }
  }

  function onPointerEnter() {
    if (disabled || trigger !== 'hover') return;
    clearTimers();
    enterTimer = setTimeout(() => setOpen(true), mouseEnterDelay);
  }

  function onPointerLeave() {
    if (disabled || trigger !== 'hover') return;
    clearTimers();
    leaveTimer = setTimeout(() => setOpen(false), mouseLeaveDelay);
  }

  function onTriggerClick() {
    if (disabled || trigger !== 'click') return;
    setOpen(!isOpen);
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
          activeIndex = enabledNext(-1, 1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
          activeIndex = enabledNext(-1, 1);
        } else {
          activeIndex = enabledNext(activeIndex, 1);
        }
        break;
      case 'Escape':
        if (isOpen && closeOnEsc) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  function onMenuKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = enabledNext(activeIndex, 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeIndex = enabledNext(activeIndex, -1);
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const item = items[activeIndex];
        if (item) selectItem(item);
        break;
      }
      case 'Escape':
        if (closeOnEsc) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  // --- useDismiss (红线 #3)：放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: closeOnEsc,
      outsideClick: true,
    });
    return cleanup;
  });

  $effect(() => clearTimers);

  const cls = $derived(
    [
      'cd-dropdown',
      `cd-dropdown--${size}`,
      `cd-dropdown--${position}`,
      disabled && 'cd-dropdown--disabled',
      isOpen && 'cd-dropdown--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<!-- 浮层定位纯 CSS：menu position:absolute 相对 root position:relative -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={cls}
  bind:this={rootEl}
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
>
  <div
    class="cd-dropdown__trigger"
    role="button"
    tabindex={disabled ? -1 : 0}
    aria-haspopup="menu"
    aria-expanded={isOpen}
    aria-controls={menuId}
    aria-disabled={disabled || undefined}
    onclick={onTriggerClick}
    onkeydown={onTriggerKeydown}
  >
    {#if triggerContent}
      {@render triggerContent()}
    {:else}
      <span class="cd-dropdown__trigger-default">{loc().t('Dropdown.trigger')}</span>
    {/if}
  </div>

  {#if isOpen}
    <div
      class="cd-dropdown__menu"
      id={menuId}
      role="menu"
      tabindex="-1"
      aria-activedescendant={activeItemId}
      onkeydown={onMenuKeydown}
    >
      {#if children}
        {@render children()}
      {:else}
        {#each items as item, i (item.key)}
          <button
            type="button"
            class="cd-dropdown__item"
            class:cd-dropdown__item--active={i === activeIndex}
            class:cd-dropdown__item--danger={item.danger}
            id={`${menuId}-item-${i}`}
            role="menuitem"
            tabindex="-1"
            aria-disabled={item.disabled || undefined}
            disabled={item.disabled ?? false}
            onpointerenter={() => {
              if (!item.disabled) activeIndex = i;
            }}
            onclick={() => selectItem(item)}
          >
            {item.label}
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .cd-dropdown {
    position: relative;
    display: inline-block;
  }
  .cd-dropdown__trigger {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }
  .cd-dropdown__trigger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-dropdown--disabled .cd-dropdown__trigger {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-dropdown__menu {
    position: absolute;
    z-index: var(--cd-dropdown-z);
    min-inline-size: var(--cd-dropdown-min-width);
    padding-block: var(--cd-spacing-1);
    background: var(--cd-dropdown-bg);
    border-radius: var(--cd-dropdown-radius);
    box-shadow: var(--cd-dropdown-shadow);
  }
  /* 位置矩阵：bottomStart / bottomEnd / topStart */
  .cd-dropdown--bottomStart .cd-dropdown__menu {
    inset-block-start: calc(100% + var(--cd-spacing-1));
    inset-inline-start: 0;
  }
  .cd-dropdown--bottomEnd .cd-dropdown__menu {
    inset-block-start: calc(100% + var(--cd-spacing-1));
    inset-inline-end: 0;
  }
  .cd-dropdown--topStart .cd-dropdown__menu {
    inset-block-end: calc(100% + var(--cd-spacing-1));
    inset-inline-start: 0;
  }
  .cd-dropdown__item {
    display: flex;
    align-items: center;
    inline-size: 100%;
    margin: 0;
    padding: var(--cd-dropdown-item-padding);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .cd-dropdown__item--active {
    background: var(--cd-dropdown-item-bg-hover);
  }
  .cd-dropdown__item--danger {
    color: var(--cd-color-danger);
  }
  .cd-dropdown__item--danger.cd-dropdown__item--active {
    background: var(--cd-color-danger-light-default, var(--cd-dropdown-item-bg-hover));
  }
  .cd-dropdown__item[aria-disabled='true'] {
    color: var(--cd-dropdown-item-color-disabled);
    cursor: not-allowed;
  }
</style>
