<!--
  Nav — 站点导航（对齐 Semi Navigation），独立渲染，不依赖 Menu。
  字段/回调对齐 Semi（itemKey/text/icon/items；富载荷回调）。自管理选中/展开/折叠受控与非受控、
  内联与浮层子导航、键盘与 a11y、Header（logo+text）/Footer（collapseButton）。

  mode：vertical 展开（内联子导航）/ vertical 折叠（图标轨 + 浮层子导航）/ horizontal（顶部 + 浮层）。

  范围：mode(vertical/horizontal)、items、header/footer、selected/open/collapsed 受控与非受控、
  multiple + onDeselect、limitIndent / toggleIconPosition / subNavMotion / tooltip 延迟 /
  renderWrapper / 声明式 Nav.Item·Nav.Sub。props 逐条对齐 Semi Navigation（无 Nav 级 disabled/ariaLabel 超集）。
  回调富载荷对齐 Semi（{itemKey,selectedKeys,selectedItems,domEvent,isOpen}）。
-->
<script lang="ts" module>
  export { NAV_CONTEXT_KEY } from './context.js';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext, untrack } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import type {
    NavItemDef,
    NavItemInput,
    NavKey,
    NavMode,
    NavHeaderConfig,
    NavFooterConfig,
    NavSelectData,
    NavClickData,
    NavOpenChangeData,
  } from './types.js';
  import {
    collectNavItemsByKeys,
    collectAncestorKeys,
    normalizeNavItems,
  } from './nav-foundation.js';
  import {
    MODE_VERTICAL,
    DEFAULT_SUBNAV_OPEN_DELAY,
    DEFAULT_SUBNAV_CLOSE_DELAY,
    DEFAULT_TOOLTIP_SHOW_DELAY,
    DEFAULT_TOOLTIP_HIDE_DELAY,
  } from './constants.js';
  import {
    NAV_CONTEXT_KEY,
    NAV_COLLECTOR_KEY,
    type NavContext,
    type NavCollector,
  } from './context.js';
  import NavItemRender from './NavItemRender.svelte';
  import NavHeader from './Header.svelte';
  import NavFooter from './Footer.svelte';

  interface Props {
    /** 导航项列表（字段对齐 Semi：itemKey/text/icon/items）。string 项取值作 text 与 itemKey。 */
    items?: NavItemInput[];
    /** 导航方向：vertical（侧边，默认）/ horizontal（顶部）。 */
    mode?: NavMode;
    /** 受控选中项 key 数组。 */
    selectedKeys?: NavKey[];
    /** 默认选中项 key 数组（非受控）。 */
    defaultSelectedKeys?: NavKey[];
    /** 受控展开的子导航 key 数组（仅 vertical 且未折叠有效）。 */
    openKeys?: NavKey[];
    /** 默认展开的子导航 key 数组（非受控）。 */
    defaultOpenKeys?: NavKey[];
    /** 多选模式（对齐 Semi multiple）：叠加选中，配合 onDeselect。 */
    multiple?: boolean;
    /** 受控折叠态（仅 vertical 有效）。 */
    isCollapsed?: boolean;
    /** 默认折叠态（非受控，仅 vertical 有效）。 */
    defaultIsCollapsed?: boolean;
    /** 头部区域配置对象（{logo, text, link, ...}）。与 headerSlot 二选一。 */
    header?: NavHeaderConfig;
    /** 底部区域配置对象（{collapseButton, ...}）。与 footerSlot 二选一。 */
    footer?: NavFooterConfig;
    /** 缩进限制：仅一级缩进（默认 true）；false 时逐级缩进。 */
    limitIndent?: boolean;
    /** 含子导航项的展开箭头位置。 */
    toggleIconPosition?: 'left' | 'right';
    /** 自定义展开箭头图标。 */
    expandIcon?: Snippet;
    /**
     * 数据驱动的项图标渲染钩子（本库扩展，Semi 无）：项自身未设 icon 时按 item 渲染前置图标。
     * 用于 items 大量、图标随 item 变化的场景（如站点侧边栏按组件名取图标）。项自带 icon 优先。
     */
    renderIcon?: Snippet<[NavItemDef]>;
    /** 子导航展开动画开关（默认 true）。对齐 Semi subNavMotion。 */
    subNavMotion?: boolean;
    /** 浮层子导航展开延迟 ms。对齐 Semi subNavOpenDelay。 */
    subNavOpenDelay?: number;
    /** 浮层子导航关闭延迟 ms。对齐 Semi subNavCloseDelay。 */
    subNavCloseDelay?: number;
    /** Nav 级：透传给所有子导航浮层 Dropdown 的默认属性（对齐 Semi subDropdownProps）。 */
    subDropdownProps?: import('./types.js').NavDropdownProps;
    /** 折叠态 tooltip 显示延迟 ms（对齐 Semi tooltipShowDelay）。 */
    tooltipShowDelay?: number;
    /** 折叠态 tooltip 隐藏延迟 ms（对齐 Semi tooltipHideDelay）。 */
    tooltipHideDelay?: number;
    /** 浮层挂载容器。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 自定义导航项外层包裹（对齐 Semi renderWrapper {itemElement,isSubNav,isInSubNav,props}）。 */
    renderWrapper?: Snippet<
      [
        {
          item: NavItemDef;
          isSubNav: boolean;
          isInSubNav: boolean;
          props: NavItemDef;
          children: Snippet;
        },
      ]
    >;
    /** 根元素自定义类名（透传）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 导航项列表容器自定义样式（对齐 Semi bodyStyle）。 */
    bodyStyle?: string;
    /** 选中导航项回调（富载荷对齐 Semi）。 */
    onSelect?: (data: NavSelectData) => void;
    /** 多选下取消选中回调（对齐 Semi onDeselect）。 */
    onDeselect?: (data: NavSelectData) => void;
    /** 点击任意导航项回调（富载荷对齐 Semi）。 */
    onClick?: (data: NavClickData) => void;
    /** 展开/收起子导航回调（富载荷对齐 Semi）。 */
    onOpenChange?: (data: NavOpenChangeData) => void;
    /** 折叠态变化回调。 */
    onCollapseChange?: (isCollapsed: boolean) => void;
    /** 自定义头部（覆盖 header 配置对象）。 */
    headerSlot?: Snippet;
    /** 自定义底部（覆盖 footer 配置对象）。 */
    footerSlot?: Snippet;
    /**
     * 子内容，渲染在导航列表 ul 内、items 之后（对齐 Semi `{itemElems}{children}`）。
     * 既可放声明式子项 <Nav.Item>/<Nav.Sub>（经 context 注册，自身不产 DOM；与 items 二选一，
     * items 优先），也可放任意内容（如一组文字/链接），后者原样渲染。
     */
    children?: Snippet;
  }

  let {
    items = [],
    mode = 'vertical',
    selectedKeys,
    defaultSelectedKeys,
    openKeys,
    defaultOpenKeys,
    multiple = false,
    isCollapsed,
    defaultIsCollapsed = false,
    header,
    footer,
    limitIndent = true,
    toggleIconPosition = 'right',
    expandIcon,
    renderIcon,
    subNavMotion = true,
    subNavOpenDelay = DEFAULT_SUBNAV_OPEN_DELAY,
    subNavCloseDelay = DEFAULT_SUBNAV_CLOSE_DELAY,
    subDropdownProps,
    tooltipShowDelay = DEFAULT_TOOLTIP_SHOW_DELAY,
    tooltipHideDelay = DEFAULT_TOOLTIP_HIDE_DELAY,
    getPopupContainer,
    renderWrapper,
    class: className = '',
    style,
    bodyStyle,
    onSelect,
    onDeselect,
    onClick,
    onOpenChange,
    onCollapseChange,
    headerSlot,
    footerSlot,
    children,
  }: Props = $props();

  // ---------- 声明式子项收集（<Nav.Item>/<Nav.Sub>）----------
  let declared: NavItemDef[] = [];
  let revision = $state(0);
  let bumpScheduled = false;
  setContext<NavCollector>(NAV_COLLECTOR_KEY, {
    add: (item: NavItemDef) => {
      declared.push(item);
      return item;
    },
    bump: () => {
      if (bumpScheduled) return;
      bumpScheduled = true;
      queueMicrotask(() => {
        bumpScheduled = false;
        revision += 1;
      });
    },
  });

  // items prop 优先（归一 string 项，对齐 Semi），否则用声明式收集结果（revision 触发重建）。
  const resolvedItems = $derived.by<NavItemDef[]>(() => {
    if (items.length) return normalizeNavItems(items);
    const r = revision;
    return r >= 0 ? declared.slice() : [];
  });

  // ---------- 折叠态（受控/非受控，仅 vertical）----------
  const isCollapsedControlled = $derived(isCollapsed !== undefined);
  let innerCollapsed = $state(untrack(() => defaultIsCollapsed));
  const collapsedState = $derived(
    mode === MODE_VERTICAL && (isCollapsedControlled ? !!isCollapsed : innerCollapsed),
  );
  function toggleCollapsed(): void {
    const next = !collapsedState;
    if (!isCollapsedControlled) innerCollapsed = next;
    onCollapseChange?.(next);
  }

  // ---------- 选中态（受控/非受控，含祖先高亮）----------
  const isSelectControlled = $derived(selectedKeys !== undefined);
  const innerSelected = new SvelteSet<NavKey>(untrack(() => defaultSelectedKeys ?? []));
  // 选中集合 = 显式选中 + 其祖先 SubNav（对齐 Semi：选中子项父级 SubNav 高亮）。
  const currentSelected = $derived.by(() => {
    const base = isSelectControlled ? (selectedKeys ?? []) : [...innerSelected];
    const ancestors = collectAncestorKeys(resolvedItems, base);
    return new Set<NavKey>([...base, ...ancestors]);
  });

  // ---------- 展开态（受控/非受控）----------
  const isOpenControlled = $derived(openKeys !== undefined);
  const innerOpen = new SvelteSet<NavKey>(untrack(() => defaultOpenKeys ?? []));
  const currentOpen = $derived<ReadonlySet<NavKey>>(
    isOpenControlled ? new Set(openKeys) : innerOpen,
  );
  // openKeys 受控 = openKeys 受控 且 vertical 且未折叠（对齐 Semi openKeysIsControlled）。
  // 浮层 SubNav 据此在受控时用 trigger='custom' + visible。
  const openKeysIsControlled = $derived(
    isOpenControlled && mode === MODE_VERTICAL && !collapsedState,
  );

  function isSelected(key: NavKey): boolean {
    return currentSelected.has(key);
  }
  function isOpen(key: NavKey): boolean {
    return currentOpen.has(key);
  }

  function buildSelectData(itemKey: NavKey, nextSelectedBase: NavKey[], domEvent?: Event): NavSelectData {
    return {
      itemKey,
      selectedKeys: nextSelectedBase,
      selectedItems: collectNavItemsByKeys(resolvedItems, nextSelectedBase),
      ...(domEvent !== undefined ? { domEvent } : {}),
      isOpen: false,
    };
  }

  function selectLeaf(item: NavItemDef, domEvent?: Event): void {
    if (item.disabled) return;
    const base = isSelectControlled ? (selectedKeys ?? []) : [...innerSelected];
    const wasSelected = base.includes(item.itemKey);
    const isDeselect = multiple && wasSelected;
    const nextBase = multiple
      ? isDeselect
        ? base.filter((k) => k !== item.itemKey)
        : [...base, item.itemKey]
      : [item.itemKey];

    if (!isSelectControlled) {
      innerSelected.clear();
      for (const k of nextBase) innerSelected.add(k);
    }

    onClick?.({ itemKey: item.itemKey, ...(domEvent !== undefined ? { domEvent } : {}), isOpen: false });
    const data = buildSelectData(item.itemKey, nextBase, domEvent);
    if (isDeselect) onDeselect?.(data);
    else onSelect?.(data);
  }

  function toggleOpen(item: NavItemDef, willOpen: boolean, domEvent?: Event): void {
    if (item.disabled) return;
    const base = isOpenControlled ? (openKeys ?? []) : [...innerOpen];
    const next = base.filter((k) => k !== item.itemKey);
    if (willOpen) next.push(item.itemKey);
    if (!isOpenControlled) {
      innerOpen.clear();
      for (const k of next) innerOpen.add(k);
    }
    onClick?.({ itemKey: item.itemKey, ...(domEvent !== undefined ? { domEvent } : {}), isOpen: willOpen });
    onOpenChange?.({
      itemKey: item.itemKey,
      openKeys: next,
      ...(domEvent !== undefined ? { domEvent } : {}),
      isOpen: willOpen,
    });
  }

  // ---------- Context 提供 ----------
  setContext<NavContext>(NAV_CONTEXT_KEY, {
    get mode() {
      return mode;
    },
    get collapsed() {
      return collapsedState;
    },
    get multiple() {
      return multiple;
    },
    get limitIndent() {
      return limitIndent;
    },
    get toggleIconPosition() {
      return toggleIconPosition;
    },
    get openKeysIsControlled() {
      return openKeysIsControlled;
    },
    get subDropdownProps() {
      return subDropdownProps;
    },
    get subNavMotion() {
      return subNavMotion;
    },
    get subNavOpenDelay() {
      return subNavOpenDelay;
    },
    get subNavCloseDelay() {
      return subNavCloseDelay;
    },
    get tooltipShowDelay() {
      return tooltipShowDelay;
    },
    get tooltipHideDelay() {
      return tooltipHideDelay;
    },
    get getPopupContainer() {
      return getPopupContainer;
    },
    get expandIcon() {
      return expandIcon;
    },
    get renderIcon() {
      return renderIcon;
    },
    get renderWrapper() {
      return renderWrapper;
    },
    isSelected,
    isOpen,
    selectLeaf,
    toggleOpen,
    toggleCollapsed,
  });

  const cls = $derived(
    ['cd-nav', `cd-nav-${mode}`, collapsedState && 'cd-nav-collapsed', className]
      .filter(Boolean)
      .join(' '),
  );

  const hasHeader = $derived(!!headerSlot || !!header);
  const hasFooter = $derived(!!footerSlot || (!!footer && !!footer.collapseButton));
</script>

<!-- 根为纯容器 <div>（对齐 Semi index.tsx：无 nav landmark）；列表用 role=menu 语义。 -->
<div class={cls} {style}>
  <div class="cd-nav-inner">
    <div class="cd-nav-header-list-outer" class:cd-nav-header-list-outer-collapsed={collapsedState}>
      {#if hasHeader}
        {#if headerSlot}
          {@render headerSlot()}
        {:else if header}
          <NavHeader
            {...header.logo !== undefined ? { logo: header.logo } : {}}
            {...header.text !== undefined ? { text: header.text } : {}}
            {...header.link !== undefined ? { link: header.link } : {}}
            {...header.linkOptions !== undefined ? { linkOptions: header.linkOptions } : {}}
            {...header.class !== undefined ? { class: header.class } : {}}
            {...header.style !== undefined ? { style: header.style } : {}}
            {mode}
            {collapsedState}
          />
        {/if}
      {/if}

      <div class="cd-nav-list-wrapper" style={bodyStyle}>
        <!-- 对齐 Semi index.tsx:434：ul[role=menu][aria-orientation=mode]；项为 role=menuitem。
             children 紧随 items 之后渲染在 ul 内（对齐 Semi `{itemElems}{children}`）：
             <Nav.Item>/<Nav.Sub> 经 context 注册后自身不产 DOM，其余任意内容原样渲染。 -->
        <ul class="cd-nav-list" role="menu" aria-orientation={mode}>
          {#each resolvedItems as item (item.itemKey)}
            <NavItemRender {item} level={0} />
          {/each}
          {#if children}{@render children()}{/if}
        </ul>
      </div>
    </div>

    {#if hasFooter}
      {#if footerSlot}
        {@render footerSlot()}
      {:else if footer}
        <NavFooter
          collapseButton={footer.collapseButton ?? false}
          {...footer.collapseText !== undefined ? { collapseText: footer.collapseText } : {}}
          {...footer.class !== undefined ? { class: footer.class } : {}}
          {...footer.style !== undefined ? { style: footer.style } : {}}
          {...footer.onClick !== undefined ? { onClick: footer.onClick } : {}}
        />
      {/if}
    {/if}
  </div>
</div>

<style>
  /* 容器：垂直侧边导航（默认）。对齐 Semi navigation.scss。 */
  .cd-nav {
    box-sizing: border-box;
    display: inline-flex;
    width: var(--cd-width-navigation-container-base);
    outline: none;
    overflow: hidden;
    margin: 0;
    padding-inline: var(--cd-spacing-navigation-paddingx);
    user-select: none;
    border-inline-end: var(--cd-width-navigation-border) solid var(--cd-color-navigation-border-default);
    background: var(--cd-color-navigation-bg-default);
    /* 注意：不过渡 width——在两个 var() 长度间过渡 Chromium 会卡死在起始值不收敛，
       导致折叠后宽度停在展开态。折叠为即时切换（功能优先）。 */
    transition: padding var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-nav-inner {
    inline-size: 100%;
    block-size: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* 折叠态：容器收窄到图标轨宽度。 */
  .cd-nav-collapsed {
    width: var(--cd-width-navigation-container-collapsed);
    padding-inline: var(--cd-spacing-navigation-collapsed-paddingx);
  }

  .cd-nav-header-list-outer {
    block-size: 100%;
    display: flex;
    flex-direction: column;
    min-block-size: 0;
  }
  .cd-nav-list-wrapper {
    padding-block-start: var(--cd-spacing-navigation-list-wrapper-paddingtop);
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1 1 auto;
    min-block-size: 0;
  }
  .cd-nav-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* 水平顶部导航。 */
  .cd-nav-horizontal {
    inline-size: 100%;
    block-size: var(--cd-height-navigation-horizontal-header);
    border-inline-end: none;
    border-block-end: var(--cd-width-navigation-border) solid var(--cd-color-navigation-border-default);
    padding-inline: var(--cd-spacing-navigation-horizontal-paddingleft);
  }
  .cd-nav-horizontal .cd-nav-inner {
    flex-direction: row;
  }
  .cd-nav-horizontal .cd-nav-header-list-outer {
    flex-direction: row;
    align-items: center;
    block-size: auto;
  }
  .cd-nav-horizontal .cd-nav-list-wrapper {
    padding-block-start: 0;
    overflow: visible;
  }
  .cd-nav-horizontal .cd-nav-list {
    display: inline-flex;
    align-items: center;
  }
</style>
