<!--
  Pagination — see specs/components/navigation/Pagination.spec.md
  Base subset: default + simple modes, prev/next, page buttons with ellipsis,
  showTotal text, showSizeChanger (reuses Select), showQuickJumper (reuses Input).
  Numbers localized via Intl.NumberFormat; text via locale package.
  Boundary validation/clamping via @chenzy-design/core (pure functions):
  out-of-range current/pageSize and quick-jumper input are clamped to a valid
  page. Controlled props are never written back (red line #1): the clamped page
  is only surfaced through onChange.
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

  type PaginationSize = 'small' | 'default' | 'large';
  type PaginationMode = 'default' | 'simple';
  type PaginationStatus = 'default' | 'warning' | 'error';
  type PopoverPosition = 'top' | 'bottom';

  interface Props {
    total?: number;
    currentPage?: number;
    defaultCurrentPage?: number;
    /** controlled page size; omit for uncontrolled (defaultPageSize) */
    pageSize?: number;
    defaultPageSize?: number;
    /** options for the size changer */
    pageSizeOptions?: number[];
    size?: PaginationSize;
    mode?: PaginationMode;
    /** quick-jumper validation state (透传 Input) */
    status?: PaginationStatus;
    showTotal?: boolean | ((total: number, range: [number, number]) => string);
    /** show the page-size selector (reuses Select) */
    showSizeChanger?: boolean;
    /** show the quick-jump input (reuses Input) */
    showQuickJumper?: boolean;
    /** hide the whole pager when there is only one page */
    hideOnSinglePage?: boolean;
    /** pages kept on each side of the current page */
    siblingCount?: number;
    /** pages kept fixed at each boundary (head/tail) */
    boundaryCount?: number;
    /** size-changer dropdown placement (透传 Select) */
    popoverPosition?: PopoverPosition;
    disabled?: boolean;
    locale?: string;
    /** fires on page OR page-size change; receives the resolved (page, pageSize) */
    onChange?: (page: number, pageSize: number) => void;
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
  }

  let {
    total = 0,
    currentPage,
    defaultCurrentPage = 1,
    pageSize,
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    size = 'default',
    mode = 'default',
    status = 'default',
    showTotal = false,
    showSizeChanger = false,
    showQuickJumper = false,
    hideOnSinglePage = false,
    siblingCount = 1,
    boundaryCount = 1,
    popoverPosition = 'bottom',
    disabled = false,
    locale = 'zh-CN',
    onChange,
    onPageSizeChange,
    ariaLabel,
    renderPage,
    popoverZIndex,
    prevText,
    nextText,
  }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：翻页 / pageSize 变更播报给屏幕阅读器。
  // 命令式写入在事件回调里（非 render 期），符合红线 #3。
  const announcer = useLiveAnnouncer();

  // --- pageSize 受控/非受控 (红线 #1)：不回写 prop ---
  const isSizeControlled = $derived(pageSize !== undefined);
  let innerSize = $state(getInitialSize());
  // 钳制：非法/不在选项内的 pageSize 回退默认值（不回写受控 prop）。
  const currentSize = $derived(
    clampPageSize(isSizeControlled ? (pageSize as number) : innerSize, pageSizeOptions, defaultPageSize),
  );

  function getInitialSize(): number {
    return clampPageSize(defaultPageSize, pageSizeOptions, 10);
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

  // size-changer options for Select
  const sizeOptions = $derived(
    pageSizeOptions.map((n) => ({
      label: loc().t('Pagination.pageSize', { size: n }),
      value: n,
    })),
  );

  // 改变每页条数：保持当前页，超出新总页数则钳到末页（onChange 上报 page+size）。
  function changePageSize(nextSize: number) {
    if (disabled || nextSize === currentSize) return;
    if (!isSizeControlled) innerSize = nextSize;
    const nextPage = clampPage(current, total, nextSize);
    if (!isControlled && nextPage !== inner) inner = nextPage;
    onPageSizeChange?.(nextSize);
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

  // hideOnSinglePage: collapse the whole pager when there is only one page.
  const hidden = $derived(hideOnSinglePage && pageCount <= 1);

  // map popoverPosition → Select placement
  const sizeChangerPlacement = $derived(
    popoverPosition === 'top' ? ('topStart' as const) : ('bottomStart' as const),
  );

  const isFirst = $derived(current <= 1);
  const isLast = $derived(current >= pageCount);

  const cls = $derived(`cd-pagination cd-pagination--${size} cd-pagination--${mode}`);

  function goto(page: number) {
    if (disabled) return;
    const next = clampPage(page, total, currentSize);
    if (next === current) return;
    if (!isControlled) inner = next;
    onChange?.(next, currentSize);
    // 用「即将生效」的 next/pageCount 播报（$derived 在同步回调内尚未重算；受控时本就不回写）。
    announcer.announce(
      loc().t('Pagination.pageChangeAnnounce', { page: next, count: pageCount }),
    );
  }

  const totalText = $derived(loc().t('Pagination.total', { total: nf.format(total) }));

  // --- roving tabindex（页码按钮，红线 #2/#3）---
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

  // 方向键漫游：移动焦点，不切页；Enter/Space 交给原生 button click → goto。
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

{#if !hidden}
<nav class={cls} aria-label={ariaLabel ?? loc().t('Pagination.ariaLabel')}>
  {#if showTotal}
    <span class="cd-pagination__total">
      {#if typeof showTotal === 'function'}
        {showTotal(total, [(current - 1) * currentSize + 1, Math.min(current * currentSize, total)])}
      {:else}
        {totalText}
      {/if}
    </span>
  {/if}

  <button
    type="button"
    class="cd-pagination__prev"
    disabled={disabled || isFirst}
    aria-label={loc().t('Pagination.prevPage')}
    onclick={() => goto(current - 1)}
  >{#if prevText}{#if typeof prevText === 'function'}{@render prevText()}{:else}{prevText}{/if}{:else}‹{/if}</button
  >

  {#if mode === 'simple'}
    <span class="cd-pagination__simple">
      <span class="cd-pagination__simple-current">{nf.format(current)}</span>
      <span class="cd-pagination__simple-sep" aria-hidden="true">/</span>
      <span class="cd-pagination__simple-total">{nf.format(pageCount)}</span>
    </span>
  {:else}
    <ul class="cd-pagination__list" bind:this={listEl}>
      {#each pages as cell (cell.type === 'page' ? `p-${cell.value}` : `e-${cell.position}`)}
        <li class="cd-pagination__item">
          {#if cell.type === 'ellipsis'}
            <span class="cd-pagination__ellipsis" aria-hidden="true">…</span>
          {:else}
            <button
              type="button"
              class="cd-pagination__page"
              class:cd-pagination__page--active={cell.value === current}
              aria-current={cell.value === current ? 'page' : undefined}
              aria-label={loc().t('Pagination.pageLabel', { page: cell.value })}
              data-page={cell.value}
              tabindex={pageTabindex(cell.value)}
              {disabled}
              onclick={() => goto(cell.value)}
              onfocus={() => (focusedPage = cell.value)}
              onkeydown={(e) => onPageKeydown(e, cell.value)}
              >{#if renderPage}{@render renderPage({ page: cell.value, isCurrent: cell.value === current })}{:else}{nf.format(cell.value)}{/if}</button
            >
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  <button
    type="button"
    class="cd-pagination__next"
    disabled={disabled || isLast}
    aria-label={loc().t('Pagination.nextPage')}
    onclick={() => goto(current + 1)}
  >{#if nextText}{#if typeof nextText === 'function'}{@render nextText()}{:else}{nextText}{/if}{:else}›{/if}</button
  >

  {#if showSizeChanger}
    <span class="cd-pagination__size-changer" style={popoverZIndex != null ? `--cd-select-dropdown-z:${popoverZIndex}` : undefined}>
      <Select
        {size}
        {disabled}
        ariaLabel={loc().t('Pagination.itemsPerPage')}
        placement={sizeChangerPlacement}
        options={sizeOptions}
        value={currentSize}
        onChange={(v) => changePageSize(Number(v))}
      />
    </span>
  {/if}

  {#if showQuickJumper}
    <span class="cd-pagination__jumper">
      <span class="cd-pagination__jumper-label">{loc().t('Pagination.jumpTo')}</span>
      <span class="cd-pagination__jumper-input">
        <Input
          {size}
          {status}
          {disabled}
          ariaLabel={loc().t('Pagination.jumpTo')}
          value={jumpValue}
          onInput={(v) => (jumpValue = v)}
          onEnter={jump}
        />
      </span>
      {#if loc().t('Pagination.jumpToSuffix')}
        <span class="cd-pagination__jumper-suffix">{loc().t('Pagination.jumpToSuffix')}</span>
      {/if}
    </span>
  {/if}
</nav>
{/if}

<style>
  .cd-pagination {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-pagination-gap);
    color: var(--cd-color-text-0);
  }
  .cd-pagination__list {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-pagination-gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-pagination__item {
    display: inline-flex;
  }
  .cd-pagination__page,
  .cd-pagination__prev,
  .cd-pagination__next {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: var(--cd-pagination-item-size);
    block-size: var(--cd-pagination-item-size);
    padding-inline: var(--cd-spacing-tight);
    border: var(--cd-pagination-item-border);
    border-radius: var(--cd-pagination-item-radius);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-pagination__page:hover:not(:disabled):not(.cd-pagination__page--active),
  .cd-pagination__prev:hover:not(:disabled),
  .cd-pagination__next:hover:not(:disabled) {
    background: var(--cd-pagination-item-bg-hover);
  }
  .cd-pagination__page--active {
    background: var(--cd-pagination-item-bg-active);
    color: var(--cd-pagination-item-color-active);
  }
  .cd-pagination__page:focus-visible,
  .cd-pagination__prev:focus-visible,
  .cd-pagination__next:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-pagination__page:disabled,
  .cd-pagination__prev:disabled,
  .cd-pagination__next:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
  .cd-pagination__ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: var(--cd-pagination-item-size);
    block-size: var(--cd-pagination-item-size);
    user-select: none;
  }
  .cd-pagination__simple {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
  }
  .cd-pagination__size-changer {
    display: inline-flex;
    inline-size: var(--cd-pagination-size-changer-width, 7.5rem);
  }
  .cd-pagination__jumper {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
  }
  .cd-pagination__jumper-input {
    inline-size: var(--cd-pagination-jumper-width, 3.5rem);
  }
  .cd-pagination--small .cd-pagination__page,
  .cd-pagination--small .cd-pagination__prev,
  .cd-pagination--small .cd-pagination__next,
  .cd-pagination--small .cd-pagination__ellipsis {
    font-size: var(--cd-font-size-small);
  }
  .cd-pagination--large .cd-pagination__page,
  .cd-pagination--large .cd-pagination__prev,
  .cd-pagination--large .cd-pagination__next,
  .cd-pagination--large .cd-pagination__ellipsis {
    font-size: var(--cd-font-size-header-6);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-pagination__page,
    .cd-pagination__prev,
    .cd-pagination__next {
      transition: none;
    }
  }
</style>
