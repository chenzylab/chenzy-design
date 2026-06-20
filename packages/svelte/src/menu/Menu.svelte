<!--
  Menu — see specs/components/navigation/Menu.spec.md
  基础子集: vertical + inline 模式, 数据驱动 items (含 SubMenu 子项),
  selectedKeys 单选, openKeys 展开/收起, navigation 语义 (role=menu/menuitem)。
  受控/非受控 (红线 #1: 不回写 prop, 仅 onChange/onOpenChange)。
  展开状态用本地 Set $state (红线 #2: 不读挂载 registry)。
  vertical 模式: SubMenu 改为 hover 弹出浮层 (复用 _floating, 顶层 bottomStart + 嵌套 rightStart, 多级嵌套),
  进入/离开带延迟避免缝隙抖动; inline 模式保持内联展开。
  horizontal 模式: 顶部菜单栏 (role=menubar), 顶层项横排 + ←→ roving 键盘切换, SubMenu 向下弹浮层 (复用 MenuPopupNode)。
  TODO(延后): inlineCollapsed 图标轨、multiple、commands purpose、nav+links 语义区分。
-->
<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import MenuPopupNode from './MenuPopupNode.svelte';
  import type { MenuItemDef, MenuKey } from './types.js';

  type Mode = 'vertical' | 'inline' | 'horizontal';
  type Size = 'small' | 'default' | 'large';

  interface Props {
    items?: MenuItemDef[];
    mode?: Mode;
    selectedKeys?: MenuKey[];
    defaultSelectedKeys?: MenuKey[];
    openKeys?: MenuKey[];
    defaultOpenKeys?: MenuKey[];
    size?: Size;
    inlineIndent?: number;
    onSelect?: (key: MenuKey) => void;
    onOpenChange?: (keys: MenuKey[]) => void;
    ariaLabel?: string;
  }

  let {
    items = [],
    mode = 'vertical',
    selectedKeys,
    defaultSelectedKeys = [],
    openKeys,
    defaultOpenKeys = [],
    size = 'default',
    inlineIndent = 24,
    onSelect,
    onOpenChange,
    ariaLabel,
  }: Props = $props();

  function getInitialSelected(): SvelteSet<MenuKey> {
    return new SvelteSet(defaultSelectedKeys);
  }
  function getInitialOpen(): SvelteSet<MenuKey> {
    return new SvelteSet(defaultOpenKeys);
  }

  // --- 受控 selectedKeys (红线 #1): 不回写 prop, 仅 onSelect ---
  const isSelectControlled = $derived(selectedKeys !== undefined);
  const innerSelected = $state<SvelteSet<MenuKey>>(getInitialSelected());
  const currentSelected = $derived<ReadonlySet<MenuKey>>(
    isSelectControlled ? new SvelteSet(selectedKeys) : innerSelected,
  );

  // --- 受控 openKeys (红线 #1 + #2): 本地 Set 兜底, 仅 onOpenChange ---
  const isOpenControlled = $derived(openKeys !== undefined);
  const innerOpen = $state<SvelteSet<MenuKey>>(getInitialOpen());
  const currentOpen = $derived<ReadonlySet<MenuKey>>(
    isOpenControlled ? new SvelteSet(openKeys) : innerOpen,
  );

  function isSelected(key: MenuKey): boolean {
    return currentSelected.has(key);
  }

  function isOpen(key: MenuKey): boolean {
    return currentOpen.has(key);
  }

  function hasChildren(item: MenuItemDef): boolean {
    return !!item.children && item.children.length > 0;
  }

  function selectLeaf(item: MenuItemDef) {
    if (item.disabled) return;
    if (!isSelectControlled) {
      innerSelected.clear();
      innerSelected.add(item.key);
    }
    onSelect?.(item.key);
  }

  function toggleSub(item: MenuItemDef) {
    if (item.disabled) return;
    const willOpen = !currentOpen.has(item.key);
    const next = [...currentOpen].filter((k) => k !== item.key);
    if (willOpen) next.push(item.key);
    if (!isOpenControlled) {
      innerOpen.clear();
      for (const k of next) innerOpen.add(k);
    }
    onOpenChange?.(next);
  }

  const cls = $derived(
    ['cd-menu', `cd-menu--${mode}`, `cd-menu--${size}`].join(' '),
  );

  // horizontal menubar：←→ 在顶层项间 roving 移动焦点（顶层是 li 直下的可聚焦元素）
  let rootEl = $state<HTMLUListElement | null>(null);
  function onMenubarKeydown(e: KeyboardEvent) {
    if (mode !== 'horizontal') return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    if (!rootEl) return;
    // 顶层可聚焦项：每个顶层 li 内的第一个 menuitem 按钮/链接
    const tops = [...rootEl.children]
      .map((li) => li.querySelector<HTMLElement>('[role="menuitem"]'))
      .filter((el): el is HTMLElement => el !== null);
    if (tops.length === 0) return;
    const cur = tops.findIndex((el) => el === document.activeElement);
    e.preventDefault();
    let next = cur;
    if (e.key === 'ArrowRight') next = cur < 0 ? 0 : (cur + 1) % tops.length;
    else if (e.key === 'ArrowLeft') next = cur < 0 ? tops.length - 1 : (cur - 1 + tops.length) % tops.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tops.length - 1;
    tops[next]?.focus();
  }
</script>

{#snippet renderItems(list: MenuItemDef[], level: number)}
  {#each list as item (item.key)}
    {@const indent = `calc(var(--cd-menu-item-padding) + ${level} * ${inlineIndent}px)`}
    {#if hasChildren(item)}
      {@const open = isOpen(item.key)}
      <li class="cd-menu__item cd-menu__item--submenu" role="none">
        <button
          type="button"
          class="cd-menu__title"
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={open}
          aria-disabled={item.disabled || undefined}
          disabled={item.disabled || undefined}
          style="padding-inline-start: {indent}"
          onclick={() => toggleSub(item)}
        >
          <span class="cd-menu__label">{item.label}</span>
          <span
            class="cd-menu__arrow"
            class:cd-menu__arrow--open={open}
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
              <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
            </svg>
          </span>
        </button>
        {#if open}
          <ul class="cd-menu__sub" role="menu">
            {@render renderItems(item.children ?? [], level + 1)}
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
          style="padding-inline-start: {indent}"
          onclick={() => selectLeaf(item)}
        >
          <span class="cd-menu__label">{item.label}</span>
        </button>
      </li>
    {/if}
  {/each}
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<ul
  class={cls}
  role={mode === 'horizontal' ? 'menubar' : 'menu'}
  aria-label={ariaLabel}
  aria-orientation={mode === 'horizontal' ? 'horizontal' : undefined}
  bind:this={rootEl}
  onkeydown={onMenubarKeydown}
>
  {#if mode === 'vertical' || mode === 'horizontal'}
    {#each items as item (item.key)}
      <MenuPopupNode
        {item}
        placement="bottomStart"
        {isSelected}
        onSelectLeaf={selectLeaf}
        onCloseAll={() => {}}
      />
    {/each}
  {:else}
    {@render renderItems(items, 0)}
  {/if}
</ul>

<style>
  .cd-menu {
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--cd-menu-bg);
    color: var(--cd-menu-item-color);
  }
  /* horizontal 菜单栏：顶层项横排。顶层 li/控件由 MenuPopupNode 渲染（独立组件），
     故用 :global 穿透 scoped 边界控制其方向与宽度。 */
  .cd-menu--horizontal {
    display: flex;
    align-items: stretch;
    border-block-end: 1px solid var(--cd-menu-border-color, var(--cd-color-border));
  }
  .cd-menu--horizontal > :global(.cd-menu__item) {
    display: flex;
  }
  .cd-menu--horizontal > :global(.cd-menu__item) > :global(.cd-menu__link),
  .cd-menu--horizontal > :global(.cd-menu__item) > :global(.cd-menu__title) {
    inline-size: auto;
  }
  .cd-menu__item {
    margin: 0;
    padding: 0;
  }
  .cd-menu__sub {
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
    transition: background var(--cd-motion-duration-fast)
      var(--cd-motion-ease-standard);
  }
  .cd-menu--small .cd-menu__link,
  .cd-menu--small .cd-menu__title {
    font-size: var(--cd-font-size-1);
  }
  .cd-menu--large .cd-menu__link,
  .cd-menu--large .cd-menu__title {
    font-size: var(--cd-font-size-3);
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
  .cd-menu__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-menu-submenu-arrow-color);
    transition: transform var(--cd-motion-duration-fast)
      var(--cd-motion-ease-standard);
  }
  .cd-menu__arrow--open {
    transform: rotate(90deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-menu__link,
    .cd-menu__title,
    .cd-menu__arrow {
      transition: none;
    }
  }
</style>
