<!--
  Dropdown — see specs/components/navigation/Dropdown.spec.md
  基础子集：click/hover/contextMenu 触发、12 方位、菜单项、useDismiss、closeOnSelect、键盘导航。
  定位：portal 到 body + position:fixed，core computePosition + autoAdjustOverflow flip。
  contextMenu：右键 preventDefault + 记录光标 x/y，浮层 portal 到 body 并 fixed 落点光标。
  嵌套子菜单 / divider / group：与 Menu 对齐的判别联合（types.ts），菜单体经 DropdownItemNode 递归渲染，
  子浮层 hover/聚焦展开并 floating 到父项右侧（溢出翻转左侧）；键盘 →/←/↑↓/Esc 逐层导航。
  键盘 roving：焦点式（query 当前层可聚焦 menuitem 移动焦点），兼容嵌套与 divider/group。
  destroyOnClose：默认 false 时首开后保留浮层 DOM（仅 --hidden 显隐），true 时关闭即卸载 {#if}，重开重建。
  getPopupContainer：自定义浮层挂载容器（默认 body）；非 body 容器时 floating 切 position:absolute 相对容器定位，
    嵌套子菜单经 ctx 透传同容器，contextMenu 浮层亦挂同容器。
-->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  import { useId, useDismiss, type Placement } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import DropdownItemNode from './DropdownItemNode.svelte';
  import { isDropdownDivider, isDropdownGroup } from './types.js';
  import { DROPDOWN_CTX, type DropdownContext } from './context.js';
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
    /** 关闭即卸载浮层内容（{#if}），重开重建。默认 false：首开后保留 DOM 仅隐藏。 */
    destroyOnClose?: boolean;
    /** 浮层挂载容器，缺省 document.body。非 body 容器时改 absolute 定位相对该容器。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
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
    destroyOnClose = false,
    getPopupContainer,
    onSelect,
    onOpenChange,
    triggerContent,
    children,
  }: Props = $props();

  const loc = useLocale();

  const menuId = useId('cd-dropdown-menu');

  // 子菜单浮层经此 context 共享同一挂载容器（getPopupContainer）。
  setContext<DropdownContext>(DROPDOWN_CTX, {
    get getContainer() {
      return getPopupContainer;
    },
  });

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isControlled ? !!open : innerOpen);

  // --- destroyOnClose：默认 false 时首开后保留浮层 DOM（仅 --hidden 切显隐），
  //     true 时关闭即从 DOM 卸载（{#if shouldRender}），重开重建。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(destroyOnClose ? isOpen : isOpen || hasBeenOpened);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isControlled) innerOpen = next;
    onOpenChange?.(next);
  }

  function selectLeaf(key: ItemKey) {
    onSelect?.(key);
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

  // 顶层菜单可聚焦项：本层直属（不含子浮层里的）未禁用 menuitem。
  function topMenuItems(): HTMLElement[] {
    if (!menuEl) return [];
    return [...menuEl.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter(
      (el) => el.getAttribute('aria-disabled') !== 'true' && belongsToTopLevel(el),
    );
  }

  // 元素是否属于顶层菜单（不在任何子浮层 .cd-dropdown__sub 内）。
  function belongsToTopLevel(el: HTMLElement): boolean {
    return el.closest('.cd-dropdown__sub') === null;
  }

  function focusTopItem(delta: number) {
    const list = topMenuItems();
    if (list.length === 0) return;
    const cur = list.findIndex((el) => el === document.activeElement);
    let next: number;
    if (cur < 0) next = delta > 0 ? 0 : list.length - 1;
    else next = (cur + delta + list.length) % list.length;
    list[next]?.focus();
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
          focusFirstWhenReady();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
          focusFirstWhenReady();
        } else {
          focusTopItem(1);
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

  // 打开后浮层需在下一帧挂载完成才能聚焦首项。
  function focusFirstWhenReady() {
    requestAnimationFrame(() => {
      const list = topMenuItems();
      list[0]?.focus();
    });
  }

  function onMenuKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusTopItem(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusTopItem(-1);
        break;
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
  let menuEl = $state<HTMLUListElement | null>(null);

  // --- useDismiss (红线 #3)：仅复用 Escape；outside-click 自管理。---
  // 子菜单浮层各自 portal 到 body（动态多层），无法逐一列入 extraTargets，
  // 故 outside 判定改为：点在触发根 / 顶层菜单 / 任意 .cd-dropdown__sub 浮层内即「内部」。
  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: closeOnEsc,
      outsideClick: false,
      extraTargets: [menuEl],
    });
    return cleanup;
  });

  // outside-click 命令式监听 + cleanup（红线 #3）：识别多层子浮层为内部。
  $effect(() => {
    if (!isOpen || !rootEl) return;
    const root = rootEl;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node | null;
      if (root.contains(t)) return;
      if (menuEl && menuEl.contains(t)) return;
      if (t instanceof Element && t.closest('.cd-dropdown__sub')) return;
      setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  });

  // contextMenu 浮层定位：portal 到 body + position:fixed 到光标 x/y。
  // floating action 只支持元素锚点，故 contextMenu 用此命令式 action 直接落点光标。
  function cursorFloating(node: HTMLElement, coords: { x: number; y: number }) {
    if (typeof document === 'undefined') {
      return { update() {}, destroy() {} };
    }
    // 自定义容器（getPopupContainer）时挂同容器并改 absolute 相对容器定位。
    const container = getPopupContainer?.() ?? document.body;
    const useAbsolute = container !== document.body;
    container.appendChild(node);
    node.style.position = useAbsolute ? 'absolute' : 'fixed';
    node.style.margin = '0';

    function place(x: number, y: number) {
      const rect = node.getBoundingClientRect();
      // 防止越出视口右/下边缘：超出则向左/上贴边。
      let left = Math.max(0, Math.min(x, window.innerWidth - rect.width));
      let top = Math.max(0, Math.min(y, window.innerHeight - rect.height));
      if (useAbsolute) {
        // 光标坐标是视口系；转为容器局部坐标（减容器盒原点 + 加容器滚动）。
        const cRect = container.getBoundingClientRect();
        left = left - cRect.left + container.scrollLeft;
        top = top - cRect.top + container.scrollTop;
      }
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
  function onMenuPointerLeave(e: PointerEvent) {
    if (trigger !== 'hover') return;
    // 指针移入子菜单浮层（portal 到 body，在顶层 ul 之外）时不关闭整体。
    const related = e.relatedTarget as Node | null;
    if (related instanceof Element && related.closest('.cd-dropdown__sub')) return;
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

  {#snippet menuBody()}
    {#if children}
      {@render children()}
    {:else}
      {#each items as item, i (isDropdownDivider(item) || isDropdownGroup(item) ? `__cd-dd-top-${i}` : item.key)}
        <DropdownItemNode
          {item}
          onSelectLeaf={selectLeaf}
          onCloseAll={() => {}}
        />
      {/each}
    {/if}
  {/snippet}

  {#if isOpen && trigger === 'contextMenu'}
    <!-- contextMenu：浮层 portal 到 body 并定位到光标 x/y -->
    <ul
      class="cd-dropdown__menu"
      id={menuId}
      bind:this={menuEl}
      use:cursorFloating={{ x: cursorX, y: cursorY }}
      role="menu"
      tabindex="-1"
      onkeydown={onMenuKeydown}
    >
      {@render menuBody()}
    </ul>
  {:else if shouldRender}
    <!-- destroyOnClose=false 时关闭仍保留 DOM（--hidden 隐藏），true 时 !isOpen 即被 {#if} 卸载。 -->
    <ul
      class="cd-dropdown__menu"
      class:cd-dropdown__menu--hidden={!isOpen}
      id={menuId}
      bind:this={menuEl}
      use:floating={{ trigger: rootEl, placement: position, autoAdjust: true, offset: 4, getContainer: getPopupContainer, open: isOpen }}
      role="menu"
      tabindex="-1"
      aria-hidden={!isOpen || undefined}
      onkeydown={onMenuKeydown}
      onpointerenter={onMenuPointerEnter}
      onpointerleave={onMenuPointerLeave}
    >
      {@render menuBody()}
    </ul>
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
    margin: 0;
    padding-block: var(--cd-spacing-1);
    padding-inline: 0;
    list-style: none;
    z-index: var(--cd-dropdown-z);
    min-inline-size: var(--cd-dropdown-min-width);
    background: var(--cd-dropdown-bg);
    border-radius: var(--cd-dropdown-radius);
    box-shadow: var(--cd-dropdown-shadow);
  }
  /* destroyOnClose=false 关闭后保留 DOM 但不可见、不可交互、不占位 */
  .cd-dropdown__menu--hidden {
    display: none;
  }
</style>
