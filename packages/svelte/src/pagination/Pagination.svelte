<!--
  Pagination — 分页器，全面对齐 Semi Design（semi-ui/pagination）。
  两类布局：default（完整页码 + 省略号折叠）与 small（`current/total` 紧凑视图，
  可 hoverShowPageSelect 悬停弹全部页码快速切页）。此外提供 large（本库扩展尺寸）。
  页码折叠、越界钳制、快速跳页解析均走 @chenzy-design/core 纯函数（红线 #2）。
  受控 currentPage/pageSize 永不回写，仅经回调上报（红线 #1）。
  数字用 Intl.NumberFormat 本地化；文案走 locale 包。
  a11y：nav[aria-label] 包裹；页码 li[role=button] + roving tabindex + 方向键漫游，
  当前页 aria-current=page；省略号 aria-hidden。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    paginationPageCount as computePageCount,
    clampPage,
    clampPageSize,
    parseJumpInput,
    pageRange,
    useLiveAnnouncer,
    nextRovingIndex,
    rovingKeyFromEvent,
    type PageCell as CorePageCell,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Select } from '../select/index.js';
  import { Input } from '../input/index.js';
  import { Popover } from '../popover/index.js';

  type PaginationSize = 'small' | 'default' | 'large';
  type PaginationStatus = 'default' | 'warning' | 'error';
  // 对齐 Semi popoverPosition（透传 Popover/Select position）
  type PopoverPosition =
    | 'top'
    | 'topLeft'
    | 'topRight'
    | 'bottom'
    | 'bottomLeft'
    | 'bottomRight'
    | 'left'
    | 'leftTop'
    | 'leftBottom'
    | 'right'
    | 'rightTop'
    | 'rightBottom';

  interface Props {
    total?: number;
    currentPage?: number;
    defaultCurrentPage?: number;
    /** controlled page size; omit for uncontrolled (defaultPageSize) */
    pageSize?: number;
    defaultPageSize?: number;
    /** options for the size changer（对齐 Semi pageSizeOpts） */
    pageSizeOpts?: number[];
    size?: PaginationSize;
    /** quick-jumper validation state (透传 Input) */
    status?: PaginationStatus;
    /** 显示总页数文案；传函数时接收 (total, [start, end]) 返回自定义字符串 */
    showTotal?: boolean | ((total: number, range: [number, number]) => string);
    /** show the page-size selector (reuses Select)；size='small' 时不生效（对齐 Semi） */
    showSizeChanger?: boolean;
    /** show the quick-jump input (reuses Input) */
    showQuickJumper?: boolean;
    /** 仅一页时隐藏整个分页器；showSizeChanger 为 true 时此开关失效（对齐 Semi） */
    hideOnSinglePage?: boolean;
    /** size='small' 时 hover 页码弹出全部页码快速切换（对齐 Semi，v1.27） */
    hoverShowPageSelect?: boolean;
    /** pages kept on each side of the current page（本库扩展，Semi 固定折叠） */
    siblingCount?: number;
    /** pages kept fixed at each boundary（本库扩展） */
    boundaryCount?: number;
    /** size-changer / hover 浮层方位（透传 Select/Popover position） */
    popoverPosition?: PopoverPosition;
    /** 切换 pageSize 时阻止自动调整 currentPage（对齐 Semi） */
    preventPageChangeOnPageSizeChange?: boolean;
    disabled?: boolean;
    locale?: string;
    /** fires on page OR page-size change; receives the resolved (page, pageSize) */
    onChange?: (page: number, pageSize: number) => void;
    /** 仅页码变化时回调（对齐 Semi onPageChange） */
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    ariaLabel?: string;
    /** 自定义页码按钮内容，接收 { page, isCurrent } */
    renderPage?: Snippet<[{ page: number; isCurrent: boolean }]>;
    /** size-changer 浮层层叠顺序（透传 CSS 变量 --cd-select-dropdown-z） */
    popoverZIndex?: number;
    /** 上一页按钮内容，可为字符串或 Snippet */
    prevText?: string | Snippet;
    /** 下一页按钮内容，可为字符串或 Snippet */
    nextText?: string | Snippet;
    /** 透传根元素类名 */
    class?: string;
    /** 透传根元素内联样式 */
    style?: string;
  }

  let {
    total = 0,
    currentPage,
    defaultCurrentPage = 1,
    pageSize,
    defaultPageSize = 10,
    pageSizeOpts = [10, 20, 40, 100],
    size = 'default',
    status = 'default',
    showTotal = false,
    showSizeChanger = false,
    showQuickJumper = false,
    hideOnSinglePage = false,
    hoverShowPageSelect = false,
    siblingCount = 1,
    boundaryCount = 1,
    popoverPosition = 'bottomLeft',
    preventPageChangeOnPageSizeChange = false,
    disabled = false,
    locale = 'zh-CN',
    onChange,
    onPageChange,
    onPageSizeChange,
    ariaLabel,
    renderPage,
    popoverZIndex,
    prevText,
    nextText,
    class: className = '',
    style,
  }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：翻页 / pageSize 变更播报给屏幕阅读器。
  // 命令式写入在事件回调里（非 render 期），符合红线 #3。
  const announcer = useLiveAnnouncer();

  const isSmall = $derived(size === 'small');
  // small 模式下 showSizeChanger 不生效（对齐 Semi）
  const effectiveShowSizeChanger = $derived(showSizeChanger && !isSmall);

  // --- pageSize 受控/非受控 (红线 #1)：不回写 prop ---
  const isSizeControlled = $derived(pageSize !== undefined);
  let innerSize = $state(getInitialSize());
  // 钳制：非法/不在选项内的 pageSize 回退默认值（不回写受控 prop）。
  const currentSize = $derived(
    clampPageSize(isSizeControlled ? (pageSize as number) : innerSize, pageSizeOpts, defaultPageSize),
  );

  function getInitialSize(): number {
    return clampPageSize(defaultPageSize, pageSizeOpts, 10);
  }

  const pageCount = $derived(computePageCount(total, currentSize));

  // Controlled / uncontrolled (red line #1): never write back the prop.
  const isControlled = $derived(currentPage !== undefined);
  let inner = $state(getInitialPage());
  // 钳制：显示的 current 始终落在 [1, pageCount]，越界时显示钳后值（不回写受控 prop）。
  const current = $derived(
    clampPage(isControlled ? (currentPage as number) : inner, total, currentSize),
  );

  function getInitialPage(): number {
    return defaultCurrentPage;
  }

  // size-changer options for Select（若 currentSize 不在 opts 内则插入，对齐 Semi pageSizeInOpts）
  const mergedSizeOpts = $derived(
    pageSizeOpts.includes(currentSize) ? pageSizeOpts : [...pageSizeOpts, currentSize].sort((a, b) => a - b),
  );
  const sizeOptions = $derived(
    mergedSizeOpts.map((n) => ({
      label: loc().t('Pagination.pageSize', { size: n }),
      value: n,
    })),
  );

  // 改变每页条数（对齐 Semi changePageSize）：
  //  - 默认按「当前页首条数据位置」重算 currentPage，保持数据位置；
  //  - preventPageChangeOnPageSizeChange=true 时保持 current 不变（仅钳入合法范围）。
  function changePageSize(nextSize: number) {
    // 先锁定旧 size / 旧 current：改 innerSize 会令 currentSize/current 派生值刷新，
    // 后续重算须用切换「之前」的值算首条数据位置。
    const prevSize = currentSize;
    const prevPage = current;
    if (disabled || nextSize === prevSize) return;
    if (!isSizeControlled) innerSize = nextSize;
    onPageSizeChange?.(nextSize);

    let nextPage: number;
    if (preventPageChangeOnPageSizeChange) {
      nextPage = clampPage(prevPage, total, nextSize);
    } else {
      const firstItemIndex = (prevPage - 1) * prevSize + 1;
      nextPage = clampPage(Math.ceil(firstItemIndex / nextSize), total, nextSize);
    }
    if (!isControlled && nextPage !== inner) inner = nextPage;
    if (nextPage !== prevPage) onPageChange?.(nextPage);
    onChange?.(nextPage, nextSize);
    announcer.announce(
      loc().t('Pagination.pageSizeChangeAnnounce', { size: nextSize, page: nextPage }),
    );
  }

  // 快速跳页：解析输入，越界静默钳入 [1, pageCount]；非数字/空输入忽略。
  let jumpValue = $state('');
  function jump() {
    const next = parseJumpInput(jumpValue, total, currentSize);
    jumpValue = '';
    if (next === null) return;
    goto(next);
  }

  const nf = $derived(new Intl.NumberFormat(locale));

  // Page list with ellipsis folding via core pure function (red line #2):
  // boundaryCount pages kept at each end, siblingCount around current, gaps
  // collapse into '…'. Cell count is bounded → million pages stay O(1) DOM.
  const pages = $derived<CorePageCell[]>(
    pageRange(current, pageCount, siblingCount, boundaryCount),
  );

  // small 模式的全部页码（hoverShowPageSelect 弹层用）；上限对齐 Semi 的百万阈值。
  const allPageNumbers = $derived(
    isSmall && hoverShowPageSelect && !disabled
      ? Array.from({ length: Math.min(pageCount, 1_000_000) }, (_, i) => i + 1)
      : [],
  );

  // hideOnSinglePage：仅一页时隐藏整个分页器；showSizeChanger 为 true 时失效（对齐 Semi）。
  const hidden = $derived(hideOnSinglePage && pageCount <= 1 && !effectiveShowSizeChanger);

  // map popoverPosition → Select placement（camelCase 12 方位）
  const sizeChangerPlacement = $derived(mapToSelectPlacement(popoverPosition));

  // Popover 只接受 side（top/bottom/left/right），12 方位靠 align 组合。
  const popoverSide = $derived<'top' | 'bottom' | 'left' | 'right'>(
    popoverPosition.startsWith('top')
      ? 'top'
      : popoverPosition.startsWith('bottom')
        ? 'bottom'
        : popoverPosition.startsWith('left')
          ? 'left'
          : 'right',
  );
  function mapToSelectPlacement(pos: PopoverPosition) {
    // Select placement 用 camelCase start/end 语义；Semi bottomLeft≈bottomStart
    switch (pos) {
      case 'top':
        return 'top' as const;
      case 'topLeft':
        return 'topStart' as const;
      case 'topRight':
        return 'topEnd' as const;
      case 'bottom':
        return 'bottom' as const;
      case 'bottomRight':
        return 'bottomEnd' as const;
      case 'bottomLeft':
      default:
        return 'bottomStart' as const;
    }
  }

  const isFirst = $derived(current <= 1);
  const isLast = $derived(current >= pageCount);

  const cls = $derived(
    ['cd-pagination', `cd-pagination--${size}`, isSmall ? 'cd-pagination--small-layout' : '', disabled ? 'cd-pagination--disabled' : '', className]
      .filter(Boolean)
      .join(' '),
  );

  function goto(page: number) {
    if (disabled) return;
    const next = clampPage(page, total, currentSize);
    if (next === current) return;
    if (!isControlled) inner = next;
    onPageChange?.(next);
    onChange?.(next, currentSize);
    // 用「即将生效」的 next/pageCount 播报（$derived 在同步回调内尚未重算；受控时本就不回写）。
    announcer.announce(
      loc().t('Pagination.pageChangeAnnounce', { page: next, count: pageCount }),
    );
  }

  // showTotal 显示的是总页数（对齐 Semi：Math.ceil(total/pageSize)）。
  const totalText = $derived(loc().t('Pagination.total', { total: nf.format(pageCount) }));

  // --- roving tabindex（页码 li，红线 #2/#3）---
  // 仅 `type === 'page'` 的单元格参与漫游；省略号/prev/next 不在序列内。
  const pageValues = $derived(pages.filter((c) => c.type === 'page').map((c) => c.value));
  let listEl = $state<HTMLElement | null>(null);
  // focusedPage 为 null 时，tab 落点回退到当前激活页（current）。
  let focusedPage = $state<number | null>(null);

  // 纯函数 tabindex：焦点项 0，其余 -1（无焦点项时 current 接收 Tab）。
  function pageTabindex(value: number): 0 | -1 {
    const stop = focusedPage ?? current;
    return value === stop ? 0 : -1;
  }

  // 方向键漫游：移动焦点，不切页；Enter/Space 交给原生 <button> click → goto。
  function onPageKeydown(e: KeyboardEvent, value: number) {
    const intent = rovingKeyFromEvent(e.key);
    if (!intent) return;
    e.preventDefault();
    const vals = pageValues;
    const idx = vals.indexOf(value);
    const nextIdx = nextRovingIndex(idx, vals.length, intent, false);
    const nextVal = vals[nextIdx];
    if (nextVal !== undefined) {
      focusedPage = nextVal;
      listEl?.querySelector<HTMLElement>(`[data-page="${nextVal}"]`)?.focus();
    }
  }
</script>

{#snippet prevBtn()}
  <li class="cd-pagination__item-wrap">
    <button
      type="button"
      class="cd-pagination__item cd-pagination__prev"
      disabled={disabled || isFirst}
      aria-label={loc().t('Pagination.prevPage')}
      onclick={() => goto(current - 1)}
    >{#if prevText}{#if typeof prevText === 'function'}{@render prevText()}{:else}{prevText}{/if}{:else}‹{/if}</button>
  </li>
{/snippet}

{#snippet nextBtn()}
  <li class="cd-pagination__item-wrap">
    <button
      type="button"
      class="cd-pagination__item cd-pagination__next"
      disabled={disabled || isLast}
      aria-label={loc().t('Pagination.nextPage')}
      onclick={() => goto(current + 1)}
    >{#if nextText}{#if typeof nextText === 'function'}{@render nextText()}{:else}{nextText}{/if}{:else}›{/if}</button>
  </li>
{/snippet}

{#snippet quickJumper()}
  {#if showQuickJumper}
    <span class="cd-pagination__quickjump" class:cd-pagination__quickjump--disabled={disabled || pageCount === 1}>
      <span class="cd-pagination__quickjump-label">{loc().t('Pagination.jumpTo')}</span>
      <span class="cd-pagination__quickjump-input">
        <Input
          {size}
          {status}
          disabled={disabled || pageCount === 1}
          ariaLabel={loc().t('Pagination.jumpTo')}
          value={jumpValue}
          onInput={(v) => (jumpValue = v)}
          onEnter={jump}
        />
      </span>
      {#if loc().t('Pagination.jumpToSuffix')}
        <span class="cd-pagination__quickjump-suffix">{loc().t('Pagination.jumpToSuffix')}</span>
      {/if}
    </span>
  {/if}
{/snippet}

{#snippet restList(nums: number[])}
  <div class="cd-pagination__rest-list" role="listbox" aria-label={loc().t('Pagination.ariaLabel')}>
    {#each nums as n (n)}
      <div
        class="cd-pagination__rest-item"
        role="option"
        aria-selected={n === current}
        aria-label={loc().t('Pagination.pageLabel', { page: n })}
        onclick={() => goto(n)}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), goto(n))}
        tabindex="-1"
      >{nf.format(n)}</div>
    {/each}
  </div>
{/snippet}

{#if !hidden}
{#if isSmall}
  <nav
    class={cls}
    {style}
    aria-label={ariaLabel ?? loc().t('Pagination.ariaLabel')}
  >
    <ul class="cd-pagination__list" bind:this={listEl}>
      {@render prevBtn()}
      {#if hoverShowPageSelect && !disabled}
        <!-- Popover 渲染为 span，须包在 <li> 内保持 <ul> 合法子；触发器内容用 span（非 li），
             避免 <span><li> 非法嵌套导致 .cd-popover 布局塌陷、浮层定位到 (0,0)。 -->
        <li class="cd-pagination__item-wrap">
          <Popover position={popoverSide} align="center" trigger="hover" showArrow={false}>
            {#snippet content()}{@render restList(allPageNumbers)}{/snippet}
            <span class="cd-pagination__item cd-pagination__item--small">
              {nf.format(current)}/{nf.format(pageCount)}
            </span>
          </Popover>
        </li>
      {:else}
        <li class="cd-pagination__item-wrap">
          <span class="cd-pagination__item cd-pagination__item--small">
            {nf.format(current)}/{nf.format(pageCount)}
          </span>
        </li>
      {/if}
      {@render nextBtn()}
    </ul>
    {@render quickJumper()}
  </nav>
{:else}
  <nav
    class={cls}
    {style}
    aria-label={ariaLabel ?? loc().t('Pagination.ariaLabel')}
  >
    {#if showTotal}
      <span class="cd-pagination__total">
        {#if typeof showTotal === 'function'}
          {showTotal(total, [(current - 1) * currentSize + 1, Math.min(current * currentSize, total)])}
        {:else}
          {totalText}
        {/if}
      </span>
    {/if}

    <ul class="cd-pagination__list" bind:this={listEl}>
      {@render prevBtn()}
      {#each pages as cell (cell.type === 'page' ? `p-${cell.value}` : `e-${cell.position}`)}
        {#if cell.type === 'ellipsis'}
          <li class="cd-pagination__item-wrap" aria-hidden="true">
            <span class="cd-pagination__item cd-pagination__ellipsis">…</span>
          </li>
        {:else}
          <li class="cd-pagination__item-wrap">
            <button
              type="button"
              class="cd-pagination__item cd-pagination__page"
              class:cd-pagination__page--active={cell.value === current}
              aria-current={cell.value === current ? 'page' : undefined}
              aria-label={loc().t('Pagination.pageLabel', { page: cell.value })}
              data-page={cell.value}
              {disabled}
              tabindex={disabled ? -1 : pageTabindex(cell.value)}
              onclick={() => goto(cell.value)}
              onfocus={() => (focusedPage = cell.value)}
              onkeydown={(e) => onPageKeydown(e, cell.value)}
            >{#if renderPage}{@render renderPage({ page: cell.value, isCurrent: cell.value === current })}{:else}{nf.format(cell.value)}{/if}</button>
          </li>
        {/if}
      {/each}
      {@render nextBtn()}
    </ul>

    {#if effectiveShowSizeChanger}
      <span class="cd-pagination__switch" style={popoverZIndex != null ? `--cd-select-dropdown-z:${popoverZIndex}` : undefined}>
        <Select
          {size}
          {disabled}
          clickToHide
          ariaLabel={loc().t('Pagination.itemsPerPage')}
          placement={sizeChangerPlacement}
          options={sizeOptions}
          value={currentSize}
          onChange={(v) => changePageSize(Number(v))}
        />
      </span>
    {/if}

    {@render quickJumper()}
  </nav>
{/if}
{/if}

<style>
  .cd-pagination {
    display: flex;
    align-items: center;
    padding: var(--cd-spacing-pagination-padding);
    color: var(--cd-color-pagination-text-default);
    font-weight: var(--cd-font-pagination-item-fontweight);
  }
  .cd-pagination--disabled {
    cursor: not-allowed;
  }
  .cd-pagination--disabled .cd-pagination__total {
    color: var(--cd-color-pagination-item-text-disabled);
  }
  .cd-pagination__list {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-pagination__item-wrap {
    display: flex;
    align-items: center;
  }
  .cd-pagination__item {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-inline-size: var(--cd-width-pagination-item-minwidth);
    block-size: var(--cd-height-pagination-item);
    margin-inline-start: var(--cd-spacing-pagination-item-marginleft);
    margin-inline-end: var(--cd-spacing-pagination-item-marginright);
    padding-inline: var(--cd-spacing-tight);
    border: var(--cd-width-pagination-item-border) solid var(--cd-color-pagination-item-border-default);
    border-radius: var(--cd-radius-pagination-item);
    background: var(--cd-color-pagination-item-bg-default);
    color: var(--cd-color-pagination-item-text-default);
    font: inherit;
    font-weight: var(--cd-font-pagination-item-fontweight);
    text-align: center;
    cursor: pointer;
    user-select: none;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-pagination__item:hover:not(:disabled):not(.cd-pagination__item--disabled):not(.cd-pagination__page--active) {
    background: var(--cd-color-pagination-item-bg-hover);
    color: var(--cd-color-pagination-item-text-hover);
    border-color: var(--cd-color-pagination-item-border-hover);
  }
  .cd-pagination__item:active:not(:disabled):not(.cd-pagination__item--disabled):not(.cd-pagination__page--active) {
    background: var(--cd-color-pagination-item-bg-active);
    color: var(--cd-color-pagination-item-text-active);
    border-color: var(--cd-color-pagination-item-border-active);
  }
  .cd-pagination__page--active {
    background: var(--cd-color-pagination-item-bg-selected);
    color: var(--cd-color-pagination-item-text-selected);
    border-color: var(--cd-color-pagination-item-border-selected);
    font-weight: var(--cd-font-pagination-item-active-fontweight);
  }
  .cd-pagination__page--active:hover {
    background: var(--cd-color-pagination-item-bg-selected);
    color: var(--cd-color-pagination-item-text-selected);
    border-color: var(--cd-color-pagination-item-border-selected);
  }
  .cd-pagination__item:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* prev/next 为图标态，消费 icon token（对齐 Semi $color-pagination_item-icon-*） */
  .cd-pagination__prev,
  .cd-pagination__next {
    color: var(--cd-color-pagination-item-icon-default);
  }
  /* 禁用态：button 原生 :disabled（页码/prev/next）+ 整体禁用容器类。
     hover 不改变（上面 hover 规则已 :not(:disabled)）。 */
  .cd-pagination__item:disabled,
  .cd-pagination__item--disabled {
    cursor: not-allowed;
    color: var(--cd-color-pagination-item-text-disabled);
    background: var(--cd-color-pagination-item-bg-disabled);
    border-color: var(--cd-color-pagination-item-border-disabled);
  }
  .cd-pagination__prev:disabled,
  .cd-pagination__next:disabled {
    color: var(--cd-color-pagination-item-icon-disabled);
  }
  /* 整体 disabled 时的当前页：选中禁用背景 + 禁用文字（对齐 Semi item-all-disabled-active） */
  .cd-pagination--disabled .cd-pagination__page--active:disabled {
    background: var(--cd-color-pagination-item-bg-selected-disabled);
    color: var(--cd-color-pagination-item-text-disabled);
  }
  .cd-pagination__ellipsis {
    cursor: default;
  }
  .cd-pagination__ellipsis:hover {
    background: var(--cd-color-pagination-item-bg-default);
    color: var(--cd-color-pagination-item-text-default);
  }
  .cd-pagination__switch {
    display: inline-flex;
    user-select: none;
  }
  .cd-pagination__quickjump {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    margin-inline-start: var(--cd-spacing-pagination-quickjump-marginleft);
    color: var(--cd-color-pagination-item-text-default);
    font-weight: var(--cd-font-pagination-quickjump-fontweight);
  }
  .cd-pagination__quickjump--disabled {
    color: var(--cd-color-pagination-quickjump-text-disabled);
  }
  .cd-pagination__quickjump-input {
    inline-size: var(--cd-width-pagination-quickjump-input-width);
    margin-inline-start: var(--cd-spacing-pagination-quickjump-input-marginleft);
    margin-inline-end: var(--cd-spacing-pagination-quickjump-input-marginright);
  }
  /* small 布局：迷你页码最小宽度 + 零外边距（对齐 Semi item-small）。
     Semi 的 small 分页字号仍为正文字号（font-size-regular），仅字重走 small token。 */
  .cd-pagination--small {
    font-weight: var(--cd-font-pagination-small-fontweight);
    padding: var(--cd-spacing-pagination-small-paddingy) var(--cd-spacing-pagination-small-paddingx);
  }
  .cd-pagination__item--small {
    min-inline-size: var(--cd-width-pagination-item-small-minwidth);
    margin: var(--cd-spacing-pagination-item-small-margin);
  }
  .cd-pagination--large .cd-pagination__item {
    font-size: var(--cd-font-size-header-6);
  }
  /* hoverShowPageSelect 弹层：全部页码列表（对齐 Semi rest-list/rest-item） */
  /* hover 弹层列表：对齐 Semi rest-list。浮层卡片（白底 + 圆角 + 阴影）由 Popover 提供，
     此处用负 margin 抵消 Popover 默认内容内边距，让页码列表铺满卡片边缘（仅列表上下留白），
     固定宽度对齐 Semi（78px），超过 5 项纵向滚动。 */
  /* hover 弹层列表：白卡片 + 圆角 + 阴影由 Popover 提供，列表居中于卡片内。
     不用负 margin / 固定宽度（会让浮层整体左移偏出触发器）；靠内容自然宽度，
     Popover align=start 使卡片左缘对齐触发器左缘（对齐 Semi bottomLeft）。 */
  .cd-pagination__rest-list {
    min-inline-size: 2.5rem; /* ≥ 页码 item 最小宽，保证窄数字也够点 */
    max-block-size: calc(var(--cd-height-pagination-item) * 5);
    overflow-y: auto;
  }
  .cd-pagination__rest-item {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    block-size: var(--cd-height-pagination-item);
    color: var(--cd-color-pagination-item-text-default);
    cursor: pointer;
  }
  .cd-pagination__rest-item:hover {
    background: var(--cd-color-pagination-item-bg-hover);
    color: var(--cd-color-pagination-item-text-hover);
  }
  .cd-pagination__rest-item:active {
    background: var(--cd-color-pagination-item-bg-active);
    color: var(--cd-color-pagination-item-text-active);
  }
  .cd-pagination__rest-item[aria-selected='true'] {
    color: var(--cd-color-pagination-item-text-selected);
    font-weight: var(--cd-font-pagination-item-active-fontweight);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-pagination__item {
      transition: none;
    }
  }
</style>
