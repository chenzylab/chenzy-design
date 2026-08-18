<!--
  Breadcrumb — 面包屑导航，严格对齐 semi-ui/breadcrumb/index.tsx。

  DOM 结构镜像 Semi：<nav aria-label class="cd-breadcrumb-wrapper [-compact|-loose]">
  直接放扁平 item-wrap span（无 ol/li、无额外包裹层），每项渲染由 Item.svelte 统一负责
  （routes 模式与声明式 <Breadcrumb.Item> 模式共享同一渲染组件，对齐 Semi renderRouteItems
  与声明式分支都实例化 BreadcrumbItem，不再各自维护一套手写渲染路径）。

  折叠（对齐 Semi handleCollapse）：template.splice(1, itemsLen-maxItemCount, spread) 语义——
  保留首项 + 折叠触发器 + 末 (maxItemCount-1) 项。触发器 DOM 结构对齐 Semi：
    <span class="cd-breadcrumb-collapse">
      <span class="cd-breadcrumb-item-wrap">
        <span role="button" tabindex="0" aria-label="Expand breadcrumb items"
              class="cd-breadcrumb-item cd-breadcrumb-item-more">…</span>
        <span class="cd-breadcrumb-separator">{separator}</span>
      </span>
    </span>
  moreType='default'：三点图标本身；'popover'：Popover 包裹三点图标，content 为 Semi
  renderPopoverMore 的 flat 结构（{item}{restItem-separator}，无 role=menu 包装）。
  renderMore 传入时接管整个触发器内容渲染。

  routes 与声明式 <Breadcrumb.Item> 两种模式都支持折叠：routes 模式父组件直接按 index
  计算好 active/shouldRenderSeparator/isCollapsed/showCollapseTrigger 传给 Item；声明式
  模式下 Svelte 无法像 React 那样对 children 数组 slice，改由 context 的 register 协议
  在子项 mount 时收集顺序，父组件据此计算同一份折叠语义（见 context.ts）。
-->
<script lang="ts">
  import type { Snippet, Component } from 'svelte';
  import { IconMore } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Popover from '../popover/Popover.svelte';
  import Item from './Item.svelte';
  import { setBreadcrumbContext } from './context.js';
  import type { BreadcrumbRoute, BreadcrumbIconProps } from './types.js';

  /** 折叠 … 浮层类型，对齐 Semi：'default'（点击就地展开）/ 'popover'（悬浮气泡列出可点项）。 */
  type MoreType = 'default' | 'popover';
  /** 截断 Tooltip 配置（对齐 Semi showToolTipProps）。 */
  type ShowTooltipProps = {
    width?: number | string;
    ellipsisPos?: 'end' | 'middle';
    opts?: Record<string, unknown>;
  };

  interface Props {
    /** 路由项数组，元素可为 Route 对象或纯字符串（字符串即 name，对齐 Semi）。 */
    routes?: Array<BreadcrumbRoute | string>;
    /**
     * 分隔符，对齐 Semi separator: ReactNode。字符串或组件引用直传（如 `separator={IconArrowRight}`）。
     * 非 Snippet 形式（见 Item.svelte 头注释：Svelte 5 无法可靠区分 Snippet 与裸 Component）。
     */
    separator?: string | Component<BreadcrumbIconProps>;
    /** 超出此数量时中间折叠，默认 4（对齐 Semi）。 */
    maxItemCount?: number;
    /**
     * 截断超出宽度时 hover 展示完整名。对齐 Semi defaultProps.showTooltip 真实默认值
     * `{width:150, ellipsisPos:'end'}`（对象，非 false）——默认即开启，不是"关闭截断
     * 提示"，这是历史实现里遗漏的对齐缺口（曾误写默认 false）。
     */
    showTooltip?: boolean | ShowTooltipProps;
    /** 折叠 … 的浮层类型，默认 'default'（对齐 Semi）。 */
    moreType?: MoreType;
    /** 紧凑模式，默认 true；false 时根元素附加 -loose 类（更大字号/间距）。 */
    compact?: boolean;
    /** 是否在超出 maxItemCount 时自动折叠，默认 true；false 时始终展示全部项。 */
    autoCollapse?: boolean;
    /** 受控选中项索引（配合 onClick 使用，令对应项高亮；对齐 Semi activeIndex）。 */
    activeIndex?: number;
    /** 无障碍标签，默认取 i18n Breadcrumb.ariaLabel；传入时覆盖（对齐 Semi aria-label）。 */
    'aria-label'?: string;
    /** 根节点内联样式（对齐 Semi style）。 */
    style?: string;
    /**
     * 自定义路由项渲染（routes 模式）；传入时替换默认的链接/文本/当前页渲染逻辑。
     * 对齐 Semi renderItem(route): ReactNode。组件引用直传（非 Snippet，见 Item.svelte
     * 头注释）：接收 route 的组件，如 `renderItem={MyItemRenderer}`，组件内部经
     * `props.route` 取数据（React 单参回调 → Svelte 组件 props 的等价表达）。
     */
    renderItem?: Component<{ route: BreadcrumbRoute }>;
    /**
     * 自定义折叠 … 区域渲染（替代 moreType 内置浮层）。对齐 Semi
     * renderMore(restItem: ReactNode[]): ReactNode。组件引用直传，经 `props.restItems` 取数据。
     */
    renderMore?: Component<{ restItems: Array<{ route: BreadcrumbRoute; index: number }> }>;
    class?: string;
    children?: Snippet;
    /** 单击事件，对齐 Semi onClick(route, event)。 */
    onClick?: (route: BreadcrumbRoute, event: MouseEvent) => void;
  }

  let {
    routes = [],
    separator = '/',
    maxItemCount = 4,
    showTooltip = { width: 150, ellipsisPos: 'end' },
    moreType = 'default',
    compact = true,
    autoCollapse = true,
    activeIndex = undefined,
    'aria-label': ariaLabel,
    style,
    renderItem,
    renderMore,
    class: className = '',
    children,
    onClick,
  }: Props = $props();

  const loc = useLocale();

  // 对齐 Semi sizeCls：wrapper 恒有，compact/loose 二态互斥。
  const cls = $derived(
    ['cd-breadcrumb-wrapper', compact ? 'cd-breadcrumb-wrapper-compact' : 'cd-breadcrumb-wrapper-loose', className]
      .filter(Boolean)
      .join(' '),
  );

  const separatorIsComponent = $derived(typeof separator === 'function');

  /** 归一化 routes：纯字符串 → { name }；对象原样（对齐 Semi genRoutes）。 */
  const normalizedRoutes = $derived<BreadcrumbRoute[]>(
    routes.map((r) => (typeof r === 'string' ? { name: r } : r)),
  );
  const hasRoutes = $derived(normalizedRoutes.length > 0);

  // 折叠：展开后显示全部；本地 $state（对齐 Semi state.isCollapsed，命名相反：
  // Semi state.isCollapsed=true 表示「当前处于折叠态」，此处 expanded=true 表示「已展开」，语义等价）。
  let expanded = $state(false);

  function handleClick(route: BreadcrumbRoute, event: MouseEvent) {
    onClick?.(route, event);
  }

  // ---------- routes 模式：折叠区间计算（对齐 Semi handleCollapse 的 splice 语义） ----------
  const routesShouldCollapse = $derived(
    hasRoutes && autoCollapse && maxItemCount > 0 && normalizedRoutes.length > maxItemCount && !expanded,
  );
  // 对齐 Semi handleCollapse: restItem = template.slice(1, itemsLen - maxItemCount + 1)
  // → 被折叠的原始 index 区间为 [1, itemsLen - maxItemCount]（闭区间，共 itemsLen-maxItemCount 项）。
  const routesCollapsedRange = $derived.by(() => {
    if (!routesShouldCollapse) return null;
    const len = normalizedRoutes.length;
    const endExclusive = len - maxItemCount + 1; // slice 语义的开区间终点
    return { start: 1, endExclusive };
  });
  const routesRestItems = $derived.by(() => {
    if (!routesCollapsedRange) return [];
    return normalizedRoutes
      .slice(routesCollapsedRange.start, routesCollapsedRange.endExclusive)
      .map((route, i) => ({ route, index: routesCollapsedRange.start + i }));
  });

  // ---------- 声明式模式：context 注册协议派生同一份折叠语义 ----------
  let nextId = 0;
  const order: number[] = [];
  let lastId = $state<number>(-1);
  let registerCount = $state(0);
  setBreadcrumbContext({
    onClick: (info, event) => handleClick(info as BreadcrumbRoute, event),
    get showTooltip() {
      return showTooltip;
    },
    get compact() {
      return compact;
    },
    get separator() {
      return separatorIsComponent ? undefined : (separator as string | undefined);
    },
    register: () => {
      const id = nextId++;
      order.push(id);
      lastId = order[order.length - 1] ?? -1;
      registerCount = order.length;
      return id;
    },
    unregister: (id: number) => {
      const i = order.indexOf(id);
      if (i !== -1) order.splice(i, 1);
      lastId = order.length > 0 ? (order[order.length - 1] ?? -1) : -1;
      registerCount = order.length;
    },
    isLast: (id: number) => lastId !== -1 && id === lastId,
    isCollapsed: (id: number) => declCollapsedIds().includes(id),
    showCollapseTriggerAfter: (id: number) => {
      const hidden = declCollapsedIds();
      if (hidden.length === 0) return false;
      const firstHidden = hidden[0]!;
      const pos = declOrder().indexOf(firstHidden);
      return pos > 0 && declOrder()[pos - 1] === id;
    },
    renderCollapseTrigger: collapseTrigger,
  });

  function declOrder(): number[] {
    void registerCount;
    return order;
  }
  // 对齐 Semi handleCollapse 同一套区间语义：[1, len-max+1) 折叠。
  function declCollapsedIds(): number[] {
    const ids = declOrder();
    if (!autoCollapse || expanded || maxItemCount <= 0 || ids.length <= maxItemCount) return [];
    const endExclusive = ids.length - maxItemCount + 1;
    return ids.slice(1, endExclusive);
  }
  const declRestCount = $derived.by(() => {
    void registerCount;
    void expanded;
    return declCollapsedIds().length;
  });

  function expandCollapsed() {
    expanded = true;
  }
  function handleExpandKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') expandCollapsed();
  }
</script>

<!-- 折叠触发器内容（moreType 分支），复用于 routes 与声明式两种模式（对齐 Semi handleCollapse 内联逻辑，
     此处提炼为 snippet 避免重复实现）。 -->
{#snippet moreContent(restItems: Array<{ route: BreadcrumbRoute; index: number }>)}
  {#if renderMore}
    {@const RenderMore = renderMore}
    <RenderMore {restItems} />
  {:else if moreType === 'default'}
    <IconMore />
  {:else if moreType === 'popover'}
    <Popover style="padding:12px" showArrow>
      {#snippet content()}
        {#each restItems as item, idx (item.index)}
          {#if renderItem}
            {@const RenderItem = renderItem}
            <RenderItem route={item.route} />
          {:else if item.route.icon}
            {@const RouteIcon = item.route.icon}
            <RouteIcon size="small" />
            {item.route.name ?? ''}
          {:else}
            {item.route.name ?? ''}
          {/if}
          {#if idx !== restItems.length - 1}
            <span class="cd-breadcrumb-restItem">
              {#if separatorIsComponent}
                {@const SepIcon = separator as Component<BreadcrumbIconProps>}
                <SepIcon size="small" />
              {:else}
                {separator}
              {/if}
            </span>
          {/if}
        {/each}
      {/snippet}
      <IconMore />
    </Popover>
  {/if}
{/snippet}

<!-- 折叠触发器整体（对齐 Semi handleCollapse 的 spread 结构）。 -->
{#snippet collapseTrigger()}
  <span class="cd-breadcrumb-collapse">
    <span class="cd-breadcrumb-item-wrap">
      <span
        role="button"
        tabindex="0"
        aria-label={loc().t('Breadcrumb.moreLabel', { count: hasRoutes ? routesRestItems.length : declRestCount })}
        class="cd-breadcrumb-item cd-breadcrumb-item-more"
        onclick={expandCollapsed}
        onkeydown={handleExpandKeydown}
      >
        {@render moreContent(hasRoutes ? routesRestItems : [])}
      </span>
      <span class="cd-breadcrumb-separator">
        {#if separatorIsComponent}
          {@const SepIcon = separator as Component<BreadcrumbIconProps>}
          <SepIcon size="small" />
        {:else}
          {separator}
        {/if}
      </span>
    </span>
  </span>
{/snippet}

<!-- routes 模式：每项用 Item 渲染，active/shouldRenderSeparator/isCollapsed/showCollapseTrigger
     由本组件按 index 直接计算传入（对齐 Semi renderRouteItems 由父组件算好作为 prop 传给
     BreadcrumbItem，Item 自身不猜测）。 -->
{#snippet routeContent(route: BreadcrumbRoute)}
  {#if renderItem}
    {@const RenderItem = renderItem}
    <RenderItem {route} />
  {:else}
    {route.name ?? ''}
  {/if}
{/snippet}

<nav class={cls} aria-label={ariaLabel ?? loc().t('Breadcrumb.ariaLabel')} {style}>
  {#if hasRoutes}
    {#each normalizedRoutes as route, idx (idx)}
      {@const isLastItem = activeIndex !== undefined ? activeIndex === idx : idx === normalizedRoutes.length - 1}
      {@const inCollapseRange = routesCollapsedRange
        ? idx >= routesCollapsedRange.start && idx < routesCollapsedRange.endExclusive
        : false}
      {#if inCollapseRange}
        {#if idx === routesCollapsedRange?.start}
          {@render collapseTrigger()}
        {/if}
      {:else}
        <Item
          href={route.href}
          icon={route.icon}
          active={isLastItem}
          shouldRenderSeparator={idx !== normalizedRoutes.length - 1}
          isCollapsed={false}
          showCollapseTrigger={false}
          onClick={(e) => handleClick(route, e)}
        >
          {#snippet children()}{@render routeContent(route)}{/snippet}
        </Item>
      {/if}
    {/each}
  {:else}
    {@render children?.()}
  {/if}
</nav>

<style>
  :global(.cd-breadcrumb-wrapper) {
    /* 对齐 Semi .semi-breadcrumb { overflow:hidden } + .semi-breadcrumb-wrapper { display:flex; flex-wrap:wrap } */
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
  }
  /* 对齐 Semi @include font-size-regular：font-size + line-height 绑定（非仅 font-size），
     否则 item/title 容器高度继承外层默认行高，图标在偏高容器里居中视觉偏下（见 memory
     semi-font-size-mixin-carries-line-height）。 */
  :global(.cd-breadcrumb-wrapper-loose) {
    font-size: var(--cd-font-breadcrumb-loose-fontsize);
    line-height: 20px;
  }
  :global(.cd-breadcrumb-wrapper-compact) {
    font-size: var(--cd-font-breadcrumb-compact-fontsize);
    line-height: 16px;
  }

  :global(.cd-breadcrumb-item-wrap) {
    display: inline-flex;
    align-items: center;
    margin: var(--cd-spacing-breadcrumb-item-wrap-marginy) 0;
    margin-right: var(--cd-spacing-breadcrumb-item-wrap-marginright);
  }
  :global(.cd-breadcrumb-item) {
    display: inline-flex;
    align-items: center;
    column-gap: var(--cd-spacing-breadcrumb-item-text-marginleft);
    margin-right: var(--cd-spacing-breadcrumb-item-marginright);
    color: var(--cd-color-breadcrumb-default-text-default);
    font-weight: var(--cd-font-breadcrumb-default-fontweight);
  }
  /* 对齐 Semi .semi-breadcrumb-item .semi-typography { color: inherit }：Typography.Text
     自带文字色声明，若不显式继承会覆盖 item-link:hover 想要的蓝色，导致 hover 不变色。 */
  :global(.cd-breadcrumb-item .cd-typography) {
    color: inherit;
  }
  :global(.cd-breadcrumb-item-active) {
    color: var(--cd-color-breadcrumb-active-text-default);
    font-weight: var(--cd-font-breadcrumb-active-fontweight);
  }
  /* 对齐 Semi &-item-active .semi-typography { font-weight: ... }：Typography.Text 自带
     size 相关 font-weight 声明（如 .cd-typography-small），是直接命中而非继承而来，
     普通的 font-weight 继承会被它覆盖，必须显式再设一遍（不能靠 inherit，因为末项声明式
     结构选择器不便再叠一层 :not(:hover) 特异性游戏，直接赋值最简单可靠）。 */
  :global(.cd-breadcrumb-item-active .cd-typography) {
    font-weight: var(--cd-font-breadcrumb-active-fontweight);
  }
  :global(.cd-breadcrumb-item-active:hover),
  :global(.cd-breadcrumb-item-active:active) {
    border: none;
    margin-bottom: 0;
    color: var(--cd-color-breadcrumb-active-text-active);
    cursor: default;
  }
  /* Semi 源码为 margin-bottom:-1px（在其自身字体/行高结构下与文字视觉居中）；本库
     结构下实测该负 margin 会让图标偏离容器几何中心 0.5px（图标中心比容器中心低）。
     去掉负 margin 后图标与容器完全几何居中，按实测校准优先于照搬公式数值。 */
  :global(.cd-breadcrumb-item-title-inline) {
    display: inline-flex;
  }
  :global(.cd-breadcrumb-item-more svg) {
    vertical-align: middle;
  }
  /* Semi &-item-link 选择器是纯 class（.semi-breadcrumb-item-link），不限定标签名——
     声明式模式下无 href 的项渲染为 span 而非 a（见 Item.svelte tag 判定），若选择器加 a
     前缀会导致这些 span 项的 hover/active 态完全失效（真实复现过的对齐缺口）。 */
  :global(.cd-breadcrumb-item-link) {
    text-decoration: inherit;
    color: inherit;
    transition: color var(--cd-transition-duration-breadcrumb-link-text)
      var(--cd-transition-function-breadcrumb-link-text) var(--cd-transition-delay-breadcrumb-link-text);
    transform: scale(var(--cd-transform-scale-breadcrumb-link-text));
  }
  :global(.cd-breadcrumb-item-link:hover) {
    color: var(--cd-color-breadcrumb-default-text-hover);
    cursor: pointer;
  }
  :global(.cd-breadcrumb-item-link:active) {
    color: var(--cd-color-breadcrumb-default-text-active);
    cursor: pointer;
  }
  :global(.cd-breadcrumb-collapse) {
    display: inline-flex;
    flex-shrink: 0;
  }
  :global(.cd-breadcrumb-separator) {
    display: flex;
    color: var(--cd-color-breadcrumb-sepearator-default-icon-default);
  }
  /* 声明式 <Breadcrumb.Item> 模式：分隔符显隐用纯 CSS 判断末项，不依赖 JS 的 isLast
     （SSR 一次性同步渲染时 isLast 靠子项注册动态推进，每项渲染自己时都会被判成「最后一个已
     注册的」，导致首屏 HTML 分隔符全部消失，直到 hydration 后才被修正）。routes 模式的
     wrap 不挂 -declarative 类，不受此规则影响（继续用 shouldRenderSeparator 精确 JS 控制）。 */
  :global(.cd-breadcrumb-item-wrap-declarative) :global(.cd-breadcrumb-separator) {
    display: none;
  }
  :global(.cd-breadcrumb-item-wrap-declarative:not(:last-child)) :global(.cd-breadcrumb-separator) {
    display: flex;
  }
  /* 同上：item-active 视觉（颜色/字重）也不依赖 JS 的 active，改用 :last-child 结构选择器
     （Item.svelte 声明式模式不再拼接 item-active class）。取值复刻上方 .cd-breadcrumb-item-active
     规则，SSR/CSR 恒定一致。aria-current 属性与 tag（a/span）标签名无法用 CSS 表达，
     仍依赖 JS（已知限制，见 Item.svelte 头注释）。
     注意：末项默认也带 -item-link class（noLink 默认 false，对齐 Semi item-active/item-link
     互相独立的条件），hover/active 态要让位给 .cd-breadcrumb-item-link:hover 的蓝色（对齐
     Semi 源码顺序 &-item-link 声明在 &-item-active 之后、层叠覆盖胜出的真实效果——Semi 官网
     实测末项 hover 确实变蓝加粗，非本库过去理解的恒定深色）。此结构选择器特异性
     （0,3,0）天然高于 .cd-breadcrumb-item-link:hover（0,2,0），必须显式 :not(:hover):not(:active)
     排除，否则无条件覆盖会压制蓝色（仅靠下面那条 :not(.cd-breadcrumb-item-link) 不够——
     它排除的是"非 link"元素，这里末项本身就是 link，需要排除的是"hover/active 状态"）。 */
  :global(.cd-breadcrumb-item-wrap-declarative:last-child)
    :global(.cd-breadcrumb-item:not(:hover):not(:active)) {
    color: var(--cd-color-breadcrumb-active-text-default);
    font-weight: var(--cd-font-breadcrumb-active-fontweight);
  }
  :global(.cd-breadcrumb-item-wrap-declarative:last-child) :global(.cd-breadcrumb-item) {
    font-weight: var(--cd-font-breadcrumb-active-fontweight);
  }
  /* Typography.Text 自带 size 相关 font-weight 声明会直接覆盖继承值，同上方
     .cd-breadcrumb-item-active .cd-typography 一样需要显式再设一遍。 */
  :global(.cd-breadcrumb-item-wrap-declarative:last-child) :global(.cd-breadcrumb-item .cd-typography) {
    font-weight: var(--cd-font-breadcrumb-active-fontweight);
  }
  :global(.cd-breadcrumb-item-wrap-declarative:last-child)
    :global(.cd-breadcrumb-item:not(.cd-breadcrumb-item-link):hover),
  :global(.cd-breadcrumb-item-wrap-declarative:last-child)
    :global(.cd-breadcrumb-item:not(.cd-breadcrumb-item-link):active) {
    border: none;
    margin-bottom: 0;
    color: var(--cd-color-breadcrumb-active-text-active);
    cursor: default;
  }
  :global(.cd-breadcrumb-restItem) {
    color: var(--cd-color-breadcrumb-restitem-text-default);
    margin-right: var(--cd-spacing-breadcrumb-restitem-marginright);
  }

  /* —— RTL（对齐 Semi breadcrumb/rtl.scss；库内无 .cd-portal-rtl 先例，故仅镜像 .cd-rtl 一套）—— */
  :global(.cd-rtl) :global(.cd-breadcrumb-wrapper) {
    direction: rtl;
  }
  :global(.cd-rtl) :global(.cd-breadcrumb-item-wrap) {
    margin-right: 0;
    margin-left: var(--cd-spacing-breadcrumb-item-wrap-marginright);
  }
  :global(.cd-rtl) :global(.cd-breadcrumb-item) {
    margin-right: 0;
    margin-left: var(--cd-spacing-breadcrumb-item-marginright);
  }
  :global(.cd-rtl) :global(.cd-breadcrumb-restItem) {
    margin-right: 0;
    margin-left: var(--cd-spacing-breadcrumb-restitem-marginright);
  }
  :global(.cd-rtl) :global(.cd-breadcrumb-item-icon) + :global(.cd-breadcrumb-item-title) {
    margin-left: 0;
    margin-right: var(--cd-spacing-breadcrumb-item-text-marginleft);
    display: inline-block;
  }
</style>
