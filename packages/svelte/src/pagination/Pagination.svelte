<!--
  Pagination — see specs/components/navigation/Pagination.spec.md
  Base subset: default + simple modes, prev/next, page buttons with ellipsis,
  showTotal text, showSizeChanger (reuses Select), showQuickJumper (reuses Input).
  Numbers localized via Intl.NumberFormat; text via locale package.
  TODO: status validation.
-->
<script lang="ts">
  import { useLocale } from '../locale-provider/index.js';
  import { Select } from '../select/index.js';
  import { Input } from '../input/index.js';

  type PaginationSize = 'small' | 'default' | 'large';
  type PaginationMode = 'default' | 'simple';

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
    showTotal?: boolean;
    /** show the page-size selector (reuses Select) */
    showSizeChanger?: boolean;
    /** show the quick-jump input (reuses Input) */
    showQuickJumper?: boolean;
    disabled?: boolean;
    locale?: string;
    /** fires on page OR page-size change; receives the resolved (page, pageSize) */
    onChange?: (page: number, pageSize: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    ariaLabel?: string;
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
    showTotal = false,
    showSizeChanger = false,
    showQuickJumper = false,
    disabled = false,
    locale = 'zh-CN',
    onChange,
    onPageSizeChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  // --- pageSize 受控/非受控 (红线 #1)：不回写 prop ---
  const isSizeControlled = $derived(pageSize !== undefined);
  let innerSize = $state(getInitialSize());
  const currentSize = $derived(isSizeControlled ? (pageSize as number) : innerSize);

  function getInitialSize(): number {
    return defaultPageSize;
  }

  const pageCount = $derived(Math.max(1, Math.ceil(total / currentSize)));

  // Controlled / uncontrolled (red line #1): never write back the prop.
  const isControlled = $derived(currentPage !== undefined);
  let inner = $state(getInitialPage());
  const current = $derived(isControlled ? (currentPage as number) : inner);

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
    const nextCount = Math.max(1, Math.ceil(total / nextSize));
    const nextPage = Math.min(current, nextCount);
    if (!isControlled && nextPage !== inner) inner = nextPage;
    onPageSizeChange?.(nextSize);
    onChange?.(nextPage, nextSize);
  }

  // 快速跳页：解析输入，钳入 [1, pageCount]，跳转。
  let jumpValue = $state('');
  function jump() {
    const n = Number.parseInt(jumpValue, 10);
    jumpValue = '';
    if (Number.isNaN(n)) return;
    goto(Math.min(Math.max(n, 1), pageCount));
  }

  const nf = $derived(new Intl.NumberFormat(locale));

  // Page list with ellipsis: always show first & last, ±1 around current,
  // '…' (non-interactive) elsewhere. Pure function of current/pageCount → render-safe.
  type PageCell = { type: 'page'; value: number } | { type: 'ellipsis'; key: string };

  const pages = $derived.by<PageCell[]>(() => {
    const cells: PageCell[] = [];
    const last = pageCount;
    const candidates = new Set<number>([1, last, current - 1, current, current + 1]);
    const sorted = [...candidates].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) {
        cells.push({ type: 'ellipsis', key: `gap-${prev}-${p}` });
      }
      cells.push({ type: 'page', value: p });
      prev = p;
    }
    return cells;
  });

  const isFirst = $derived(current <= 1);
  const isLast = $derived(current >= pageCount);

  const cls = $derived(`cd-pagination cd-pagination--${size} cd-pagination--${mode}`);

  function goto(page: number) {
    if (disabled) return;
    if (page < 1 || page > pageCount || page === current) return;
    if (!isControlled) inner = page;
    onChange?.(page, currentSize);
  }

  const totalText = $derived(loc().t('Pagination.total', { total: nf.format(total) }));
</script>

<nav class={cls} aria-label={ariaLabel ?? loc().t('Pagination.ariaLabel')}>
  {#if showTotal}
    <span class="cd-pagination__total">{totalText}</span>
  {/if}

  <button
    type="button"
    class="cd-pagination__prev"
    disabled={disabled || isFirst}
    aria-label={loc().t('Pagination.prevPage')}
    onclick={() => goto(current - 1)}>‹</button
  >

  {#if mode === 'simple'}
    <span class="cd-pagination__simple">
      <span class="cd-pagination__simple-current">{nf.format(current)}</span>
      <span class="cd-pagination__simple-sep" aria-hidden="true">/</span>
      <span class="cd-pagination__simple-total">{nf.format(pageCount)}</span>
    </span>
  {:else}
    <ul class="cd-pagination__list">
      {#each pages as cell (cell.type === 'page' ? `p-${cell.value}` : cell.key)}
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
              {disabled}
              onclick={() => goto(cell.value)}>{nf.format(cell.value)}</button
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
    onclick={() => goto(current + 1)}>›</button
  >

  {#if showSizeChanger}
    <span class="cd-pagination__size-changer">
      <Select
        {size}
        {disabled}
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
          {disabled}
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
    padding-inline: var(--cd-spacing-2);
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
    gap: var(--cd-spacing-1);
  }
  .cd-pagination__size-changer {
    display: inline-flex;
    inline-size: var(--cd-pagination-size-changer-width, 7.5rem);
  }
  .cd-pagination__jumper {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-1);
  }
  .cd-pagination__jumper-input {
    inline-size: var(--cd-pagination-jumper-width, 3.5rem);
  }
  .cd-pagination--small .cd-pagination__page,
  .cd-pagination--small .cd-pagination__prev,
  .cd-pagination--small .cd-pagination__next,
  .cd-pagination--small .cd-pagination__ellipsis {
    font-size: var(--cd-font-size-1);
  }
  .cd-pagination--large .cd-pagination__page,
  .cd-pagination--large .cd-pagination__prev,
  .cd-pagination--large .cd-pagination__next,
  .cd-pagination--large .cd-pagination__ellipsis {
    font-size: var(--cd-font-size-3);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-pagination__page,
    .cd-pagination__prev,
    .cd-pagination__next {
      transition: none;
    }
  }
</style>
