<!--
  DatePicker — see specs/components/input/DatePicker.spec.md
  基础子集: 单选 type='date' 日历面板 / type='dateTime' 日期+时间。Token-driven, a11y-correct, 受控/非受控。
  本地化全部走 Intl.DateTimeFormat (不手拼日期串)。dateTime 复用 TimePicker 的时/分/秒列逻辑。
  disabledTime: dateTime 时/分/秒列按日期禁用值置灰跳过；presets: 面板侧边快捷日期按钮。
  format: 传 token 串（YYYY/MM/DD/HH/mm/ss）时，触发器变可输入文本框，显示与手输解析均走
  core 的 formatDate/parseDateString 纯函数（红线 #2）；不传则沿用 Intl.DateTimeFormat 显示（向后兼容）。
-->
<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { useId, useDismiss, useFocusTrap, isSameDay, startOfDay, addMonths, getMonthGrid, weekdayOrder, gridFocusMove, formatDate, parseDateString, type GridFocusKey } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  type PickerType = 'date' | 'dateTime' | 'month' | 'year';
  type CSSProperties = Record<string, string | number>;
  type PresetPosition = 'left' | 'right' | 'top' | 'bottom';

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

  interface DayStatus {
    isSelected: boolean;
    isToday: boolean;
    isDisabled: boolean;
    isInMonth: boolean;
  }

  interface Props {
    type?: PickerType;
    value?: Date | Date[] | null;
    defaultValue?: Date | Date[] | null;
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
    onChange?: (v: Date | Date[] | null) => void;
    onOpenChange?: (open: boolean) => void;
    /** 手动键入解析失败 (editable 模式)。 */
    onParseError?: (e: { text: string }) => void;
    /** 可见年月切换 (头部导航)。 */
    onPanelChange?: (e: { panelDate: Date }) => void;
    /** 点击快捷选项。 */
    onPresetClick?: (e: { preset: Preset }) => void;
    /** 点击清除。 */
    onClear?: (e: Record<string, never>) => void;
    /** 点击确认按钮 (dateTime / needConfirm)。 */
    onConfirm?: (e: { value: Date | Date[] | null }) => void;
    /** 触发器获得焦点。 */
    onFocus?: (e: FocusEvent) => void;
    /** 触发器失去焦点。 */
    onBlur?: (e: FocusEvent) => void;
    ariaLabel?: string;
    /** 用 Snippet 自定义范围分隔符，优先于 rangeSeparator 字符串。 */
    rangeSeparatorNode?: Snippet;
    /** 选完月/年后自动切换到日视图（默认 true）。 */
    autoSwitchDate?: boolean;
    /** 浮层自动调整位置防溢出（默认 true）。 */
    autoAdjustOverflow?: boolean;
    /** 范围模式下在面板内嵌输入框（默认 false）。 */
    insetInput?: boolean;
    /** 浮层弹出位置（默认 'bottomLeft'）。 */
    position?: string;
    /** 触发器与浮层间距。 */
    spacing?: number;
    /** 浮层挂载容器。 */
    getPopupContainer?: () => HTMLElement;
    /** weekStart 别名。 */
    weekStartsOn?: WeekStart;
    /** 点击取消按钮。 */
    onCancel?: (date: Date | Date[] | null, dateStr: string) => void;
    /** onChange 参数改为 dateFirst（仅声明，透传语义）。 */
    onChangeWithDateFirst?: boolean;
    /** 点击外部关闭时触发。 */
    onClickOutSide?: (e: MouseEvent) => void;

    // --- 外观类 ---
    /** 无边框模式 */
    borderless?: boolean;
    /** 面板尺寸 compact 时面板更紧凑 */
    density?: 'default' | 'compact';
    /** 触发器前缀内容，渲染在 input 左侧 */
    prefix?: Snippet | string;
    /** 自定义清除按钮图标 */
    clearIcon?: Snippet;
    /** 是否显示清除按钮（默认 true，受 clearable 控制） */
    showClear?: boolean;
    /** 输入框 readonly 属性 */
    inputReadOnly?: boolean;
    /** 输入框内联样式 */
    inputStyle?: CSSProperties | string;
    /** 挂载时自动聚焦 */
    autoFocus?: boolean;

    // --- 浮层类 ---
    /** 下拉浮层 className */
    dropdownClassName?: string;
    /** 下拉浮层样式 */
    dropdownStyle?: CSSProperties | string;
    /** 浮层溢出冗余值 */
    dropdownMargin?: number | { x?: number; y?: number };
    /** 浮层 z-index（默认 1030） */
    zIndex?: number;
    /** 面板展开动画，false 时添加 cd-date-picker--no-motion（默认 true） */
    motion?: boolean;
    /** 聚焦时阻止滚动 */
    preventScroll?: boolean;
    /** 阻止浮层点击事件冒泡（默认 true） */
    stopPropagation?: boolean;

    // --- 插槽类 ---
    /** 面板顶部额外区域 */
    topSlot?: Snippet;
    /** 面板底部额外区域 */
    bottomSlot?: Snippet;
    /** 面板左侧额外区域 */
    leftSlot?: Snippet;
    /** 面板右侧额外区域 */
    rightSlot?: Snippet;

    // --- 日期范围增强 ---
    /** 多选（仅 type='date'），value 变为 Date[] */
    multiple?: boolean;
    /** multiple=true 时最多选择数量 */
    max?: number;
    /** 范围日期分隔符（默认 '~'） */
    rangeSeparator?: string;
    /** 单击选择范围的起始偏移 */
    startDateOffset?: (date: Date) => Date;
    /** 单击选择范围的结束偏移 */
    endDateOffset?: (date: Date) => Date;
    /** 年份滚轮最小年 */
    startYear?: number;
    /** 年份滚轮最大年 */
    endYear?: number;
    /** 范围选择双面板同步切换月份（默认 false） */
    syncSwitchMonth?: boolean;

    // --- 自定义渲染 ---
    /** 自定义日期单元格内容 */
    renderDate?: Snippet<[{ day: number; fullDate: string }]>;
    /** 完全自定义日期格子 */
    renderFullDate?: Snippet<[{ day: number; fullDate: string; dayStatus: DayStatus }]>;
    /** 完全自定义触发器 */
    triggerRender?: Snippet<[{ value: Date | Date[] | null; placeholder: string }]>;

    // --- 时间相关 ---
    /** 透传给内部 TimePicker 的参数 */
    timePickerOpts?: Record<string, unknown>;
    /** 隐藏禁止的时间选项 */
    hideDisabledOptions?: boolean;
    /** 禁止时间选择 */
    disabledTimePicker?: boolean;
    /** dateTime/dateTimeRange 时需要点击确认才写入 */
    needConfirm?: boolean;

    // --- 快捷选项 ---
    /** 快捷选项列表位置（默认 'bottom'） */
    presetPosition?: PresetPosition;

    // --- 年月滚轮配置 ---
    /** 透传给年月 ScrollList 的参数 */
    yearAndMonthOpts?: { yearCyclic?: boolean; monthCyclic?: boolean } | Record<string, unknown>;
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
    rangeSeparatorNode,
    rangeSeparator = '~',
    autoSwitchDate = true,
    autoAdjustOverflow = true,
    insetInput = false,
    position = 'bottomLeft',
    spacing,
    getPopupContainer,
    weekStartsOn,
    yearAndMonthOpts,
    onCancel,
    onChangeWithDateFirst = false,
    onClickOutSide,
    // 外观类
    borderless = false,
    density = 'default',
    prefix,
    clearIcon,
    showClear: showClearProp = true,
    inputReadOnly = false,
    inputStyle,
    autoFocus = false,
    // 浮层类
    dropdownClassName,
    dropdownStyle,
    dropdownMargin,
    zIndex = 1030,
    motion = true,
    preventScroll = false,
    stopPropagation = true,
    // 插槽类
    topSlot,
    bottomSlot,
    leftSlot,
    rightSlot,
    // 日期范围增强
    multiple = false,
    max,
    startDateOffset,
    endDateOffset,
    startYear,
    endYear,
    syncSwitchMonth = false,
    // 自定义渲染
    renderDate,
    renderFullDate,
    triggerRender,
    // 时间相关
    timePickerOpts,
    hideDisabledOptions = false,
    disabledTimePicker = false,
    needConfirm = false,
    // 快捷选项
    presetPosition = 'bottom',
  }: Props = $props();

  const isDateTime = $derived(type === 'dateTime');
  const isMonth = $derived(type === 'month');
  const isYear = $derived(type === 'year');

  // weekStartsOn 是 weekStart 的别名，weekStart 优先
  const effWeekStart = $derived(weekStart ?? weekStartsOn ?? 0);

  const loc = useLocale();

  const dialogId = useId('cd-date-picker-panel');
  // 日期网格容器 id（aria-activedescendant 指向其中的 cell id 前缀）
  const gridId = useId('cd-date-picker-grid');

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);

  // multiple 模式下 value 为 Date[]，单选为 Date | null
  function getInitialValue(): Date | Date[] | null {
    if (multiple) {
      if (Array.isArray(defaultValue)) return defaultValue;
      if (defaultValue instanceof Date) return [defaultValue];
      return [];
    }
    if (Array.isArray(defaultValue)) return defaultValue[0] ?? null;
    return defaultValue ?? null;
  }

  let innerValue = $state<Date | Date[] | null>(getInitialValue());
  const current = $derived<Date | Date[] | null>(isValueControlled ? (value ?? null) : innerValue);

  // 单一 Date 视图（multiple 时取第一个，非 multiple 直接用）
  const currentSingle = $derived<Date | null>(
    Array.isArray(current) ? (current[0] ?? null) : current,
  );

  function setValue(next: Date | Date[] | null) {
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
  // 初始化游标用 defaultValue（不依赖 $derived 的 currentSingle 避免 state_referenced_locally）
  const _initCursorDate: Date | null = Array.isArray(defaultValue)
    ? (defaultValue[0] ?? null)
    : (defaultValue instanceof Date ? defaultValue : null);
  let cursor = $state(startOfDay(_initCursorDate ?? new Date()));

  // 当面板打开时把游标对齐到当前选中值(或今天)所在月份
  $effect(() => {
    if (isOpen) {
      cursor = startOfDay(currentSingle ?? new Date());
    }
  });

  // --- needConfirm 暂存值：点确认才写入 ---
  let pendingValue = $state<Date | Date[] | null>(null);

  $effect(() => {
    if (isOpen) {
      pendingValue = current;
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
  function formatSingle(d: Date | null): string {
    if (!d) return '';
    return format ? formatDate(d, format) : triggerFormat.format(d);
  }

  const formattedValue = $derived(
    multiple
      ? (Array.isArray(current) ? current.map(formatSingle).join(` ${rangeSeparator} `) : '')
      : formatSingle(currentSingle),
  );
  const displayText = $derived(formattedValue || (placeholder ?? loc().t('DatePicker.placeholder')));

  // --- 可输入模式 (format 串)：本地草稿文本 + 按格式解析 ---
  const editable = $derived(!!format && !multiple);
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
      if (currentSingle !== null) setValue(null);
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

  // --- insetInput 面板内嵌输入 (对齐 Semi InsetDateInput / InsetTimeInput) ---
  // 面板顶部渲染可编辑输入框：date 一个日期框；dateTime 日期框 + 时间框。
  // 与面板选择双向同步：点日历/选时间 → currentSingle 变 → 派生文本刷新；键入 → 解析 → 写回。
  // 解析/序列化复用 core 纯函数 formatDate/parseDateString（红线 #2），不重写解析。
  // insetInput 仅在 date / dateTime 面板生效（month/year 无内嵌输入，对齐 Semi）。
  const insetEnabled = $derived(insetInput && !multiple && (type === 'date' || type === 'dateTime'));
  // 内嵌输入用的日期/时间格式串：优先复用用户 format（拆出日期段与时间段），否则用默认。
  const insetDateFormat = $derived(deriveInsetDateFormat());
  const insetTimeFormat = $derived(deriveInsetTimeFormat());

  // 从 format 提取「日期部分」token（YYYY/MM/DD 及其分隔符），无 format 时回退 YYYY-MM-DD。
  function deriveInsetDateFormat(): string {
    if (format) {
      const m = format.match(/^[^Hms]*(?=(?:\s+)?(?:HH|mm|ss)|$)/);
      const datePart = (m?.[0] ?? '').trim();
      if (datePart) return datePart;
    }
    return 'YYYY-MM-DD';
  }
  // 从 format 提取「时间部分」token（HH/mm/ss），无 format 时按 showSecond 回退。
  function deriveInsetTimeFormat(): string {
    if (format) {
      const idx = format.search(/HH|mm|ss/);
      if (idx >= 0) return format.slice(idx).trim();
    }
    return showSecond ? 'HH:mm:ss' : 'HH:mm';
  }

  // 内嵌输入草稿文本：从当前值派生（非编辑态跟随面板选择刷新）。
  let insetDateText = $state('');
  let insetTimeText = $state('');
  $effect(() => {
    if (!insetEnabled) return;
    insetDateText = currentSingle ? formatDate(currentSingle, insetDateFormat) : '';
    insetTimeText = currentSingle ? formatDate(currentSingle, insetTimeFormat) : '';
  });

  // 提交内嵌日期输入：解析日期段，保留已选时间（combine），写回。
  function commitInsetDate() {
    if (!insetEnabled) return;
    const raw = insetDateText.trim();
    if (raw === '') return;
    const parsed = parseDateString(raw, insetDateFormat);
    if (parsed && !(disabledDate?.(parsed) ?? false)) {
      const next = combine(parsed);
      if (needConfirm) pendingValue = next;
      else setValue(next);
    } else {
      insetDateText = currentSingle ? formatDate(currentSingle, insetDateFormat) : '';
      onParseError?.({ text: raw });
    }
  }

  // 提交内嵌时间输入：解析时/分/秒，合并到当前日期（无则今天），写回。
  function commitInsetTime() {
    if (!insetEnabled || !isDateTime) return;
    const raw = insetTimeText.trim();
    if (raw === '') return;
    const parsedTime = parseDateString(raw, insetTimeFormat);
    if (parsedTime) {
      const base = currentSingle ? new Date(currentSingle) : startOfDay(today);
      base.setHours(parsedTime.getHours(), parsedTime.getMinutes(), parsedTime.getSeconds(), 0);
      if (needConfirm) pendingValue = base;
      else setValue(base);
    } else {
      insetTimeText = currentSingle ? formatDate(currentSingle, insetTimeFormat) : '';
      onParseError?.({ text: raw });
    }
  }

  function onInsetDateKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInsetDate();
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setOpen(false);
    }
  }
  function onInsetTimeKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInsetTime();
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
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
      const inRange = (startYear === undefined || year >= startYear) && (endYear === undefined || year <= endYear);
      return { date, year, inDecade: year >= decadeStart && year <= decadeStart + 9, inRange };
    }),
  );

  // 星期名: 用 weekdayOrder + 一个已知周日基准 (2023-01-01 是星期日) 经 Intl 本地化
  const weekdayNames = $derived(
    weekdayOrder(effWeekStart).map((dow) => weekdayFormat.format(new Date(2023, 0, 1 + dow))),
  );
  // 完整星期名 (columnheader aria-label)，顺序与 weekdayNames 一致
  const weekdayLongNames = $derived(
    weekdayOrder(effWeekStart).map((dow) => weekdayLongFormat.format(new Date(2023, 0, 1 + dow))),
  );

  // 面板内键盘高亮日 (highlight 为本地 $state；aria-activedescendant 指向它)
  let highlight = $state<Date | null>(null);

  const grid = $derived(getMonthGrid(cursor, effWeekStart));
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

  // showClear 综合判断：clearable & !disabled & 有值 & showClearProp=true
  const showClearDerived = $derived(
    clearable &&
    showClearProp &&
    !disabled &&
    (multiple ? (Array.isArray(current) && current.length > 0) : currentSingle !== null),
  );

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
  const selectedHour = $derived(currentSingle ? currentSingle.getHours() : 0);
  const selectedMinute = $derived(currentSingle ? currentSingle.getMinutes() : 0);
  const selectedSecond = $derived(currentSingle ? currentSingle.getSeconds() : 0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  // --- disabledTime (dateTime)：按当前日期解析各列禁用值集合 ---
  // 基准日期取当前选中值(无则今天)；时/分依赖已选时分以联动下游列。
  const disabledTimeCfg = $derived(
    isDateTime && disabledTime ? disabledTime(currentSingle ?? today) : undefined,
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

    if (multiple) {
      const arr = Array.isArray(current) ? [...current] : [];
      const idx = arr.findIndex((d) => isSameDay(d, date));
      let next: Date[];
      if (idx >= 0) {
        // 取消选中
        next = arr.filter((_, i) => i !== idx);
      } else {
        // 新增选中（max 限制）
        if (max !== undefined && arr.length >= max) return;
        next = [...arr, startOfDay(date)];
      }
      if (needConfirm) {
        pendingValue = next;
      } else {
        setValue(next);
      }
      return;
    }

    const combined = combine(date);
    if (needConfirm) {
      pendingValue = combined;
      // dateTime needConfirm：选日期后保留面板
    } else {
      setValue(combined);
      // dateTime：选日期后保留面板，让用户继续选时间，点确定再关
      if (!isDateTime) setOpen(false);
    }
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
    const base = currentSingle ? new Date(currentSingle) : startOfDay(today);
    base.setHours(h, m, s, 0);
    if (needConfirm) {
      pendingValue = base;
    } else {
      setValue(base);
    }
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
    const val = needConfirm ? pendingValue : current;
    onConfirm?.({ value: val });
    if (needConfirm && pendingValue !== null) {
      setValue(pendingValue);
    }
    setOpen(false);
  }

  function cancelConfirm() {
    const dateStr = Array.isArray(current)
      ? current.map(formatSingle).join(` ${rangeSeparator} `)
      : formatSingle(currentSingle);
    onCancel?.(current, dateStr);
    pendingValue = current;
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
    const emptyVal = multiple ? [] : null;
    setValue(emptyVal);
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
      highlight = startOfDay(currentSingle ?? today);
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
    const next = gridFocusMove(base, key as GridFocusKey, 'month', effWeekStart);
    if (next) setHighlight(next);
  }

  // --- useDismiss (红线 #3): 绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  // 浮层 + 日期网格容器引用 (focus trap / 进场落焦，红线 #3 命令式 + cleanup)
  let panelEl = $state<HTMLDivElement | null>(null);
  let gridEl = $state<HTMLDivElement | null>(null);
  let triggerEl = $state<HTMLButtonElement | HTMLInputElement | null>(null);

  // autoFocus: 挂载后聚焦触发器
  $effect(() => {
    if (autoFocus && triggerEl) {
      void tick().then(() => {
        triggerEl?.focus({ preventScroll });
      });
    }
  });

  $effect(() => {
    if (!isOpen || !rootEl) return;
    // onClickOutSide 额外监听
    function handleDocClick(e: MouseEvent) {
      if (rootEl && !rootEl.contains(e.target as Node)) {
        onClickOutSide?.(e);
      }
    }
    if (onClickOutSide) {
      document.addEventListener('click', handleDocClick, true);
    }
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
    return () => {
      if (onClickOutSide) {
        document.removeEventListener('click', handleDocClick, true);
      }
      cleanup?.();
    };
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

  // onClickOutSide: 监听 document mousedown，点击不在 rootEl 内时触发
  $effect(() => {
    if (!onClickOutSide) return;
    function handler(e: MouseEvent) {
      if (rootEl && !rootEl.contains(e.target as Node)) {
        onClickOutSide!(e);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  });

  // stopPropagation：面板点击阻止冒泡
  function onPanelClick(e: MouseEvent) {
    if (stopPropagation) e.stopPropagation();
  }

  // --- 样式工具函数 ---
  function styleToString(s: CSSProperties | string | undefined): string | undefined {
    if (!s) return undefined;
    if (typeof s === 'string') return s;
    return Object.entries(s)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
      .join(';');
  }

  const dropdownStyleStr = $derived(styleToString(dropdownStyle));
  const inputStyleStr = $derived(styleToString(inputStyle));

  // z-index CSS variable 注入到 panel
  const panelStyle = $derived(
    [dropdownStyleStr, `z-index:${zIndex}`].filter(Boolean).join(';'),
  );

  const cls = $derived(
    [
      'cd-date-picker',
      `cd-date-picker--${size}`,
      `cd-date-picker--${status}`,
      disabled && 'cd-date-picker--disabled',
      isOpen && 'cd-date-picker--open',
      insetInput && 'cd-date-picker--inset-input',
      position && `cd-date-picker--${position}`,
      borderless && 'cd-date-picker--borderless',
      density === 'compact' && 'cd-date-picker--compact',
      !motion && 'cd-date-picker--no-motion',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // multiple 模式下是否选中某天
  function isDateSelected(date: Date): boolean {
    if (multiple) {
      return Array.isArray(current) && current.some((d) => isSameDay(d, date));
    }
    return isSameDay(date, currentSingle);
  }

  // fullDate 字符串工具
  function fullDateStr(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  // presets 布局：left/right 时垂直在侧边；top/bottom 时水平在上下
  const presetsVertical = $derived(presetPosition === 'left' || presetPosition === 'right');
</script>

<div class={cls} bind:this={rootEl} aria-invalid={status === 'error' || undefined} data-position={position}>
  <div class="cd-date-picker__control">
    {#if triggerRender}
      {@render triggerRender({ value: current, placeholder: placeholder ?? loc().t('DatePicker.placeholder') })}
    {:else if editable}
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
        readonly={inputReadOnly}
        style={inputStyleStr}
        bind:this={triggerEl as HTMLInputElement}
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
        style={inputStyleStr}
        bind:this={triggerEl as HTMLButtonElement}
        onclick={toggleOpen}
        onkeydown={onTriggerKeydown}
        onfocus={onFocus}
        onblur={onBlur}
      >
        {#if prefix}
          <span class="cd-date-picker__prefix">
            {#if typeof prefix === 'string'}
              {prefix}
            {:else}
              {@render prefix()}
            {/if}
          </span>
        {/if}
        <span class="cd-date-picker__value" class:cd-date-picker__value--placeholder={!formattedValue}>
          {displayText}
        </span>
      </button>
    {/if}

    {#if showClearDerived}
      <button type="button" class="cd-date-picker__clear" aria-label={loc().t('DatePicker.clear')} onclick={clear}>
        {#if clearIcon}
          {@render clearIcon()}
        {:else}
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
            />
          </svg>
        {/if}
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
      class={['cd-date-picker__panel', dropdownClassName].filter(Boolean).join(' ')}
      class:cd-date-picker__panel--datetime={isDateTime}
      id={dialogId}
      role="dialog"
      aria-modal="false"
      aria-label={loc().t('DatePicker.triggerLabel')}
      tabindex="-1"
      style={panelStyle}
      onclick={onPanelClick}
      onkeydown={undefined}
    >
      {#if topSlot}
        <div class="cd-date-picker__slot cd-date-picker__slot--top">
          {@render topSlot()}
        </div>
      {/if}

      <div
        class="cd-date-picker__layout"
        class:cd-date-picker__layout--presets={presets && presets.length > 0}
        class:cd-date-picker__layout--presets-top={presets && presets.length > 0 && presetPosition === 'top'}
        class:cd-date-picker__layout--presets-bottom={presets && presets.length > 0 && presetPosition === 'bottom'}
        class:cd-date-picker__layout--presets-left={presets && presets.length > 0 && presetPosition === 'left'}
        class:cd-date-picker__layout--presets-right={presets && presets.length > 0 && presetPosition === 'right'}
      >
        {#if leftSlot}
          <div class="cd-date-picker__slot cd-date-picker__slot--left">
            {@render leftSlot()}
          </div>
        {/if}

        {#if presets && presets.length > 0 && (presetPosition === 'left' || presetPosition === 'top')}
          <div
            class="cd-date-picker__presets"
            class:cd-date-picker__presets--vertical={presetsVertical}
            role="group"
            aria-label={loc().t('DatePicker.triggerLabel')}
          >
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
          {#if insetEnabled}
            <div class="cd-date-picker__inset-input" class:cd-date-picker__inset-input--datetime={isDateTime}>
              <input
                type="text"
                class="cd-date-picker__inset-field cd-date-picker__inset-field--date"
                aria-label={loc().t('DatePicker.triggerLabel')}
                placeholder={insetDateFormat}
                {disabled}
                bind:value={insetDateText}
                onkeydown={onInsetDateKeydown}
                onblur={commitInsetDate}
              />
              {#if isDateTime}
                <input
                  type="text"
                  class="cd-date-picker__inset-field cd-date-picker__inset-field--time"
                  aria-label={loc().t('TimePicker.hour')}
                  placeholder={insetTimeFormat}
                  {disabled}
                  bind:value={insetTimeText}
                  onkeydown={onInsetTimeKeydown}
                  onblur={commitInsetTime}
                />
              {/if}
            </div>
          {/if}
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
                      currentSingle !== null &&
                      currentSingle.getFullYear() === cell.date.getFullYear() &&
                      currentSingle.getMonth() === cell.month}
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
                    {@const isSelected = currentSingle !== null && currentSingle.getFullYear() === cell.year}
                    {@const isCurrent = today.getFullYear() === cell.year}
                    {@const isDisabled = (disabledDate?.(cell.date) ?? false) || !cell.inRange}
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
                        {@const isSelected = isDateSelected(cell.date)}
                        {@const isToday = isSameDay(cell.date, today)}
                        {@const isHighlight = isSameDay(cell.date, highlight)}
                        {@const isDisabled = disabledDate?.(cell.date) ?? false}
                        {@const dayStatus = { isSelected, isToday, isDisabled, isInMonth: cell.inMonth }}
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
                          {#if renderFullDate}
                            {@render renderFullDate({ day: cell.date.getDate(), fullDate: fullDateStr(cell.date), dayStatus })}
                          {:else if renderDate}
                            {@render renderDate({ day: cell.date.getDate(), fullDate: fullDateStr(cell.date) })}
                          {:else}
                            {cell.date.getDate()}
                          {/if}
                        </button>
                      {/each}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            {#if isDateTime && !disabledTimePicker}
              <div class="cd-date-picker__time">
                <ul class="cd-date-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.hour')} bind:this={hourCol}>
                  {#each hours as h (h)}
                    {@const isHourDisabled = disabledHourSet.has(h)}
                    {#if !(hideDisabledOptions && isHourDisabled)}
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
                    {/if}
                  {/each}
                </ul>
                <ul class="cd-date-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.minute')} bind:this={minuteCol}>
                  {#each minutes as m (m)}
                    {@const isMinuteDisabled = disabledMinuteSet.has(m)}
                    {#if !(hideDisabledOptions && isMinuteDisabled)}
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
                    {/if}
                  {/each}
                </ul>
                {#if showSecond}
                  <ul class="cd-date-picker__time-col" role="listbox" aria-label={loc().t('TimePicker.second')} bind:this={secondCol}>
                    {#each seconds as s (s)}
                      {@const isSecondDisabled = disabledSecondSet.has(s)}
                      {#if !(hideDisabledOptions && isSecondDisabled)}
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
                      {/if}
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
            {#if isDateTime || needConfirm}
              {#if needConfirm}
                <button type="button" class="cd-date-picker__cancel" onclick={cancelConfirm}>
                  {loc().t('DatePicker.cancel') ?? '取消'}
                </button>
              {/if}
              <button type="button" class="cd-date-picker__ok" onclick={confirm}>
                {loc().t('TimePicker.confirm')}
              </button>
            {/if}
          </div>
        </div>

        {#if presets && presets.length > 0 && (presetPosition === 'right' || presetPosition === 'bottom')}
          <div
            class="cd-date-picker__presets"
            class:cd-date-picker__presets--vertical={presetsVertical}
            role="group"
            aria-label={loc().t('DatePicker.triggerLabel')}
          >
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

        {#if rightSlot}
          <div class="cd-date-picker__slot cd-date-picker__slot--right">
            {@render rightSlot()}
          </div>
        {/if}
      </div>

      {#if bottomSlot}
        <div class="cd-date-picker__slot cd-date-picker__slot--bottom">
          {@render bottomSlot()}
        </div>
      {/if}
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
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    block-size: var(--cd-height-input-default);
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
    block-size: var(--cd-height-input-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-date-picker--large .cd-date-picker__trigger {
    block-size: var(--cd-height-input-large);
    font-size: var(--cd-font-size-header-6);
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
  /* borderless 模式 */
  .cd-date-picker--borderless .cd-date-picker__trigger {
    border-color: transparent;
    background: transparent;
  }
  /* compact 密度 */
  .cd-date-picker--compact .cd-date-picker__panel {
    padding: var(--cd-spacing-tight);
  }
  .cd-date-picker--compact .cd-date-picker__cell {
    inline-size: calc(var(--cd-date-picker-cell-size) * 0.85);
    block-size: calc(var(--cd-date-picker-cell-size) * 0.85);
    font-size: var(--cd-font-size-small);
  }
  .cd-date-picker--compact .cd-date-picker__weekday {
    block-size: calc(var(--cd-date-picker-cell-size) * 0.85);
    font-size: var(--cd-font-size-small);
  }
  /* no-motion */
  .cd-date-picker--no-motion .cd-date-picker__panel {
    animation: none;
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
  .cd-date-picker__prefix {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
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
    border-radius: var(--cd-border-radius-small);
  }
  .cd-date-picker__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-date-picker__panel {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-extra-tight));
    inset-inline-start: 0;
    z-index: var(--cd-date-picker-panel-z, 1030);
    padding: var(--cd-spacing-base-tight);
    background: var(--cd-date-picker-panel-bg);
    border-radius: var(--cd-date-picker-panel-radius);
    box-shadow: var(--cd-date-picker-panel-shadow);
  }
  .cd-date-picker__panel:focus-visible {
    outline: none;
  }
  /* 顶部/底部插槽 */
  .cd-date-picker__slot--top {
    margin-block-end: var(--cd-spacing-tight);
  }
  .cd-date-picker__slot--bottom {
    margin-block-start: var(--cd-spacing-tight);
  }
  .cd-date-picker__slot--left {
    margin-inline-end: var(--cd-spacing-tight);
  }
  .cd-date-picker__slot--right {
    margin-inline-start: var(--cd-spacing-tight);
  }
  .cd-date-picker__layout {
    display: flex;
    align-items: stretch;
  }
  /* presets top/bottom 时竖向排列整体 */
  .cd-date-picker__layout--presets-top,
  .cd-date-picker__layout--presets-bottom {
    flex-direction: column;
  }
  .cd-date-picker__main {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
  }
  .cd-date-picker__presets {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    margin-inline-end: var(--cd-spacing-base-tight);
    padding-inline-end: var(--cd-spacing-base-tight);
    border-inline-end: 1px solid var(--cd-color-date-picker-border-bg-default);
    min-inline-size: 5rem;
  }
  /* top/bottom 时横向排列 presets */
  .cd-date-picker__presets:not(.cd-date-picker__presets--vertical) {
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
  .cd-date-picker__layout--presets-right .cd-date-picker__presets {
    margin-inline-end: 0;
    padding-inline-end: 0;
    border-inline-end: none;
    margin-inline-start: var(--cd-spacing-base-tight);
    padding-inline-start: var(--cd-spacing-base-tight);
    border-inline-start: 1px solid var(--cd-color-date-picker-border-bg-default);
  }
  /* bottom 预sets */
  .cd-date-picker__layout--presets-bottom .cd-date-picker__presets {
    margin-block-end: 0;
    padding-block-end: 0;
    border-block-end: none;
    margin-block-start: var(--cd-spacing-tight);
    padding-block-start: var(--cd-spacing-tight);
    border-block-start: 1px solid var(--cd-color-date-picker-border-bg-default);
  }
  .cd-date-picker__preset {
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
  .cd-date-picker__preset:hover {
    background: var(--cd-date-picker-cell-bg-hover);
    color: var(--cd-color-date-picker-quick-button-text-default);
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
    margin-inline-start: var(--cd-spacing-tight);
    padding-inline-start: var(--cd-spacing-tight);
    border-inline-start: 1px solid var(--cd-color-date-picker-border-bg-default);
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
    border-inline-start: 1px solid var(--cd-color-date-picker-border-bg-default);
  }
  .cd-date-picker__time-item {
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-time-picker-time-item-height);
    color: var(--cd-color-date-picker-date-text-default);
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
    color: var(--cd-color-date-picker-date-disabled-text-default);
    cursor: not-allowed;
    background: transparent;
  }
  .cd-date-picker__ok {
    padding-inline: var(--cd-spacing-tight);
    padding-block: var(--cd-spacing-extra-tight);
    border: none;
    border-radius: var(--cd-width-date-picker-quick-control-border-radius);
    background: var(--cd-color-date-picker-date-selected-bg-default);
    color: var(--cd-color-date-picker-date-selected-text-default);
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
  .cd-date-picker__cancel {
    padding-inline: var(--cd-spacing-tight);
    padding-block: var(--cd-spacing-extra-tight);
    border: 1px solid var(--cd-color-date-picker-border-bg-default);
    border-radius: var(--cd-width-date-picker-quick-control-border-radius);
    background: transparent;
    color: var(--cd-color-date-picker-date-text-default);
    font: inherit;
    cursor: pointer;
  }
  .cd-date-picker__cancel:hover {
    border-color: var(--cd-color-date-picker-quick-button-text-default);
    color: var(--cd-color-date-picker-quick-button-text-default);
  }
  .cd-date-picker__cancel:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-tight);
    margin-block-end: var(--cd-spacing-tight);
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
    color: var(--cd-color-date-picker-nav-icon-text-default);
    border-radius: var(--cd-date-picker-cell-radius);
    cursor: pointer;
  }
  .cd-date-picker__nav:hover {
    background: var(--cd-date-picker-cell-bg-hover);
    color: var(--cd-color-date-picker-nav-month-icon-text-default);
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
    gap: var(--cd-spacing-extra-tight);
    inline-size: calc(var(--cd-date-picker-cell-size) * 7 + 2px * 6);
  }
  .cd-date-picker__cell--block {
    inline-size: auto;
    padding-inline: var(--cd-spacing-tight);
    block-size: calc(var(--cd-date-picker-cell-size) * 1.4);
  }
  .cd-date-picker__weekday {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-date-picker-cell-size);
    color: var(--cd-date-picker-weekday-color);
    font-size: var(--cd-font-size-small);
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
    color: var(--cd-color-date-picker-date-text-default);
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
    color: var(--cd-color-date-picker-date-disabled-text-default);
    cursor: not-allowed;
    background: transparent;
  }
  .cd-date-picker__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-tight);
    margin-block-start: var(--cd-spacing-tight);
    padding-block-start: var(--cd-spacing-tight);
    border-block-start: 1px solid var(--cd-color-date-picker-border-bg-default);
    background: var(--cd-date-picker-footer-bg); /* 对齐 Semi footer 背景 fill-0 */
  }
  .cd-date-picker__panel--datetime .cd-date-picker__footer,
  .cd-date-picker__footer:has(.cd-date-picker__ok) {
    justify-content: space-between;
  }
  .cd-date-picker__today {
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-date-picker-date-today-text-default);
    font: inherit;
    cursor: pointer;
  }
  .cd-date-picker__today:hover {
    text-decoration: underline;
  }
  .cd-date-picker__today:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  /* insetInput 面板内嵌输入框（对齐 Semi InsetDateInput / InsetTimeInput） */
  .cd-date-picker__inset-input {
    display: flex;
    gap: var(--cd-spacing-date-picker-inset-input-separator-padding-x);
    box-sizing: border-box;
    inline-size: var(--cd-width-date-picker-inset-input-date-type-wrapper);
    max-inline-size: 100%;
    margin-block-end: var(--cd-spacing-date-picker-inset-input-wrapper-margin);
    padding-block: var(--cd-spacing-date-picker-inset-input-wrapper-padding-y)
      var(--cd-spacing-date-picker-inset-input-wrapper-padding-bottom);
    padding-inline: var(--cd-spacing-date-picker-inset-input-wrapper-padding-x);
  }
  .cd-date-picker__inset-field {
    flex: 1 1 auto;
    min-inline-size: 0;
    block-size: var(--cd-height-date-picker-range-input-default);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-color-date-picker-range-input-bg-default);
    color: var(--cd-input-color-text);
    border: var(--cd-width-date-picker-range-input-border) solid var(--cd-color-date-picker-range-input-border-default);
    border-radius: var(--cd-radius-date-picker-range-input-input-wrapper);
    font: inherit;
    transition: var(--cd-transition-date-picker-range-input);
  }
  .cd-date-picker__inset-field:hover {
    background: var(--cd-color-date-picker-range-input-bg-hover);
  }
  .cd-date-picker__inset-field:focus-visible {
    outline: none;
    border-color: var(--cd-color-date-picker-range-input-border-active);
    background: var(--cd-color-date-picker-range-input-input-wrapper-bg-focus);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker__inset-field::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-date-picker__inset-field:disabled {
    color: var(--cd-color-date-picker-range-input-disabled-text-default);
    background: var(--cd-color-date-picker-range-input-disabled-bg-default);
    cursor: not-allowed;
  }
  .cd-date-picker__inset-field--time {
    flex: 0 0 auto;
    inline-size: 40%;
  }
  .cd-date-picker--compact .cd-date-picker__inset-input {
    inline-size: var(--cd-width-date-picker-inset-input-date-type-wrapper-compact);
    margin-block-end: var(--cd-spacing-date-picker-inset-input-wrapper-compact-margin);
    padding-block: var(--cd-spacing-date-picker-inset-input-wrapper-compact-padding-y)
      var(--cd-spacing-date-picker-inset-input-wrapper-compact-padding-bottom);
    padding-inline: var(--cd-spacing-date-picker-inset-input-wrapper-compact-padding-x);
  }
  .cd-date-picker--compact .cd-date-picker__inset-field {
    block-size: var(--cd-height-date-picker-inset-input-wrapper-compact);
    font-size: var(--cd-font-size-date-picker-inset-input-compact-font-size);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-date-picker__trigger,
    .cd-date-picker__clear,
    .cd-date-picker__cell,
    .cd-date-picker__preset,
    .cd-date-picker__inset-field {
      transition: none;
    }
  }
</style>
