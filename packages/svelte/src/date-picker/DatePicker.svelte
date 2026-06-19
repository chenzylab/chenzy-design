<!--
  DatePicker — see specs/components/input/DatePicker.spec.md
  基础子集: 单选 type='date' 日历面板。Token-driven, a11y-correct, 受控/非受控。
  本地化全部走 Intl.DateTimeFormat (不手拼日期串)。
  TODO(延后): dateTime/range/month/year 类型、disabledTime、maxRange、自定义 format 解析手输。
-->
<script lang="ts">
  import { useId, useDismiss, isSameDay, startOfDay, addMonths, getMonthGrid, weekdayOrder } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type WeekStart = 0 | 1;

  interface Props {
    value?: Date | null;
    defaultValue?: Date | null;
    open?: boolean;
    defaultOpen?: boolean;
    placeholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    clearable?: boolean;
    disabledDate?: (date: Date) => boolean;
    weekStart?: WeekStart;
    locale?: string;
    onChange?: (v: Date | null) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;
  }

  let {
    value,
    defaultValue = null,
    open,
    defaultOpen = false,
    placeholder,
    size = 'default',
    status = 'default',
    disabled = false,
    clearable = true,
    disabledDate,
    weekStart = 0,
    locale = 'zh-CN',
    onChange,
    onOpenChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  const dialogId = useId('cd-date-picker-panel');

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<Date | null>(getInitialValue());
  const current = $derived<Date | null>(isValueControlled ? (value ?? null) : innerValue);

  function getInitialValue(): Date | null {
    return defaultValue ?? null;
  }

  function setValue(next: Date | null) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  // --- 面板游标月份 (本地 $state)，打开时同步到 value/today 月份 ---
  const today = startOfDay(new Date());
  let cursor = $state(startOfDay(getInitialValue() ?? new Date()));

  // 当面板打开时把游标对齐到当前选中值(或今天)所在月份
  $effect(() => {
    if (isOpen) {
      cursor = startOfDay(current ?? new Date());
    }
  });

  // --- Intl 本地化格式化器 (不手拼日期串) ---
  const triggerFormat = $derived(
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }),
  );
  const headerFormat = $derived(
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }),
  );
  const weekdayFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short' }));

  const displayText = $derived(current ? triggerFormat.format(current) : (placeholder ?? loc().t('DatePicker.placeholder')));
  const headerText = $derived(headerFormat.format(cursor));

  // 星期名: 用 weekdayOrder + 一个已知周日基准 (2023-01-01 是星期日) 经 Intl 本地化
  const weekdayNames = $derived(
    weekdayOrder(weekStart).map((dow) => weekdayFormat.format(new Date(2023, 0, 1 + dow))),
  );

  const grid = $derived(getMonthGrid(cursor, weekStart));

  const showClear = $derived(clearable && !disabled && current !== null);

  function prevMonth() {
    cursor = addMonths(cursor, -1);
  }
  function nextMonth() {
    cursor = addMonths(cursor, 1);
  }

  function selectDate(date: Date) {
    if (disabledDate?.(date)) return;
    setValue(startOfDay(date));
    setOpen(false);
  }

  function selectToday() {
    if (disabledDate?.(today)) return;
    setValue(startOfDay(today));
    setOpen(false);
  }

  function clear(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setValue(null);
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setOpen(true);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) setOpen(true);
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  // 面板内方向键: 移动游标高亮日 (highlight 为本地 $state)
  let highlight = $state<Date | null>(null);

  $effect(() => {
    if (isOpen) {
      highlight = startOfDay(current ?? today);
    } else {
      highlight = null;
    }
  });

  function moveHighlight(deltaDays: number) {
    const base = highlight ?? today;
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + deltaDays);
    highlight = startOfDay(next);
    cursor = startOfDay(new Date(next.getFullYear(), next.getMonth(), 1));
  }

  function onPanelKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveHighlight(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveHighlight(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveHighlight(-7);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveHighlight(7);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlight) selectDate(highlight);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  }

  // --- useDismiss (红线 #3): 绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
  });

  const cls = $derived(
    [
      'cd-date-picker',
      `cd-date-picker--${size}`,
      `cd-date-picker--${status}`,
      disabled && 'cd-date-picker--disabled',
      isOpen && 'cd-date-picker--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl} aria-invalid={status === 'error' || undefined}>
  <div class="cd-date-picker__control">
    <button
      type="button"
      class="cd-date-picker__trigger"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={dialogId}
      aria-label={ariaLabel}
      {disabled}
      onclick={toggleOpen}
      onkeydown={onTriggerKeydown}
    >
      <span class="cd-date-picker__value" class:cd-date-picker__value--placeholder={current === null}>
        {displayText}
      </span>
    </button>

    {#if showClear}
      <button type="button" class="cd-date-picker__clear" aria-label={loc().t('DatePicker.clear')} onclick={clear}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      </button>
    {/if}

    <span class="cd-date-picker__icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
        <path
          fill="currentColor"
          d="M5 1v1H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2H11V1h-1v1H6V1H5Zm7.5 4.5v7h-9v-7h9Z"
        />
      </svg>
    </span>
  </div>

  {#if isOpen}
    <div
      class="cd-date-picker__panel"
      id={dialogId}
      role="dialog"
      aria-label={loc().t('DatePicker.triggerLabel')}
      tabindex="-1"
      onkeydown={onPanelKeydown}
    >
      <div class="cd-date-picker__header">
        <button
          type="button"
          class="cd-date-picker__nav"
          aria-label={loc().t('DatePicker.prevMonth')}
          onclick={prevMonth}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M10 3.5 5.5 8l4.5 4.5 1-1L7.5 8 11 4.5l-1-1Z" />
          </svg>
        </button>
        <span class="cd-date-picker__title">{headerText}</span>
        <button
          type="button"
          class="cd-date-picker__nav"
          aria-label={loc().t('DatePicker.nextMonth')}
          onclick={nextMonth}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M6 3.5 5 4.5 8.5 8 5 11.5l1 1L10.5 8 6 3.5Z" />
          </svg>
        </button>
      </div>

      <div class="cd-date-picker__weekdays" aria-hidden="true">
        {#each weekdayNames as name, i (i)}
          <span class="cd-date-picker__weekday">{name}</span>
        {/each}
      </div>

      <div class="cd-date-picker__grid" role="grid">
        {#each grid as cell (cell.date.getTime())}
          {@const isSelected = isSameDay(cell.date, current)}
          {@const isToday = isSameDay(cell.date, today)}
          {@const isHighlight = isSameDay(cell.date, highlight)}
          {@const isDisabled = disabledDate?.(cell.date) ?? false}
          <button
            type="button"
            class="cd-date-picker__cell"
            class:cd-date-picker__cell--muted={!cell.inMonth}
            class:cd-date-picker__cell--selected={isSelected}
            class:cd-date-picker__cell--today={isToday}
            class:cd-date-picker__cell--highlight={isHighlight}
            role="gridcell"
            aria-selected={isSelected}
            aria-disabled={isDisabled || undefined}
            disabled={isDisabled}
            tabindex={isHighlight ? 0 : -1}
            onclick={() => selectDate(cell.date)}
          >
            {cell.date.getDate()}
          </button>
        {/each}
      </div>

      <div class="cd-date-picker__footer">
        <button type="button" class="cd-date-picker__today" onclick={selectToday}>
          今天
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .cd-date-picker {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-input-font-size);
  }
  .cd-date-picker__control {
    position: relative;
    inline-size: 100%;
  }
  .cd-date-picker__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    inline-size: 100%;
    block-size: var(--cd-input-height-default);
    padding-inline-start: var(--cd-input-padding-x);
    padding-inline-end: calc(var(--cd-input-padding-x) + 1.25rem);
    background: var(--cd-input-color-bg);
    color: var(--cd-input-color-text);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-date-picker--small .cd-date-picker__trigger {
    block-size: var(--cd-input-height-small);
    font-size: var(--cd-font-size-1);
  }
  .cd-date-picker--large .cd-date-picker__trigger {
    block-size: var(--cd-input-height-large);
    font-size: var(--cd-font-size-3);
  }
  .cd-date-picker__trigger:focus-visible {
    outline: none;
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker--open .cd-date-picker__trigger {
    border-color: var(--cd-input-border-active);
  }
  .cd-date-picker--warning .cd-date-picker__trigger {
    border-color: var(--cd-input-border-warning);
  }
  .cd-date-picker--error .cd-date-picker__trigger {
    border-color: var(--cd-input-border-error);
  }
  .cd-date-picker--disabled .cd-date-picker__trigger {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-date-picker__value {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-date-picker__value--placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-date-picker__clear,
  .cd-date-picker__icon {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: var(--cd-input-padding-x);
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-text-2);
    pointer-events: none;
  }
  .cd-date-picker__clear {
    padding: 0;
    border: none;
    background: var(--cd-input-color-bg);
    cursor: pointer;
    opacity: 0;
    pointer-events: auto;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-date-picker__control:hover .cd-date-picker__clear,
  .cd-date-picker__clear:focus-visible {
    opacity: 1;
  }
  .cd-date-picker__clear:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-date-picker__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-date-picker__panel {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-1));
    inset-inline-start: 0;
    z-index: var(--cd-date-picker-panel-z);
    padding: var(--cd-spacing-3);
    background: var(--cd-date-picker-panel-bg);
    border-radius: var(--cd-date-picker-panel-radius);
    box-shadow: var(--cd-date-picker-panel-shadow);
  }
  .cd-date-picker__panel:focus-visible {
    outline: none;
  }
  .cd-date-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-2);
    margin-block-end: var(--cd-spacing-2);
  }
  .cd-date-picker__title {
    flex: 1 1 auto;
    text-align: center;
    color: var(--cd-date-picker-header-color);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-date-picker__nav {
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
  .cd-date-picker__nav:hover {
    background: var(--cd-date-picker-cell-bg-hover);
    color: var(--cd-color-text-0);
  }
  .cd-date-picker__nav:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker__weekdays,
  .cd-date-picker__grid {
    display: grid;
    grid-template-columns: repeat(7, var(--cd-date-picker-cell-size));
    gap: 2px;
  }
  .cd-date-picker__weekday {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-date-picker-cell-size);
    color: var(--cd-date-picker-weekday-color);
    font-size: var(--cd-font-size-1);
  }
  .cd-date-picker__cell {
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
  .cd-date-picker__cell:hover {
    background: var(--cd-date-picker-cell-bg-hover);
  }
  .cd-date-picker__cell:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker__cell--muted {
    color: var(--cd-date-picker-cell-color-muted);
  }
  .cd-date-picker__cell--today {
    border-block-end: 2px solid var(--cd-date-picker-cell-bg-selected);
  }
  .cd-date-picker__cell--highlight {
    background: var(--cd-date-picker-cell-bg-hover);
  }
  .cd-date-picker__cell--selected,
  .cd-date-picker__cell--selected:hover {
    background: var(--cd-date-picker-cell-bg-selected);
    color: var(--cd-date-picker-cell-color-selected);
  }
  .cd-date-picker__cell:disabled {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
    background: transparent;
  }
  .cd-date-picker__footer {
    display: flex;
    justify-content: center;
    margin-block-start: var(--cd-spacing-2);
    padding-block-start: var(--cd-spacing-2);
    border-block-start: 1px solid var(--cd-color-border);
  }
  .cd-date-picker__today {
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-primary);
    font: inherit;
    cursor: pointer;
  }
  .cd-date-picker__today:hover {
    text-decoration: underline;
  }
  .cd-date-picker__today:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-date-picker__trigger,
    .cd-date-picker__clear,
    .cd-date-picker__cell {
      transition: none;
    }
  }
</style>
