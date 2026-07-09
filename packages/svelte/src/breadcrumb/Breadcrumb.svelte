<!--
  Breadcrumb — 面包屑导航。字段/API 全面对齐 Semi Design。
  Data-driven `routes` mode（可为 Route 对象或纯字符串）+ declarative `<Breadcrumb.Item>` mode。
  声明式模式：子项间分隔符由纯 CSS（:not(:last-child)::after）自动插入，最后一项后无分隔符；
  最后一项语义（当前页：不可点 + aria-current=page）由 context 注册顺序派生（红线 #2 纯函数）。
  maxItemCount（默认 4）：超出时中间折叠为 IconMore 触发器（保留首项 + 末 maxItemCount-1 项）。
  moreType（对齐 Semi 'default'|'popover'，默认 'default'）：
    - 'default'：点击 IconMore 就地展开整条（disclosure，aria-expanded）。
    - 'popover'：悬浮 IconMore 弹出可点击的折叠项菜单。
  showTooltip（boolean | { width, ellipsisPos, opts }）：文本超出 width 截断，hover 用 Tooltip 展示完整名。
  复用库内 Tooltip/Popover（红线 #3：cleanup 由其内部 useDismiss/定时器自管）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import Popover from '../popover/Popover.svelte';
  import { setBreadcrumbContext } from './context.js';
  import type { BreadcrumbRoute } from './types.js';

  type BreadcrumbSize = 'small' | 'default' | 'large';
  /** 折叠 … 浮层类型，对齐 Semi：'default'（点击就地展开）/ 'popover'（悬浮气泡列出可点项）。 */
  type MoreType = 'default' | 'popover';
  /** 截断 Tooltip 配置（对齐 Semi showToolTipProps）。 */
  type ShowTooltipProps = {
    /** 溢出截断宽度（number→px），默认 150。 */
    width?: number | string;
    /** 截断位置：末尾省略 / 中间省略。 */
    ellipsisPos?: 'end' | 'middle';
    /** 透传给 Tooltip 的额外属性。 */
    opts?: Record<string, unknown>;
  };
  type CollapsedRoute = { route: BreadcrumbRoute; index: number };
  type DisplayCell =
    | { type: 'route'; route: BreadcrumbRoute; index: number }
    | { type: 'ellipsis'; count: number; collapsed: CollapsedRoute[] };

  interface Props {
    /** 路由项数组，元素可为 Route 对象或纯字符串（字符串即 name，对齐 Semi）。 */
    routes?: Array<BreadcrumbRoute | string>;
    separator?: string;
    size?: BreadcrumbSize;
    /** 超出此数量时中间折叠，默认 4（对齐 Semi）。 */
    maxItemCount?: number;
    /**
     * 文本截断 + hover Tooltip 展示完整名。
     * true / 对象（{ width, ellipsisPos, opts }）启用；false 关闭。默认关闭。
     * 对象默认值对齐 Semi：{ width: 150, ellipsisPos: 'end' }。
     */
    showTooltip?: boolean | ShowTooltipProps;
    /** 折叠 … 的浮层类型，默认 'default'（对齐 Semi）。 */
    moreType?: MoreType;
    /** 紧凑模式，默认 true；false 时根元素附加 cd-breadcrumb--loose 类（更大字号/间距）。 */
    compact?: boolean;
    /** 是否在超出 maxItemCount 时自动折叠，默认 true；false 时始终展示全部项。 */
    autoCollapse?: boolean;
    /** 受控选中项索引（配合 onClick 使用，令对应项高亮；对齐 Semi activeIndex）。 */
    activeIndex?: number;
    /** 无障碍标签，默认取 i18n Breadcrumb.ariaLabel；传入时覆盖（对齐 Semi aria-label）。 */
    ariaLabel?: string;
    /** 根节点内联样式（对齐 Semi style）。 */
    style?: string;
    /**
     * 自定义路由项渲染（routes 模式）；传入时替换默认的链接/文本/当前页渲染逻辑。
     * Svelte 5 Snippet：{@render renderItem(route, index, isLast)}
     */
    renderItem?: Snippet<[BreadcrumbRoute, number, boolean]>;
    /**
     * 自定义折叠 … 区域渲染（替代 moreType 内置浮层）。
     * 传入时接管折叠展示，参数为被折叠的路由列表。
     * Svelte 5 Snippet：{@render renderMore(collapsed)}
     */
    renderMore?: Snippet<[CollapsedRoute[]]>;
    class?: string;
    children?: Snippet;
    onClick?: (route: BreadcrumbRoute, index: number) => void;
  }

  let {
    routes = [],
    separator = '/',
    size = 'default',
    maxItemCount = 4,
    showTooltip = false,
    moreType = 'default',
    compact = true,
    autoCollapse = true,
    activeIndex,
    ariaLabel,
    style,
    renderItem,
    renderMore,
    class: className = '',
    children,
    onClick,
  }: Props = $props();

  const loc = useLocale();

  const cls = $derived(
    [
      'cd-breadcrumb',
      `cd-breadcrumb--${size}`,
      !compact ? 'cd-breadcrumb--loose' : '',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** 归一化 routes：纯字符串 → { name }；对象原样（对齐 Semi genRoutes）。 */
  const normalizedRoutes = $derived<BreadcrumbRoute[]>(
    routes.map((r) => (typeof r === 'string' ? { name: r } : r)),
  );

  const hasRoutes = $derived(normalizedRoutes.length > 0);

  // showTooltip 归一化为 { enabled, width, ellipsisPos }（对齐 Semi 默认 width:150/ellipsisPos:'end'）。
  const tooltipCfg = $derived.by(() => {
    if (!showTooltip) return { enabled: false, width: 150, ellipsisPos: 'end' as const };
    if (showTooltip === true) return { enabled: true, width: 150, ellipsisPos: 'end' as const };
    return {
      enabled: true,
      width: showTooltip.width ?? 150,
      ellipsisPos: showTooltip.ellipsisPos ?? 'end',
    };
  });
  /**
   * middle 截断 action（对齐 Semi ellipsisPos:'middle'）：纯 CSS 只能末尾省略，
   * 中间省略需 JS 测量。挂载 + 容器尺寸变化时二分裁剪承载文本的内层元素为「头…尾」
   * 使其不溢出，并补 aria-label=完整名保可访问；未溢出则显示完整文本。
   * enabled=false（end 模式）时 no-op。完整文本仍由外层 Tooltip 展示。SSR 安全。
   */
  function middleEllipsis(node: HTMLElement, opts: { enabled: boolean; full: string }) {
    const ELLIPSIS = '…';
    let updating = false;
    // 承载文本的内层元素（current / link / text 之一）。
    function inner(): HTMLElement | null {
      return node.querySelector('.cd-breadcrumb__current, .cd-breadcrumb__link, .cd-breadcrumb__text');
    }
    function update({ enabled, full }: { enabled: boolean; full: string }) {
      if (!enabled || updating) return;
      const el = inner();
      if (!el) return;
      // 含前置图标时不裁 textContent（会误删 icon 节点）；退化为 CSS 末尾省略。
      if (el.querySelector('.cd-breadcrumb__icon')) return;
      updating = true;
      el.setAttribute('aria-label', full);
      el.textContent = full;
      if (el.scrollWidth > el.clientWidth && full.length > 2) {
        let lo = 1;
        let hi = full.length - 1;
        let best = ELLIPSIS;
        while (lo <= hi) {
          const keep = (lo + hi) >> 1;
          const head = Math.ceil(keep / 2);
          const tail = Math.floor(keep / 2);
          const cand = full.slice(0, head) + ELLIPSIS + (tail > 0 ? full.slice(full.length - tail) : '');
          el.textContent = cand;
          if (el.scrollWidth <= el.clientWidth) {
            best = cand;
            lo = keep + 1;
          } else {
            hi = keep - 1;
          }
        }
        el.textContent = best;
      }
      updating = false;
    }
    update(opts);
    const ro =
      opts.enabled && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => update(opts))
        : null;
    ro?.observe(node);
    return {
      update(next: { enabled: boolean; full: string }) {
        opts = next;
        update(next);
      },
      destroy() {
        ro?.disconnect();
      },
    };
  }

  const tooltipWidthPx = $derived(
    typeof tooltipCfg.width === 'number' ? `${tooltipCfg.width}px` : tooltipCfg.width,
  );

  // 折叠：展开后显示全部；本地 $state。
  let expanded = $state(false);

  // 折叠生效：autoCollapse=true、maxItemCount>0、未展开、路由数超上限。
  // 折叠后展示：首项 + ellipsis + 末 (maxItemCount-1) 项（对齐 Semi slice(1, len-max+1)）。
  const cells = $derived.by<DisplayCell[]>(() => {
    const src = normalizedRoutes;
    const all: DisplayCell[] = src.map((route, index) => ({ type: 'route', route, index }));
    if (!autoCollapse || expanded || maxItemCount <= 0 || src.length <= maxItemCount) return all;
    const tail = Math.max(1, maxItemCount - 1);
    const head = all.slice(0, 1);
    const rest = all.slice(1, src.length - tail);
    const tailCells = all.slice(src.length - tail);
    if (rest.length === 0) return all;
    const collapsed: CollapsedRoute[] = rest.map((c) =>
      c.type === 'route' ? { route: c.route, index: c.index } : { route: { name: '' }, index: -1 },
    );
    return [...head, { type: 'ellipsis', count: rest.length, collapsed }, ...tailCells];
  });

  function handleClick(route: BreadcrumbRoute, index: number) {
    onClick?.(route, index);
  }

  // 声明式 <Breadcrumb.Item> 注册：按 mount 顺序（= 源码顺序）收集 id，据此派生「最后一项」。
  // 分隔符本身由纯 CSS 插入，无需 JS。红线 #2：注册簿记用普通数组，末项 id 单独用 $state 承载，
  // 副作用写 / 渲染读分离，无 effect_update_depth_exceeded 自循环。
  let nextId = 0;
  const order: number[] = [];
  let lastId = $state<number>(-1);
  setBreadcrumbContext({
    register: () => {
      const id = nextId++;
      order.push(id);
      lastId = order[order.length - 1] ?? -1;
      return id;
    },
    unregister: (id: number) => {
      const i = order.indexOf(id);
      if (i !== -1) order.splice(i, 1);
      lastId = order.length > 0 ? (order[order.length - 1] ?? -1) : -1;
    },
    isLast: (id: number) => lastId !== -1 && id === lastId,
  });
</script>

<!-- IconMore：水平三点，对齐 Semi IconMore 折叠触发器视觉。 -->
{#snippet iconMore()}
  <svg class="cd-breadcrumb__more-icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <circle cx="5" cy="12" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="19" cy="12" r="2" fill="currentColor" />
  </svg>
{/snippet}

<!-- 单个路由项内容：末项=当前页（不可点），有 href=链接，否则可点文本。
     renderItem 优先：传入时直接渲染自定义内容。
     activeIndex 对应项附加 cd-breadcrumb__link--active / cd-breadcrumb__text--active 类。 -->
{#snippet routeItem(route: BreadcrumbRoute, index: number, last: boolean)}
  {#if renderItem}
    {@render renderItem(route, index, last)}
  {:else if last}
    <span class="cd-breadcrumb__current" aria-current="page">
      {#if route.icon}<span class="cd-breadcrumb__icon">{@render route.icon()}</span>{/if}{route.name ?? ''}
    </span>
  {:else if route.href}
    <a
      class={['cd-breadcrumb__link', activeIndex === index ? 'cd-breadcrumb__link--active' : ''].filter(Boolean).join(' ')}
      href={route.href}
      onclick={() => handleClick(route, index)}
      >{#if route.icon}<span class="cd-breadcrumb__icon">{@render route.icon()}</span>{/if}{route.name ?? ''}</a
    >
  {:else}
    <span
      class={['cd-breadcrumb__text', activeIndex === index ? 'cd-breadcrumb__text--active' : ''].filter(Boolean).join(' ')}
      role="link"
      tabindex="0"
      onclick={() => handleClick(route, index)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(route, index);
        }
      }}
      >{#if route.icon}<span class="cd-breadcrumb__icon">{@render route.icon()}</span>{/if}{route.name ?? ''}</span
    >
  {/if}
{/snippet}

<!-- showTooltip 开启：用 Tooltip 包裹，content 为完整文本。
     end 截断：CSS text-overflow:ellipsis（末尾省略）。
     middle 截断：JS action 二分裁剪为「头…尾」（对齐 Semi ellipsisPos:'middle'）。 -->
{#snippet maybeTooltip(route: BreadcrumbRoute, index: number, last: boolean)}
  {#if tooltipCfg.enabled}
    <Tooltip content={route.name ?? ''} placement="top">
      <span
        class="cd-breadcrumb__ellipsis-wrap"
        class:cd-breadcrumb__ellipsis-wrap--middle={tooltipCfg.ellipsisPos === 'middle'}
        style="--cd-breadcrumb-item-max-width:{tooltipWidthPx}"
        use:middleEllipsis={{ enabled: tooltipCfg.ellipsisPos === 'middle', full: route.name ?? '' }}
        >{@render routeItem(route, index, last)}</span
      >
    </Tooltip>
  {:else}
    {@render routeItem(route, index, last)}
  {/if}
{/snippet}

<!-- 折叠 … 触发器（Tooltip/Popover 的 child）。
     menu=true（popover 模式）时声明 disclosure 语义：aria-haspopup="menu"。 -->
{#snippet moreTrigger(count: number, menu: boolean)}
  <button
    type="button"
    class="cd-breadcrumb__more"
    aria-label={loc().t('Breadcrumb.moreLabel', { count })}
    aria-haspopup={menu ? 'menu' : undefined}
  >{@render iconMore()}</button>
{/snippet}

<nav class={cls} aria-label={ariaLabel ?? loc().t('Breadcrumb.ariaLabel')} {style}>
  {#if hasRoutes}
    <ol class="cd-breadcrumb__list">
      {#each cells as cell, cellIndex (cell.type === 'route' ? `r-${cell.index}` : 'ellipsis')}
        {@const isLast = cellIndex === cells.length - 1}
        <li class="cd-breadcrumb__item">
          {#if cell.type === 'ellipsis'}
            {#if renderMore}
              <!-- renderMore 接管折叠区域渲染，参数为被折叠路由列表。 -->
              {@render renderMore(cell.collapsed)}
            {:else if moreType === 'popover'}
              <Popover trigger="click" position="bottom" align="start">
                {@render moreTrigger(cell.count, true)}
                {#snippet contentSlot()}
                  <!-- 折叠节点展开浮层：WAI-ARIA APG menu 角色，项为 menuitem。 -->
                  <ul class="cd-breadcrumb__more-list" role="menu">
                    {#each cell.collapsed as c (c.index)}
                      <li class="cd-breadcrumb__more-list-item" role="none">
                        {#if c.route.href}
                          <a
                            class="cd-breadcrumb__link"
                            role="menuitem"
                            href={c.route.href}
                            onclick={() => handleClick(c.route, c.index)}>{c.route.name ?? ''}</a
                          >
                        {:else}
                          <span
                            class="cd-breadcrumb__text"
                            role="menuitem"
                            tabindex="0"
                            onclick={() => handleClick(c.route, c.index)}
                            onkeydown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleClick(c.route, c.index);
                              }
                            }}>{c.route.name ?? ''}</span
                          >
                        {/if}
                      </li>
                    {/each}
                  </ul>
                {/snippet}
              </Popover>
            {:else}
              <!-- 默认模式（moreType='default'，对齐 Semi）：点击 IconMore 就地展开整条 ol，disclosure 语义用 aria-expanded。 -->
              <button
                type="button"
                class="cd-breadcrumb__more"
                aria-label={loc().t('Breadcrumb.moreLabel', { count: cell.count })}
                aria-expanded={expanded}
                onclick={() => (expanded = true)}
              >{@render iconMore()}</button>
            {/if}
          {:else}
            {@render maybeTooltip(cell.route, cell.index, isLast)}
          {/if}
          {#if !isLast}
            <span class="cd-breadcrumb__separator" aria-hidden="true">{separator}</span>
          {/if}
        </li>
      {/each}
    </ol>
  {:else}
    <ol
      class="cd-breadcrumb__list cd-breadcrumb__list--declarative"
      style="--cd-breadcrumb-separator-content: '{separator}'"
    >
      {@render children?.()}
    </ol>
  {/if}
</nav>

<style>
  .cd-breadcrumb {
    /* 对齐 Semi .semi-breadcrumb { overflow: hidden } */
    overflow: hidden;
    font-size: var(--cd-breadcrumb-font-size);
    color: var(--cd-breadcrumb-color);
  }
  .cd-breadcrumb--small {
    font-size: var(--cd-breadcrumb-font-size-compact);
  }
  .cd-breadcrumb--large {
    font-size: var(--cd-font-size-header-6);
  }
  /* compact=false：宽松模式，字号对齐 Semi loose（regular），项间距增加 */
  .cd-breadcrumb--loose {
    font-size: var(--cd-breadcrumb-loose-font-size);
    letter-spacing: var(--cd-breadcrumb-loose-letter-spacing);
  }
  .cd-breadcrumb--loose .cd-breadcrumb__list {
    gap: var(--cd-breadcrumb-loose-gap);
  }
  .cd-breadcrumb__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--cd-breadcrumb-gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* 子项内容类用 :global 包裹：声明式 <Breadcrumb.Item> 渲染的元素在子组件作用域内，
     数据驱动模式的元素则为本组件 .cd-breadcrumb 后代，两者统一受样式约束（对齐 Collapse 模式）。 */
  .cd-breadcrumb :global(.cd-breadcrumb__item) {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-breadcrumb-gap);
  }
  /* 前置图标：与文字基线对齐（对齐 Semi .semi-breadcrumb-item-icon 视觉） */
  .cd-breadcrumb :global(.cd-breadcrumb__icon) {
    display: inline-flex;
    align-items: center;
    margin-inline-end: var(--cd-spacing-breadcrumb-item-text-marginleft);
  }
  .cd-breadcrumb__separator {
    color: var(--cd-breadcrumb-separator-color);
    user-select: none;
  }
  /* 声明式 Item 间分隔符：纯 CSS 自动插入，最后一项后不加（红线 #2）。 */
  .cd-breadcrumb__list--declarative :global(.cd-breadcrumb__item:not(:last-child))::after {
    content: var(--cd-breadcrumb-separator-content, '/');
    margin-inline-start: var(--cd-breadcrumb-gap);
    color: var(--cd-breadcrumb-separator-color);
    user-select: none;
  }
  .cd-breadcrumb :global(.cd-breadcrumb__link),
  .cd-breadcrumb :global(.cd-breadcrumb__text) {
    display: inline-flex;
    align-items: center;
    color: var(--cd-breadcrumb-color-link);
    text-decoration: none;
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
  }
  .cd-breadcrumb :global(.cd-breadcrumb__link:hover),
  .cd-breadcrumb :global(.cd-breadcrumb__text:hover) {
    color: var(--cd-breadcrumb-color-link-hover);
    text-decoration: underline;
  }
  .cd-breadcrumb :global(.cd-breadcrumb__link:active),
  .cd-breadcrumb :global(.cd-breadcrumb__text:active) {
    color: var(--cd-breadcrumb-color-link-active);
  }
  .cd-breadcrumb :global(.cd-breadcrumb__link:focus-visible),
  .cd-breadcrumb :global(.cd-breadcrumb__text:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-breadcrumb :global(.cd-breadcrumb__current) {
    display: inline-flex;
    align-items: center;
    color: var(--cd-breadcrumb-color-active);
    font-weight: var(--cd-breadcrumb-active-weight); /* 对齐 Semi 当前项字重 bold */
  }
  /* activeIndex：选中项高亮（配合 onClick 受控选中） */
  .cd-breadcrumb :global(.cd-breadcrumb__link--active),
  .cd-breadcrumb :global(.cd-breadcrumb__text--active) {
    color: var(--cd-breadcrumb-color-active);
    font-weight: var(--cd-breadcrumb-active-weight);
  }
  .cd-breadcrumb__more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 1.5em;
    padding: 0 var(--cd-spacing-breadcrumb-item-marginright);
    border: none;
    background: transparent;
    color: var(--cd-breadcrumb-restitem-color);
    font: inherit;
    line-height: 1;
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
  }
  .cd-breadcrumb__more-icon {
    display: block;
  }
  .cd-breadcrumb__more:hover {
    color: var(--cd-breadcrumb-color-link-hover);
    background: var(--cd-color-fill-1);
  }
  .cd-breadcrumb__more:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  /* showTooltip：截断包裹——超过 max-inline-size 时省略号，hover 由 Tooltip 显示完整文本 */
  .cd-breadcrumb__ellipsis-wrap {
    display: inline-block;
    max-inline-size: var(--cd-breadcrumb-item-max-width);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }
  /* 内层可点元素在截断包裹内需为块级以继承省略号（end 截断） */
  .cd-breadcrumb__ellipsis-wrap :global(.cd-breadcrumb__link),
  .cd-breadcrumb__ellipsis-wrap :global(.cd-breadcrumb__text),
  .cd-breadcrumb__ellipsis-wrap :global(.cd-breadcrumb__current) {
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* middle 截断：内层块级 + 受父宽约束，供 middleEllipsis action 测量 scrollWidth/clientWidth。
     文本由 action 就地裁剪为「头…尾」，故此处不用 text-overflow。 */
  .cd-breadcrumb__ellipsis-wrap--middle :global(.cd-breadcrumb__link),
  .cd-breadcrumb__ellipsis-wrap--middle :global(.cd-breadcrumb__text),
  .cd-breadcrumb__ellipsis-wrap--middle :global(.cd-breadcrumb__current) {
    display: block;
    max-inline-size: 100%;
    overflow: hidden;
    text-overflow: clip;
    white-space: nowrap;
  }

  /* moreType=popover 折叠项列表 */
  .cd-breadcrumb__more-list {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-breadcrumb-item-marginright);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-breadcrumb__more-list-item {
    white-space: nowrap;
  }
</style>
