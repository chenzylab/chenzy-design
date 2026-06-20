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
    class: className = '',
    children,
    onClick,
  }: Props = $props();

  const loc = useLocale();

  const cls = $derived(
    ['cd-breadcrumb', `cd-breadcrumb--${size}`, className].filter(Boolean).join(' '),
  );

  const hasRoutes = $derived(routes.length > 0);

  // 折叠：展开后显示全部；本地 $state。
  let expanded = $state(false);

  // 折叠生效：maxItemCount>0、未展开、路由数超上限。
  // 折叠后展示：首项 + ellipsis + 末 (maxItemCount-1) 项。
  const cells = $derived.by<DisplayCell[]>(() => {
    const all: DisplayCell[] = routes.map((route, index) => ({
      type: 'route',
      route,
      index,
    }));
    if (expanded || maxItemCount <= 0 || routes.length <= maxItemCount) return all;
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
  let nextId = 0;
  let registered = $state<number[]>([]);
  setBreadcrumbContext({
    register: () => {
      const id = nextId++;
      registered.push(id);
      return id;
    },
    unregister: (id: number) => {
      const i = registered.indexOf(id);
      if (i !== -1) registered.splice(i, 1);
    },
    isLast: (id: number) => registered.length > 0 && registered[registered.length - 1] === id,
  });
</script>

<!-- 单个路由项内容：末项=当前页（不可点），有 href=链接，否则可点文本。 -->
{#snippet routeItem(route: BreadcrumbRoute, index: number, last: boolean)}
  {#if last}
    <span class="cd-breadcrumb__current" aria-current="page">{route.label}</span>
  {:else if route.href}
    <a
      class="cd-breadcrumb__link"
      href={route.href}
      onclick={() => handleClick(route, index)}>{route.label}</a
    >
  {:else}
    <span
      class="cd-breadcrumb__text"
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

<!-- 折叠 ... 触发器（Tooltip/Popover 的 child） -->
{#snippet moreTrigger(count: number)}
  <button
    type="button"
    class="cd-breadcrumb__more"
    aria-label={loc().t('Breadcrumb.moreLabel', { count })}
  >…</button>
{/snippet}

<nav class={cls} aria-label={loc().t('Breadcrumb.ariaLabel')}>
  {#if hasRoutes}
    <ol class="cd-breadcrumb__list">
      {#each cells as cell, cellIndex (cell.type === 'route' ? `r-${cell.index}` : 'ellipsis')}
        {@const isLast = cellIndex === cells.length - 1}
        <li class="cd-breadcrumb__item">
          {#if cell.type === 'ellipsis'}
            {#if moreType === 'popover'}
              <Popover trigger="click" position="bottom" align="start">
                {@render moreTrigger(cell.count)}
                {#snippet contentSlot()}
                  <ul class="cd-breadcrumb__more-list">
                    {#each cell.collapsed as c (c.index)}
                      <li class="cd-breadcrumb__more-list-item">
                        {#if c.route.href}
                          <a
                            class="cd-breadcrumb__link"
                            href={c.route.href}
                            onclick={() => handleClick(c.route, c.index)}>{c.route.label}</a
                          >
                        {:else}
                          <span
                            class="cd-breadcrumb__text"
                            role="link"
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
                {@render moreTrigger(cell.count)}
                {#snippet content()}
                  <span class="cd-breadcrumb__more-tip">
                    {cell.collapsed.map((c) => c.route.label).join(` ${separator} `)}
                  </span>
                {/snippet}
              </Tooltip>
            {:else}
              <button
                type="button"
                class="cd-breadcrumb__more"
                aria-label={loc().t('Breadcrumb.moreLabel', { count: cell.count })}
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
    font-size: var(--cd-font-size-1);
  }
  .cd-breadcrumb--large {
    font-size: var(--cd-font-size-3);
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
    border-radius: var(--cd-radius-1);
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
  }
  .cd-breadcrumb__more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 1.5em;
    padding: 0 var(--cd-spacing-1);
    border: none;
    background: transparent;
    color: var(--cd-breadcrumb-color-link);
    font: inherit;
    line-height: 1;
    cursor: pointer;
    border-radius: var(--cd-radius-1);
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
    max-inline-size: var(--cd-breadcrumb-item-max-width, 12em);
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
    gap: var(--cd-spacing-1);
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
