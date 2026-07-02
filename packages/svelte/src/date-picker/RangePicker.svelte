<!--
  RangePicker — see specs/components/input/DatePicker.spec.md（range 范围选择）
  双面板（两个月并排，右面板=左面板+1）序列选择：第一次点击设起始、第二次设结束，
  自动排序 start<=end，起止可落在不同面板，hover 跨面板预览区间。
  受控 value=[start,end]（Date|null 元组）不回写 (红线 #1)，仅 onChange。
  本地化走 Intl.DateTimeFormat。useDismiss / 几何由 $effect 管理 (红线 #3)。
  复用 @chenzy-design/core 日期纯函数（getMonthGrid/addMonths/isSameDay/startOfDay/weekdayOrder）。
  maxRange: 起止跨度上限（天）。选定起始后，超出 maxRange 天的日期置灰禁用（daysBetween 纯函数判定，红线 #2）。
-->
<script lang="ts">
  import { untrack, tick } from 'svelte';
  import {
    useId,
    useDismiss,
    useFocusTrap,
    isSameDay,
    startOfDay,
    addMonths,
    getMonthGrid,
    weekdayOrder,
    gridFocusMove,
    daysBetween,
    type GridFocusKey,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type WeekStart = 0 | 1;
  type RangeValue = [Date | null, Date | null];

  interface Props {
    value?: RangeValue | null;
    defaultValue?: RangeValue | null;
    open?: boolean;
    defaultOpen?: boolean;
    startPlaceholder?: string;
    endPlaceholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    clearable?: boolean;
    disabledDate?: (date: Date) => boolean;
    /** 起止跨度上限（天）。选定起始后，超出该跨度的日期被禁用。 */
    maxRange?: number;
    weekStart?: WeekStart;
    locale?: string;
    onChange?: (v: RangeValue | null) => void;
    onOpenChange?: (open: boolean) => void;
    /** 可见年月切换 (头部导航)。panelDate 为左面板月份。 */
    onPanelChange?: (e: { panelDate: Date }) => void;
    /** 点击清除。 */
    onClear?: (e: Record<string, never>) => void;
    /** 触发器获得焦点。 */
    onFocus?: (e: FocusEvent) => void;
    /** 触发器失去焦点。 */
    onBlur?: (e: FocusEvent) => void;
    ariaLabel?: string;
  }

  let {
    value,
    defaultValue = null,
    open,
    defaultOpen = false,
    startPlaceholder,
    endPlaceholder,
    size = 'default',
    status = 'default',
    disabled = false,
    clearable = true,
    disabledDate,
    maxRange,
    weekStart = 0,
    locale = 'zh-CN',
    onChange,
    onOpenChange,
    onPanelChange,
    onClear,
    onFocus,
    onBlur,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();
  const dialogId = useId('cd-range-picker-panel');
  // 左右两个日期网格容器 id（aria-activedescendant 指向其中的 cell id 前缀）
  const leftGridId = useId('cd-range-picker-grid-l');
  const rightGridId = useId('cd-range-picker-grid-r');

  function normPair(v: RangeValue | null | undefined): RangeValue {
    if (!v) return [null, null];
    return [v[0] ? startOfDay(v[0]) : null, v[1] ? startOfDay(v[1]) : null];
  }

  // --- 受控 value (红线 #1) ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<RangeValue>(untrack(() => normPair(defaultValue)));
  const current = $derived<RangeValue>(isValueControlled ? normPair(value) : innerValue);
  const startVal = $derived(current[0]);
  const endVal = $derived(current[1]);

  function setValue(next: RangeValue) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next[0] === null && next[1] === null ? null : next);
  }

  // --- 受控 open (红线 #1) ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(untrack(() => defaultOpen));
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  // --- 选择状态机：null=待选起始；'end'=已选起始待选结束 ---
  const today = startOfDay(new Date());
  let phase = $state<'start' | 'end'>('start');
  let pendingStart = $state<Date | null>(null);
  let previewEnd = $state<Date | null>(null);

  // --- 面板游标月份 ---
  let cursor = $state(untrack(() => startOfDay(normPair(defaultValue)[0] ?? new Date())));
  // 键盘高亮日 (网格 roving 焦点；aria-activedescendant 指向它)
  let highlight = $state<Date | null>(null);
  $effect(() => {
    if (isOpen) {
      cursor = startOfDay(startVal ?? new Date());
      phase = 'start';
      pendingStart = null;
      previewEnd = null;
      highlight = startOfDay(startVal ?? new Date());
    } else {
      highlight = null;
    }
  });

  // --- Intl 格式化 ---
  const triggerFormat = $derived(
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }),
  );
  const headerFormat = $derived(new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }));
  const weekdayFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short' }));
  const weekdayLongFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'long' }));

  const startText = $derived(
    startVal ? triggerFormat.format(startVal) : (startPlaceholder ?? loc().t('DatePicker.startPlaceholder')),
  );
  const endText = $derived(
    endVal ? triggerFormat.format(endVal) : (endPlaceholder ?? loc().t('DatePicker.endPlaceholder')),
  );
  // --- 双面板：cursor = 左面板月份，右面板 = 左 + 1 ---
  const rightCursor = $derived(addMonths(cursor, 1));
  const leftHeaderText = $derived(headerFormat.format(cursor));
  const rightHeaderText = $derived(headerFormat.format(rightCursor));
  const weekdayNames = $derived(
    weekdayOrder(weekStart).map((dow) => weekdayFormat.format(new Date(2023, 0, 1 + dow))),
  );
  const weekdayLongNames = $derived(
    weekdayOrder(weekStart).map((dow) => weekdayLongFormat.format(new Date(2023, 0, 1 + dow))),
  );
  const leftGrid = $derived(getMonthGrid(cursor, weekStart));
  const rightGrid = $derived(getMonthGrid(rightCursor, weekStart));
  // 6×7 行结构 (role=row / gridcell)。getMonthGrid 固定返回 42 格。
  const leftRows = $derived(Array.from({ length: 6 }, (_, r) => leftGrid.slice(r * 7, r * 7 + 7)));
  const rightRows = $derived(Array.from({ length: 6 }, (_, r) => rightGrid.slice(r * 7, r * 7 + 7)));
  function cellId(prefix: string, date: Date): string {
    return `${prefix}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  const showClear = $derived(clearable && !disabled && (startVal !== null || endVal !== null));

  // 整体左右翻一个月（左面板 −1 / 右面板 +1 联动，两面板始终相邻）
  function setCursor(next: Date) {
    cursor = next;
    onPanelChange?.({ panelDate: next });
  }
  function prevMonth() {
    setCursor(addMonths(cursor, -1));
  }
  function nextMonth() {
    setCursor(addMonths(cursor, 1));
  }

  // 选区端点（选择中用 pendingStart + previewEnd，否则用已提交值）
  const rangeStart = $derived(phase === 'end' ? pendingStart : startVal);
  const rangeEnd = $derived(phase === 'end' ? previewEnd : endVal);
  // 归一后的 [lo, hi]（用于区间内判定）
  const span = $derived.by<[number, number] | null>(() => {
    const a = rangeStart;
    const b = rangeEnd;
    if (!a || !b) return null;
    const ta = a.getTime();
    const tb = b.getTime();
    return ta <= tb ? [ta, tb] : [tb, ta];
  });

  function inRange(date: Date): boolean {
    if (!span) return false;
    const t = startOfDay(date).getTime();
    return t > span[0] && t < span[1];
  }
  function isEdge(date: Date): boolean {
    return isSameDay(date, rangeStart) || isSameDay(date, rangeEnd);
  }

  // maxRange：选定起始(phase==='end')后，离 pendingStart 超过 maxRange-1 天的日期禁用
  // （跨度含两端，故 maxRange=7 表示最多 7 天，即间隔 ≤ 6）
  function exceedsMaxRange(date: Date): boolean {
    if (maxRange == null || maxRange <= 0) return false;
    if (phase !== 'end' || !pendingStart) return false;
    return Math.abs(daysBetween(pendingStart, date)) > maxRange - 1;
  }

  // 单元格综合禁用：外部 disabledDate 或 超出 maxRange
  function isCellDisabled(date: Date): boolean {
    return (disabledDate?.(date) ?? false) || exceedsMaxRange(date);
  }

  function selectDate(date: Date) {
    if (isCellDisabled(date)) return;
    const day = startOfDay(date);
    if (phase === 'start') {
      pendingStart = day;
      previewEnd = day;
      phase = 'end';
      return;
    }
    // phase === 'end'：定第二端，排序后提交
    const a = pendingStart ?? day;
    const [lo, hi] = a.getTime() <= day.getTime() ? [a, day] : [day, a];
    setValue([lo, hi]);
    phase = 'start';
    pendingStart = null;
    previewEnd = null;
    setOpen(false);
  }

  function onCellHover(date: Date) {
    if (phase === 'end' && !isCellDisabled(date)) previewEnd = startOfDay(date);
  }

  function clear(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setValue([null, null]);
    phase = 'start';
    pendingStart = null;
    previewEnd = null;
    onClear?.({});
  }

  // 高亮所在面板：在左面板月份则左，否则右（决定 aria-activedescendant 落哪个网格）
  const highlightInLeft = $derived(
    !!highlight &&
      highlight.getFullYear() === cursor.getFullYear() &&
      highlight.getMonth() === cursor.getMonth(),
  );
  const leftActiveId = $derived(
    highlight && highlightInLeft ? cellId(leftGridId, highlight) : undefined,
  );
  const rightActiveId = $derived(
    highlight && !highlightInLeft ? cellId(rightGridId, highlight) : undefined,
  );

  // 把高亮移到 next，跨出双面板可见范围时整体翻页（cursor=左面板月份）
  function setHighlight(next: Date) {
    highlight = startOfDay(next);
    // 双面板显示 cursor 月 + cursor+1 月；高亮落在其中一个则不翻页
    const inLeft = next.getFullYear() === cursor.getFullYear() && next.getMonth() === cursor.getMonth();
    const inRight =
      next.getFullYear() === rightCursor.getFullYear() && next.getMonth() === rightCursor.getMonth();
    if (!inLeft && !inRight) {
      setCursor(startOfDay(new Date(next.getFullYear(), next.getMonth(), 1)));
    }
  }

  const GRID_NAV_KEYS = new Set<string>([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
  ]);

  // 日期网格键盘导航 (WAI-ARIA grid，红线 #2：方向用纯 gridFocusMove)
  function onGridKeydown(e: KeyboardEvent) {
    const key = e.key;
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      if (highlight) selectDate(highlight);
      return;
    }
    if (key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
    const base = highlight ?? today;
    if (e.shiftKey && (key === 'PageUp' || key === 'PageDown')) {
      e.preventDefault();
      setHighlight(addMonths(base, key === 'PageUp' ? -12 : 12));
      return;
    }
    if (!GRID_NAV_KEYS.has(key)) return;
    e.preventDefault();
    const next = gridFocusMove(base, key as GridFocusKey, 'month', weekStart);
    if (next) {
      setHighlight(next);
      if (phase === 'end' && !isCellDisabled(next)) previewEnd = startOfDay(next);
    }
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setOpen(false);
    }
  }

  // --- useDismiss (红线 #3) ---
  let rootEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  let leftGridEl = $state<HTMLDivElement | null>(null);
  let rightGridEl = $state<HTMLDivElement | null>(null);
  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
  });

  // --- focus trap (红线 #3): 困住 Tab、关闭归还焦点；进场落焦高亮所在网格 ---
  $effect(() => {
    if (!isOpen || !panelEl) return;
    const trap = useFocusTrap(panelEl, { trapTab: true, returnFocus: true });
    trap.activate();
    void tick().then(() => {
      const target = highlightInLeft ? leftGridEl : rightGridEl;
      target?.focus();
    });
    return () => trap.deactivate();
  });

  const cls = $derived(
    [
      'cd-range-picker',
      `cd-range-picker--${size}`,
      `cd-range-picker--${status}`,
      disabled && 'cd-range-picker--disabled',
      isOpen && 'cd-range-picker--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl} aria-invalid={status === 'error' || undefined}>
  <div class="cd-range-picker__control">
    <button
      type="button"
      class="cd-range-picker__trigger"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={dialogId}
      aria-label={ariaLabel}
      {disabled}
      onclick={toggleOpen}
      onkeydown={onTriggerKeydown}
      onfocus={onFocus}
      onblur={onBlur}
    >
      <span class="cd-range-picker__value" class:cd-range-picker__value--placeholder={startVal === null}>
        {startText}
      </span>
      <span class="cd-range-picker__sep" aria-hidden="true">→</span>
      <span class="cd-range-picker__value" class:cd-range-picker__value--placeholder={endVal === null}>
        {endText}
      </span>
    </button>

    {#if showClear}
      <button type="button" class="cd-range-picker__clear" aria-label={loc().t('DatePicker.clear')} onclick={clear}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      </button>
    {/if}
  </div>

  {#if isOpen}
    <div bind:this={panelEl} class="cd-range-picker__panel" id={dialogId} role="dialog" aria-modal="false" aria-label={loc().t('DatePicker.rangeTriggerLabel')} tabindex="-1">
      <div class="cd-range-picker__panels">
        <!-- 左面板 -->
        <div class="cd-range-picker__month">
          <div class="cd-range-picker__header">
            <button type="button" class="cd-range-picker__nav" aria-label={loc().t('DatePicker.prevMonth')} onclick={prevMonth}>
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M10 3.5 5.5 8l4.5 4.5 1-1L7.5 8 11 4.5l-1-1Z" />
              </svg>
            </button>
            <span class="cd-range-picker__title">{leftHeaderText}</span>
            <span class="cd-range-picker__nav cd-range-picker__nav--ghost" aria-hidden="true"></span>
          </div>

          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            bind:this={leftGridEl}
            class="cd-range-picker__grid"
            role="grid"
            tabindex="0"
            aria-label={leftHeaderText}
            aria-activedescendant={leftActiveId}
            onkeydown={onGridKeydown}
          >
            <div class="cd-range-picker__row cd-range-picker__row--head" role="row">
              {#each weekdayNames as name, i (i)}
                <span class="cd-range-picker__weekday" role="columnheader" aria-label={weekdayLongNames[i]}>{name}</span>
              {/each}
            </div>
            {#each leftRows as row, wi (wi)}
              <div class="cd-range-picker__row" role="row">
                {#each row as cell (cell.date.getTime())}
                  {@const edge = isEdge(cell.date)}
                  {@const within = inRange(cell.date)}
                  {@const isToday = isSameDay(cell.date, today)}
                  {@const isHighlight = isSameDay(cell.date, highlight)}
                  {@const isDisabled = isCellDisabled(cell.date)}
                  <button
                    type="button"
                    id={cellId(leftGridId, cell.date)}
                    class="cd-range-picker__cell"
                    class:cd-range-picker__cell--muted={!cell.inMonth}
                    class:cd-range-picker__cell--edge={edge}
                    class:cd-range-picker__cell--in-range={within}
                    class:cd-range-picker__cell--today={isToday}
                    class:cd-range-picker__cell--highlight={isHighlight}
                    role="gridcell"
                    aria-selected={edge}
                    aria-disabled={isDisabled || undefined}
                    disabled={isDisabled}
                    tabindex={-1}
                    onclick={() => selectDate(cell.date)}
                    onpointerenter={() => onCellHover(cell.date)}
                  >
                    {cell.date.getDate()}
                  </button>
                {/each}
              </div>
            {/each}
          </div>
        </div>

        <!-- 右面板 -->
        <div class="cd-range-picker__month">
          <div class="cd-range-picker__header">
            <span class="cd-range-picker__nav cd-range-picker__nav--ghost" aria-hidden="true"></span>
            <span class="cd-range-picker__title">{rightHeaderText}</span>
            <button type="button" class="cd-range-picker__nav" aria-label={loc().t('DatePicker.nextMonth')} onclick={nextMonth}>
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M6 3.5 5 4.5 8.5 8 5 11.5l1 1L10.5 8 6 3.5Z" />
              </svg>
            </button>
          </div>

          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            bind:this={rightGridEl}
            class="cd-range-picker__grid"
            role="grid"
            tabindex="0"
            aria-label={rightHeaderText}
            aria-activedescendant={rightActiveId}
            onkeydown={onGridKeydown}
          >
            <div class="cd-range-picker__row cd-range-picker__row--head" role="row">
              {#each weekdayNames as name, i (i)}
                <span class="cd-range-picker__weekday" role="columnheader" aria-label={weekdayLongNames[i]}>{name}</span>
              {/each}
            </div>
            {#each rightRows as row, wi (wi)}
              <div class="cd-range-picker__row" role="row">
                {#each row as cell (cell.date.getTime())}
                  {@const edge = isEdge(cell.date)}
                  {@const within = inRange(cell.date)}
                  {@const isToday = isSameDay(cell.date, today)}
                  {@const isHighlight = isSameDay(cell.date, highlight)}
                  {@const isDisabled = isCellDisabled(cell.date)}
                  <button
                    type="button"
                    id={cellId(rightGridId, cell.date)}
                    class="cd-range-picker__cell"
                    class:cd-range-picker__cell--muted={!cell.inMonth}
                    class:cd-range-picker__cell--edge={edge}
                    class:cd-range-picker__cell--in-range={within}
                    class:cd-range-picker__cell--today={isToday}
                    class:cd-range-picker__cell--highlight={isHighlight}
                    role="gridcell"
                    aria-selected={edge}
                    aria-disabled={isDisabled || undefined}
                    disabled={isDisabled}
                    tabindex={-1}
                    onclick={() => selectDate(cell.date)}
                    onpointerenter={() => onCellHover(cell.date)}
                  >
                    {cell.date.getDate()}
                  </button>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .cd-range-picker {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-input-font-size);
  }
  .cd-range-picker__control {
    position: relative;
    inline-size: 100%;
  }
  .cd-range-picker__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    block-size: var(--cd-height-input-default);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-input-color-bg);
    color: var(--cd-input-color-text);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-range-picker--small .cd-range-picker__trigger {
    block-size: var(--cd-height-input-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-range-picker--large .cd-range-picker__trigger {
    block-size: var(--cd-height-input-large);
    font-size: var(--cd-font-size-header-6);
  }
  .cd-range-picker__trigger:focus-visible {
    outline: none;
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-range-picker--open .cd-range-picker__trigger {
    border-color: var(--cd-input-border-active);
  }
  .cd-range-picker--warning .cd-range-picker__trigger {
    border-color: var(--cd-input-border-warning);
  }
  .cd-range-picker--error .cd-range-picker__trigger {
    border-color: var(--cd-input-border-error);
  }
  .cd-range-picker--disabled .cd-range-picker__trigger {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-range-picker__value {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
  }
  .cd-range-picker__value--placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-range-picker__sep {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-range-picker__clear {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: var(--cd-input-padding-x);
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: var(--cd-input-color-bg);
    color: var(--cd-color-text-2);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-range-picker__control:hover .cd-range-picker__clear,
  .cd-range-picker__clear:focus-visible {
    opacity: 1;
  }
  .cd-range-picker__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-range-picker__clear:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  .cd-range-picker__panel {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-extra-tight));
    inset-inline-start: 0;
    z-index: var(--cd-date-picker-panel-z);
    padding: var(--cd-spacing-base-tight);
    background: var(--cd-date-picker-panel-bg);
    border-radius: var(--cd-date-picker-panel-radius);
    box-shadow: var(--cd-date-picker-panel-shadow);
  }
  .cd-range-picker__panel:focus-visible {
    outline: none;
  }
  /* 双面板：左右两个月历并排 */
  .cd-range-picker__panels {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-base);
  }
  .cd-range-picker__month {
    flex: 0 0 auto;
  }
  .cd-range-picker__nav--ghost {
    background: transparent;
    cursor: default;
    pointer-events: none;
  }
  .cd-range-picker__nav--ghost:hover {
    background: transparent;
  }
  .cd-range-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-tight);
    margin-block-end: var(--cd-spacing-tight);
  }
  .cd-range-picker__title {
    flex: 1 1 auto;
    text-align: center;
    color: var(--cd-date-picker-header-color);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-range-picker__nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: var(--cd-date-picker-cell-size);
    block-size: var(--cd-date-picker-cell-size);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    border-radius: var(--cd-date-picker-cell-radius);
    cursor: pointer;
  }
  .cd-range-picker__nav:hover {
    background: var(--cd-date-picker-cell-bg-hover);
    color: var(--cd-color-text-0);
  }
  .cd-range-picker__nav:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-range-picker__grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .cd-range-picker__grid:focus-visible {
    outline: none;
  }
  .cd-range-picker__row {
    display: grid;
    grid-template-columns: repeat(7, var(--cd-date-picker-cell-size));
    gap: 2px;
  }
  .cd-range-picker__weekday {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-date-picker-cell-size);
    color: var(--cd-date-picker-weekday-color);
    font-size: var(--cd-font-size-small);
  }
  .cd-range-picker__cell {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-date-picker-cell-size);
    block-size: var(--cd-date-picker-cell-size);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-0);
    border-radius: var(--cd-date-picker-cell-radius);
    font: inherit;
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-range-picker__cell:hover {
    background: var(--cd-date-picker-cell-bg-hover);
  }
  .cd-range-picker__cell:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-range-picker__cell--muted {
    color: var(--cd-date-picker-cell-color-muted);
  }
  .cd-range-picker__cell--today {
    border-block-end: 2px solid var(--cd-date-picker-cell-bg-selected);
  }
  /* 键盘高亮格（aria-activedescendant 当前格）：浅底提示 */
  .cd-range-picker__cell--highlight {
    background: var(--cd-date-picker-cell-bg-hover);
  }
  /* 区间内：浅底连续条 */
  .cd-range-picker__cell--in-range {
    background: var(--cd-date-picker-cell-bg-hover);
    border-radius: 0;
  }
  /* 端点：实心高亮 */
  .cd-range-picker__cell--edge,
  .cd-range-picker__cell--edge:hover {
    background: var(--cd-date-picker-cell-bg-selected);
    color: var(--cd-date-picker-cell-color-selected);
  }
  .cd-range-picker__cell:disabled {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
    background: transparent;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-range-picker__trigger,
    .cd-range-picker__clear,
    .cd-range-picker__cell {
      transition: none;
    }
  }
</style>
