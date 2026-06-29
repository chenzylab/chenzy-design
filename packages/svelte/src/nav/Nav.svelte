<!--
  Nav — 站点导航（对齐 Semi Navigation）。独立组件、对外字段对齐 Semi
  （itemKey/text/icon/items），内部委托我们自己的 Menu 渲染导航体（purpose=navigation），
  复用 Menu 的选中/展开/折叠/键盘/a11y 逻辑，仅新增 Header（logo+text）/Footer（collapseButton）
  容器与折叠联动。

  mode 映射：horizontal → Menu mode=horizontal；vertical 展开 → Menu mode=inline；
  vertical 折叠 → Menu mode=inline + inlineCollapsed（图标轨 + hover 浮层）。

  范围（MVP）：mode(vertical/horizontal)、items、header/footer、selected/open/collapsed
  受控与非受控 + 回调。TODO（暂未实现，留待后续）：limitIndent / toggleIconPosition /
  subNavMotion / tooltip 延迟 / renderWrapper / Nav.Item 声明式写法。
-->
<script lang="ts" module>
  export { NAV_CONTEXT_KEY } from './context.js';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext, untrack } from 'svelte';
  import Menu from '../menu/Menu.svelte';
  import type { MenuKey, MenuItemNode } from '../menu/types.js';
  import {
    navItemsToMenuItems,
    type NavItemDef,
    type NavKey,
    type NavMode,
    type NavHeaderConfig,
    type NavFooterConfig,
  } from './types.js';
  import {
    NAV_CONTEXT_KEY,
    NAV_COLLECTOR_KEY,
    type NavContext,
    type NavCollector,
  } from './context.js';
  import NavHeader from './NavHeader.svelte';
  import NavFooter from './NavFooter.svelte';

  interface Props {
    /** 导航项列表（字段对齐 Semi：itemKey/text/icon/items）。 */
    items?: NavItemDef[];
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
    /** 受控折叠态（仅 vertical 有效）。 */
    isCollapsed?: boolean;
    /** 默认折叠态（非受控，仅 vertical 有效）。 */
    defaultIsCollapsed?: boolean;
    /** 头部区域配置对象（{logo, text}）。与 header snippet 二选一。 */
    header?: NavHeaderConfig;
    /** 底部区域配置对象（{collapseButton}）。与 footer snippet 二选一。 */
    footer?: NavFooterConfig;
    /** 整体禁用。 */
    disabled?: boolean;
    /** 子级缩进像素（透传 Menu inlineIndent）。 */
    inlineIndent?: number;
    /** 缩进限制：仅一级缩进（默认 true）；false 时逐级缩进（透传 Menu limitIndent）。 */
    limitIndent?: boolean;
    /** 含子导航项的展开箭头位置（透传 Menu toggleIconPosition）。 */
    toggleIconPosition?: 'left' | 'right';
    /** 浮层子导航展开延迟 ms（透传 Menu subMenuOpenDelay）。对齐 Semi subNavOpenDelay。 */
    subNavOpenDelay?: number;
    /** 浮层子导航关闭延迟 ms（透传 Menu subMenuCloseDelay）。对齐 Semi subNavCloseDelay。 */
    subNavCloseDelay?: number;
    /** 浮层挂载容器（透传 Menu getPopupContainer）。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 自定义导航项外层包裹（透传 Menu renderWrapper）。 */
    renderWrapper?: Snippet<[{ item: MenuItemNode; children: Snippet }]>;
    /** 根元素自定义类名（透传）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 导航项列表容器自定义样式（对齐 Semi bodyStyle）。 */
    bodyStyle?: string;
    /** 可访问性标签。 */
    ariaLabel?: string;
    /** 选中导航项回调。 */
    onSelect?: (key: NavKey) => void;
    /** 展开/收起子导航回调。 */
    onOpenChange?: (keys: NavKey[]) => void;
    /** 折叠态变化回调。 */
    onCollapseChange?: (isCollapsed: boolean) => void;
    /** 自定义头部（覆盖 header 配置对象）。 */
    headerSlot?: Snippet;
    /** 自定义底部（覆盖 footer 配置对象）。 */
    footerSlot?: Snippet;
    /** 声明式子项（<Nav.Item>/<Nav.Sub>）。与 items 二选一，items 优先。 */
    children?: Snippet;
  }

  let {
    items = [],
    mode = 'vertical',
    selectedKeys,
    defaultSelectedKeys,
    openKeys,
    defaultOpenKeys,
    isCollapsed,
    defaultIsCollapsed = false,
    header,
    footer,
    disabled = false,
    inlineIndent,
    limitIndent,
    toggleIconPosition,
    subNavOpenDelay,
    subNavCloseDelay,
    getPopupContainer,
    renderWrapper,
    class: className = '',
    style,
    bodyStyle,
    ariaLabel,
    onSelect,
    onOpenChange,
    onCollapseChange,
    headerSlot,
    footerSlot,
    children,
  }: Props = $props();

  // --- 受控/非受控折叠态（仅 vertical 有意义）；受控 prop 优先，变化走回调不回写 ---
  const isCollapsedControlled = $derived(isCollapsed !== undefined);
  let innerCollapsed = $state(untrack(() => defaultIsCollapsed));
  const collapsedState = $derived(
    mode === 'vertical' && (isCollapsedControlled ? !!isCollapsed : innerCollapsed),
  );

  function toggleCollapsed(): void {
    const next = !collapsedState;
    if (!isCollapsedControlled) innerCollapsed = next;
    onCollapseChange?.(next);
  }

  // Footer 的 collapseButton 经 context 联动折叠态。
  setContext<NavContext>(NAV_CONTEXT_KEY, {
    get collapsed() {
      return collapsedState;
    },
    get mode() {
      return mode;
    },
    toggleCollapsed,
  });

  // --- 声明式子项收集（<Nav.Item>/<Nav.Sub>）---
  // 普通数组承接注册（非 $state，避免子项 init push 触发反应自循环）。
  let declared: NavItemDef[] = [];
  // 唯一反应量：子项挂载后异步 bump，触发一次 items 重建。
  let revision = $state(0);
  let bumpScheduled = false;

  setContext<NavCollector>(NAV_COLLECTOR_KEY, {
    add: (item: NavItemDef) => {
      declared.push(item);
      return item;
    },
    bump: () => {
      // 合并同一帧的多次 bump 为一次；异步脱离挂载 effect 同步栈。
      if (bumpScheduled) return;
      bumpScheduled = true;
      queueMicrotask(() => {
        bumpScheduled = false;
        revision += 1;
      });
    },
  });

  // items prop 优先；否则用声明式收集结果。
  // 必须真正使用 revision 的值（裸读语句会被编译器优化掉、断开依赖）；
  // 返回浅拷贝确保 Menu 每次收到新数组引用而重渲染。
  const resolvedItems = $derived.by(() => {
    if (items.length) return items;
    const r = revision;
    return r >= 0 ? declared.slice() : [];
  });

  // --- items（Semi 形）→ Menu items ---
  const menuItems = $derived(navItemsToMenuItems(resolvedItems));

  // --- mode 映射到 Menu ---
  const menuMode = $derived<'inline' | 'horizontal'>(
    mode === 'horizontal' ? 'horizontal' : 'inline',
  );
  const menuInlineCollapsed = $derived(mode === 'vertical' && collapsedState);

  const cls = $derived(
    ['cd-nav', `cd-nav--${mode}`, collapsedState && 'cd-nav--collapsed', className]
      .filter(Boolean)
      .join(' '),
  );

  // 头部/底部是否渲染。
  const hasHeader = $derived(!!headerSlot || !!header);
  const hasFooter = $derived(!!footerSlot || (!!footer && footer.collapseButton));
</script>

<div class={cls} {style} aria-label={ariaLabel}>
  {#if hasHeader}
    {#if headerSlot}
      {@render headerSlot()}
    {:else if header}
      <NavHeader
        {...header.logo !== undefined ? { logo: header.logo } : {}}
        {...header.text !== undefined ? { text: header.text } : {}}
        {collapsedState}
      />
    {/if}
  {/if}

  <div class="cd-nav__body" style={bodyStyle}>
    <Menu
      items={menuItems}
      mode={menuMode}
      inlineCollapsed={menuInlineCollapsed}
      purpose="navigation"
      {disabled}
      {...selectedKeys !== undefined ? { selectedKeys } : {}}
      {...defaultSelectedKeys !== undefined ? { defaultSelectedKeys } : {}}
      {...openKeys !== undefined ? { openKeys } : {}}
      {...defaultOpenKeys !== undefined ? { defaultOpenKeys } : {}}
      {...inlineIndent !== undefined ? { inlineIndent } : {}}
      {...limitIndent !== undefined ? { limitIndent } : {}}
      {...toggleIconPosition !== undefined ? { toggleIconPosition } : {}}
      {...subNavOpenDelay !== undefined ? { subMenuOpenDelay: subNavOpenDelay } : {}}
      {...subNavCloseDelay !== undefined ? { subMenuCloseDelay: subNavCloseDelay } : {}}
      {...getPopupContainer !== undefined ? { getPopupContainer } : {}}
      {...renderWrapper !== undefined ? { renderWrapper } : {}}
      onSelect={(key: MenuKey) => onSelect?.(key)}
      onOpenChange={(keys: MenuKey[]) => onOpenChange?.(keys)}
    />
  </div>

  <!-- 声明式子项注册宿主：仅当未传 items 且有 children 时挂载。
       Nav.Item/Nav.Sub 渲染无可见 DOM，只在此注册描述符；display:none 不占位。 -->
  {#if !items.length && children}
    <div hidden style="display:none">{@render children()}</div>
  {/if}

  {#if hasFooter}
    {#if footerSlot}
      {@render footerSlot()}
    {:else if footer}
      <NavFooter collapseButton={footer.collapseButton ?? false} />
    {/if}
  {/if}
</div>

<style>
  .cd-nav {
    display: flex;
    flex-direction: column;
    background: var(--cd-nav-bg);
    color: var(--cd-nav-color);
  }
  .cd-nav--horizontal {
    flex-direction: row;
    align-items: center;
    height: var(--cd-nav-horizontal-height);
  }
  /* 导航体占据中间，header/footer 固定 */
  .cd-nav__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }
  .cd-nav--horizontal .cd-nav__body {
    flex: 1 1 auto;
    overflow: visible;
  }
</style>
