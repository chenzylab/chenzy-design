<!--
  Pagination — 分页器，严格对齐 Semi Design（semi-ui/pagination）。
  两类布局：default（完整页码 + 省略号折叠，7 格上限）与 small（`current/total`
  紧凑视图，可 hoverShowPageSelect 悬停弹全部页码快速切页）。
  页码折叠严格镜像 Semi `_updatePageList`（core semiPageList 纯函数）；越界钳制、
  快速跳页解析走 @chenzy-design/core。省略号 hover 弹出隐藏页码列表（对齐 Semi Popover）。
  受控 currentPage/pageSize 永不回写，仅经回调上报（红线 #1）。
  文案走 locale-provider 上下文；页码为原始数字（对齐 Semi，不做 Intl 本地化）。
  a11y：nav[aria-label] 包裹；页码 li 内 <button> + roving tabindex + 方向键漫游，
  当前页 aria-current=page；省略号 aria-hidden。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    paginationPageCount as computePageCount,
    clampPage,
    clampPageSize,
    parseJumpInput,
    semiPageList,
    nextRovingIndex,
    rovingKeyFromEvent,
    useLiveAnnouncer,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Select } from '../select/index.js';
  import { Input } from '../input/index.js';
  import { Popover } from '../popover/index.js';

  // 对齐 Semi popoverPosition（PopoverPosition = Position，透传 Popover/Select position）
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

  // 严格对齐 Semi PaginationProps（semi-ui/pagination/index.tsx）。
  interface Props {
    /** 总条数（对齐 Semi total，默认 1） */
    total?: number;
    /** 是否显示总页数（对齐 Semi showTotal） */
    showTotal?: boolean;
    /** 每页条数；缺省时取 pageSizeOpts[0]（对齐 Semi pageSize，默认 null） */
    pageSize?: number;
    /** size changer 可选每页条数（对齐 Semi pageSizeOpts） */
    pageSizeOpts?: number[];
    /** 尺寸（对齐 Semi size） */
    size?: 'small' | 'default';
    /** 受控当前页（越界自动钳制显示，不回写；对齐 Semi currentPage） */
    currentPage?: number;
    /** 默认当前页（非受控；对齐 Semi defaultCurrentPage，默认 1） */
    defaultCurrentPage?: number;
    /** 仅页码变化回调（对齐 Semi onPageChange） */
    onPageChange?: (currentPage: number) => void;
    /** 每页容量变化回调（对齐 Semi onPageSizeChange） */
    onPageSizeChange?: (newPageSize: number) => void;
    /** 页码或每页容量变化回调（对齐 Semi onChange） */
    onChange?: (currentPage: number, pageSize: number) => void;
    /** 上一页按钮内容，可为字符串或 Snippet（对齐 Semi prevText） */
    prevText?: string | Snippet;
    /** 下一页按钮内容，可为字符串或 Snippet（对齐 Semi nextText） */
    nextText?: string | Snippet;
    /** 显示每页条数 Select；size=small 时不生效（对齐 Semi showSizeChanger） */
    showSizeChanger?: boolean;
    /** 显示快速跳页 Input（对齐 Semi showQuickJumper） */
    showQuickJumper?: boolean;
    /** 浮层 z-index（对齐 Semi popoverZIndex，默认 1030） */
    popoverZIndex?: number;
    /** size changer / 省略号 / hover 浮层方位（对齐 Semi popoverPosition） */
    popoverPosition?: PopoverPosition;
    /** 透传根元素内联样式（对齐 Semi style） */
    style?: string;
    /** 透传根元素类名（对齐 Semi className） */
    class?: string;
    /** 仅一页时隐藏整个分页器；showSizeChanger 为 true 时失效（对齐 Semi hideOnSinglePage） */
    hideOnSinglePage?: boolean;
    /** size=small 时 hover 页码弹出全部页码快速切换（对齐 Semi hoverShowPageSelect，v1.27） */
    hoverShowPageSelect?: boolean;
    /** 禁用（对齐 Semi disabled） */
    disabled?: boolean;
    /** 切换 pageSize 时阻止自动调整 currentPage（对齐 Semi preventPageChangeOnPageSizeChange） */
    preventPageChangeOnPageSizeChange?: boolean;
  }

  let {
    total = 1,
    showTotal = false,
    pageSize,
    pageSizeOpts = [10, 20, 40, 100],
    size = 'default',
    currentPage,
    defaultCurrentPage = 1,
    onPageChange,
    onPageSizeChange,
    onChange,
    prevText,
    nextText,
    showSizeChanger = false,
    showQuickJumper = false,
    popoverZIndex = 1030,
    popoverPosition = 'bottomLeft',
    style,
    class: className = '',
    hideOnSinglePage = false,
    hoverShowPageSelect = false,
    disabled = false,
    preventPageChangeOnPageSizeChange = false,
  }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：翻页 / pageSize 变更播报给屏幕阅读器。命令式写入在事件回调里。
  const announcer = useLiveAnnouncer();

  const isSmall = $derived(size === 'small');
  // small 模式下 showSizeChanger 不生效（对齐 Semi）
  const effectiveShowSizeChanger = $derived(showSizeChanger && !isSmall);

  // 缺省 pageSize 取 pageSizeOpts[0]，再退默认 10（对齐 Semi constructor）
  const fallbackSize = $derived(pageSizeOpts[0] ?? 10);

  // --- pageSize 受控/非受控 (红线 #1)：不回写 prop ---
  const isSizeControlled = $derived(pageSize !== undefined);
  let innerSize = $state<number | undefined>(undefined);
  // 非受控初值：pageSizeOpts[0]（惰性，首个渲染取 fallbackSize）
  const currentSize = $derived(
    clampPageSize(
      isSizeControlled ? (pageSize as number) : (innerSize ?? fallbackSize),
      pageSizeOpts,
      fallbackSize,
    ),
  );

  const pageCount = $derived(computePageCount(total, currentSize));

  // Controlled / uncontrolled (red line #1): never write back the prop.
  const isControlled = $derived(currentPage !== undefined);
  let inner = $state(getInitialPage());
  function getInitialPage(): number {
    return defaultCurrentPage;
  }
  // 钳制：显示的 current 始终落在 [1, pageCount]（不回写受控 prop）。
  const current = $derived(
    clampPage(isControlled ? (currentPage as number) : inner, total, currentSize),
  );

  // size-changer options：若 currentSize 不在 opts 内则插入（对齐 Semi pageSizeInOpts）
  const mergedSizeOpts = $derived(
    pageSizeOpts.includes(currentSize)
      ? pageSizeOpts
      : [...pageSizeOpts, currentSize].sort((a, b) => a - b),
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

  // 页码列表（含 '...' + 各省略号背后的隐藏页），严格镜像 Semi _updatePageList。
  const pageData = $derived(semiPageList(current, pageCount));

  // small 模式的全部页码（hoverShowPageSelect 弹层用）；上限对齐 Semi 百万阈值。
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
    [
      'cd-page',
      isSmall ? 'cd-page-small' : '',
      disabled ? 'cd-page-disabled' : '',
      className,
    ]
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
    announcer.announce(
      loc().t('Pagination.pageChangeAnnounce', { page: next, count: pageCount }),
    );
  }

  // showTotal 显示总页数（对齐 Semi：Math.ceil(total/pageSize)）。
  const totalText = $derived(loc().t('Pagination.total', { total: pageCount }));

  // --- roving tabindex（页码 button，红线 #2/#3）---
  const pageValues = $derived(
    pageData.pageList.filter((c): c is number => typeof c === 'number'),
  );
  let listEl = $state<HTMLElement | null>(null);
  let focusedPage = $state<number | null>(null);

  function pageTabindex(value: number): 0 | -1 {
    const stop = focusedPage ?? current;
    return value === stop ? 0 : -1;
  }

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
  <li class="cd-page-item-wrap">
    <button
      type="button"
      class="cd-page-item cd-page-prev"
      disabled={disabled || isFirst}
      aria-label={loc().t('Pagination.prevPage')}
      onclick={() => goto(current - 1)}
    >{#if prevText}{#if typeof prevText === 'function'}{@render prevText()}{:else}{prevText}{/if}{:else}‹{/if}</button>
  </li>
{/snippet}

{#snippet nextBtn()}
  <li class="cd-page-item-wrap">
    <button
      type="button"
      class="cd-page-item cd-page-next"
      disabled={disabled || isLast}
      aria-label={loc().t('Pagination.nextPage')}
      onclick={() => goto(current + 1)}
    >{#if nextText}{#if typeof nextText === 'function'}{@render nextText()}{:else}{nextText}{/if}{:else}›{/if}</button>
  </li>
{/snippet}

{#snippet quickJumper()}
  {#if showQuickJumper}
    <span
      class="cd-page-quickjump"
      class:cd-page-quickjump-disabled={disabled || pageCount === 1}
    >
      <span class="cd-page-quickjump-label">{loc().t('Pagination.jumpTo')}</span>
      <span class="cd-page-quickjump-input">
        <Input
          {size}
          disabled={disabled || pageCount === 1}
          ariaLabel={loc().t('Pagination.jumpTo')}
          value={jumpValue}
          onInput={(v) => (jumpValue = v)}
          onEnterPress={jump}
        />
      </span>
      {#if loc().t('Pagination.jumpToSuffix')}
        <span class="cd-page-quickjump-suffix">{loc().t('Pagination.jumpToSuffix')}</span>
      {/if}
    </span>
  {/if}
{/snippet}

{#snippet restList(nums: number[])}
  <div class="cd-page-rest-list" role="listbox" aria-label={loc().t('Pagination.ariaLabel')}>
    {#each nums as n (n)}
      <div
        class="cd-page-rest-item"
        role="option"
        aria-selected={n === current}
        aria-label={loc().t('Pagination.pageLabel', { page: n })}
        onclick={() => goto(n)}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), goto(n))}
        tabindex="-1"
      >{n}</div>
    {/each}
  </div>
{/snippet}

{#if !hidden}
  {#if isSmall}
    <nav class={cls} {style} aria-label={loc().t('Pagination.ariaLabel')}>
      <ul class="cd-page-list" bind:this={listEl}>
        {@render prevBtn()}
        {#if hoverShowPageSelect && !disabled}
          <!-- Popover 渲染为 span，须包在 <li> 内保持 <ul> 合法子；触发器内容用 span（非 li）。 -->
          <li class="cd-page-item-wrap">
            <Popover position={popoverSide} trigger="hover" showArrow={false} zIndex={popoverZIndex}>
              {#snippet content()}{@render restList(allPageNumbers)}{/snippet}
              <span class="cd-page-item cd-page-item-small">
                {current}/{pageCount}
              </span>
            </Popover>
          </li>
        {:else}
          <li class="cd-page-item-wrap">
            <span class="cd-page-item cd-page-item-small">
              {current}/{pageCount}
            </span>
          </li>
        {/if}
        {@render nextBtn()}
      </ul>
      {@render quickJumper()}
    </nav>
  {:else}
    <nav class={cls} {style} aria-label={loc().t('Pagination.ariaLabel')}>
      {#if showTotal}
        <span class="cd-page-total">{totalText}</span>
      {/if}

      <ul class="cd-page-list" bind:this={listEl}>
        {@render prevBtn()}
        {#each pageData.pageList as cell, i (typeof cell === 'number' ? `p-${cell}` : `e-${i}`)}
          {#if cell === '...'}
            {#if disabled}
              <li class="cd-page-item-wrap" aria-hidden="true">
                <span class="cd-page-item cd-page-item-rest">…</span>
              </li>
            {:else}
              <!-- 省略号 hover 弹出隐藏页码列表（对齐 Semi renderRestPageList）：
                   i<3 用左侧隐藏页，否则右侧隐藏页。 -->
              <li class="cd-page-item-wrap">
                <Popover
                  position={popoverPosition.startsWith('top') ? 'top' : 'bottom'}
                  trigger="hover"
                  showArrow={false}
                  zIndex={popoverZIndex}
                >
                  {#snippet content()}{@render restList(i < 3 ? pageData.restLeft : pageData.restRight)}{/snippet}
                  <span
                    class="cd-page-item cd-page-item-rest"
                    aria-label={loc().t('Pagination.more')}
                  >…</span>
                </Popover>
              </li>
            {/if}
          {:else}
            <li class="cd-page-item-wrap">
              <button
                type="button"
                class="cd-page-item cd-page-item"
                class:cd-page-item-active={cell === current}
                aria-current={cell === current ? 'page' : undefined}
                aria-label={loc().t('Pagination.pageLabel', { page: cell })}
                data-page={cell}
                {disabled}
                tabindex={disabled ? -1 : pageTabindex(cell)}
                onclick={() => goto(cell)}
                onfocus={() => (focusedPage = cell)}
                onkeydown={(e) => onPageKeydown(e, cell)}
              >{cell}</button>
            </li>
          {/if}
        {/each}
        {@render nextBtn()}
      </ul>

      {#if effectiveShowSizeChanger}
        <span
          class="cd-page-switch"
          style={popoverZIndex != null ? `--cd-select-dropdown-z:${popoverZIndex}` : undefined}
        >
          <Select
            {size}
            {disabled}
            clickToHide
            ariaLabel={loc().t('Pagination.itemsPerPage')}
            position={sizeChangerPlacement}
            optionList={sizeOptions}
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
  .cd-page {
    display: flex;
    align-items: center;
    padding: var(--cd-spacing-pagination-padding);
    color: var(--cd-color-pagination-text-default);
    font-weight: var(--cd-font-pagination-item-fontweight);
  }
  .cd-page-disabled {
    cursor: not-allowed;
  }
  .cd-page-disabled .cd-page-total {
    color: var(--cd-color-pagination-item-text-disabled);
  }
  .cd-page-list {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-page-item-wrap {
    display: flex;
    align-items: center;
  }
  .cd-page-item {
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
  .cd-page-item:hover:not(:disabled):not(.cd-page-item-disabled):not(.cd-page-item-active) {
    background: var(--cd-color-pagination-item-bg-hover);
    color: var(--cd-color-pagination-item-text-hover);
    border-color: var(--cd-color-pagination-item-border-hover);
  }
  .cd-page-item:active:not(:disabled):not(.cd-page-item-disabled):not(.cd-page-item-active) {
    background: var(--cd-color-pagination-item-bg-active);
    color: var(--cd-color-pagination-item-text-active);
    border-color: var(--cd-color-pagination-item-border-active);
  }
  .cd-page-item-active {
    background: var(--cd-color-pagination-item-bg-selected);
    color: var(--cd-color-pagination-item-text-selected);
    border-color: var(--cd-color-pagination-item-border-selected);
    font-weight: var(--cd-font-pagination-item-active-fontweight);
  }
  .cd-page-item-active:hover {
    background: var(--cd-color-pagination-item-bg-selected);
    color: var(--cd-color-pagination-item-text-selected);
    border-color: var(--cd-color-pagination-item-border-selected);
  }
  .cd-page-item:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* prev/next 为图标态，消费 icon token（对齐 Semi $color-pagination_item-icon-*） */
  .cd-page-prev,
  .cd-page-next {
    color: var(--cd-color-pagination-item-icon-default);
  }
  /* 禁用态：button 原生 :disabled（页码/prev/next）+ 整体禁用容器类。 */
  .cd-page-item:disabled,
  .cd-page-item-disabled {
    cursor: not-allowed;
    color: var(--cd-color-pagination-item-text-disabled);
    background: var(--cd-color-pagination-item-bg-disabled);
    border-color: var(--cd-color-pagination-item-border-disabled);
  }
  .cd-page-prev:disabled,
  .cd-page-next:disabled {
    color: var(--cd-color-pagination-item-icon-disabled);
  }
  /* 整体 disabled 时的当前页：选中禁用背景 + 禁用文字（对齐 Semi item-all-disabled-active） */
  .cd-page-disabled .cd-page-item-active:disabled {
    background: var(--cd-color-pagination-item-bg-selected-disabled);
    color: var(--cd-color-pagination-item-text-disabled);
  }
  .cd-page-item-rest {
    cursor: default;
  }
  .cd-page-item-rest:hover {
    background: var(--cd-color-pagination-item-bg-default);
    color: var(--cd-color-pagination-item-text-default);
  }
  .cd-page-switch {
    display: inline-flex;
    user-select: none;
  }
  .cd-page-quickjump {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    margin-inline-start: var(--cd-spacing-pagination-quickjump-marginleft);
    color: var(--cd-color-pagination-item-text-default);
    font-weight: var(--cd-font-pagination-quickjump-fontweight);
  }
  .cd-page-quickjump-disabled {
    color: var(--cd-color-pagination-quickjump-text-disabled);
  }
  .cd-page-quickjump-input {
    inline-size: var(--cd-width-pagination-quickjump-input-width);
    margin-inline-start: var(--cd-spacing-pagination-quickjump-input-marginleft);
    margin-inline-end: var(--cd-spacing-pagination-quickjump-input-marginright);
  }
  /* small 布局：字重走 small token（对齐 Semi page-small），字号仍为正文字号。 */
  .cd-page-small {
    font-weight: var(--cd-font-pagination-small-fontweight);
    padding: var(--cd-spacing-pagination-small-paddingy) var(--cd-spacing-pagination-small-paddingx);
  }
  .cd-page-item-small {
    min-inline-size: var(--cd-width-pagination-item-small-minwidth);
    margin: var(--cd-spacing-pagination-item-small-margin);
  }
  /* hover 弹层列表：白卡片 + 圆角 + 阴影由 Popover 提供，页码列表居中于卡片内。
     超过 5 项纵向滚动（对齐 Semi rest-list itemHeight*5）。 */
  .cd-page-rest-list {
    min-inline-size: 2.5rem;
    max-block-size: calc(var(--cd-height-pagination-item) * 5);
    padding-block-start: var(--cd-spacing-pagination-reset-list-paddingtop);
    padding-block-end: var(--cd-spacing-pagination-reset-list-paddingbottom);
    overflow-y: auto;
  }
  .cd-page-rest-item {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    block-size: var(--cd-height-pagination-item);
    color: var(--cd-color-pagination-item-text-default);
    cursor: pointer;
  }
  .cd-page-rest-item:hover {
    background: var(--cd-color-pagination-item-bg-hover);
    color: var(--cd-color-pagination-item-text-hover);
  }
  .cd-page-rest-item:active {
    background: var(--cd-color-pagination-item-bg-active);
    color: var(--cd-color-pagination-item-text-active);
  }
  .cd-page-rest-item[aria-selected='true'] {
    color: var(--cd-color-pagination-item-text-selected);
    font-weight: var(--cd-font-pagination-item-active-fontweight);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-page-item {
      transition: none;
    }
  }
</style>
