<!--
  RangePicker — see specs/components/input/DatePicker.spec.md（range 范围选择）
  双面板（两个月并排，右面板=左面板+1）序列选择：第一次点击设起始、第二次设结束，
  自动排序 start<=end，起止可落在不同面板，hover 跨面板预览区间。
  受控 value=[start,end]（Date|null 元组）不回写 (红线 #1)，仅 onChange。
  本地化走 Intl.DateTimeFormat。useDismiss / 几何由 $effect 管理 (红线 #3)。
  复用 @chenzy-design/core 日期纯函数（getMonthGrid/addMonths/isSameDay/startOfDay/weekdayOrder）。
  maxRange: 起止跨度上限（天）。选定起始后，超出 maxRange 天的日期置灰禁用（daysBetween 纯函数判定，红线 #2）。

  type='dateTimeRange'：在双日期面板右侧各挂一组时/分/秒时间列（复用 DatePicker dateTime 的列逻辑/token）。
  起止各自携带时分秒；needConfirm（dateTimeRange 默认 true）时选择进入 pending 缓冲，点「确定」才提交。
  时间列作用于「当前激活端」activeEnd（选起始日或点左侧时间列 = start；选结束日或点右侧时间列 = end）。
  showSecond/disabledTime/disabledTimePicker/hideDisabledOptions 与 DatePicker dateTime 语义一致。

  type='monthRange'（对齐 Semi，>=2.32）：双「月份」面板（各 12 个月格，头部显示年份 + 左右切年，左右面板年份相邻）
  选起止「月」。粒度从「日」变「月」：value=[起始月, 结束月]（Date 落在该月 1 号起始），区间高亮/hover 预览按月比较。
  复用 dateRange 的双面板范围状态机（phase='start'/'end'、pendingStart/previewEnd、自动排序）；不支持时间列。
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
    type Placement,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import { IconClear, IconChevronLeft, IconChevronRight, IconDoubleChevronLeft, IconDoubleChevronRight } from '@chenzy-design/icons';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type WeekStart = 0 | 1;
  type RangeType = 'dateRange' | 'dateTimeRange' | 'monthRange';
  type RangeValue = [Date | null, Date | null];
  type PresetPosition = 'left' | 'right' | 'top' | 'bottom';
  // 快捷区间：value 为 [start, end] 元组或惰性求值函数（点击时即时求值）。
  interface RangePreset {
    label: string;
    value: [Date, Date] | (() => [Date, Date]);
  }

  // 时间列禁用配置 (Semi/AntD 风格)：按当前日期返回各列禁用值。与 DatePicker 一致。
  interface DisabledTime {
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
  }

  interface Props {
    /** dateRange 纯日期范围 / dateTimeRange 带时间范围（每端时/分/秒列 + 确认）/ monthRange 月份范围（双月份面板选起止月）。 */
    type?: RangeType;
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
    /** dateTimeRange：按日期返回各时间列禁用值（分/秒列联动已选时/分）。 */
    disabledTime?: (date: Date) => DisabledTime;
    /** dateTimeRange：是否显示秒列（默认 true）。 */
    showSecond?: boolean;
    /** dateTimeRange：隐藏被禁用的时间选项（默认 false，仅置灰）。 */
    hideDisabledOptions?: boolean;
    /** dateTimeRange：禁止时间列（只保留日期面板 + 确认）。 */
    disabledTimePicker?: boolean;
    /** 需点击确认才提交（dateTimeRange 默认 true，dateRange 默认 false）。 */
    needConfirm?: boolean;
    /** 起止跨度上限（天）。选定起始后，超出该跨度的日期被禁用。 */
    maxRange?: number;
    /**
     * 单击范围选择：与 endDateOffset 同时提供后，用户单击某日即选定区间
     * [startDateOffset(clicked), endDateOffset(clicked)]（如周选择：返回该周一/周日），一步完成、
     * 不进「点起始→点结束」两步状态机。仅 dateRange/dateTimeRange 生效（monthRange 不适用）。
     */
    startDateOffset?: (date: Date) => Date;
    /** 单击范围选择的结束偏移；与 startDateOffset 同时提供才生效。见 startDateOffset。 */
    endDateOffset?: (date: Date) => Date;
    weekStart?: WeekStart;
    locale?: string;
    /** 快捷区间列表（点击直接选定整段 [start, end]）。未传时面板与现状一致。 */
    presets?: RangePreset[];
    /** 快捷区间列表位置（默认 'bottom'）。 */
    presetPosition?: PresetPosition;
    onChange?: (v: RangeValue | null) => void;
    onOpenChange?: (open: boolean) => void;
    /** 可见年月切换 (头部导航)。panelDate 为左面板月份。 */
    onPanelChange?: (e: { panelDate: Date }) => void;
    /** 点击清除。 */
    onClear?: (e: Record<string, never>) => void;
    /** 点击快捷区间选项。 */
    onPresetClick?: (e: { preset: RangePreset }) => void;
    /** 点击确认按钮（needConfirm）。 */
    onConfirm?: (e: { value: RangeValue | null }) => void;
    /** 点击取消按钮（needConfirm）。 */
    onCancel?: (e: { value: RangeValue | null }) => void;
    /** 触发器获得焦点。 */
    onFocus?: (e: FocusEvent) => void;
    /** 触发器失去焦点。 */
    onBlur?: (e: FocusEvent) => void;
    ariaLabel?: string;
    /** 浮层弹出位置（默认 'bottomLeft'）。 */
    position?: string;
    /** 浮层自动调整位置防溢出（默认 true）。 */
    autoAdjustOverflow?: boolean;
    /** 触发器与浮层间距（px）。 */
    spacing?: number;
    /** 浮层挂载容器（默认 document.body）。 */
    getPopupContainer?: () => HTMLElement;
    /** 浮层相对触发器的额外偏移；number 叠加到间距，对象 { y } 叠加纵向间距（x 暂不支持）。 */
    dropdownMargin?: number | { x?: number; y?: number };
    /** 根节点额外 className */
    class?: string;
    /** 根节点内联样式 */
    style?: string;
  }

  let {
    type = 'dateRange',
    value,
    defaultValue = null,
    open: openProp,
    defaultOpen = false,
    startPlaceholder,
    endPlaceholder,
    size = 'default',
    status = 'default',
    disabled = false,
    clearable = true,
    disabledDate,
    disabledTime,
    showSecond = true,
    hideDisabledOptions = false,
    disabledTimePicker = false,
    needConfirm,
    maxRange,
    startDateOffset,
    endDateOffset,
    weekStart = 0,
    locale = 'zh-CN',
    presets,
    presetPosition = 'bottom',
    onChange,
    onOpenChange,
    onPanelChange,
    onClear,
    onPresetClick,
    onConfirm,
    onCancel,
    onFocus,
    onBlur,
    ariaLabel,
    position = 'bottomLeft',
    autoAdjustOverflow = true,
    spacing,
    getPopupContainer,
    dropdownMargin,
    class: className = '',
    style = undefined,
  }: Props = $props();

  const isDateTime = $derived(type === 'dateTimeRange');
  const isMonth = $derived(type === 'monthRange');
  // 单击范围选择：start+end offset 都提供且非 monthRange 时启用（点一次即选定整个区间）。
  const offsetSelect = $derived(!isMonth && !!startDateOffset && !!endDateOffset);
  // needConfirm：显式传优先；否则 dateTimeRange 默认 true、其它默认 false。
  const effNeedConfirm = $derived(needConfirm ?? isDateTime);

  // monthRange：把任意日期归一到该月 1 号起始。
  function startOfMonth(d: Date): Date {
    return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  const loc = useLocale();
  const dialogId = useId('cd-range-picker-panel');
  // 左右两个日期网格容器 id（aria-activedescendant 指向其中的 cell id 前缀）
  const leftGridId = useId('cd-range-picker-grid-l');
  const rightGridId = useId('cd-range-picker-grid-r');

  // dateRange 归一到当天起始；dateTimeRange 保留时分秒；monthRange 归一到该月 1 号起始。
  function normOne(d: Date | null | undefined, t: RangeType): Date | null {
    if (!d) return null;
    if (t === 'dateTimeRange') return new Date(d);
    if (t === 'monthRange') return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
    return startOfDay(d);
  }
  function normPair(v: RangeValue | null | undefined, t: RangeType): RangeValue {
    if (!v) return [null, null];
    return [normOne(v[0], t), normOne(v[1], t)];
  }

  // --- 受控 value (红线 #1) ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<RangeValue>(
    untrack(() => normPair(defaultValue, type)),
  );
  const current = $derived<RangeValue>(
    isValueControlled ? normPair(value, type) : innerValue,
  );
  const startVal = $derived(current[0]);
  const endVal = $derived(current[1]);

  function setValue(next: RangeValue) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next[0] === null && next[1] === null ? null : next);
  }

  // --- 受控 open (红线 #1) ---
  const isOpenControlled = $derived(openProp !== undefined);
  let innerOpen = $state(untrack(() => defaultOpen));
  const isOpen = $derived(isOpenControlled ? !!openProp : innerOpen);

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  // --- 选择状态机：phase='start' 待选起始；'end' 已选起始待选结束 ---
  const today = startOfDay(new Date());
  let phase = $state<'start' | 'end'>('start');
  let pendingStart = $state<Date | null>(null);
  let previewEnd = $state<Date | null>(null);
  // offsetSelect 模式的 hover 预览端点（单击范围选择时，悬停整段高亮 [start,end]）。
  let offsetPreviewStart = $state<Date | null>(null);
  let offsetPreviewEnd = $state<Date | null>(null);

  // dateTimeRange needConfirm：pending 缓冲的起止（含时间），点确定才提交。
  // 面板打开时同步为当前 value；选日期/时间只改 pending。
  let pendingValue = $state<RangeValue>([null, null]);
  // 时间列作用的当前端：选起始日 / 点左侧时间列 = 'start'；选结束日 / 点右侧时间列 = 'end'。
  let activeEnd = $state<'start' | 'end'>('start');

  // 面板内某一端「当前生效」的 Date（needConfirm 用 pending，否则用已提交 value）。
  const panelStart = $derived(effNeedConfirm ? pendingValue[0] : startVal);
  const panelEnd = $derived(effNeedConfirm ? pendingValue[1] : endVal);

  // --- 面板游标月份 ---
  let cursor = $state(
    untrack(() => startOfDay(normPair(defaultValue, type)[0] ?? new Date())),
  );
  // 键盘高亮日 (网格 roving 焦点；aria-activedescendant 指向它)
  let highlight = $state<Date | null>(null);
  $effect(() => {
    if (isOpen) {
      cursor = startOfDay(startVal ?? new Date());
      phase = 'start';
      pendingStart = null;
      previewEnd = null;
      highlight = startOfDay(startVal ?? new Date());
      pendingValue = [startVal, endVal];
      activeEnd = 'start';
      offsetPreviewStart = null;
      offsetPreviewEnd = null;
    } else {
      highlight = null;
      offsetPreviewStart = null;
      offsetPreviewEnd = null;
    }
  });

  // --- Intl 格式化 ---
  // monthRange：触发器仅显示年+月；日/时列不需要。
  const dateOpts = $derived<Intl.DateTimeFormatOptions>(
    isMonth
      ? { year: 'numeric', month: '2-digit' }
      : {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          ...(isDateTime
            ? { hour: '2-digit', minute: '2-digit', second: showSecond ? '2-digit' : undefined, hour12: false }
            : {}),
        },
  );
  const triggerFormat = $derived(new Intl.DateTimeFormat(locale, dateOpts));
  const headerFormat = $derived(new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }));
  // monthRange 头部仅显示年份，月格用短名。
  const yearFormat = $derived(new Intl.DateTimeFormat(locale, { year: 'numeric' }));
  const monthShortFormat = $derived(new Intl.DateTimeFormat(locale, { month: 'short' }));
  const weekdayFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short' }));
  const weekdayLongFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'long' }));

  const startText = $derived(
    startVal ? triggerFormat.format(startVal) : (startPlaceholder ?? loc().t('DatePicker.startPlaceholder')),
  );
  const endText = $derived(
    endVal ? triggerFormat.format(endVal) : (endPlaceholder ?? loc().t('DatePicker.endPlaceholder')),
  );
  // --- 双面板：dateRange/dateTimeRange 时 cursor=左面板月份、右=左+1 月；
  //     monthRange 时 cursor=左面板年份、右=左+1 年（各显示 12 个月格）。 ---
  const rightCursor = $derived(addMonths(cursor, isMonth ? 12 : 1));
  const leftHeaderText = $derived(isMonth ? yearFormat.format(cursor) : headerFormat.format(cursor));
  const rightHeaderText = $derived(isMonth ? yearFormat.format(rightCursor) : headerFormat.format(rightCursor));
  // monthRange：左右面板各 12 个月格（用 cursor/rightCursor 的年份 + 0..11 月）。
  const leftMonthCells = $derived(
    Array.from({ length: 12 }, (_, m) => {
      const date = new Date(cursor.getFullYear(), m, 1);
      return { date, label: monthShortFormat.format(date), month: m };
    }),
  );
  const rightMonthCells = $derived(
    Array.from({ length: 12 }, (_, m) => {
      const date = new Date(rightCursor.getFullYear(), m, 1);
      return { date, label: monthShortFormat.format(date), month: m };
    }),
  );
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
  // dateRange 翻月（±1）；monthRange 翻年（±12 个月）。
  function prevMonth() {
    setCursor(addMonths(cursor, isMonth ? -12 : -1));
  }
  function nextMonth() {
    setCursor(addMonths(cursor, isMonth ? 12 : 1));
  }

  // 选区端点：offsetSelect hover 预览优先；否则选择中用 pendingStart + previewEnd，再否则用面板生效值。
  const rangeStart = $derived(
    offsetSelect && offsetPreviewStart ? offsetPreviewStart : phase === 'end' ? pendingStart : panelStart,
  );
  const rangeEnd = $derived(
    offsetSelect && offsetPreviewEnd ? offsetPreviewEnd : phase === 'end' ? previewEnd : panelEnd,
  );
  // 比较基准：dateRange 按「天」；monthRange 按「月」（归一到月 1 号起始）。
  function normUnit(d: Date): Date {
    return isMonth ? startOfMonth(d) : startOfDay(d);
  }
  // 同一「单位」（同日 / 同月）判定。
  function isSameUnit(a: Date | null | undefined, b: Date | null | undefined): boolean {
    if (!a || !b) return false;
    return isMonth
      ? a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
      : isSameDay(a, b);
  }
  // 归一后的 [lo, hi]（用于区间内判定，按当前单位比较）
  const span = $derived.by<[number, number] | null>(() => {
    const a = rangeStart;
    const b = rangeEnd;
    if (!a || !b) return null;
    const ta = normUnit(a).getTime();
    const tb = normUnit(b).getTime();
    return ta <= tb ? [ta, tb] : [tb, ta];
  });

  function inRange(date: Date): boolean {
    if (!span) return false;
    const t = normUnit(date).getTime();
    return t > span[0] && t < span[1];
  }
  function isEdge(date: Date): boolean {
    return isSameUnit(date, rangeStart) || isSameUnit(date, rangeEnd);
  }

  // maxRange：选定起始(phase==='end')后，离 pendingStart 超过 maxRange-1 天的日期禁用
  function exceedsMaxRange(date: Date): boolean {
    if (isMonth) return false; // monthRange 暂不支持按天的 maxRange
    if (maxRange == null || maxRange <= 0) return false;
    if (phase !== 'end' || !pendingStart) return false;
    return Math.abs(daysBetween(pendingStart, date)) > maxRange - 1;
  }

  function isCellDisabled(date: Date): boolean {
    return (disabledDate?.(date) ?? false) || exceedsMaxRange(date);
  }

  // 把 day 与某端已有的时分秒合并（dateTime 保留时间，dateRange 归零到当天起始，monthRange 归到月 1 号）。
  function combineDay(day: Date, base: Date | null): Date {
    if (isMonth) return startOfMonth(day);
    if (!isDateTime) return startOfDay(day);
    const next = startOfDay(day);
    if (base) next.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
    return next;
  }

  function selectDate(date: Date) {
    if (isCellDisabled(date)) return;
    // 单击范围选择（startDateOffset/endDateOffset）：一步算出起止并提交，不进两步状态机。
    if (offsetSelect && startDateOffset && endDateOffset) {
      const s = startOfDay(startDateOffset(date));
      const e = startOfDay(endDateOffset(date));
      const [loDay, hiDay] = s.getTime() <= e.getTime() ? [s, e] : [e, s];
      const lo = combineDay(loDay, isDateTime ? pendingValue[0] : null);
      const hi = combineDay(hiDay, isDateTime ? pendingValue[1] : null);
      phase = 'start';
      pendingStart = null;
      previewEnd = null;
      if (effNeedConfirm) {
        pendingValue = [lo, hi];
      } else {
        setValue([lo, hi]);
        setOpen(false);
      }
      return;
    }
    const day = isMonth ? startOfMonth(date) : startOfDay(date);
    if (phase === 'start') {
      pendingStart = day;
      previewEnd = day;
      phase = 'end';
      activeEnd = 'start';
      // needConfirm：起始日进 pending（保留起端已有时间）。
      if (effNeedConfirm) {
        pendingValue = [combineDay(day, pendingValue[0]), pendingValue[1]];
      }
      return;
    }
    // phase === 'end'：定第二端，排序后（含时间）提交或进 pending。
    const a = pendingStart ?? day;
    const [loDay, hiDay] = a.getTime() <= day.getTime() ? [a, day] : [day, a];
    // 起端时间取 pendingValue[0]（若为对应端），结束端取 pendingValue[1]。
    const lo = combineDay(loDay, isDateTime ? pendingValue[0] : null);
    const hi = combineDay(hiDay, isDateTime ? pendingValue[1] : null);
    activeEnd = 'end';
    if (effNeedConfirm) {
      pendingValue = [lo, hi];
      phase = 'start';
      pendingStart = null;
      previewEnd = null;
      // needConfirm：不自动关闭，等用户调时间 + 点确定。
    } else {
      setValue([lo, hi]);
      phase = 'start';
      pendingStart = null;
      previewEnd = null;
      setOpen(false);
    }
  }

  function onCellHover(date: Date) {
    if (offsetSelect && startDateOffset && endDateOffset) {
      // 单击范围选择：悬停即预览整段 [startDateOffset, endDateOffset]。
      if (isCellDisabled(date)) return;
      offsetPreviewStart = startOfDay(startDateOffset(date));
      offsetPreviewEnd = startOfDay(endDateOffset(date));
      return;
    }
    if (phase === 'end' && !isCellDisabled(date)) previewEnd = isMonth ? startOfMonth(date) : startOfDay(date);
  }

  function clear(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setValue([null, null]);
    pendingValue = [null, null];
    phase = 'start';
    pendingStart = null;
    previewEnd = null;
    offsetPreviewStart = null;
    offsetPreviewEnd = null;
    onClear?.({});
  }

  // ---------- 时间列（dateTimeRange，复用 DatePicker dateTime 列逻辑） ----------
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);
  function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  // 当前激活端的 Date（用于时间列选中态与禁用联动基准）。
  const activeDate = $derived<Date | null>(activeEnd === 'start' ? pendingValue[0] : pendingValue[1]);
  const activeHour = $derived(activeDate ? activeDate.getHours() : 0);
  const activeMinute = $derived(activeDate ? activeDate.getMinutes() : 0);
  const activeSecond = $derived(activeDate ? activeDate.getSeconds() : 0);

  const disabledTimeCfg = $derived(
    isDateTime && disabledTime ? disabledTime(activeDate ?? today) : undefined,
  );
  const disabledHourSet = $derived(new Set(disabledTimeCfg?.disabledHours?.() ?? []));
  const disabledMinuteSet = $derived(
    new Set(disabledTimeCfg?.disabledMinutes?.(activeHour) ?? []),
  );
  const disabledSecondSet = $derived(
    new Set(disabledTimeCfg?.disabledSeconds?.(activeHour, activeMinute) ?? []),
  );

  // 把 h/m/s 写入激活端 Date（无日期则以今天为底），只改 pending（needConfirm）或提交。
  function commitTime(h: number, m: number, s: number) {
    const baseSrc = activeDate ?? startOfDay(today);
    const base = new Date(baseSrc);
    base.setHours(h, m, s, 0);
    const nextPair: RangeValue =
      activeEnd === 'start' ? [base, pendingValue[1]] : [pendingValue[0], base];
    if (effNeedConfirm) {
      pendingValue = nextPair;
    } else {
      pendingValue = nextPair;
      setValue(nextPair);
    }
  }
  function pickHour(h: number) {
    if (disabledHourSet.has(h)) return;
    commitTime(h, activeMinute, activeSecond);
  }
  function pickMinute(m: number) {
    if (disabledMinuteSet.has(m)) return;
    commitTime(activeHour, m, activeSecond);
  }
  function pickSecond(s: number) {
    if (disabledSecondSet.has(s)) return;
    commitTime(activeHour, activeMinute, s);
  }
  function focusEnd(which: 'start' | 'end') {
    activeEnd = which;
  }

  // 时间列容器引用（scrollIntoView 命令式，红线 #3）。start/end 各一组。
  let startHourCol = $state<HTMLUListElement | null>(null);
  let startMinuteCol = $state<HTMLUListElement | null>(null);
  let startSecondCol = $state<HTMLUListElement | null>(null);
  let endHourCol = $state<HTMLUListElement | null>(null);
  let endMinuteCol = $state<HTMLUListElement | null>(null);
  let endSecondCol = $state<HTMLUListElement | null>(null);

  function scrollColToSelected(col: HTMLUListElement | null) {
    if (!col) return;
    const target = col.querySelector<HTMLElement>('[aria-selected="true"]');
    target?.scrollIntoView({ block: 'center' });
  }
  $effect(() => {
    if (!isOpen || !isDateTime || disabledTimePicker) return;
    // 依赖 pendingValue 以在时间变化后重新滚动到选中项。
    void pendingValue;
    void tick().then(() => {
      scrollColToSelected(startHourCol);
      scrollColToSelected(startMinuteCol);
      if (showSecond) scrollColToSelected(startSecondCol);
      scrollColToSelected(endHourCol);
      scrollColToSelected(endMinuteCol);
      if (showSecond) scrollColToSelected(endSecondCol);
    });
  });

  // 确认 / 取消（needConfirm）。
  function confirm() {
    const val: RangeValue = pendingValue;
    onConfirm?.({ value: val[0] === null && val[1] === null ? null : val });
    setValue(val);
    setOpen(false);
  }
  function cancelConfirm() {
    onCancel?.({ value: startVal === null && endVal === null ? null : [startVal, endVal] });
    pendingValue = [startVal, endVal];
    setOpen(false);
  }

  // --- presets：点击快捷区间直接选定整段（惰性 value 即时求值）。复用现有区间提交路径。 ---
  function selectRangePreset(preset: RangePreset) {
    onPresetClick?.({ preset });
    const raw = typeof preset.value === 'function' ? preset.value() : preset.value;
    // 按 type 归一（dateRange 归零到当天起始 / dateTimeRange 保时分秒 / monthRange 落每月 1 号），
    // 再自动排序确保 start<=end。
    const s = normOne(raw[0], type);
    const e = normOne(raw[1], type);
    if (!s || !e) return;
    const [lo, hi] = s.getTime() <= e.getTime() ? [s, e] : [e, s];
    // 复位选择状态机（与 selectDate 提交分支一致）。
    phase = 'start';
    pendingStart = null;
    previewEnd = null;
    activeEnd = 'end';
    if (effNeedConfirm) {
      // needConfirm：进 pending 缓冲，等用户点确定。
      pendingValue = [lo, hi];
    } else {
      setValue([lo, hi]);
      setOpen(false);
    }
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
  let triggerEl = $state<HTMLButtonElement | null>(null);

  // --- 命令式 Methods（对齐 Semi API 形状）---
  export function open(): void {
    setOpen(true);
  }
  export function close(): void {
    setOpen(false);
  }
  // RangePicker 触发器为单个 button（非起止双输入框），focusType 无法精确落焦到起止端，
  // 退化为聚焦整个触发器；保留签名以对齐 Semi API 形状。
  export function focus(focusType?: 'rangeStart' | 'rangeEnd'): void {
    void focusType;
    triggerEl?.focus();
  }
  export function blur(): void {
    triggerEl?.blur();
  }
  let leftGridEl = $state<HTMLDivElement | null>(null);
  let rightGridEl = $state<HTMLDivElement | null>(null);
  $effect(() => {
    if (!isOpen || !rootEl) return;
    // panel portal 出 root 子树后列入 extraTargets，否则面板内点击被误判为外部点击而误关。
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [panelEl],
    });
  });

  // position（'bottomLeft'/'bottomRight'/'topLeft'/…）→ use:floating 的 Placement。
  // 缺省或未知值回退 'bottomStart'（触发器正下方偏左，与原 CSS 视觉一致）。
  const POSITION_TO_PLACEMENT: Record<string, Placement> = {
    bottomLeft: 'bottomStart',
    bottomRight: 'bottomEnd',
    bottom: 'bottom',
    topLeft: 'topStart',
    topRight: 'topEnd',
    top: 'top',
    leftTop: 'leftStart',
    leftBottom: 'leftEnd',
    left: 'left',
    rightTop: 'rightStart',
    rightBottom: 'rightEnd',
    right: 'right',
  };
  const resolvedPlacement = $derived<Placement>(POSITION_TO_PLACEMENT[position] ?? 'bottomStart');

  // 触发器与浮层间距：spacing 优先，未传回退默认 4（近似原 calc(100% + extra-tight)）；
  // 再叠加 dropdownMargin（number 直接加，对象取 y ?? 0；x 方向本 action 不单独支持，忽略）。
  const resolvedOffset = $derived.by(() => {
    const base = spacing ?? 4;
    if (typeof dropdownMargin === 'number') return base + dropdownMargin;
    if (dropdownMargin && typeof dropdownMargin === 'object') return base + (dropdownMargin.y ?? 0);
    return base;
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
      isDateTime && 'cd-range-picker--datetime',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const showFooter = $derived(isDateTime || effNeedConfirm);
  // presets 是否有效（有值时渲染；monthRange 仍渲染，value 落每月 1 号，与 monthRange 语义一致）。
  const hasPresets = $derived(!!presets && presets.length > 0);
  // left/right 竖排；top/bottom 横排。
  const presetsVertical = $derived(presetPosition === 'left' || presetPosition === 'right');
</script>

<div class={cls} style={style || undefined} bind:this={rootEl} aria-invalid={status === 'error' || undefined}>
  <div class="cd-range-picker__control">
    <button
      bind:this={triggerEl}
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
        <IconClear aria-hidden="true" />
      </button>
    {/if}
  </div>

  {#if isOpen}
    <div
      bind:this={panelEl}
      use:floating={{
        trigger: rootEl,
        placement: resolvedPlacement,
        autoAdjust: autoAdjustOverflow,
        offset: resolvedOffset,
        getContainer: getPopupContainer,
        open: isOpen,
      }}
      class="cd-range-picker__panel"
      id={dialogId}
      role="dialog"
      aria-modal="false"
      aria-label={loc().t('DatePicker.rangeTriggerLabel')}
      tabindex="-1"
    >
      {#snippet panelsBlock()}
      <div class="cd-range-picker__panels">
        {#if isMonth}
          <!-- monthRange：左右各一「月份」面板（12 个月格），头部显示年份 + 左右切年 -->
          <!-- 左面板（年份 = cursor） -->
          <div class="cd-range-picker__month">
            <div class="cd-range-picker__header">
              <button type="button" class="cd-range-picker__nav" aria-label={loc().t('DatePicker.prevYear')} onclick={prevMonth}>
                <IconDoubleChevronLeft size="small" aria-hidden="true" />
              </button>
              <span class="cd-range-picker__title">{leftHeaderText}</span>
              <span class="cd-range-picker__nav cd-range-picker__nav--ghost" aria-hidden="true"></span>
            </div>
            <div class="cd-range-picker__grid cd-range-picker__grid--month" role="grid" aria-label={leftHeaderText}>
              {#each leftMonthCells as cell (cell.month)}
                {@const edge = isEdge(cell.date)}
                {@const within = inRange(cell.date)}
                {@const isCurrentMonth = today.getFullYear() === cell.date.getFullYear() && today.getMonth() === cell.month}
                {@const isDisabled = isCellDisabled(cell.date)}
                <button
                  type="button"
                  class="cd-range-picker__cell cd-range-picker__cell--block"
                  class:cd-range-picker__cell--edge={edge}
                  class:cd-range-picker__cell--in-range={within}
                  class:cd-range-picker__cell--today={isCurrentMonth}
                  role="gridcell"
                  aria-selected={edge}
                  aria-disabled={isDisabled || undefined}
                  disabled={isDisabled}
                  onclick={() => selectDate(cell.date)}
                  onpointerenter={() => onCellHover(cell.date)}
                >
                  {cell.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- 右面板（年份 = cursor + 1 年） -->
          <div class="cd-range-picker__month">
            <div class="cd-range-picker__header">
              <span class="cd-range-picker__nav cd-range-picker__nav--ghost" aria-hidden="true"></span>
              <span class="cd-range-picker__title">{rightHeaderText}</span>
              <button type="button" class="cd-range-picker__nav" aria-label={loc().t('DatePicker.nextYear')} onclick={nextMonth}>
                <IconDoubleChevronRight size="small" aria-hidden="true" />
              </button>
            </div>
            <div class="cd-range-picker__grid cd-range-picker__grid--month" role="grid" aria-label={rightHeaderText}>
              {#each rightMonthCells as cell (cell.month)}
                {@const edge = isEdge(cell.date)}
                {@const within = inRange(cell.date)}
                {@const isCurrentMonth = today.getFullYear() === cell.date.getFullYear() && today.getMonth() === cell.month}
                {@const isDisabled = isCellDisabled(cell.date)}
                <button
                  type="button"
                  class="cd-range-picker__cell cd-range-picker__cell--block"
                  class:cd-range-picker__cell--edge={edge}
                  class:cd-range-picker__cell--in-range={within}
                  class:cd-range-picker__cell--today={isCurrentMonth}
                  role="gridcell"
                  aria-selected={edge}
                  aria-disabled={isDisabled || undefined}
                  disabled={isDisabled}
                  onclick={() => selectDate(cell.date)}
                  onpointerenter={() => onCellHover(cell.date)}
                >
                  {cell.label}
                </button>
              {/each}
            </div>
          </div>
        {:else}
        <!-- 左面板 -->
        <div class="cd-range-picker__month">
          <div class="cd-range-picker__header">
            <button type="button" class="cd-range-picker__nav" aria-label={loc().t('DatePicker.prevMonth')} onclick={prevMonth}>
              <IconChevronLeft size="small" aria-hidden="true" />
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
              <IconChevronRight size="small" aria-hidden="true" />
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
        {/if}

        {#if isDateTime && !disabledTimePicker}
          <!-- 起止两组时/分/秒时间列（复用 DatePicker dateTime 列 token/结构） -->
          <div class="cd-range-picker__times">
            <div
              class="cd-range-picker__time"
              class:cd-range-picker__time--active={activeEnd === 'start'}
              role="group"
              aria-label={loc().t('DatePicker.startPlaceholder')}
            >
              <ul class="cd-range-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.hour')} bind:this={startHourCol}>
                {#each hours as h (h)}
                  {@const isHourDisabled = activeEnd === 'start' && disabledHourSet.has(h)}
                  {@const isSel = activeEnd === 'start' && h === activeHour && pendingValue[0] !== null}
                  {#if !(hideDisabledOptions && isHourDisabled)}
                    <li
                      class="cd-range-picker__time-item"
                      class:cd-range-picker__time-item--selected={isSel}
                      class:cd-range-picker__time-item--disabled={isHourDisabled}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={isHourDisabled || undefined}
                      tabindex="-1"
                      onclick={() => {
                        focusEnd('start');
                        pickHour(h);
                      }}
                      onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          focusEnd('start');
                          pickHour(h);
                        }
                      }}
                    >
                      {pad2(h)}
                    </li>
                  {/if}
                {/each}
              </ul>
              <ul class="cd-range-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.minute')} bind:this={startMinuteCol}>
                {#each minutes as m (m)}
                  {@const isMinDisabled = activeEnd === 'start' && disabledMinuteSet.has(m)}
                  {@const isSel = activeEnd === 'start' && m === activeMinute && pendingValue[0] !== null}
                  {#if !(hideDisabledOptions && isMinDisabled)}
                    <li
                      class="cd-range-picker__time-item"
                      class:cd-range-picker__time-item--selected={isSel}
                      class:cd-range-picker__time-item--disabled={isMinDisabled}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={isMinDisabled || undefined}
                      tabindex="-1"
                      onclick={() => {
                        focusEnd('start');
                        pickMinute(m);
                      }}
                      onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          focusEnd('start');
                          pickMinute(m);
                        }
                      }}
                    >
                      {pad2(m)}
                    </li>
                  {/if}
                {/each}
              </ul>
              {#if showSecond}
                <ul class="cd-range-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.second')} bind:this={startSecondCol}>
                  {#each seconds as s (s)}
                    {@const isSecDisabled = activeEnd === 'start' && disabledSecondSet.has(s)}
                    {@const isSel = activeEnd === 'start' && s === activeSecond && pendingValue[0] !== null}
                    {#if !(hideDisabledOptions && isSecDisabled)}
                      <li
                        class="cd-range-picker__time-item"
                        class:cd-range-picker__time-item--selected={isSel}
                        class:cd-range-picker__time-item--disabled={isSecDisabled}
                        role="option"
                        aria-selected={isSel}
                        aria-disabled={isSecDisabled || undefined}
                        tabindex="-1"
                        onclick={() => {
                          focusEnd('start');
                          pickSecond(s);
                        }}
                        onkeydown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            focusEnd('start');
                            pickSecond(s);
                          }
                        }}
                      >
                        {pad2(s)}
                      </li>
                    {/if}
                  {/each}
                </ul>
              {/if}
            </div>

            <div
              class="cd-range-picker__time"
              class:cd-range-picker__time--active={activeEnd === 'end'}
              role="group"
              aria-label={loc().t('DatePicker.endPlaceholder')}
            >
              <ul class="cd-range-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.hour')} bind:this={endHourCol}>
                {#each hours as h (h)}
                  {@const isHourDisabled = activeEnd === 'end' && disabledHourSet.has(h)}
                  {@const isSel = activeEnd === 'end' && h === activeHour && pendingValue[1] !== null}
                  {#if !(hideDisabledOptions && isHourDisabled)}
                    <li
                      class="cd-range-picker__time-item"
                      class:cd-range-picker__time-item--selected={isSel}
                      class:cd-range-picker__time-item--disabled={isHourDisabled}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={isHourDisabled || undefined}
                      tabindex="-1"
                      onclick={() => {
                        focusEnd('end');
                        pickHour(h);
                      }}
                      onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          focusEnd('end');
                          pickHour(h);
                        }
                      }}
                    >
                      {pad2(h)}
                    </li>
                  {/if}
                {/each}
              </ul>
              <ul class="cd-range-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.minute')} bind:this={endMinuteCol}>
                {#each minutes as m (m)}
                  {@const isMinDisabled = activeEnd === 'end' && disabledMinuteSet.has(m)}
                  {@const isSel = activeEnd === 'end' && m === activeMinute && pendingValue[1] !== null}
                  {#if !(hideDisabledOptions && isMinDisabled)}
                    <li
                      class="cd-range-picker__time-item"
                      class:cd-range-picker__time-item--selected={isSel}
                      class:cd-range-picker__time-item--disabled={isMinDisabled}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={isMinDisabled || undefined}
                      tabindex="-1"
                      onclick={() => {
                        focusEnd('end');
                        pickMinute(m);
                      }}
                      onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          focusEnd('end');
                          pickMinute(m);
                        }
                      }}
                    >
                      {pad2(m)}
                    </li>
                  {/if}
                {/each}
              </ul>
              {#if showSecond}
                <ul class="cd-range-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.second')} bind:this={endSecondCol}>
                  {#each seconds as s (s)}
                    {@const isSecDisabled = activeEnd === 'end' && disabledSecondSet.has(s)}
                    {@const isSel = activeEnd === 'end' && s === activeSecond && pendingValue[1] !== null}
                    {#if !(hideDisabledOptions && isSecDisabled)}
                      <li
                        class="cd-range-picker__time-item"
                        class:cd-range-picker__time-item--selected={isSel}
                        class:cd-range-picker__time-item--disabled={isSecDisabled}
                        role="option"
                        aria-selected={isSel}
                        aria-disabled={isSecDisabled || undefined}
                        tabindex="-1"
                        onclick={() => {
                          focusEnd('end');
                          pickSecond(s);
                        }}
                        onkeydown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            focusEnd('end');
                            pickSecond(s);
                          }
                        }}
                      >
                        {pad2(s)}
                      </li>
                    {/if}
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      {/snippet}

      {#snippet presetGroup()}
        <div
          class="cd-range-picker__presets"
          class:cd-range-picker__presets--vertical={presetsVertical}
          role="group"
          aria-label={loc().t('DatePicker.rangeTriggerLabel')}
        >
          {#each presets ?? [] as preset, i (i)}
            <button
              type="button"
              class="cd-range-picker__preset"
              onclick={() => selectRangePreset(preset)}
            >
              {preset.label}
            </button>
          {/each}
        </div>
      {/snippet}

      {#if hasPresets}
        <div
          class="cd-range-picker__layout"
          class:cd-range-picker__layout--presets-top={presetPosition === 'top'}
          class:cd-range-picker__layout--presets-bottom={presetPosition === 'bottom'}
          class:cd-range-picker__layout--presets-left={presetPosition === 'left'}
          class:cd-range-picker__layout--presets-right={presetPosition === 'right'}
        >
          {#if presetPosition === 'left' || presetPosition === 'top'}
            {@render presetGroup()}
          {/if}
          {@render panelsBlock()}
          {#if presetPosition === 'right' || presetPosition === 'bottom'}
            {@render presetGroup()}
          {/if}
        </div>
      {:else}
        {@render panelsBlock()}
      {/if}

      {#if showFooter}
        <div class="cd-range-picker__footer">
          <button type="button" class="cd-range-picker__cancel" onclick={cancelConfirm}>
            {loc().t('DatePicker.cancel') ?? '取消'}
          </button>
          <button type="button" class="cd-range-picker__ok" onclick={confirm}>
            {loc().t('TimePicker.confirm')}
          </button>
        </div>
      {/if}
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
    /* 定位（position/inset/transform）由 use:floating action 接管；此处仅保留视觉样式。 */
    z-index: var(--cd-date-picker-panel-z);
    padding: var(--cd-spacing-base-tight);
    background: var(--cd-date-picker-panel-bg);
    border-radius: var(--cd-date-picker-panel-radius);
    box-shadow: var(--cd-date-picker-panel-shadow);
  }
  .cd-range-picker__panel:focus-visible {
    outline: none;
  }
  /* presets 布局：left/right 时 presets 与面板横向并排；top/bottom 时整体竖排。 */
  .cd-range-picker__layout {
    display: flex;
    align-items: stretch;
  }
  .cd-range-picker__layout--presets-top,
  .cd-range-picker__layout--presets-bottom {
    flex-direction: column;
  }
  .cd-range-picker__presets {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    margin-inline-end: var(--cd-spacing-base-tight);
    padding-inline-end: var(--cd-spacing-base-tight);
    border-inline-end: 1px solid var(--cd-color-date-picker-border-bg-default);
    min-inline-size: 5rem;
  }
  /* top/bottom 时横向排列 presets */
  .cd-range-picker__presets:not(.cd-range-picker__presets--vertical) {
    flex-direction: row;
    flex-wrap: wrap;
    margin-inline-end: 0;
    padding-inline-end: 0;
    border-inline-end: none;
    margin-block-end: var(--cd-spacing-tight);
    padding-block-end: var(--cd-spacing-tight);
    border-block-end: 1px solid var(--cd-color-date-picker-border-bg-default);
    min-inline-size: unset;
  }
  /* right 侧预设：切换 margin/border 方向 */
  .cd-range-picker__layout--presets-right .cd-range-picker__presets {
    margin-inline-end: 0;
    padding-inline-end: 0;
    border-inline-end: none;
    margin-inline-start: var(--cd-spacing-base-tight);
    padding-inline-start: var(--cd-spacing-base-tight);
    border-inline-start: 1px solid var(--cd-color-date-picker-border-bg-default);
  }
  /* bottom 侧预设 */
  .cd-range-picker__layout--presets-bottom .cd-range-picker__presets {
    margin-block-end: 0;
    padding-block-end: 0;
    border-block-end: none;
    margin-block-start: var(--cd-spacing-tight);
    padding-block-start: var(--cd-spacing-tight);
    border-block-start: 1px solid var(--cd-color-date-picker-border-bg-default);
  }
  .cd-range-picker__preset {
    padding-inline: var(--cd-spacing-tight);
    padding-block: var(--cd-spacing-extra-tight);
    border: none;
    border-radius: var(--cd-width-date-picker-quick-control-border-radius);
    background: var(--cd-color-date-picker-quick-bg-default);
    color: var(--cd-color-date-picker-date-text-default);
    font: inherit;
    text-align: start;
    white-space: nowrap;
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-range-picker__preset:hover {
    background: var(--cd-date-picker-cell-bg-hover);
    color: var(--cd-color-date-picker-quick-button-text-default);
  }
  .cd-range-picker__preset:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
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
    color: var(--cd-color-date-picker-nav-icon-text-default);
    border-radius: var(--cd-date-picker-cell-radius);
    cursor: pointer;
  }
  .cd-range-picker__nav:hover {
    background: var(--cd-date-picker-cell-bg-hover);
    color: var(--cd-color-date-picker-nav-month-icon-text-default);
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
    color: var(--cd-color-date-picker-date-text-default);
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
  /* 区间内：浅底连续条（对齐 Semi primary-light 区间底色） */
  .cd-range-picker__cell--in-range {
    background: var(--cd-color-date-picker-date-in-hover-bg-default);
    border-radius: 0;
  }
  /* 端点：实心高亮 */
  .cd-range-picker__cell--edge,
  .cd-range-picker__cell--edge:hover {
    background: var(--cd-color-date-picker-date-selected-bg-default);
    color: var(--cd-color-date-picker-date-selected-text-default);
  }
  .cd-range-picker__cell:disabled {
    color: var(--cd-color-date-picker-date-disabled-text-default);
    cursor: not-allowed;
    background: transparent;
  }

  /* --- monthRange：3 列月份大格（对齐 DatePicker type=month 的 month 面板） --- */
  .cd-range-picker__grid--month {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--cd-spacing-extra-tight);
    inline-size: calc(var(--cd-date-picker-cell-size) * 7 + 2px * 6);
  }
  .cd-range-picker__cell--block {
    inline-size: auto;
    padding-inline: var(--cd-spacing-tight);
    block-size: calc(var(--cd-date-picker-cell-size) * 1.4);
  }

  /* --- 时间列（dateTimeRange，复用 DatePicker dateTime 列 token） --- */
  .cd-range-picker__times {
    display: flex;
    margin-inline-start: var(--cd-spacing-tight);
    padding-inline-start: var(--cd-spacing-tight);
    border-inline-start: 1px solid var(--cd-color-date-picker-border-bg-default);
    gap: var(--cd-spacing-tight);
  }
  .cd-range-picker__time {
    display: flex;
  }
  .cd-range-picker__time + .cd-range-picker__time {
    padding-inline-start: var(--cd-spacing-tight);
    border-inline-start: 1px solid var(--cd-color-date-picker-border-bg-default);
  }
  /* 当前激活端：轻微高亮标示时间列作用于哪一端 */
  .cd-range-picker__time--active {
    background: var(--cd-color-date-picker-date-in-hover-bg-default);
    border-radius: var(--cd-date-picker-cell-radius);
  }
  .cd-range-picker__time-col {
    inline-size: var(--cd-date-picker-inline-time-col-width);
    block-size: calc(var(--cd-date-picker-inline-time-item-height) * 7);
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
    scrollbar-width: thin;
  }
  .cd-range-picker__time-col + .cd-range-picker__time-col {
    border-inline-start: 1px solid var(--cd-color-date-picker-border-bg-default);
  }
  .cd-range-picker__time-item {
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-date-picker-inline-time-item-height);
    color: var(--cd-color-date-picker-date-text-default);
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-range-picker__time-item:hover {
    background: var(--cd-date-picker-cell-bg-hover);
  }
  .cd-range-picker__time-item:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-range-picker__time-item--selected,
  .cd-range-picker__time-item--selected:hover {
    background: var(--cd-date-picker-cell-bg-selected);
    color: var(--cd-date-picker-cell-color-selected);
  }
  .cd-range-picker__time-item--disabled,
  .cd-range-picker__time-item--disabled:hover {
    color: var(--cd-color-date-picker-date-disabled-text-default);
    cursor: not-allowed;
    background: transparent;
  }

  /* --- footer（确认 / 取消） --- */
  .cd-range-picker__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--cd-spacing-tight);
    margin-block-start: var(--cd-spacing-tight);
    padding-block-start: var(--cd-spacing-tight);
    border-block-start: 1px solid var(--cd-color-date-picker-border-bg-default);
    background: var(--cd-date-picker-footer-bg);
  }
  .cd-range-picker__ok {
    padding-inline: var(--cd-spacing-tight);
    padding-block: var(--cd-spacing-extra-tight);
    border: none;
    border-radius: var(--cd-width-date-picker-quick-control-border-radius);
    background: var(--cd-color-date-picker-date-selected-bg-default);
    color: var(--cd-color-date-picker-date-selected-text-default);
    font: inherit;
    cursor: pointer;
  }
  .cd-range-picker__ok:hover {
    background: var(--cd-color-primary-hover, var(--cd-color-primary));
  }
  .cd-range-picker__ok:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-range-picker__cancel {
    padding-inline: var(--cd-spacing-tight);
    padding-block: var(--cd-spacing-extra-tight);
    border: 1px solid var(--cd-color-date-picker-border-bg-default);
    border-radius: var(--cd-width-date-picker-quick-control-border-radius);
    background: transparent;
    color: var(--cd-color-date-picker-date-text-default);
    font: inherit;
    cursor: pointer;
  }
  .cd-range-picker__cancel:hover {
    border-color: var(--cd-color-date-picker-quick-button-text-default);
    color: var(--cd-color-date-picker-quick-button-text-default);
  }
  .cd-range-picker__cancel:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-range-picker__trigger,
    .cd-range-picker__clear,
    .cd-range-picker__cell,
    .cd-range-picker__time-item {
      transition: none;
    }
  }
</style>
