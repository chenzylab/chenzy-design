<!--
  Pagination — 分页器，严格对齐 Semi Design（semi-ui/pagination）。
  两类布局：default（完整页码 + 省略号折叠，7 格上限）与 small（`current/total`
  紧凑视图，可 hoverShowPageSelect 悬停弹全部页码快速切页）。
  页码折叠严格镜像 Semi `_updatePageList`（core semiPageList 纯函数）；越界钳制、
  快速跳页解析走 @chenzy-design/core。省略号 hover 弹出隐藏页码列表（对齐 Semi Popover）。
  受控 currentPage/pageSize 永不回写，仅经回调上报（红线 #1）。
  文案走 locale-provider 上下文（仅 Semi 4 个 key：pageSize/total/jumpTo/page）；
  页码为原始数字（对齐 Semi，不做 Intl 本地化）。
  a11y：<li role="button" aria-disabled>，硬编码英文 aria-label
  （"Previous"/"Next"/"Page size selector"/"Page X"/"More"）对齐 Semi；
  但键盘可达性不复制 Semi 缺陷（Semi handleKeyDown 为空实现）——本库补 tabindex +
  Enter/Space 触发点击，disabled 态 tabindex=-1 移出 Tab 序列。无 LiveAnnouncer。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    paginationPageCount as computePageCount,
    clampPage,
    clampPageSize,
    parseJumpInput,
    semiPageList,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Select } from '../select/index.js';
  import { InputNumber } from '../input-number/index.js';
  import { Popover } from '../popover/index.js';
  import { IconChevronLeft, IconChevronRight } from '@chenzy-design/icons';

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
  }

  // showTotal 显示总页数（对齐 Semi：Math.ceil(total/pageSize)）。
  const totalText = $derived(loc().t('Pagination.total', { total: pageCount }));
</script>

{#snippet prevBtn()}
  <!-- role="button" 恒为字面量，语义上安全覆盖 <li> 默认 listitem 角色（对齐 Semi
       renderPrevBtn 的 <li role="button">），svelte-check 静态规则仍保守报 non-interactive
       标签持 interactive role + tabindex，键盘处理已就绪，误报。 -->
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <li
    role="button"
    tabindex={disabled || isFirst ? -1 : 0}
    aria-disabled={disabled || isFirst}
    aria-label="Previous"
    class="cd-page-item cd-page-prev"
    class:cd-page-item-disabled={disabled || isFirst}
    onclick={() => !(disabled || isFirst) && goto(current - 1)}
    onkeydown={(e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !(disabled || isFirst)) {
        e.preventDefault();
        goto(current - 1);
      }
    }}
  >{#if prevText}{#if typeof prevText === 'function'}{@render prevText()}{:else}{prevText}{/if}{:else}<IconChevronLeft size="large" />{/if}</li>
{/snippet}

{#snippet nextBtn()}
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <li
    role="button"
    tabindex={disabled || isLast ? -1 : 0}
    aria-disabled={disabled || isLast}
    aria-label="Next"
    class="cd-page-item cd-page-next"
    class:cd-page-item-disabled={disabled || isLast}
    onclick={() => !(disabled || isLast) && goto(current + 1)}
    onkeydown={(e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !(disabled || isLast)) {
        e.preventDefault();
        goto(current + 1);
      }
    }}
  >{#if nextText}{#if typeof nextText === 'function'}{@render nextText()}{:else}{nextText}{/if}{:else}<IconChevronRight size="large" />{/if}</li>
{/snippet}

{#snippet pageSizeSwitch()}
  {#if effectiveShowSizeChanger}
    <div class="cd-page-switch">
      <Select
        {size}
        {disabled}
        clickToHide
        aria-label="Page size selector"
        position={sizeChangerPlacement}
        dropdownClassName="cd-page-select-dropdown"
        optionList={sizeOptions}
        value={currentSize}
        zIndex={popoverZIndex}
        onChange={(v) => changePageSize(Number(v))}
      />
    </div>
  {/if}
{/snippet}

{#snippet quickJumper()}
  {#if showQuickJumper}
    <div
      class="cd-page-quickjump"
      class:cd-page-quickjump-disabled={disabled || pageCount === 1}
    >
      <span>{loc().t('Pagination.jumpTo')}</span>
      <InputNumber
        class="cd-page-quickjump-input-number"
        value={jumpValue === '' ? null : Number(jumpValue)}
        hideButtons
        disabled={disabled || pageCount === 1}
        onBlur={jump}
        onEnterPress={jump}
        onChange={(v) => (jumpValue = v == null ? '' : String(v))}
      />
      <span>{loc().t('Pagination.page')}</span>
    </div>
  {/if}
{/snippet}

{#snippet restList(nums: number[])}
  <div class="cd-page-rest-list">
    {#each nums as n (n)}
      <!-- role="listitem" 对齐 Semi renderRestPageList；补 tabindex/onkeydown 键盘可达但
           listitem 是 non-interactive role，svelte-check 保守报警，误报。 -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div
        role="listitem"
        tabindex={0}
        class="cd-page-rest-item"
        aria-label={`${n}`}
        onclick={() => goto(n)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goto(n);
          }
        }}
      >{n}</div>
    {/each}
  </div>
{/snippet}

{#if !hidden}
  {#if isSmall}
    <div class={cls} {style}>
      {@render prevBtn()}
      {#if hoverShowPageSelect && !disabled}
        <Popover position={popoverSide} trigger="hover" showArrow={false} zIndex={popoverZIndex}>
          {#snippet content()}{@render restList(allPageNumbers)}{/snippet}
          <div class="cd-page-item cd-page-item-small">{current}/{pageCount} </div>
        </Popover>
      {:else}
        <div class="cd-page-item cd-page-item-small">{current}/{pageCount} </div>
      {/if}
      {@render nextBtn()}
      {@render quickJumper()}
    </div>
  {:else}
    <ul class={cls} {style}>
      {#if showTotal}
        <span class="cd-page-total">{totalText}</span>
      {/if}
      {@render prevBtn()}
      {#each pageData.pageList as cell, i (typeof cell === 'number' ? `p-${cell}` : `e-${i}`)}
        {#if cell === '...'}
          {#if disabled}
            <li aria-label="More" aria-current={false} class="cd-page-item">…</li>
          {:else}
            <!-- 省略号 hover 弹出隐藏页码列表（对齐 Semi renderRestPageList）：
                 i<3 用左侧隐藏页，否则右侧隐藏页。 -->
            <Popover
              position={popoverPosition.startsWith('top') ? 'top' : 'bottom'}
              trigger="hover"
              showArrow={false}
              zIndex={popoverZIndex}
            >
              {#snippet content()}{@render restList(i < 3 ? pageData.restLeft : pageData.restRight)}{/snippet}
              <li aria-label="More" aria-current={false} class="cd-page-item">…</li>
            </Popover>
          {/if}
        {:else}
          <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
          <li
            role="button"
            tabindex={disabled ? -1 : 0}
            class="cd-page-item"
            class:cd-page-item-active={cell === current}
            class:cd-page-item-all-disabled={disabled}
            class:cd-page-item-all-disabled-active={cell === current && disabled}
            aria-current={cell === current ? 'page' : false}
            aria-label={`Page ${cell}`}
            onclick={() => !disabled && goto(cell)}
            onkeydown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                e.preventDefault();
                goto(cell);
              }
            }}
          >{cell}</li>
        {/if}
      {/each}
      {@render nextBtn()}
      {@render pageSizeSwitch()}
      {@render quickJumper()}
    </ul>
  {/if}
{/if}

<style>
  .cd-page {
    display: flex;
    list-style: none;
    padding: var(--cd-spacing-pagination-padding);
    align-items: center;
    margin-block: 0;
  }
  .cd-page-small {
    font-weight: var(--cd-font-pagination-small-fontweight);
    color: var(--cd-color-pagination-text-default);
    padding: var(--cd-spacing-pagination-small-paddingy) var(--cd-spacing-pagination-small-paddingx);
  }
  .cd-page-disabled {
    cursor: not-allowed;
  }
  .cd-page-disabled .cd-page-total {
    color: var(--cd-color-pagination-item-text-disabled);
  }
  .cd-page-item {
    min-inline-size: var(--cd-width-pagination-item-minwidth);
    border: var(--cd-width-pagination-item-border) solid var(--cd-color-pagination-item-border-default);
    cursor: pointer;
    user-select: none;
    block-size: var(--cd-height-pagination-item);
    margin-inline-start: var(--cd-spacing-pagination-item-marginleft);
    margin-inline-end: var(--cd-spacing-pagination-item-marginright);
    font-weight: var(--cd-font-pagination-item-fontweight);
    color: var(--cd-color-pagination-item-text-default);
    border-radius: var(--cd-radius-pagination-item);
    text-align: center;
    line-height: var(--cd-height-pagination-item);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-page-item:hover {
    border-color: var(--cd-color-pagination-item-border-hover);
    background-color: var(--cd-color-pagination-item-bg-hover);
    color: var(--cd-color-pagination-item-text-hover);
  }
  .cd-page-item:active {
    border-color: var(--cd-color-pagination-item-border-active);
    background-color: var(--cd-color-pagination-item-bg-active);
    color: var(--cd-color-pagination-item-text-active);
  }
  .cd-page-item-active {
    border-color: var(--cd-color-pagination-item-border-selected);
    color: var(--cd-color-pagination-item-text-selected);
    font-weight: var(--cd-font-pagination-item-active-fontweight);
    background-color: var(--cd-color-pagination-item-bg-selected);
  }
  .cd-page-item-active:hover {
    border-color: var(--cd-color-pagination-item-border-selected);
    color: var(--cd-color-pagination-item-text-selected);
    background-color: var(--cd-color-pagination-item-bg-selected);
  }
  .cd-page-item-disabled {
    border-color: var(--cd-color-pagination-item-border-disabled);
    color: var(--cd-color-pagination-item-text-disabled);
    background-color: var(--cd-color-pagination-item-bg-disabled);
    cursor: not-allowed;
  }
  .cd-page-item-disabled:hover {
    background-color: transparent;
  }
  .cd-page-item-small {
    min-inline-size: var(--cd-width-pagination-item-small-minwidth);
    margin: var(--cd-spacing-pagination-item-small-margin);
  }
  .cd-page-item-all-disabled {
    border-color: var(--cd-color-pagination-item-border-disabled);
    color: var(--cd-color-pagination-item-text-disabled);
    background-color: var(--cd-color-pagination-item-bg-disabled);
    cursor: not-allowed;
  }
  .cd-page-item-all-disabled:hover {
    background-color: transparent;
    color: var(--cd-color-pagination-item-text-disabled);
  }
  .cd-page-item-all-disabled-active {
    background-color: var(--cd-color-pagination-item-bg-selected-disabled);
    font-weight: var(--cd-font-pagination-item-active-fontweight);
  }
  .cd-page-item-all-disabled-active:hover {
    background-color: var(--cd-color-pagination-item-bg-selected-disabled);
  }
  .cd-page-total {
    color: var(--cd-color-pagination-text-default);
  }
  .cd-page-prev,
  .cd-page-next {
    color: var(--cd-color-pagination-item-icon-default);
    cursor: pointer;
  }
  .cd-page-prev.cd-page-item-disabled,
  .cd-page-next.cd-page-item-disabled {
    color: var(--cd-color-pagination-item-icon-disabled);
    cursor: not-allowed;
  }
  .cd-page-quickjump {
    margin-inline-start: var(--cd-spacing-pagination-quickjump-marginleft);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--cd-color-pagination-item-text-default);
    font-weight: var(--cd-font-pagination-quickjump-fontweight);
  }
  .cd-page-quickjump :global(.cd-page-quickjump-input-number) {
    max-inline-size: var(--cd-width-pagination-quickjump-input-width);
    margin-inline-start: var(--cd-spacing-pagination-quickjump-input-marginleft);
    margin-inline-end: var(--cd-spacing-pagination-quickjump-input-marginright);
  }
  .cd-page-quickjump-disabled {
    color: var(--cd-color-pagination-quickjump-text-disabled);
  }
  .cd-page-switch {
    user-select: none;
  }
  /* hover 弹层列表：Popover 提供白卡片 + 圆角 + 阴影，页码列表居中于卡片内。
     固定宽度 78px（对齐 Semi renderRestPageList 的 react-window width={78}）；
     超过 5 项纵向滚动（对齐 Semi rest-list itemHeight*5）。 */
  .cd-page-rest-list {
    inline-size: 78px;
    padding-block-start: var(--cd-spacing-pagination-reset-list-paddingtop);
    padding-block-end: var(--cd-spacing-pagination-reset-list-paddingbottom);
    max-block-size: calc(var(--cd-height-pagination-item) * 5);
    overflow-y: auto;
  }
  .cd-page-rest-item {
    block-size: var(--cd-height-pagination-item);
    line-height: var(--cd-height-pagination-item);
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    cursor: pointer;
  }
  .cd-page-rest-item:hover {
    background-color: var(--cd-color-pagination-item-bg-hover);
  }
  .cd-page-rest-item:active {
    background-color: var(--cd-color-pagination-item-bg-active);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-page-item {
      transition: none;
    }
  }
  /* RTL（对齐 Semi pagination/rtl.scss）：margin 由 margin-inline-start/end 逻辑属性自动镜像；
     prev/next 图标额外水平翻转。 */
  :global(.cd-rtl) .cd-page-prev,
  :global(.cd-rtl) .cd-page-next {
    transform: scaleX(-1);
  }
</style>
