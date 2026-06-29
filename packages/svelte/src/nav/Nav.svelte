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
  import type { MenuKey } from '../menu/types.js';
  import {
    navItemsToMenuItems,
    type NavItemDef,
    type NavKey,
    type NavMode,
    type NavHeaderConfig,
    type NavFooterConfig,
  } from './types.js';
  import { NAV_CONTEXT_KEY, type NavContext } from './context.js';
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
    class: className = '',
    style,
    bodyStyle,
    ariaLabel,
    onSelect,
    onOpenChange,
    onCollapseChange,
    headerSlot,
    footerSlot,
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

  // --- items（Semi 形）→ Menu items ---
  const menuItems = $derived(navItemsToMenuItems(items));

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
      onSelect={(key: MenuKey) => onSelect?.(key)}
      onOpenChange={(keys: MenuKey[]) => onOpenChange?.(keys)}
    />
  </div>

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
