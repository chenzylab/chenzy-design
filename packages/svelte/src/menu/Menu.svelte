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
  import type { Snippet } from 'svelte';
  import type { Placement } from '@chenzy-design/core';
  import type { MenuItemDef, MenuItemNode, MenuKey, MenuPurpose } from './types.js';

  type Mode = 'vertical' | 'inline' | 'horizontal';
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type TriggerSubMenuAction = 'hover' | 'click';

  interface TooltipProps {
    content?: string;
    position?: Placement;
    theme?: 'dark' | 'light';
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
  }

  interface Props {
    items?: MenuItemDef[];
    mode?: Mode;
    selectedKeys?: MenuKey[];
    defaultSelectedKeys?: MenuKey[];
    openKeys?: MenuKey[];
    defaultOpenKeys?: MenuKey[];
    size?: Size;
    inlineIndent?: number;
    /**
     * 缩进限制（默认 true）：仅一级导航缩进，深层子项不按层级累加缩进。
     * 设为 false 时按 level × inlineIndent 逐级缩进。仅 inline 模式有意义。
     */
    limitIndent?: boolean;
    /**
     * 含子菜单项的展开箭头位置（默认 'right'）：'left' 置于 label 前、'right' 置于末尾。
     * 仅 inline 模式（内联展开的 SubMenu title）生效。
     */
    toggleIconPosition?: 'left' | 'right';
    /** 自定义展开箭头图标（Snippet，替代默认三角形）。 */
    expandIcon?: Snippet;
    /** 子菜单展开/浮层动画开关（默认 true）。false 时去除展开过渡与浮层动画。 */
    motion?: boolean;
    /** inline 模式下折叠为图标轨：仅显图标、容器变窄，有子菜单的项 hover 向右弹浮层 */
    inlineCollapsed?: boolean;
    /** 多选模式：点击叶子项 toggle 其选中态，selectedKeys 可含多项同时高亮（默认单选） */
    multiple?: boolean;
    /**
     * 浮层子菜单触发方式（仅 vertical/horizontal/collapsed 浮层模式生效）：
     * 'hover'（默认推导）= 鼠标悬停带 open/close 延迟展开/收起；
     * 'click' = 点击 title 切换浮层（不随 hover 开合）。
     * 缺省时按 mode 推导：horizontal 默认 hover，其余 hover（inline 内联不涉及浮层）。
     */
    triggerSubMenuAction?: TriggerSubMenuAction;
    /** hover 触发时子菜单浮层展开延迟(ms) */
    subMenuOpenDelay?: number;
    /** hover 触发时子菜单浮层收起延迟(ms) */
    subMenuCloseDelay?: number;
    /** 浮层子菜单挂载容器，缺省 document.body（透传 floating action getContainer） */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /**
     * 校验态（用于表单内菜单选择，少见）：'default' | 'warning' | 'error'。
     * 非 default 时给根节点加 cd-menu--{status} 类并以 token 着色选中指示条/边框，
     * error 时根节点 aria-invalid=true。默认 'default'。
     */
    status?: Status;
    /**
     * 浮层子菜单隐藏时是否卸载其内容 DOM（默认 false：保留 DOM 仅隐藏，重显不重建）。
     * 仅作用于 vertical/horizontal/collapsed 浮层模式的 hover/click 子菜单浮层；
     * inline 内联展开不涉及浮层，始终随展开态挂载/卸载。
     */
    destroyOnHide?: boolean;
    /** 整体禁用：所有项不可交互（叶子/子菜单 title 均 disabled） */
    disabled?: boolean;
    /**
     * 语义用途（默认 'menu'）：
     * 'menu' = 命令式菜单（role=menu/menuitem + roving，执行操作）；
     * 'navigation' = 站点导航（nav landmark + 含 href 叶子渲染 <a>，原生链接语义）。
     */
    purpose?: MenuPurpose;
    onSelect?: (key: MenuKey) => void;
    onOpenChange?: (keys: MenuKey[]) => void;
    ariaLabel?: string;
    /**
     * 折叠模式（inlineCollapsed=true）下顶层项的 Tooltip 配置。
     * content 默认为项 label；position→placement、theme、mouseEnterDelay、mouseLeaveDelay 透传给 Tooltip。
     */
    tooltipProps?: TooltipProps;
    /**
     * 自定义叶子项内容包裹 Snippet，接收 { item, children }。
     * children 为默认的 <a> 或 <button>，可在外层包一层自定义容器。
     */
    renderWrapper?: Snippet<[{ item: MenuItemNode; children: Snippet }]>;
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
    limitIndent = true,
    toggleIconPosition = 'right',
    expandIcon,
    motion = true,
    inlineCollapsed = false,
    multiple = false,
    triggerSubMenuAction,
    subMenuOpenDelay = 100,
    subMenuCloseDelay = 100,
    status = 'default',
    destroyOnHide = false,
    getPopupContainer,
    disabled = false,
    purpose = 'menu',
    onSelect,
    onOpenChange,
    ariaLabel,
    tooltipProps,
    renderWrapper,
  }: Props = $props();

  // 浮层子菜单触发方式：未显式指定时按 mode 推导（全部默认 hover；inline 走内联不涉及浮层）。
  const subTrigger = $derived<TriggerSubMenuAction>(triggerSubMenuAction ?? 'hover');

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

  // 整体 disabled 叠加单项 disabled：模板据此渲染 aria-disabled/disabled。
  function isItemDisabled(item: MenuItemNode): boolean {
    return disabled || !!item.disabled;
  }

  function selectLeaf(item: MenuItemNode) {
    if (disabled || item.disabled) return;
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
    if (disabled || item.disabled) return;
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
      status !== 'default' ? `cd-menu--${status}` : '',
      collapsed ? 'cd-menu--collapsed' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // --- roving tabindex / 键盘导航（a11y §6 / WAI-ARIA APG Menu）---
  // rootEl 普通引用（bind:this），命令式 focus()/tabindex 写入用，非 render 期读 DOM。
  let rootEl = $state<HTMLUListElement | null>(null);

  // horizontal menubar 顶层项：每个顶层 li 内第一个 menuitem（←→ roving 用）。
  function menubarTops(): HTMLElement[] {
    if (!rootEl) return [];
    return [...rootEl.children]
      .map((li) => li.querySelector<HTMLElement>('[role="menuitem"]'))
      .filter((el): el is HTMLElement => el !== null);
  }

  // vertical/inline：当前可见、可聚焦的 menuitem，按 DOM 顺序漫游
  // （inline renderItems 与 vertical MenuPopupNode 均产出 [role="menuitem"] 按钮）。
  // 排除 disabled（原生 disabled 已移出焦点序）与隐藏浮层内的项（仅漫游当前可见层）。
  function verticalItems(): HTMLElement[] {
    if (!rootEl) return [];
    return [...rootEl.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter(
      (el) =>
        !el.hasAttribute('disabled') &&
        // 隐藏浮层子菜单（cd-menu__sub--hidden / aria-hidden）内的项不参与漫游
        el.closest('[aria-hidden="true"]') === null &&
        el.offsetParent !== null,
    );
  }

  // 把 roving tabindex 收敛到单一停靠点：仅 active 项 tabindex=0，其余 -1
  // （命令式写 DOM，非 render 期；红线 #2：不在 render 期写状态）。
  function applyRovingTabindex(items: HTMLElement[], active: HTMLElement | null) {
    const stop = active ?? items[0] ?? null;
    for (const el of items) el.tabIndex = el === stop ? 0 : -1;
  }

  // 挂载后 / items 变化后：vertical/inline 模式收敛 roving 停靠点为首项。
  $effect(() => {
    if (sem.navigation || mode === 'horizontal') return;
    void items; // items 变化重算
    const list = verticalItems();
    if (list.length === 0) return;
    const focused = list.find((el) => el === document.activeElement) ?? null;
    applyRovingTabindex(list, focused);
  });

  // typeahead 缓冲（普通簿记变量，不参与 render 响应式；红线 #2）。
  let typeBuffer = '';
  let typeTimer: ReturnType<typeof setTimeout> | undefined;
  function pushType(ch: string): string {
    if (typeTimer !== undefined) clearTimeout(typeTimer);
    typeBuffer += ch.toLowerCase();
    typeTimer = setTimeout(() => {
      typeBuffer = '';
      typeTimer = undefined;
    }, 500);
    return typeBuffer;
  }
  $effect(() => () => {
    if (typeTimer !== undefined) clearTimeout(typeTimer);
  });

  function itemText(el: HTMLElement): string {
    return (el.querySelector('.cd-menu__label')?.textContent ?? el.textContent ?? '')
      .trim()
      .toLowerCase();
  }

  function onMenuKeydown(e: KeyboardEvent) {
    // navigation 用途用原生链接 + Tab 键序，不接管 roving（红线: 不破坏原生导航）。
    if (sem.navigation) return;

    if (mode === 'horizontal') {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
      const tops = menubarTops();
      if (tops.length === 0) return;
      const cur = tops.findIndex((el) => el === document.activeElement);
      e.preventDefault();
      let next = cur;
      if (e.key === 'ArrowRight') next = cur < 0 ? 0 : (cur + 1) % tops.length;
      else if (e.key === 'ArrowLeft') next = cur < 0 ? tops.length - 1 : (cur - 1 + tops.length) % tops.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tops.length - 1;
      tops[next]?.focus();
      applyRovingTabindex(tops, tops[next] ?? null);
      return;
    }

    // vertical / inline：↑↓ 漫游、Home/End 跳首末、typeahead 首字母、Esc 收起/关闭子菜单。
    const list = verticalItems();
    if (list.length === 0) return;
    const cur = list.findIndex((el) => el === document.activeElement);

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      let next = cur;
      if (e.key === 'ArrowDown') next = cur < 0 ? 0 : (cur + 1) % list.length;
      else if (e.key === 'ArrowUp') next = cur < 0 ? list.length - 1 : (cur - 1 + list.length) % list.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = list.length - 1;
      const target = list[next];
      if (target) {
        target.focus();
        applyRovingTabindex(list, target);
      }
      return;
    }

    if (e.key === 'Escape') {
      // 收起当前聚焦项所在的展开子菜单，焦点返回其触发器（APG）。
      const active = document.activeElement as HTMLElement | null;
      const titleEl = active?.closest<HTMLElement>('.cd-menu__item--submenu')?.querySelector<HTMLElement>('.cd-menu__title[aria-expanded="true"]');
      const sub = active?.closest<HTMLElement>('.cd-menu__sub');
      const parentTitle = sub?.previousElementSibling as HTMLElement | null;
      if (parentTitle?.matches('.cd-menu__title')) {
        // 焦点在子列表内：收起父级子菜单并把焦点返回父触发器。
        const key = parentTitle.dataset.menuKey;
        if (key !== undefined) {
          collapseByKey(key);
          parentTitle.focus();
          e.preventDefault();
        }
        return;
      }
      if (titleEl?.dataset.menuKey !== undefined) {
        // 焦点在已展开的 SubMenu 触发器上：收起自身。
        collapseByKey(titleEl.dataset.menuKey);
        e.preventDefault();
      }
      return;
    }

    // typeahead：单字符（可打印、非组合键）→ 跳到首字母匹配项。
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /\S/.test(e.key)) {
      const buf = pushType(e.key);
      const start = cur < 0 ? 0 : cur;
      // 从当前项之后开始环绕查找，单字符重复时跳到下一个同首字母项。
      const offset = buf.length === 1 ? 1 : 0;
      for (let i = 0; i < list.length; i += 1) {
        const idx = (start + offset + i) % list.length;
        if (itemText(list[idx]!).startsWith(buf)) {
          e.preventDefault();
          list[idx]!.focus();
          applyRovingTabindex(list, list[idx]!);
          return;
        }
      }
    }
  }

  // 焦点进入某 menuitem（含鼠标点击）→ 把 roving 停靠点同步到它（单一 Tab 停靠点）。
  function onMenuFocusin(e: FocusEvent) {
    if (sem.navigation || mode === 'horizontal') return;
    const t = e.target as HTMLElement | null;
    if (!t || t.getAttribute('role') !== 'menuitem') return;
    applyRovingTabindex(verticalItems(), t);
  }

  // 按 key 收起内联展开的 SubMenu（data-menu-key 为字符串，需按 String 匹配原 key）。
  function collapseByKey(key: string) {
    const matched = [...currentOpen].find((k) => String(k) === key);
    if (matched === undefined) return;
    const next = [...currentOpen].filter((k) => k !== matched);
    if (!isOpenControlled) {
      innerOpen.clear();
      for (const k of next) innerOpen.add(k);
    }
    onOpenChange?.(next);
  }
</script>

{#snippet renderItems(list: MenuItemDef[], level: number)}
  {#each list as item, i (item.key ?? `__cd-menu-${level}-${i}`)}
    {@const indentLevel = limitIndent ? Math.min(level, 1) : level}
    {@const indent = `calc(var(--cd-menu-item-padding) + ${indentLevel} * ${inlineIndent}px)`}
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
          data-menu-key={String(item.key)}
          aria-haspopup="true"
          aria-expanded={open}
          aria-disabled={isItemDisabled(item) || undefined}
          disabled={isItemDisabled(item) || undefined}
          style="padding-inline-start: {indent}"
          onclick={() => toggleSub(item)}
          onkeydown={(e) => {
            // 内联 SubMenu 触发器：→/Enter/Space 展开，←/Esc 收起（APG disclosure）。
            if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
              if (!isItemDisabled(item) && !isOpen(item.key)) {
                e.preventDefault();
                toggleSub(item);
              }
            } else if (e.key === 'ArrowLeft') {
              if (isOpen(item.key)) {
                e.preventDefault();
                toggleSub(item);
              }
            }
          }}
        >
          {#if toggleIconPosition === 'left'}
            <span
              class="cd-menu__arrow cd-menu__arrow--left"
              class:cd-menu__arrow--open={open}
              aria-hidden="true"
            >
              {#if expandIcon}{@render expandIcon()}{:else}
                <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
                  <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
                </svg>
              {/if}
            </span>
          {/if}
          {#if item.icon}<span class="cd-menu__icon" aria-hidden="true">{@render item.icon()}</span>{/if}
          <span class="cd-menu__label">{item.label}</span>
          {#if toggleIconPosition === 'right'}
            <span
              class="cd-menu__arrow"
              class:cd-menu__arrow--open={open}
              aria-hidden="true"
            >
              {#if expandIcon}{@render expandIcon()}{:else}
                <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
                  <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
                </svg>
              {/if}
            </span>
          {/if}
        </button>
        {#if open}
          <ul
            class="cd-menu__sub"
            class:cd-menu__sub--motion={motion}
            role={sem.subListRole}
          >
            {@render renderItems(item.children ?? [], level + 1)}
          </ul>
        {/if}
      </li>
    {:else}
      {@const selected = isSelected(item.key)}
      <li class="cd-menu__item" role={sem.structuralRole}>
        {#if sem.navigation && item.href !== undefined}
          <!-- navigation 用途：含 href 叶子渲染原生 <a>，走浏览器链接 + Tab 键序 -->
          {#snippet inlineLeafLink()}
            <a
              class="cd-menu__link"
              class:cd-menu__link--selected={selected}
              href={isItemDisabled(item) ? undefined : item.href}
              target={item.target}
              rel={item.rel}
              aria-current={selected ? 'page' : undefined}
              aria-disabled={isItemDisabled(item) || undefined}
              style="padding-inline-start: {indent}"
              onclick={(e) => {
                item.onClick?.(e);
                selectLeaf(item);
              }}
              onmouseenter={item.onMouseEnter}
              onmouseleave={item.onMouseLeave}
            >
              {#if item.icon}<span class="cd-menu__icon" aria-hidden="true">{@render item.icon()}</span>{/if}
              <span class="cd-menu__label">{item.label}</span>
            </a>
          {/snippet}
          {#if renderWrapper}
            {@render renderWrapper({ item: item as MenuItemNode, children: inlineLeafLink })}
          {:else}
            {@render inlineLeafLink()}
          {/if}
        {:else}
          {#snippet inlineLeafButton()}
            <button
              type="button"
              class="cd-menu__link"
              class:cd-menu__link--selected={selected}
              role={sem.leafRole}
              aria-current={!sem.navigation && !multiple && selected ? 'true' : undefined}
              aria-checked={multiple ? selected : undefined}
              aria-disabled={isItemDisabled(item) || undefined}
              disabled={isItemDisabled(item) || undefined}
              style="padding-inline-start: {indent}"
              onclick={(e) => {
                item.onClick?.(e);
                selectLeaf(item);
              }}
              onmouseenter={item.onMouseEnter}
              onmouseleave={item.onMouseLeave}
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
          {/snippet}
          {#if renderWrapper}
            {@render renderWrapper({ item: item as MenuItemNode, children: inlineLeafButton })}
          {:else}
            {@render inlineLeafButton()}
          {/if}
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
    aria-invalid={status === 'error' || undefined}
    bind:this={rootEl}
    onkeydown={onMenuKeydown}
    onfocusin={onMenuFocusin}
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
          trigger={subTrigger}
          openDelay={subMenuOpenDelay}
          closeDelay={subMenuCloseDelay}
          {destroyOnHide}
          {getPopupContainer}
          parentDisabled={disabled}
          {...(tooltipProps !== undefined ? { tooltipProps } : {})}
          {...(renderWrapper !== undefined ? { renderWrapper } : {})}
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
          trigger={subTrigger}
          openDelay={subMenuOpenDelay}
          closeDelay={subMenuCloseDelay}
          {destroyOnHide}
          {getPopupContainer}
          parentDisabled={disabled}
          {...(renderWrapper !== undefined ? { renderWrapper } : {})}
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
  /* 水平导航配色对齐 Semi：默认项文字浅(text-2)、hover 文字变深(text-1) 且无背景、
     选中文字最深(text-0) + 无背景块、仅底部 2px 下划线指示。 */
  .cd-menu--horizontal > :global(.cd-menu__item) > :global(.cd-menu__link),
  .cd-menu--horizontal > :global(.cd-menu__item) > :global(.cd-menu__title) {
    inline-size: auto;
    background: transparent;
    color: var(--cd-color-text-2);
  }
  .cd-menu--horizontal > :global(.cd-menu__item) > :global(.cd-menu__link:hover),
  .cd-menu--horizontal > :global(.cd-menu__item) > :global(.cd-menu__title:hover) {
    background: transparent;
    color: var(--cd-color-text-1);
  }
  .cd-menu--horizontal > :global(.cd-menu__item) > :global(.cd-menu__link--selected) {
    background: transparent;
    color: var(--cd-color-text-0);
  }
  /* 选中下划线：压在菜单底部边框上（-1px 抵消 border-block-end）对齐成一条线；
     左右内缩到 item 内边距，使下划线对齐文字内容区（不盖到 padding 留白），更精致。 */
  .cd-menu--horizontal > :global(.cd-menu__item) > :global(.cd-menu__link--selected)::before {
    inset-block: auto -1px;
    inset-inline: var(--cd-menu-item-padding);
    inline-size: auto;
    block-size: 2px;
    border-radius: 1px;
  }
  /* 折叠图标轨：容器收窄到仅容图标 + padding */
  /* 折叠图标轨：撑满容器宽度（如 Nav/Sider 的折叠宽度），使图标居中、选中背景填满。
     min 用 token 兜底，避免容器未限宽时塌成 0。 */
  .cd-menu--collapsed {
    inline-size: 100%;
    min-inline-size: var(--cd-menu-collapsed-width, calc(var(--cd-menu-item-height) + var(--cd-spacing-2)));
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
  /* motion=true 时内联子菜单展开动画（淡入 + 轻微下移）；motion=false 关闭 */
  .cd-menu__sub--motion {
    animation: cd-menu-sub-in var(--cd-motion-duration-fast) var(--cd-motion-ease-standard) both;
  }
  @keyframes cd-menu-sub-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-menu__sub--motion {
      animation: none;
    }
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
  /* 校验态：用 token 着色选中指示条与选中文字（表单内菜单少见场景）。
     选中叶子可能由子组件 MenuPopupNode 渲染（vertical/horizontal/collapsed 浮层模式），
     故用 :global 穿透 scoped 边界匹配后代 link。 */
  .cd-menu--warning :global(.cd-menu__link--selected) {
    color: var(--cd-menu-color-warning, var(--cd-color-warning));
  }
  .cd-menu--warning :global(.cd-menu__link--selected::before) {
    background: var(--cd-menu-color-warning, var(--cd-color-warning));
  }
  .cd-menu--error :global(.cd-menu__link--selected) {
    color: var(--cd-menu-color-danger, var(--cd-color-danger));
  }
  .cd-menu--error :global(.cd-menu__link--selected::before) {
    background: var(--cd-menu-color-danger, var(--cd-color-danger));
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
  /* toggleIconPosition='left'：箭头置于 label 前，与后续内容留出间距 */
  .cd-menu__arrow--left {
    margin-inline-end: var(--cd-spacing-1);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-menu__link,
    .cd-menu__title,
    .cd-menu__arrow {
      transition: none;
    }
  }
</style>
