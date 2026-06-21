<!--
  Menu — see specs/components/navigation/Menu.spec.md
  基础子集: vertical + inline 模式, 数据驱动 items (含 SubMenu 子项),
  selectedKeys 单选, openKeys 展开/收起, navigation 语义 (role=menu/menuitem)。
  受控/非受控 (红线 #1: 不回写 prop, 仅 onChange/onOpenChange)。
  展开状态用本地 Set $state (红线 #2: 不读挂载 registry)。
  vertical 模式: SubMenu 改为 hover 弹出浮层 (复用 _floating, 顶层 bottomStart + 嵌套 rightStart, 多级嵌套),
  进入/离开带延迟避免缝隙抖动; inline 模式保持内联展开。
  horizontal 模式: 顶部菜单栏 (role=menubar), 顶层项横排 + ←→ roving 键盘切换, SubMenu 向下弹浮层 (复用 MenuPopupNode)。
  multiple 多选: 点叶子项 toggle 选中态, selectedKeys 可含多项同时高亮 + 勾选标记 (role=menuitemcheckbox/aria-checked);
  受控不回写 (红线 #1), 父组件据 onSelect(key) 自行 toggle; 非受控内部维护多选 Set。
  purpose 语义区分 (红线 #2: role 由 deriveMenuSemantics 纯函数派生):
    'menu' (默认, 命令式菜单): role=menu/menuitem + roving tabindex, 叶子 button + onClick, 行为完全向后兼容;
    'navigation' (站点导航): <nav> landmark 包裹 ul, 含 href 的叶子渲染原生 <a href> 走浏览器链接 + Tab 键序,
    不用 menuitem role (改用原生 list/link 语义)。
-->
<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import MenuPopupNode from './MenuPopupNode.svelte';
  import { deriveMenuSemantics, isDivider, isGroup } from './types.js';
  import type { MenuItemDef, MenuItemNode, MenuKey, MenuPurpose } from './types.js';

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
    /** inline 模式下折叠为图标轨：仅显图标、容器变窄，有子菜单的项 hover 向右弹浮层 */
    inlineCollapsed?: boolean;
    /** 多选模式：点击叶子项 toggle 其选中态，selectedKeys 可含多项同时高亮（默认单选） */
    multiple?: boolean;
    /**
     * 语义用途（默认 'menu'）：
     * 'menu' = 命令式菜单（role=menu/menuitem + roving，执行操作）；
     * 'navigation' = 站点导航（nav landmark + 含 href 叶子渲染 <a>，原生链接语义）。
     */
    purpose?: MenuPurpose;
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
    inlineCollapsed = false,
    multiple = false,
    purpose = 'menu',
    onSelect,
    onOpenChange,
    ariaLabel,
  }: Props = $props();

  // 折叠仅在 inline 模式生效；其它模式忽略以保持向后兼容。
  const collapsed = $derived(mode === 'inline' && inlineCollapsed);

  // role/语义由纯函数派生（红线 #2）：navigation 用原生 nav/list/link，menu 用 menu/menuitem。
  const sem = $derived(deriveMenuSemantics(purpose, mode, multiple));
  const navigation = $derived(sem.navigation);

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

  function hasChildren(item: MenuItemNode): boolean {
    return !!item.children && item.children.length > 0;
  }

  function selectLeaf(item: MenuItemNode) {
    if (item.disabled) return;
    // 非受控才回写内部 Set：multiple 下 toggle（已选取消/未选加入），单选下替换。
    if (!isSelectControlled) {
      if (multiple) {
        if (innerSelected.has(item.key)) innerSelected.delete(item.key);
        else innerSelected.add(item.key);
      } else {
        innerSelected.clear();
        innerSelected.add(item.key);
      }
    }
    // 受控由父组件依据 onSelect(key) 自行维护 selectedKeys（红线 #1：不回写 prop）。
    onSelect?.(item.key);
  }

  function toggleSub(item: MenuItemNode) {
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
    [
      'cd-menu',
      `cd-menu--${mode}`,
      `cd-menu--${size}`,
      collapsed ? 'cd-menu--collapsed' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // horizontal menubar：←→ 在顶层项间 roving 移动焦点（顶层是 li 直下的可聚焦元素）
  let rootEl = $state<HTMLUListElement | null>(null);
  function onMenubarKeydown(e: KeyboardEvent) {
    // navigation 用途用原生链接 + Tab 键序，不接管 ←→ roving（红线: 不破坏原生导航）。
    if (sem.navigation || mode !== 'horizontal') return;
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
  {#each list as item, i (item.key ?? `__cd-menu-${level}-${i}`)}
    {@const indent = `calc(var(--cd-menu-item-padding) + ${level} * ${inlineIndent}px)`}
    {#if isDivider(item)}
      <li class="cd-menu__divider" role={sem.navigation ? undefined : 'separator'}></li>
    {:else if isGroup(item)}
      <li class="cd-menu__item cd-menu__item--group" role={sem.structuralRole}>
        <div
          class="cd-menu__group-title"
          style="padding-inline-start: {indent}"
          id="cd-menu-group-{item.key ?? `${level}-${i}`}"
        >
          {item.label}
        </div>
        <ul
          class="cd-menu__group-list"
          role={sem.groupListRole}
          aria-labelledby="cd-menu-group-{item.key ?? `${level}-${i}`}"
        >
          {@render renderItems(item.children, level)}
        </ul>
      </li>
    {:else if hasChildren(item)}
      {@const open = isOpen(item.key)}
      <li class="cd-menu__item cd-menu__item--submenu" role={sem.structuralRole}>
        <button
          type="button"
          class="cd-menu__title"
          role={sem.submenuTitleRole}
          aria-haspopup="true"
          aria-expanded={open}
          aria-disabled={item.disabled || undefined}
          disabled={item.disabled || undefined}
          style="padding-inline-start: {indent}"
          onclick={() => toggleSub(item)}
        >
          {#if item.icon}<span class="cd-menu__icon" aria-hidden="true">{@render item.icon()}</span>{/if}
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
          <ul class="cd-menu__sub" role={sem.subListRole}>
            {@render renderItems(item.children ?? [], level + 1)}
          </ul>
        {/if}
      </li>
    {:else}
      {@const selected = isSelected(item.key)}
      <li class="cd-menu__item" role={sem.structuralRole}>
        {#if sem.navigation && item.href !== undefined}
          <!-- navigation 用途：含 href 叶子渲染原生 <a>，走浏览器链接 + Tab 键序 -->
          <a
            class="cd-menu__link"
            class:cd-menu__link--selected={selected}
            href={item.disabled ? undefined : item.href}
            target={item.target}
            rel={item.rel}
            aria-current={selected ? 'page' : undefined}
            aria-disabled={item.disabled || undefined}
            style="padding-inline-start: {indent}"
            onclick={() => selectLeaf(item)}
          >
            {#if item.icon}<span class="cd-menu__icon" aria-hidden="true">{@render item.icon()}</span>{/if}
            <span class="cd-menu__label">{item.label}</span>
          </a>
        {:else}
          <button
            type="button"
            class="cd-menu__link"
            class:cd-menu__link--selected={selected}
            role={sem.leafRole}
            aria-current={!sem.navigation && !multiple && selected ? 'true' : undefined}
            aria-checked={multiple ? selected : undefined}
            aria-disabled={item.disabled || undefined}
            disabled={item.disabled || undefined}
            style="padding-inline-start: {indent}"
            onclick={() => selectLeaf(item)}
          >
            {#if item.icon}<span class="cd-menu__icon" aria-hidden="true">{@render item.icon()}</span>{/if}
            <span class="cd-menu__label">{item.label}</span>
            {#if multiple}
              <span class="cd-menu__check" class:cd-menu__check--on={selected} aria-hidden="true">
                <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
                  <path fill="none" stroke="currentColor" stroke-width="2" d="M3 8.5l3.5 3.5L13 5" />
                </svg>
              </span>
            {/if}
          </button>
        {/if}
      </li>
    {/if}
  {/each}
{/snippet}

{#snippet menuList()}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <ul
    class={cls}
    role={sem.listRole}
    aria-label={sem.navigation ? undefined : ariaLabel}
    aria-orientation={!sem.navigation && mode === 'horizontal' ? 'horizontal' : undefined}
    bind:this={rootEl}
    onkeydown={onMenubarKeydown}
  >
    {#if collapsed}
      {#each items as item, i (item.key ?? `__cd-menu-top-${i}`)}
        <MenuPopupNode
          {item}
          placement="rightStart"
          collapsed
          {multiple}
          {navigation}
          {isSelected}
          onSelectLeaf={selectLeaf}
          onCloseAll={() => {}}
        />
      {/each}
    {:else if mode === 'vertical' || mode === 'horizontal'}
      {#each items as item, i (item.key ?? `__cd-menu-top-${i}`)}
        <MenuPopupNode
          {item}
          placement="bottomStart"
          {multiple}
          {navigation}
          {isSelected}
          onSelectLeaf={selectLeaf}
          onCloseAll={() => {}}
        />
      {/each}
    {:else}
      {@render renderItems(items, 0)}
    {/if}
  </ul>
{/snippet}

{#if sem.navigation}
  <!-- navigation 用途：nav landmark 包裹原生 list/link，提供站点导航地标语义 -->
  <nav class="cd-menu-nav" aria-label={ariaLabel}>
    {@render menuList()}
  </nav>
{:else}
  {@render menuList()}
{/if}

<style>
  /* navigation 用途的 nav landmark 包裹：不引入额外盒模型，仅作语义地标 */
  .cd-menu-nav {
    display: contents;
  }
  .cd-menu {
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--cd-menu-bg);
    color: var(--cd-menu-item-color);
  }
  /* navigation 叶子用 <a> 渲染：抹平默认下划线/颜色，复用 link 视觉 */
  .cd-menu a.cd-menu__link {
    text-decoration: none;
  }
  .cd-menu a.cd-menu__link[aria-disabled='true'] {
    color: var(--cd-menu-item-color-disabled);
    cursor: not-allowed;
    pointer-events: none;
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
  /* 折叠图标轨：容器收窄到仅容图标 + padding */
  .cd-menu--collapsed {
    inline-size: var(--cd-menu-collapsed-width, calc(var(--cd-menu-item-height) + var(--cd-spacing-2)));
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
  /* 分隔符：水平细线，不可交互 */
  .cd-menu__divider {
    block-size: 1px;
    margin-block: var(--cd-spacing-1);
    background: var(--cd-menu-border-color, var(--cd-color-border));
  }
  /* 分组：始终展开的分区标题 + 组内项列表 */
  .cd-menu__group-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-menu__group-title {
    display: flex;
    align-items: center;
    block-size: var(--cd-menu-item-height);
    padding-inline: var(--cd-menu-item-padding);
    color: var(--cd-menu-item-color-disabled);
    font-size: var(--cd-font-size-1);
    cursor: default;
    user-select: none;
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
  .cd-menu__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--cd-menu-item-color);
  }
  .cd-menu__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--cd-menu-item-color-selected);
    opacity: 0;
  }
  .cd-menu__check--on {
    opacity: 1;
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
