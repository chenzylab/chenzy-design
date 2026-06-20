<!--
  Dropdown — see specs/components/navigation/Dropdown.spec.md
  基础子集：click/hover/contextMenu 触发、12 方位、菜单项、useDismiss、closeOnSelect、键盘导航。
  定位：portal 到 body + position:fixed，core computePosition + autoAdjustOverflow flip。
  contextMenu：右键 preventDefault + 记录光标 x/y，浮层 portal 到 body 并 fixed 落点光标。
  TODO(延后): destroyOnClose、嵌套子菜单、getPopupContainer。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useDismiss, type Placement } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import type { DropdownItem } from './types.js';

  type ItemKey = string | number;
  type Trigger = 'hover' | 'click' | 'contextMenu';
  // 12 方位全集（兼容旧的 bottomStart/bottomEnd/topStart）
  type Position = Placement;
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

  // --- contextMenu 触发：右键弹菜单，菜单定位到鼠标光标处 ---
  // 鼠标坐标存普通 $state，仅用于浮层 fixed 定位（红线 #3：命令式监听 + cleanup）。
  let cursorX = $state(0);
  let cursorY = $state(0);

  function onContextMenu(e: MouseEvent) {
    if (disabled || trigger !== 'contextMenu') return;
    e.preventDefault();
    cursorX = e.clientX;
    cursorY = e.clientY;
    setOpen(true);
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

  // --- DOM 引用：触发根 + portal 浮层菜单（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
  let menuEl = $state<HTMLDivElement | null>(null);

  // --- useDismiss (红线 #3)：menu portal 出 root 子树后，需把 menuEl 列为内部 ---
  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: closeOnEsc,
      outsideClick: true,
      extraTargets: [menuEl],
    });
    return cleanup;
  });

  // contextMenu 浮层定位：portal 到 body + position:fixed 到光标 x/y。
  // floating action 只支持元素锚点，故 contextMenu 用此命令式 action 直接落点光标。
  function cursorFloating(node: HTMLElement, coords: { x: number; y: number }) {
    if (typeof document === 'undefined') {
      return { update() {}, destroy() {} };
    }
    document.body.appendChild(node);
    node.style.position = 'fixed';
    node.style.margin = '0';

    function place(x: number, y: number) {
      const rect = node.getBoundingClientRect();
      // 防止越出视口右/下边缘：超出则向左/上贴边。
      const left = Math.max(0, Math.min(x, window.innerWidth - rect.width));
      const top = Math.max(0, Math.min(y, window.innerHeight - rect.height));
      node.style.insetInlineStart = `${Math.round(left)}px`;
      node.style.insetBlockStart = `${Math.round(top)}px`;
    }

    place(coords.x, coords.y);
    return {
      update(next: { x: number; y: number }) {
        place(next.x, next.y);
      },
      destroy() {
        node.remove();
      },
    };
  }

  // contextmenu 监听绑触发根，命令式 + cleanup（红线 #3）。
  $effect(() => {
    if (trigger !== 'contextMenu' || !rootEl) return;
    const el = rootEl;
    el.addEventListener('contextmenu', onContextMenu);
    return () => el.removeEventListener('contextmenu', onContextMenu);
  });

  $effect(() => clearTimers);

  // portal 后 menu 不在 root 子树内，hover 移到 menu 上需维持 open。
  function onMenuPointerEnter() {
    if (trigger !== 'hover') return;
    clearTimers();
  }
  function onMenuPointerLeave() {
    if (trigger !== 'hover') return;
    clearTimers();
    leaveTimer = setTimeout(() => setOpen(false), mouseLeaveDelay);
  }

  const cls = $derived(
    [
      'cd-dropdown',
      `cd-dropdown--${size}`,
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

  {#snippet menuItems()}
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
  {/snippet}

  {#if isOpen && trigger === 'contextMenu'}
    <!-- contextMenu：浮层 portal 到 body 并定位到光标 x/y -->
    <div
      class="cd-dropdown__menu"
      id={menuId}
      bind:this={menuEl}
      use:cursorFloating={{ x: cursorX, y: cursorY }}
      role="menu"
      tabindex="-1"
      aria-activedescendant={activeItemId}
      onkeydown={onMenuKeydown}
    >
      {@render menuItems()}
    </div>
  {:else if isOpen}
    <div
      class="cd-dropdown__menu"
      id={menuId}
      bind:this={menuEl}
      use:floating={{ trigger: rootEl, placement: position, autoAdjust: true, offset: 4 }}
      role="menu"
      tabindex="-1"
      aria-activedescendant={activeItemId}
      onkeydown={onMenuKeydown}
      onpointerenter={onMenuPointerEnter}
      onpointerleave={onMenuPointerLeave}
    >
      {@render menuItems()}
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
  /* 浮层 portal 到 body，由 JS 写 position:fixed + transform 定位 */
  .cd-dropdown__menu {
    z-index: var(--cd-dropdown-z);
    min-inline-size: var(--cd-dropdown-min-width);
    padding-block: var(--cd-spacing-1);
    background: var(--cd-dropdown-bg);
    border-radius: var(--cd-dropdown-radius);
    box-shadow: var(--cd-dropdown-shadow);
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
