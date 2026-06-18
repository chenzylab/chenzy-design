<!--
  Menu — see specs/components/navigation/Menu.spec.md
  基础子集: vertical + inline 模式, 数据驱动 items (含 SubMenu 子项),
  selectedKeys 单选, openKeys 展开/收起, navigation 语义 (role=menu/menuitem)。
  受控/非受控 (红线 #1: 不回写 prop, 仅 onChange/onOpenChange)。
  展开状态用本地 Set $state (红线 #2: 不读挂载 registry)。
  TODO(延后): horizontal/menubar roving、inlineCollapsed 图标轨、
  hover 浮层子菜单、multiple、commands purpose、nav+links 语义区分。
-->
<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import type { MenuItemDef, MenuKey } from './types.js';

  type Mode = 'vertical' | 'inline';
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

<ul class={cls} role="menu" aria-label={ariaLabel}>
  {@render renderItems(items, 0)}
</ul>

<style>
  .cd-menu {
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--cd-menu-bg);
    color: var(--cd-menu-item-color);
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
