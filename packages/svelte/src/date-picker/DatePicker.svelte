<!--
  DatePicker — see specs/components/input/DatePicker.spec.md
  基础子集: 单选 type='date' 日历面板 / type='dateTime' 日期+时间。Token-driven, a11y-correct, 受控/非受控。
  本地化全部走 Intl.DateTimeFormat (不手拼日期串)。dateTime 复用 TimePicker 的时/分/秒列逻辑。
  disabledTime: dateTime 时/分/秒列按日期禁用值置灰跳过；presets: 面板侧边快捷日期按钮。
  format: 传 token 串（YYYY/MM/DD/HH/mm/ss）时，触发器变可输入文本框，显示与手输解析均走
  core 的 formatDate/parseDateString 纯函数（红线 #2）；不传则沿用 Intl.DateTimeFormat 显示（向后兼容）。
-->
<script lang="ts">
  import { tick } from 'svelte';
  import { useId, useDismiss, useFocusTrap, isSameDay, startOfDay, addMonths, getMonthGrid, weekdayOrder, gridFocusMove, formatDate, parseDateString, type GridFocusKey } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type WeekStart = 0 | 1;
  type PickerType = 'date' | 'dateTime' | 'month' | 'year';

  // 时间列禁用配置 (Semi/AntD 风格)：按当前日期返回各列禁用值
  interface DisabledTime {
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
  }

  // 快捷日期项：value 可为 Date 或惰性求值函数 (点击时才计算，如「今天」)
  interface Preset {
    label: string;
    value: Date | (() => Date);
  }

  interface Props {
    type?: PickerType;
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
    disabledTime?: (date: Date) => DisabledTime;
    presets?: Preset[];
    weekStart?: WeekStart;
    showSecond?: boolean;
    locale?: string;
    /** token 格式串 (YYYY/MM/DD/HH/mm/ss)。传入则触发器变可输入文本框，显示+手输解析按此格式。 */
    format?: string;
    onChange?: (v: Date | null) => void;
    onOpenChange?: (open: boolean) => void;
    /** 手动键入解析失败 (editable 模式)。 */
    onParseError?: (e: { text: string }) => void;
    /** 可见年月切换 (头部导航)。 */
    onPanelChange?: (e: { panelDate: Date }) => void;
    /** 点击快捷选项。 */
    onPresetClick?: (e: { preset: Preset }) => void;
    /** 点击清除。 */
    onClear?: (e: Record<string, never>) => void;
    /** 点击确认按钮 (dateTime)。 */
    onConfirm?: (e: { value: Date | null }) => void;
    /** 触发器获得焦点。 */
    onFocus?: (e: FocusEvent) => void;
    /** 触发器失去焦点。 */
    onBlur?: (e: FocusEvent) => void;
    ariaLabel?: string;
  }

  let {
    type = 'date',
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
    disabledTime,
    presets,
    weekStart = 0,
    showSecond = true,
    locale = 'zh-CN',
    format,
    onChange,
    onOpenChange,
    onParseError,
    onPanelChange,
    onPresetClick,
    onClear,
    onConfirm,
    onFocus,
    onBlur,
    ariaLabel,
  }: Props = $props();

  const isDateTime = $derived(type === 'dateTime');
  const isMonth = $derived(type === 'month');
  const isYear = $derived(type === 'year');

  const loc = useLocale();

  const dialogId = useId('cd-date-picker-panel');
  // 日期网格容器 id（aria-activedescendant 指向其中的 cell id 前缀）
  const gridId = useId('cd-date-picker-grid');

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
    new Intl.DateTimeFormat(
      locale,
      isYear
        ? { year: 'numeric' }
        : isMonth
          ? { year: 'numeric', month: '2-digit' }
          : {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              ...(isDateTime
                ? { hour: '2-digit', minute: '2-digit', second: showSecond ? '2-digit' : undefined, hour12: false }
                : {}),
            },
    ),
  );
  const headerFormat = $derived(
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }),
  );
  // 仅年份的头部文案 (month 面板头部 / year 面板基准)
  const yearFormat = $derived(new Intl.DateTimeFormat(locale, { year: 'numeric' }));
  // 月格短名 (month 面板 12 格)
  const monthShortFormat = $derived(new Intl.DateTimeFormat(locale, { month: 'short' }));
  const weekdayFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short' }));
  // 完整星期名 (columnheader aria-label，朗读用)
  const weekdayLongFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'long' }));

  // format 串优先用 core 纯函数序列化；否则沿用 Intl (向后兼容)
  const formattedValue = $derived(
    current ? (format ? formatDate(current, format) : triggerFormat.format(current)) : '',
  );
  const displayText = $derived(formattedValue || (placeholder ?? loc().t('DatePicker.placeholder')));

  // --- 可输入模式 (format 串)：本地草稿文本 + 按格式解析 ---
  const editable = $derived(!!format);
  let inputText = $state('');
  // 非编辑期同步草稿到受控显示值 (打开输入时让用户继续编辑当前文本)
  $effect(() => {
    if (!editable) return;
    inputText = formattedValue;
  });

  function commitInput() {
    if (!editable || !format) return;
    const raw = inputText.trim();
    if (raw === '') {
      if (current !== null) setValue(null);
      return;
    }
    const parsed = parseDateString(raw, format);
    if (parsed && !(disabledDate?.(parsed) ?? false)) {
      setValue(combine(parsed));
    } else {
      // 解析失败：回退到当前值的规范文本
      inputText = formattedValue;
      onParseError?.({ text: raw });
    }
  }

  function onInputKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInput();
      setOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      inputText = formattedValue;
      setOpen(false);
    }
  }

  // --- 十年范围 (year 面板)：以 cursor 年所在的十年起点对齐 ---
  const decadeStart = $derived(Math.floor(cursor.getFullYear() / 10) * 10);
  const headerText = $derived(
    isYear
      ? `${decadeStart}-${decadeStart + 9}`
      : isMonth
        ? yearFormat.format(cursor)
        : headerFormat.format(cursor),
  );

  // month 面板 12 个月格 (用 cursor 年份 + 0..11 月)
  const monthCells = $derived(
    Array.from({ length: 12 }, (_, m) => {
      const date = new Date(cursor.getFullYear(), m, 1);
      return { date, label: monthShortFormat.format(date), month: m };
    }),
  );

  // year 面板格子：前后各留 1 个邻十年年份用于占位，共 12 格
  const yearCells = $derived(
    Array.from({ length: 12 }, (_, i) => {
      const year = decadeStart - 1 + i;
      const date = new Date(year, 0, 1);
      return { date, year, inDecade: year >= decadeStart && year <= decadeStart + 9 };
    }),
  );

  // 星期名: 用 weekdayOrder + 一个已知周日基准 (2023-01-01 是星期日) 经 Intl 本地化
  const weekdayNames = $derived(
    weekdayOrder(weekStart).map((dow) => weekdayFormat.format(new Date(2023, 0, 1 + dow))),
  );
  // 完整星期名 (columnheader aria-label)，顺序与 weekdayNames 一致
  const weekdayLongNames = $derived(
    weekdayOrder(weekStart).map((dow) => weekdayLongFormat.format(new Date(2023, 0, 1 + dow))),
  );

  // 面板内键盘高亮日 (highlight 为本地 $state；aria-activedescendant 指向它)
  let highlight = $state<Date | null>(null);

  const grid = $derived(getMonthGrid(cursor, weekStart));
  // 6×7 行结构 (role=row / gridcell)。getMonthGrid 固定返回 42 格。
  const weekRows = $derived(
    Array.from({ length: 6 }, (_, r) => grid.slice(r * 7, r * 7 + 7)),
  );
  // 每个日期格的稳定 id（aria-activedescendant 指向当前高亮格）
  function cellId(date: Date): string {
    return `${gridId}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  // 当前高亮格 id（aria-activedescendant）
  const activeCellId = $derived(highlight ? cellId(highlight) : undefined);

  const showClear = $derived(clearable && !disabled && current !== null);

  // 头部导航切换可见年月：更新游标并通知 onPanelChange（红线 #1：panelDate 是面板视图态，非 value）
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
  // month 面板：切年（±12 个月）
  function prevYear() {
    setCursor(addMonths(cursor, -12));
  }
  function nextYear() {
    setCursor(addMonths(cursor, 12));
  }
  // year 面板：切十年
  function prevDecade() {
    setCursor(new Date(cursor.getFullYear() - 10, cursor.getMonth(), 1));
  }
  function nextDecade() {
    setCursor(new Date(cursor.getFullYear() + 10, cursor.getMonth(), 1));
  }

  // 选中某个月：保留年+月，归一到该月 1 号起始
  function selectMonth(date: Date) {
    if (disabledDate?.(date)) return;
    setValue(startOfDay(date));
    setOpen(false);
  }
  // 选中某一年：归一到该年 1 月 1 号起始
  function selectYear(date: Date) {
    if (disabledDate?.(date)) return;
    setValue(startOfDay(date));
    setOpen(false);
  }

  // 头部导航按面板类型分派（month=切年, year=切十年, 其它=切月）
  const onPrev = $derived(isYear ? prevDecade : isMonth ? prevYear : prevMonth);
  const onNext = $derived(isYear ? nextDecade : isMonth ? nextYear : nextMonth);
  const prevLabel = $derived(
    isYear
      ? loc().t('DatePicker.prevDecade')
      : isMonth
        ? loc().t('DatePicker.prevYear')
        : loc().t('DatePicker.prevMonth'),
  );
  const nextLabel = $derived(
    isYear
      ? loc().t('DatePicker.nextDecade')
      : isMonth
        ? loc().t('DatePicker.nextYear')
        : loc().t('DatePicker.nextMonth'),
  );

  // --- 时间部分 (dateTime)：复用 TimePicker 的列逻辑 ---
  const selectedHour = $derived(current ? current.getHours() : 0);
  const selectedMinute = $derived(current ? current.getMinutes() : 0);
  const selectedSecond = $derived(current ? current.getSeconds() : 0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  // --- disabledTime (dateTime)：按当前日期解析各列禁用值集合 ---
  // 基准日期取当前选中值(无则今天)；时/分依赖已选时分以联动下游列。
  const disabledTimeCfg = $derived(
    isDateTime && disabledTime ? disabledTime(current ?? today) : undefined,
  );
  const disabledHourSet = $derived(new Set(disabledTimeCfg?.disabledHours?.() ?? []));
  const disabledMinuteSet = $derived(
    new Set(disabledTimeCfg?.disabledMinutes?.(selectedHour) ?? []),
  );
  const disabledSecondSet = $derived(
    new Set(disabledTimeCfg?.disabledSeconds?.(selectedHour, selectedMinute) ?? []),
  );

  // 合并指定日期与已有时分秒 (dateTime 保留时间，date 归零到当天起始)
  function combine(date: Date): Date {
    if (!isDateTime) return startOfDay(date);
    const next = new Date(date);
    next.setHours(selectedHour, selectedMinute, selectedSecond, 0);
    return next;
  }

  function selectDate(date: Date) {
    if (disabledDate?.(date)) return;
    setValue(combine(date));
    // dateTime：选日期后保留面板，让用户继续选时间，点确定再关
    if (!isDateTime) setOpen(false);
  }

  function selectToday() {
    if (disabledDate?.(today)) return;
    if (isMonth) {
      setValue(startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)));
      setOpen(false);
      return;
    }
    if (isYear) {
      setValue(startOfDay(new Date(today.getFullYear(), 0, 1)));
      setOpen(false);
      return;
    }
    setValue(combine(today));
    if (!isDateTime) setOpen(false);
  }

  // 时间列：基于 current（无则今天）写入 h/m/s，不关面板
  function commitTime(h: number, m: number, s: number) {
    const base = current ? new Date(current) : startOfDay(today);
    base.setHours(h, m, s, 0);
    setValue(base);
  }
  function pickHour(h: number) {
    if (disabledHourSet.has(h)) return;
    commitTime(h, selectedMinute, selectedSecond);
  }
  function pickMinute(m: number) {
    if (disabledMinuteSet.has(m)) return;
    commitTime(selectedHour, m, selectedSecond);
  }
  function pickSecond(s: number) {
    if (disabledSecondSet.has(s)) return;
    commitTime(selectedHour, selectedMinute, s);
  }

  // --- presets：点击快捷项直接选中 (惰性 value 即时求值) ---
  function selectPreset(preset: Preset) {
    onPresetClick?.({ preset });
    const date = typeof preset.value === 'function' ? preset.value() : preset.value;
    if (disabledDate?.(date)) return;
    if (isMonth) {
      setValue(startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)));
      setOpen(false);
      return;
    }
    if (isYear) {
      setValue(startOfDay(new Date(date.getFullYear(), 0, 1)));
      setOpen(false);
      return;
    }
    // dateTime：连带时间一起选中；date：归零到当天起始。
    setValue(isDateTime ? new Date(date) : startOfDay(date));
    setOpen(false);
  }

  function confirm() {
    onConfirm?.({ value: current });
    setOpen(false);
  }

  // 时间列容器引用 (红线 #3: 普通 bind:this，scrollIntoView 命令式调用)
  let hourCol = $state<HTMLUListElement | null>(null);
  let minuteCol = $state<HTMLUListElement | null>(null);
  let secondCol = $state<HTMLUListElement | null>(null);

  function scrollColToSelected(col: HTMLUListElement | null) {
    if (!col) return;
    const target = col.querySelector<HTMLElement>('[aria-selected="true"]');
    target?.scrollIntoView({ block: 'center' });
  }

  // 打开时把时间列各自滚到选中项 (命令式，不放响应式 attachment)
  $effect(() => {
    if (!isOpen || !isDateTime) return;
    void tick().then(() => {
      scrollColToSelected(hourCol);
      scrollColToSelected(minuteCol);
      if (showSecond) scrollColToSelected(secondCol);
    });
  });

  function clear(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setValue(null);
    onClear?.({});
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

  // 打开时把高亮对齐当前选中值或今天，关闭清空
  $effect(() => {
    if (isOpen) {
      highlight = startOfDay(current ?? today);
    } else {
      highlight = null;
    }
  });

  // 把高亮移到 next，并让游标随动到 next 所在月份（跨月自动翻页）
  function setHighlight(next: Date) {
    highlight = startOfDay(next);
    cursor = startOfDay(new Date(next.getFullYear(), next.getMonth(), 1));
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

  // 日期网格键盘导航 (WAI-ARIA grid，红线 #2：方向用纯 gridFocusMove 派生)
  // 方向键 ∓1 天 / ∓1 周；Home/End 本周首末；PageUp/Down ∓1 月；Shift+PageUp/Down ∓1 年。
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
    // Shift+PageUp/Down：切年（gridFocusMove 不含年级，组件层 ±12 月）
    if (e.shiftKey && (key === 'PageUp' || key === 'PageDown')) {
      e.preventDefault();
      setHighlight(addMonths(base, key === 'PageUp' ? -12 : 12));
      return;
    }
    if (!GRID_NAV_KEYS.has(key)) return;
    e.preventDefault();
    const next = gridFocusMove(base, key as GridFocusKey, 'month', weekStart);
    if (next) setHighlight(next);
  }

  // --- useDismiss (红线 #3): 绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  // 浮层 + 日期网格容器引用 (focus trap / 进场落焦，红线 #3 命令式 + cleanup)
  let panelEl = $state<HTMLDivElement | null>(null);
  let gridEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
  });

  // --- focus trap (红线 #3): 打开时困住 Tab，关闭归还焦点到触发器；进场落焦到日期网格 ---
  $effect(() => {
    if (!isOpen || !panelEl) return;
    const trap = useFocusTrap(panelEl, { trapTab: true, returnFocus: true });
    trap.activate();
    // aria-activedescendant 模型：焦点落在网格容器（非单格），用 tick 等渲染完成
    void tick().then(() => {
      if (gridEl) gridEl.focus();
    });
    return () => trap.deactivate();
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
    {#if editable}
      <input
        type="text"
        class="cd-date-picker__trigger cd-date-picker__input"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
        aria-label={ariaLabel}
        placeholder={placeholder ?? format}
        {disabled}
        bind:value={inputText}
        onclick={() => setOpen(true)}
        onkeydown={onInputKeydown}
        onfocus={onFocus}
        onblur={(e) => {
          commitInput();
          onBlur?.(e);
        }}
      />
    {:else}
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
        onfocus={onFocus}
        onblur={onBlur}
      >
        <span class="cd-date-picker__value" class:cd-date-picker__value--placeholder={current === null}>
          {displayText}
        </span>
      </button>
    {/if}

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
      bind:this={panelEl}
      class="cd-date-picker__panel"
      class:cd-date-picker__panel--datetime={isDateTime}
      id={dialogId}
      role="dialog"
      aria-modal="false"
      aria-label={loc().t('DatePicker.triggerLabel')}
      tabindex="-1"
    >
      <div class="cd-date-picker__layout" class:cd-date-picker__layout--presets={presets && presets.length > 0}>
      {#if presets && presets.length > 0}
        <div class="cd-date-picker__presets" role="group" aria-label={loc().t('DatePicker.triggerLabel')}>
          {#each presets as preset, i (i)}
            <button
              type="button"
              class="cd-date-picker__preset"
              onclick={() => selectPreset(preset)}
            >
              {preset.label}
            </button>
          {/each}
        </div>
      {/if}
      <div class="cd-date-picker__main">
      <div class="cd-date-picker__body">
      <div class="cd-date-picker__calendar">
      <div class="cd-date-picker__header">
        <button
          type="button"
          class="cd-date-picker__nav"
          aria-label={prevLabel}
          onclick={onPrev}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M10 3.5 5.5 8l4.5 4.5 1-1L7.5 8 11 4.5l-1-1Z" />
          </svg>
        </button>
        <span class="cd-date-picker__title">{headerText}</span>
        <button
          type="button"
          class="cd-date-picker__nav"
          aria-label={nextLabel}
          onclick={onNext}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M6 3.5 5 4.5 8.5 8 5 11.5l1 1L10.5 8 6 3.5Z" />
          </svg>
        </button>
      </div>

      {#if isMonth}
        <div class="cd-date-picker__grid cd-date-picker__grid--month" role="grid">
          {#each monthCells as cell (cell.month)}
            {@const isSelected =
              current !== null &&
              current.getFullYear() === cell.date.getFullYear() &&
              current.getMonth() === cell.month}
            {@const isCurrent =
              today.getFullYear() === cell.date.getFullYear() && today.getMonth() === cell.month}
            {@const isDisabled = disabledDate?.(cell.date) ?? false}
            <button
              type="button"
              class="cd-date-picker__cell cd-date-picker__cell--block"
              class:cd-date-picker__cell--selected={isSelected}
              class:cd-date-picker__cell--today={isCurrent}
              role="gridcell"
              aria-selected={isSelected}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              tabindex={-1}
              onclick={() => selectMonth(cell.date)}
            >
              {cell.label}
            </button>
          {/each}
        </div>
      {:else if isYear}
        <div class="cd-date-picker__grid cd-date-picker__grid--year" role="grid">
          {#each yearCells as cell (cell.year)}
            {@const isSelected = current !== null && current.getFullYear() === cell.year}
            {@const isCurrent = today.getFullYear() === cell.year}
            {@const isDisabled = disabledDate?.(cell.date) ?? false}
            <button
              type="button"
              class="cd-date-picker__cell cd-date-picker__cell--block"
              class:cd-date-picker__cell--muted={!cell.inDecade}
              class:cd-date-picker__cell--selected={isSelected}
              class:cd-date-picker__cell--today={isCurrent}
              role="gridcell"
              aria-selected={isSelected}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              tabindex={-1}
              onclick={() => selectYear(cell.date)}
            >
              {cell.year}
            </button>
          {/each}
        </div>
      {:else}
        <!-- WAI-ARIA grid：role=grid 容器 (aria-activedescendant 指当前高亮格)
             + 表头行 columnheader + 每周一行 row，格 role=gridcell。
             焦点落在容器，方向键经 onGridKeydown → gridFocusMove 移动高亮 (红线 #2)。 -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          bind:this={gridEl}
          class="cd-date-picker__grid"
          role="grid"
          tabindex="0"
          aria-activedescendant={activeCellId}
          aria-label={headerText}
          onkeydown={onGridKeydown}
        >
          <div class="cd-date-picker__row cd-date-picker__row--head" role="row">
            {#each weekdayNames as name, i (i)}
              <span class="cd-date-picker__weekday" role="columnheader" aria-label={weekdayLongNames[i]}>
                {name}
              </span>
            {/each}
          </div>
          {#each weekRows as row, wi (wi)}
            <div class="cd-date-picker__row" role="row">
              {#each row as cell (cell.date.getTime())}
                {@const isSelected = isSameDay(cell.date, current)}
                {@const isToday = isSameDay(cell.date, today)}
                {@const isHighlight = isSameDay(cell.date, highlight)}
                {@const isDisabled = disabledDate?.(cell.date) ?? false}
                <button
                  type="button"
                  id={cellId(cell.date)}
                  class="cd-date-picker__cell"
                  class:cd-date-picker__cell--muted={!cell.inMonth}
                  class:cd-date-picker__cell--selected={isSelected}
                  class:cd-date-picker__cell--today={isToday}
                  class:cd-date-picker__cell--highlight={isHighlight}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled || undefined}
                  disabled={isDisabled}
                  tabindex={-1}
                  onclick={() => selectDate(cell.date)}
                >
                  {cell.date.getDate()}
                </button>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
      </div>

      {#if isDateTime}
        <div class="cd-date-picker__time">
          <ul class="cd-date-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.hour')} bind:this={hourCol}>
            {#each hours as h (h)}
              {@const isHourDisabled = disabledHourSet.has(h)}
              <li
                class="cd-date-picker__time-item"
                class:cd-date-picker__time-item--selected={h === selectedHour}
                class:cd-date-picker__time-item--disabled={isHourDisabled}
                role="option"
                aria-selected={h === selectedHour}
                aria-disabled={isHourDisabled || undefined}
                tabindex="-1"
                onclick={() => pickHour(h)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pickHour(h);
                  }
                }}
              >
                {pad2(h)}
              </li>
            {/each}
          </ul>
          <ul class="cd-date-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.minute')} bind:this={minuteCol}>
            {#each minutes as m (m)}
              {@const isMinuteDisabled = disabledMinuteSet.has(m)}
              <li
                class="cd-date-picker__time-item"
                class:cd-date-picker__time-item--selected={m === selectedMinute}
                class:cd-date-picker__time-item--disabled={isMinuteDisabled}
                role="option"
                aria-selected={m === selectedMinute}
                aria-disabled={isMinuteDisabled || undefined}
                tabindex="-1"
                onclick={() => pickMinute(m)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pickMinute(m);
                  }
                }}
              >
                {pad2(m)}
              </li>
            {/each}
          </ul>
          {#if showSecond}
            <ul class="cd-date-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.second')} bind:this={secondCol}>
              {#each seconds as s (s)}
                {@const isSecondDisabled = disabledSecondSet.has(s)}
                <li
                  class="cd-date-picker__time-item"
                  class:cd-date-picker__time-item--selected={s === selectedSecond}
                  class:cd-date-picker__time-item--disabled={isSecondDisabled}
                  role="option"
                  aria-selected={s === selectedSecond}
                  aria-disabled={isSecondDisabled || undefined}
                  tabindex="-1"
                  onclick={() => pickSecond(s)}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      pickSecond(s);
                    }
                  }}
                >
                  {pad2(s)}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
      </div>

      <div class="cd-date-picker__footer">
        <button type="button" class="cd-date-picker__today" onclick={selectToday}>
          {loc().t('DatePicker.today')}
        </button>
        {#if isDateTime}
          <button type="button" class="cd-date-picker__ok" onclick={confirm}>
            {loc().t('TimePicker.confirm')}
          </button>
        {/if}
      </div>
      </div>
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
  /* format 可输入模式：原生 input 复用 trigger 外观 */
  .cd-date-picker__input::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-date-picker__input:disabled {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
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
  .cd-date-picker__layout {
    display: flex;
    align-items: stretch;
  }
  .cd-date-picker__main {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
  }
  .cd-date-picker__presets {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
    margin-inline-end: var(--cd-spacing-3);
    padding-inline-end: var(--cd-spacing-3);
    border-inline-end: 1px solid var(--cd-color-border);
    min-inline-size: 5rem;
  }
  .cd-date-picker__preset {
    padding-inline: var(--cd-spacing-2);
    padding-block: var(--cd-spacing-1);
    border: none;
    border-radius: var(--cd-radius-1);
    background: transparent;
    color: var(--cd-color-text-0);
    font: inherit;
    text-align: start;
    white-space: nowrap;
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-date-picker__preset:hover {
    background: var(--cd-date-picker-cell-bg-hover);
    color: var(--cd-color-primary);
  }
  .cd-date-picker__preset:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker__body {
    display: flex;
    align-items: stretch;
  }
  .cd-date-picker__time {
    display: flex;
    margin-inline-start: var(--cd-spacing-2);
    padding-inline-start: var(--cd-spacing-2);
    border-inline-start: 1px solid var(--cd-color-border);
  }
  .cd-date-picker__time-col {
    inline-size: var(--cd-time-picker-time-col-width);
    block-size: calc(var(--cd-time-picker-time-item-height) * 7);
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
    scrollbar-width: thin;
  }
  .cd-date-picker__time-col + .cd-date-picker__time-col {
    border-inline-start: 1px solid var(--cd-color-border);
  }
  .cd-date-picker__time-item {
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-time-picker-time-item-height);
    color: var(--cd-color-text-0);
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-date-picker__time-item:hover {
    background: var(--cd-date-picker-cell-bg-hover);
  }
  .cd-date-picker__time-item:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker__time-item--selected,
  .cd-date-picker__time-item--selected:hover {
    background: var(--cd-date-picker-cell-bg-selected);
    color: var(--cd-date-picker-cell-color-selected);
  }
  .cd-date-picker__time-item--disabled,
  .cd-date-picker__time-item--disabled:hover {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
    background: transparent;
  }
  .cd-date-picker__ok {
    padding-inline: var(--cd-spacing-2);
    padding-block: var(--cd-spacing-1);
    border: none;
    border-radius: var(--cd-radius-1);
    background: var(--cd-color-primary);
    color: var(--cd-color-white, #fff);
    font: inherit;
    cursor: pointer;
  }
  .cd-date-picker__ok:hover {
    background: var(--cd-color-primary-hover, var(--cd-color-primary));
  }
  .cd-date-picker__ok:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
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
  /* 日期网格：role=grid 容器纵向堆行，每行 7 列 */
  .cd-date-picker__grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .cd-date-picker__grid:focus-visible {
    outline: none;
  }
  .cd-date-picker__row {
    display: grid;
    grid-template-columns: repeat(7, var(--cd-date-picker-cell-size));
    gap: 2px;
  }
  /* month/year 面板：3 列大格 (仍用 grid 容器) */
  .cd-date-picker__grid--month,
  .cd-date-picker__grid--year {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--cd-spacing-1);
    inline-size: calc(var(--cd-date-picker-cell-size) * 7 + 2px * 6);
  }
  .cd-date-picker__cell--block {
    inline-size: auto;
    padding-inline: var(--cd-spacing-2);
    block-size: calc(var(--cd-date-picker-cell-size) * 1.4);
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
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-2);
    margin-block-start: var(--cd-spacing-2);
    padding-block-start: var(--cd-spacing-2);
    border-block-start: 1px solid var(--cd-color-border);
  }
  .cd-date-picker__panel--datetime .cd-date-picker__footer {
    justify-content: space-between;
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
    .cd-date-picker__cell,
    .cd-date-picker__preset {
      transition: none;
    }
  }
</style>
