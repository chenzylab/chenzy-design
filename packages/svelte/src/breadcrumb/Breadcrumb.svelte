<!--
  Breadcrumb — see specs/components/navigation/Breadcrumb.spec.md
  Data-driven `routes` mode (browser-verifiable) + declarative `<Breadcrumb.Item>` mode。
  声明式模式：子项间分隔符由纯 CSS（:not(:last-child)::after）自动插入，最后一项后无分隔符；
  最后一项语义（当前页：不可点 + aria-current=page）由 context 注册顺序派生（红线 #2 纯函数）。
  maxItemCount: 超出时中间折叠为 ... 触发器（保留首项 + 末 maxItemCount-1 项），点击展开全部。
  showTooltip: 文本可能被截断的项，启用后用 :global Tooltip 悬浮展示完整 label（label 截断由 CSS 控制）。
  moreType: 折叠 ... 的浮层类型——'tooltip' 悬浮列出被折叠项；'popover' 悬浮列出且其中项可点击跳转。
    未设 moreType（undefined）时维持现状：点击 ... 直接展开全部（向后兼容）。
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
  /** 折叠 ... 浮层类型；undefined 时点击直接展开全部（向后兼容） */
  type MoreType = 'tooltip' | 'popover';
  type CollapsedRoute = { route: BreadcrumbRoute; index: number };
  type DisplayCell =
    | { type: 'route'; route: BreadcrumbRoute; index: number }
    | { type: 'ellipsis'; count: number; collapsed: CollapsedRoute[] };

  interface Props {
    routes?: BreadcrumbRoute[];
    separator?: string;
    size?: BreadcrumbSize;
    /** 超出此数量时中间折叠（0 = 不折叠） */
    maxItemCount?: number;
    /** 文本被截断的项 hover 时用 Tooltip 展示完整 label */
    showTooltip?: boolean;
    /** 折叠 ... 的浮层类型；不设则点击 ... 直接展开全部 */
    moreType?: MoreType;
    /** 紧凑模式，默认 true；false 时根元素附加 cd-breadcrumb--loose 类（更大字号/间距） */
    compact?: boolean;
    /**
     * 是否在超出 maxItemCount 时自动折叠，默认 true。
     * false 时即使超出 maxItemCount 也不折叠（始终展示全部项）。
     */
    autoCollapse?: boolean;
    /** 受控选中项索引（配合 onClick 使用，令对应项高亮） */
    activeIndex?: number;
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
    maxItemCount = 0,
    showTooltip = false,
    moreType,
    compact = true,
    autoCollapse = true,
    activeIndex,
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

  const hasRoutes = $derived(routes.length > 0);

  // 折叠：展开后显示全部；本地 $state。
  let expanded = $state(false);

  // 折叠生效：autoCollapse=true、maxItemCount>0、未展开、路由数超上限。
  // 折叠后展示：首项 + ellipsis + 末 (maxItemCount-1) 项。
  const cells = $derived.by<DisplayCell[]>(() => {
    const all: DisplayCell[] = routes.map((route, index) => ({
      type: 'route',
      route,
      index,
    }));
    if (!autoCollapse || expanded || maxItemCount <= 0 || routes.length <= maxItemCount) return all;
    const tail = Math.max(1, maxItemCount - 1);
    const head = all.slice(0, 1);
    const rest = all.slice(1, routes.length - tail);
    const tailCells = all.slice(routes.length - tail);
    if (rest.length === 0) return all;
    const collapsed: CollapsedRoute[] = rest.map((c) =>
      // rest 内必为 route cell（all 全由 route 构成）
      c.type === 'route' ? { route: c.route, index: c.index } : { route: { label: '' }, index: -1 },
    );
    return [...head, { type: 'ellipsis', count: rest.length, collapsed }, ...tailCells];
  });

  function handleClick(route: BreadcrumbRoute, index: number) {
    onClick?.(route, index);
  }

  // 声明式 <Breadcrumb.Item> 注册：按 mount 顺序（= 源码顺序）收集 id，
  // 据此派生「最后一项」。分隔符本身由纯 CSS 插入，无需 JS。
  //
  // 红线 #2：注册顺序簿记 `order` 用普通数组（非 $state），避免在 Item 的注册
  // $effect 内 push 时既「读」又「写」同一块 $state（数组代理 push 会读 length
  // 再写元素）形成 effect_update_depth_exceeded 自循环。render 真正需要的只有
  // 「末项 id」，单独用 $state `lastId` 承载：register/unregister 仅写它（Item 的
  // effect 不读它），isLast 在 render 期只读，副作用写 / 渲染读分离，无环。
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

<!-- 单个路由项内容：末项=当前页（不可点），有 href=链接，否则可点文本。
     renderItem 优先：传入时直接渲染自定义内容。
     activeIndex 对应项附加 cd-breadcrumb__link--active / cd-breadcrumb__text--active 类。 -->
{#snippet routeItem(route: BreadcrumbRoute, index: number, last: boolean)}
  {#if renderItem}
    {@render renderItem(route, index, last)}
  {:else if last}
    <span class="cd-breadcrumb__current" aria-current="page">{route.label}</span>
  {:else if route.href}
    <a
      class={['cd-breadcrumb__link', activeIndex === index ? 'cd-breadcrumb__link--active' : ''].filter(Boolean).join(' ')}
      href={route.href}
      onclick={() => handleClick(route, index)}>{route.label}</a
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
      }}>{route.label}</span
    >
  {/if}
{/snippet}

<!-- showTooltip 开启：用 Tooltip 包裹（label 截断由 CSS 控制），content 为完整文本。 -->
{#snippet maybeTooltip(route: BreadcrumbRoute, index: number, last: boolean)}
  {#if showTooltip}
    <Tooltip content={route.label} placement="top">
      <span class="cd-breadcrumb__ellipsis-wrap">{@render routeItem(route, index, last)}</span>
    </Tooltip>
  {:else}
    {@render routeItem(route, index, last)}
  {/if}
{/snippet}

<!-- 折叠 ... 触发器（Tooltip/Popover 的 child）。
     menu=true（popover 模式）时声明 disclosure 语义：aria-haspopup="menu"，
     展开态 aria-expanded 由父 Popover 的 trigger 包裹同步（这里补 haspopup=menu，
     使浮层菜单角色与触发器声明一致，符合 WAI-ARIA APG Breadcrumb 折叠节点）。 -->
{#snippet moreTrigger(count: number, menu: boolean)}
  <button
    type="button"
    class="cd-breadcrumb__more"
    aria-label={loc().t('Breadcrumb.moreLabel', { count })}
    aria-haspopup={menu ? 'menu' : undefined}
  >…</button>
{/snippet}

<nav class={cls} aria-label={loc().t('Breadcrumb.ariaLabel')}>
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
                            onclick={() => handleClick(c.route, c.index)}>{c.route.label}</a
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
                            }}>{c.route.label}</span
                          >
                        {/if}
                      </li>
                    {/each}
                  </ul>
                {/snippet}
              </Popover>
            {:else if moreType === 'tooltip'}
              <Tooltip placement="bottom">
                {@render moreTrigger(cell.count, false)}
                {#snippet content()}
                  <span class="cd-breadcrumb__more-tip">
                    {cell.collapsed.map((c) => c.route.label).join(` ${separator} `)}
                  </span>
                {/snippet}
              </Tooltip>
            {:else}
              <!-- 默认模式（无 moreType）：点击就地展开整条 ol，disclosure 语义用 aria-expanded。 -->
              <button
                type="button"
                class="cd-breadcrumb__more"
                aria-label={loc().t('Breadcrumb.moreLabel', { count: cell.count })}
                aria-expanded={expanded}
                onclick={() => (expanded = true)}
              >…</button>
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
    color: var(--cd-breadcrumb-color-link);
    text-decoration: none;
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
  }
  .cd-breadcrumb :global(.cd-breadcrumb__link:hover),
  .cd-breadcrumb :global(.cd-breadcrumb__text:hover) {
    text-decoration: underline;
  }
  .cd-breadcrumb :global(.cd-breadcrumb__link:focus-visible),
  .cd-breadcrumb :global(.cd-breadcrumb__text:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-breadcrumb :global(.cd-breadcrumb__current) {
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
    color: var(--cd-breadcrumb-color-link);
    font: inherit;
    line-height: 1;
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
  }
  .cd-breadcrumb__more:hover {
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
  /* 内层可点元素在截断包裹内需为块级以继承省略号 */
  .cd-breadcrumb__ellipsis-wrap :global(.cd-breadcrumb__link),
  .cd-breadcrumb__ellipsis-wrap :global(.cd-breadcrumb__text),
  .cd-breadcrumb__ellipsis-wrap :global(.cd-breadcrumb__current) {
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
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
  /* moreType=tooltip 折叠项文本（换行友好） */
  .cd-breadcrumb__more-tip {
    white-space: normal;
  }
</style>
