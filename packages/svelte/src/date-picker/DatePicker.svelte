<!--
  DatePicker — see specs/components/input/DatePicker.spec.md
  基础子集: 单选 type='date' 日历面板 / type='dateTime' 日期+时间。Token-driven, a11y-correct, 受控/非受控。
  本地化全部走 Intl.DateTimeFormat (不手拼日期串)。dateTime 复用 TimePicker 的时/分/秒列逻辑。
  disabledTime: dateTime 时/分/秒列按日期禁用值置灰跳过；presets: 面板侧边快捷日期按钮。
  format: 传 token 串（YYYY/MM/DD/HH/mm/ss）时，触发器变可输入文本框，显示与手输解析均走
  core 的 formatDate/parseDateString 纯函数（红线 #2）；不传则沿用 Intl.DateTimeFormat 显示（向后兼容）。
  年月滚轮（PANEL_YAM，对齐 Semi）：点头部年/月标题展开年 + 月两列 ScrollList 快速跳转面板游标（复用 scroll-list，不重写滚轮）。
-->
<script lang="ts">
  import { tick, untrack, getContext, type Snippet } from 'svelte';
  import { useId, useDismiss, useFocusTrap, isSameDay, startOfDay, addMonths, getMonthGrid, weekdayOrder, gridFocusMove, formatDate, parseDateString, zonedWallTime, daysBetween, buildHourOptions, buildMinuteOptions, buildSecondOptions, applyHideDisabled, type GridFocusKey, type ScrollItemData, type ScrollItemSelectPayload } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { CONFIG_CONTEXT_KEY, type ConfigContextValue } from '../config-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import type { Placement } from '@chenzy-design/core';
  import ScrollList from '../scroll-list/ScrollList.svelte';
  import ScrollItem from '../scroll-list/ScrollItem.svelte';
  import Button from '../button/Button.svelte';
  import { IconClear, IconCalendar, IconCalendarClock, IconChevronLeft, IconChevronRight, IconDoubleChevronLeft, IconDoubleChevronRight } from '@chenzy-design/icons';

  type Size = 'small' | 'default' | 'large';
  type ValidateStatus = 'default' | 'warning' | 'error';
  type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  // 对齐 Semi TYPE_SET（constants.ts:49）：单组件靠 type 枚举承载 7 种形态（含 3 种 range）。
  type PickerType =
    | 'date'
    | 'dateRange'
    | 'year'
    | 'month'
    | 'monthRange'
    | 'dateTime'
    | 'dateTimeRange';
  type CSSProperties = Record<string, string | number>;
  type PresetPosition = 'left' | 'right' | 'top' | 'bottom';
  // range 值：起止元组（各端 Date|null）。
  type RangeValue = [Date | null, Date | null];
  // range 双输入框焦点态（对齐 Semi rangeInputFocus）：由用户点哪个输入框驱动落 start/end。
  type RangeInputFocus = 'rangeStart' | 'rangeEnd' | false;

  // 时间列禁用配置 (Semi/AntD 风格)：按当前日期返回各列禁用值
  interface DisabledTime {
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
  }

  // 快捷日期项：单选 value 为 Date 或惰性函数；range 为 [start,end] 元组或惰性函数（点击即时求值）。
  interface Preset {
    label: string;
    value: Date | (() => Date) | [Date, Date] | (() => [Date, Date]);
  }

  interface DayStatus {
    isSelected: boolean;
    isToday: boolean;
    isDisabled: boolean;
    isInMonth: boolean;
  }

  interface Props {
    type?: PickerType;
    /** 单选为 Date|Date[]（multiple）；range 为 [start,end] 元组。 */
    value?: Date | Date[] | RangeValue | null;
    defaultValue?: Date | Date[] | RangeValue | null;
    open?: boolean;
    defaultOpen?: boolean;
    placeholder?: string;
    /** range 起始输入框占位（对齐 Semi）。 */
    startPlaceholder?: string;
    /** range 结束输入框占位（对齐 Semi）。 */
    endPlaceholder?: string;
    size?: Size;
    /** 校验态（对齐 Semi validateStatus）。 */
    validateStatus?: ValidateStatus;
    disabled?: boolean;
    disabledDate?: (date: Date) => boolean;
    disabledTime?: (date: Date) => DisabledTime;
    presets?: Preset[];
    locale?: string;
    /** range 起止跨度上限（天）。选定起始后超出该跨度的日期禁用。 */
    maxRange?: number;
    /**
     * 单击范围选择（周选择）：与 endDateOffset 同时提供后，单击某日即选定区间
     * [startDateOffset(clicked), endDateOffset(clicked)]，一步完成不进双输入焦点流转。
     * 仅 dateRange/dateTimeRange 生效。
     */
    startDateOffset?: (date: Date) => Date;
    /** 单击范围选择的结束偏移；与 startDateOffset 同时提供才生效。 */
    endDateOffset?: (date: Date) => Date;
    /** range 双面板同步翻月（对齐 Semi syncSwitchMonth，默认 false）。 */
    syncSwitchMonth?: boolean;
    /** range 起止输入框之间的自定义分隔节点（对齐 Semi rangeSeparatorNode）。 */
    rangeSeparatorNode?: Snippet | string;
    /** 透传给内部时间列的配置（对齐 Semi timePickerOpts）：showSecond 等。 */
    timePickerOpts?: { showSecond?: boolean; use12Hours?: boolean } & Record<string, unknown>;
    /**
     * 面板初始定位日期（非受控，仅控制面板首次展开时显示哪个月/年）。
     * 与 value 无关：不改变选中值，只 seed 面板游标。range 场景可传 Date[]（取首个）。
     * 仅在无选中值时生效；有选中值时面板对齐到选中值所在月份（对齐 Semi）。
     */
    defaultPickerValue?: Date | Date[];
    /**
     * 按指定 IANA 时区显示/解析日期时间（如 'Asia/Tokyo'）。
     * 实现边界：仅作用于「显示格式化层」——所有 Intl.DateTimeFormat 附加 { timeZone }，
     * 使触发器/头部/内嵌输入的文案按该时区呈现。底层 value 仍是系统本地时钟的 Date 对象，
     * 不做完整的跨时区值转换（选中/解析得到的 Date 其绝对时刻不变）。
     * format 串走 core formatDate 的可编辑模式不受 timeZone 影响（按 Date 本地字段序列化）。
     */
    timeZone?: string | number;
    /** token 格式串 (YYYY/MM/DD/HH/mm/ss)。传入则触发器变可输入文本框，显示+手输解析按此格式。 */
    format?: string;
    /**
     * 值变化回调。第二参 dateString 为按当前格式化规则得到的字符串（multiple/range 用
     * rangeSeparator 连接）。参数顺序由 onChangeWithDateFirst 控制：默认 (value, dateString)；
     * onChangeWithDateFirst=false 时 (dateString, value)。历史用法仅取第一参 value，故默认保持 value-first。
     */
    onChange?: (value: Date | Date[] | RangeValue | null, dateString: string) => void;
    onOpenChange?: (open: boolean) => void;
    /** 可见年月切换 (头部导航)。 */
    onPanelChange?: (e: { panelDate: Date }) => void;
    /** 点击快捷选项（对齐 Semi (item, e)）。 */
    onPresetClick?: (item: Preset, e?: MouseEvent) => void;
    /** 点击清除。 */
    onClear?: (e: Record<string, never>) => void;
    /** 点击确认按钮 (dateTime / needConfirm)。 */
    onConfirm?: (e: { value: Date | Date[] | RangeValue | null }) => void;
    /** 触发器获得焦点。 */
    onFocus?: (e: FocusEvent) => void;
    /** 触发器失去焦点。 */
    onBlur?: (e: FocusEvent) => void;
    ariaLabel?: string;
    /** aria-labelledby：关联外部 label 元素（Form.Field 透传 labelId，对齐 Semi）。 */
    ariaLabelledby?: string;
    /** aria-describedby：关联 helpText / extraText（Form.Field 透传）。 */
    ariaDescribedby?: string;
    /** aria-errormessage：error 态关联错误信息容器（Form.Field 透传）。 */
    ariaErrormessage?: string;
    /** aria-required：必填语义（Form.Field required 透传）。 */
    ariaRequired?: boolean;
    /** 内嵌标签：浮入触发器左侧的常驻标签（纯展示，不影响值/解析）。 */
    insetLabel?: string | Snippet;
    /**
     * insetLabel 的 id，挂到内嵌标签元素上并经 aria-labelledby 关联触发器 combobox，
     * 使屏幕阅读器把内嵌标签朗读为触发器可访问名的一部分。仅 insetLabel 存在时生效。
     */
    insetLabelId?: string;
    /** 年月滚轮（PANEL_YAM）里选完年/月后自动切回日期网格视图（默认 true）。 */
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
    /** 一周起始日（0=周日 … 6=周六）。 */
    weekStartsOn?: WeekStart;
    /** 点击取消按钮（对齐 Semi 无参）。 */
    onCancel?: () => void;
    /**
     * 控制 onChange 参数顺序。默认 true → (value, dateString)（对齐 Semi 默认，且与历史 value-first 用法一致）；
     * 设为 false → (dateString, value)。
     */
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
    /** 根节点额外 className */
    class?: string;
    /** 根节点内联样式 */
    style?: string;

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
    /** 范围日期分隔符（默认 ' ~ '，对齐 Semi DEFAULT_SEPARATOR_RANGE） */
    rangeSeparator?: string;
    /** 年份滚轮最小年 */
    startYear?: number;
    /** 年份滚轮最大年 */
    endYear?: number;

    // --- 自定义渲染 ---
    /** 自定义日期单元格内容 */
    renderDate?: Snippet<[{ day: number; fullDate: string }]>;
    /** 完全自定义日期格子 */
    renderFullDate?: Snippet<[{ day: number; fullDate: string; dayStatus: DayStatus }]>;
    /** 完全自定义触发器 */
    triggerRender?: Snippet<[{ value: Date | Date[] | RangeValue | null; placeholder: string }]>;

    // --- 时间相关 ---
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
    open: openProp,
    defaultOpen = false,
    placeholder,
    startPlaceholder,
    endPlaceholder,
    size = 'default',
    validateStatus = 'default',
    disabled = false,
    disabledDate,
    disabledTime,
    presets,
    locale = 'zh-CN',
    maxRange,
    startDateOffset,
    endDateOffset,
    syncSwitchMonth = false,
    rangeSeparatorNode,
    timePickerOpts,
    defaultPickerValue,
    timeZone,
    format,
    onChange,
    onOpenChange,
    onPanelChange,
    onPresetClick,
    onClear,
    onConfirm,
    onFocus,
    onBlur,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    insetLabel,
    insetLabelId,
    rangeSeparator = ' ~ ',
    autoSwitchDate = true,
    autoAdjustOverflow = true,
    insetInput = false,
    position = 'bottomLeft',
    spacing,
    getPopupContainer,
    weekStartsOn = 0,
    yearAndMonthOpts,
    onCancel,
    onChangeWithDateFirst = true,
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
    class: className = '',
    style = undefined,
    // 插槽类
    topSlot,
    bottomSlot,
    leftSlot,
    rightSlot,
    // 日期范围增强
    multiple = false,
    max,
    startYear,
    endYear,
    // 自定义渲染
    renderDate,
    renderFullDate,
    triggerRender,
    // 时间相关
    hideDisabledOptions = false,
    disabledTimePicker = false,
    needConfirm,
    // 快捷选项
    presetPosition = 'bottom',
  }: Props = $props();

  // --- 7-type 派生分派（对齐 Semi isRangeType /range/i.test + monthsGridFoundation）---
  const isRange = $derived(/range/i.test(type));
  const isDateTime = $derived(/dateTime/i.test(type)); // dateTime | dateTimeRange
  const isMonth = $derived(type === 'month' || type === 'monthRange');
  const isYear = $derived(type === 'year');
  // showSecond：Semi 走 timePickerOpts.showSecond；默认 true。
  const showSecond = $derived(timePickerOpts?.showSecond ?? true);
  // needConfirm：显式传优先；dateTimeRange 默认 true，其它默认 false（对齐 Semi）。
  const effNeedConfirm = $derived(needConfirm ?? type === 'dateTimeRange');

  // 一周起始（保留 weekStartsOn 单名，删旧 weekStart 别名）。
  const effWeekStart = $derived(weekStartsOn ?? 0);

  const loc = useLocale();

  const dialogId = useId('cd-date-picker-panel');
  // 日期网格容器 id（aria-activedescendant 指向其中的 cell id 前缀）
  const gridId = useId('cd-date-picker-grid');

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);

  // monthRange/dateRange/dateTimeRange 归一：把 raw value 折成 [start,end]。
  // svelte-ignore state_referenced_locally
  function normOneRange(d: Date | null | undefined): Date | null {
    if (!d) return null;
    if (type === 'dateTimeRange') return new Date(d);
    if (type === 'monthRange') return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
    return startOfDay(d);
  }
  function toRangePair(v: unknown): RangeValue {
    if (Array.isArray(v)) {
      const a = v[0] instanceof Date ? v[0] : null;
      const b = v[1] instanceof Date ? v[1] : null;
      return [normOneRange(a), normOneRange(b)];
    }
    return [null, null];
  }

  // multiple 模式下 value 为 Date[]，单选为 Date | null
  function getInitialValue(): Date | Date[] | null {
    if (multiple) {
      if (Array.isArray(defaultValue)) return defaultValue as Date[];
      if (defaultValue instanceof Date) return [defaultValue];
      return [];
    }
    if (Array.isArray(defaultValue)) return (defaultValue as Date[])[0] ?? null;
    return (defaultValue as Date | null) ?? null;
  }

  let innerValue = $state<Date | Date[] | null>(getInitialValue());
  const current = $derived<Date | Date[] | null>(
    isValueControlled ? ((value as Date | Date[] | null) ?? null) : innerValue,
  );

  // 单一 Date 视图（multiple 时取第一个，非 multiple 直接用）
  const currentSingle = $derived<Date | null>(
    Array.isArray(current) ? (current[0] ?? null) : current,
  );

  // --- range 值模型（与 single/multiple 平行）---
  let innerRange = $state<RangeValue>(untrack(() => toRangePair(defaultValue)));
  const currentRange = $derived<RangeValue>(
    isValueControlled ? toRangePair(value) : innerRange,
  );

  function setValue(next: Date | Date[] | null) {
    if (!isValueControlled) innerValue = next;
    if (onChange) {
      // 第二参 dateString：按当前格式化规则序列化 next（multiple 用 rangeSeparator 连接）。
      const dateStr = Array.isArray(next)
        ? next.map(formatSingle).join(rangeSeparator)
        : formatSingle(next);
      // onChangeWithDateFirst 默认 true → (value, dateString)；false → (dateString, value)。
      if (onChangeWithDateFirst) onChange(next, dateStr);
      // onChangeWithDateFirst=false：故意反转为 (dateString, value)，类型以默认 value-first 声明，此处 cast。
      else (onChange as (a: unknown, b: unknown) => void)(dateStr, next);
    }
  }

  // range 提交：写内部值 + onChange（第二参为 'start ~ end' 串）。
  function setRangeValue(next: RangeValue) {
    const emptied = next[0] === null && next[1] === null;
    if (!isValueControlled) innerRange = next;
    if (onChange) {
      const dateStr = emptied
        ? ''
        : `${formatSingle(next[0])}${rangeSeparator}${formatSingle(next[1])}`;
      const outVal = emptied ? null : next;
      if (onChangeWithDateFirst) onChange(outVal, dateStr);
      else (onChange as (a: unknown, b: unknown) => void)(dateStr, outVal);
    }
  }

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(openProp !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!openProp : innerOpen);

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

  // --- 命令式 Methods（对齐 Semi API 形状）---
  export function open(): void {
    setOpen(true);
  }
  export function close(): void {
    setOpen(false);
  }
  export function focus(): void {
    triggerEl?.focus({ preventScroll });
  }
  export function blur(): void {
    triggerEl?.blur();
  }

  // --- 面板游标月份 (本地 $state)，打开时同步到 value/today 月份 ---
  const today = startOfDay(new Date());
  // defaultPickerValue：面板初始定位日期（一次性初值），仅在无选中值时用于 seed 游标。
  // svelte-ignore state_referenced_locally
  const _pickerSeed: Date | null = Array.isArray(defaultPickerValue)
    ? (defaultPickerValue[0] ?? null)
    : (defaultPickerValue instanceof Date ? defaultPickerValue : null);
  // 初始化游标用 defaultValue（刻意静态读初值，default 语义仅取一次，不回写）；
  // 无 defaultValue 时回退到 defaultPickerValue，再无则今天。
  // svelte-ignore state_referenced_locally
  const _initCursorDate: Date | null = Array.isArray(defaultValue)
    ? (defaultValue[0] ?? null)
    : (defaultValue instanceof Date ? defaultValue : null);
  let cursor = $state(startOfDay(_initCursorDate ?? _pickerSeed ?? new Date()));
  // 双面板游标：左=cursor、右=cursor+1 月（monthRange 右=+1 年=+12 月）。
  const rightCursor = $derived(addMonths(cursor, isMonth ? 12 : 1));

  // 当面板打开时把游标对齐到当前选中值所在月份；range 对齐到起始端；无值回退 defaultPickerValue/今天。
  $effect(() => {
    if (isOpen) {
      if (isRange) {
        cursor = startOfDay(currentRange[0] ?? _pickerSeed ?? new Date());
      } else {
        cursor = startOfDay(currentSingle ?? _pickerSeed ?? new Date());
      }
    }
  });

  // --- needConfirm 暂存值：点确认才写入 ---
  let pendingValue = $state<Date | Date[] | null>(null);

  $effect(() => {
    if (isOpen) {
      pendingValue = current;
    }
  });

  // ============================================================================
  // range 状态机（对齐 Semi）：阶段 3 把 phase 两步机升级为 rangeInputFocus 双输入框驱动。
  // 值语义：currentRange=[start,end]；needConfirm 时选择进 pendingRange 缓冲、点确定才提交。
  // ============================================================================
  // rangeInputFocus：点起始输入框→'rangeStart'、点结束输入框→'rangeEnd'、未聚焦→false。
  let rangeInputFocus = $state<RangeInputFocus>(false);
  // 用户是否手动点过某端输入框（对齐 Semi isAnotherPanelHasOpened：允许只改一端不自动流转）。
  let rangeStartFocused = $state(false);
  let rangeEndFocused = $state(false);
  // range 选择缓冲：pendingRange 暂存起止（含时间），提交前的工作值。
  let pendingRange = $state<RangeValue>([null, null]);
  // hover 预览端点（选起点后 hover 目标 = 预览终点；offset 周选择时预览整段）。
  let hoverDay = $state<Date | null>(null);
  let offsetPreviewStart = $state<Date | null>(null);
  let offsetPreviewEnd = $state<Date | null>(null);
  // 时间列作用的当前激活端（dateTimeRange）。
  let activeEnd = $state<'start' | 'end'>('start');

  // 单击范围选择（周选择）：start+end offset 都提供且非 monthRange。
  const offsetSelect = $derived(!isMonth && !!startDateOffset && !!endDateOffset);

  // range 面板生效的起止（needConfirm 用 pending，否则用已提交值）。
  const panelRangeStart = $derived<Date | null>(effNeedConfirm ? pendingRange[0] : currentRange[0]);
  const panelRangeEnd = $derived<Date | null>(effNeedConfirm ? pendingRange[1] : currentRange[1]);

  // 触发器显示端点（对齐 currentRange，触发器双输入框各显示一端）。
  const rangeStart = $derived<Date | null>(currentRange[0]);
  const rangeEnd = $derived<Date | null>(currentRange[1]);

  // 打开面板时初始化 range 状态机。
  $effect(() => {
    if (!isRange) return;
    if (isOpen) {
      untrack(() => {
        pendingRange = [currentRange[0], currentRange[1]];
        rangeInputFocus = 'rangeStart';
        rangeStartFocused = false;
        rangeEndFocused = false;
        hoverDay = null;
        offsetPreviewStart = null;
        offsetPreviewEnd = null;
        activeEnd = 'start';
      });
    } else {
      untrack(() => {
        hoverDay = null;
        offsetPreviewStart = null;
        offsetPreviewEnd = null;
      });
    }
  });

  // --- 时区（对齐 Semi utcToZonedTime 值层语义，不给 Intl 传 timeZone）---
  // Semi 的 timeZone 不在显示格式化器上附加时区，而是在值层把选中的绝对时刻转成「目标时区
  // 墙上时间」的 Date，再按其本地字段序列化。自身 timeZone prop 优先，未传回退 ConfigProvider
  // 的 timeZone（对齐 Semi：DatePicker 用 timeZone={config} 作默认再被自身 prop 覆盖）。
  // 取值支持数字偏移 / 'GMT±HH:mm'；具名 IANA（无 tz 数据库）不做转换。
  const configCtx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  const configTimeZone = $derived(configCtx?.current.timeZone);
  const effectiveTimeZone = $derived<string | number | undefined>(timeZone ?? configTimeZone);

  // --- Intl 本地化格式化器 (不手拼日期串；不传 timeZone，时区在值层由 zonedWallTime 处理) ---
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

  // 触发器/输入显示：选中值先转目标时区墙上时间，再序列化（format 走 core 纯函数按本地字段，
  // 无 format 走 Intl 本地字段），使显示随 timeZone 变化。对齐 Semi 值层转换语义。
  function formatSingle(d: Date | null): string {
    if (!d) return '';
    const shown = zonedWallTime(d, effectiveTimeZone);
    return format ? formatDate(shown, format) : triggerFormat.format(shown);
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
      if (effNeedConfirm) pendingValue = next;
      else setValue(next);
    } else {
      insetDateText = currentSingle ? formatDate(currentSingle, insetDateFormat) : '';
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
      if (effNeedConfirm) pendingValue = base;
      else setValue(base);
    } else {
      insetTimeText = currentSingle ? formatDate(currentSingle, insetTimeFormat) : '';
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

  // --- range 双面板网格派生 ---
  const rangeRightGridId = useId('cd-date-picker-grid-r');
  const leftGrid = $derived(getMonthGrid(cursor, effWeekStart));
  const rightGrid = $derived(getMonthGrid(rightCursor, effWeekStart));
  const leftRows = $derived(Array.from({ length: 6 }, (_, r) => leftGrid.slice(r * 7, r * 7 + 7)));
  const rightRows = $derived(Array.from({ length: 6 }, (_, r) => rightGrid.slice(r * 7, r * 7 + 7)));
  function rangeCellId(prefix: string, date: Date): string {
    return `${prefix}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  // range monthRange 双面板月格。
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
  // range 头部文案：dateRange 显示「年 月」；monthRange 仅显示年。
  const rangeLeftHeaderText = $derived(isMonth ? yearFormat.format(cursor) : headerFormat.format(cursor));
  const rangeRightHeaderText = $derived(isMonth ? yearFormat.format(rightCursor) : headerFormat.format(rightCursor));
  // 触发器双输入框各端显示文本。
  const startText = $derived(
    rangeStart ? triggerFormat.format(zonedWallTime(rangeStart, effectiveTimeZone)) : '',
  );
  const endText = $derived(
    rangeEnd ? triggerFormat.format(zonedWallTime(rangeEnd, effectiveTimeZone)) : '',
  );

  // showClear 综合判断（对齐 Semi 单一 showClear）：showClear & !disabled & 有值。
  const showClearDerived = $derived(
    showClearProp &&
    !disabled &&
    (isRange
      ? (rangeStart !== null || rangeEnd !== null)
      : multiple
        ? (Array.isArray(current) && current.length > 0)
        : currentSingle !== null),
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
  // 头部箭头图标：date/dateTime 面板翻「月」用单箭头 Chevron；month 翻「年」/ year 翻「十年」
  // 均属年级跳转，对齐 Semi Navigation（翻年用 DoubleChevron），用双箭头。
  const navIsYearJump = $derived(isYear || isMonth);
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
  // date/dateTime 面板（日历日格视图）：对齐 Semi Navigation 有翻年双箭头 + 翻月单箭头两组。
  // month/year 面板走年月滚轮，仍单组 prev/next（切年 / 切十年）。
  const isDayPanel = $derived(!isMonth && !isYear);
  const prevYearLabel = $derived(loc().t('DatePicker.prevYear'));
  const nextYearLabel = $derived(loc().t('DatePicker.nextYear'));

  // --- 年月滚轮快速跳转 (PANEL_YAM，对齐 Semi)：点头部年/月标题展开年+月滚轮列 ---
  // yearAndMonthOpts 归一化：仅取 yearCyclic/monthCyclic（其余键透传语义暂不消费）。
  const yamYearCyclic = $derived(
    typeof (yearAndMonthOpts as { yearCyclic?: boolean } | undefined)?.yearCyclic === 'boolean'
      ? (yearAndMonthOpts as { yearCyclic: boolean }).yearCyclic
      : false,
  );
  const yamMonthCyclic = $derived(
    typeof (yearAndMonthOpts as { monthCyclic?: boolean } | undefined)?.monthCyclic === 'boolean'
      ? (yearAndMonthOpts as { monthCyclic: boolean }).monthCyclic
      : false,
  );

  // 滚轮展开态（本地 $state）；面板关闭时复位（红线 #2 在 isOpen effect 内一并处理）。
  let yamOpen = $state(false);

  // 年份滚轮范围：对齐 Semi getYears（默认 今年±100，可用 startYear/endYear 收窄）。
  const yamYears = $derived.by(() => {
    const cur = new Date().getFullYear();
    let start = typeof startYear === 'number' ? startYear : cur - 100;
    let end = typeof endYear === 'number' ? endYear : cur + 100;
    if (end < start) [start, end] = [end, start];
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  // 月份全名（Intl 本地化，朗读/显示用）。
  const monthLongFormat = $derived(new Intl.DateTimeFormat(locale, { month: 'long' }));

  // 年列 ScrollItem list：value=年份数字，text 本地化（中文加「年」）。
  const isCJK = $derived(locale.startsWith('zh') || locale.startsWith('ja') || locale.startsWith('ko'));
  const yamYearItems = $derived<ScrollItemData[]>(
    yamYears.map((y) => ({
      value: y,
      text: isCJK ? `${y}年` : `${y}`,
      // 该年 12 个月全被禁用 → 整年禁用（对齐 Semi isAllMonthDisabled）。
      disabled: Array.from({ length: 12 }, (_, m) => new Date(y, m, 1)).every(
        (d) => disabledDate?.(d) ?? false,
      ),
    })),
  );
  // 月列 ScrollItem list：value=0..11 月序，text 本地化月名。
  const yamMonthItems = $derived<ScrollItemData[]>(
    Array.from({ length: 12 }, (_, m) => {
      const d = new Date(cursor.getFullYear(), m, 1);
      return {
        value: m,
        text: monthLongFormat.format(d),
        disabled: disabledDate?.(d) ?? false,
      };
    }),
  );
  // 各列当前选中索引（受控给 ScrollItem.selectedIndex）：年 = cursor 年在 yamYears 的位置；月 = cursor 月序。
  const yamYearIndex = $derived(Math.max(0, yamYears.indexOf(cursor.getFullYear())));
  const yamMonthIndex = $derived(cursor.getMonth());

  // 滚轮选中 → 只跳转面板游标（不写 value，对齐 Semi「选完回主面板继续选日」）。
  // autoSwitchDate=true 且当前面板存在日期网格（type='date'/'dateTime'）时，选完年/月
  // 自动切回日期网格视图（关闭滚轮）；否则停留在滚轮（对齐 Semi autoSwitchDate）。
  function onYamSelect(data: ScrollItemSelectPayload): void {
    const year = data.type === 'year' && typeof data.value === 'number' ? data.value : cursor.getFullYear();
    const month = data.type === 'month' && typeof data.value === 'number' ? data.value : cursor.getMonth();
    setCursor(new Date(year, month, 1));
    if (autoSwitchDate && (type === 'date' || type === 'dateTime')) {
      yamOpen = false;
    }
  }

  // 点头部标题：year 面板仍用十年格切换（不进滚轮），其余面板进年月滚轮。
  const yamEnabled = $derived(!isYear);
  function toggleYam(): void {
    if (!yamEnabled) return;
    yamOpen = !yamOpen;
  }
  function backToMain(): void {
    yamOpen = false;
  }

  // --- 时间部分 (dateTime)：复用 TimePicker 的列逻辑 ---
  const selectedHour = $derived(currentSingle ? currentSingle.getHours() : 0);
  const selectedMinute = $derived(currentSingle ? currentSingle.getMinutes() : 0);
  const selectedSecond = $derived(currentSingle ? currentSingle.getSeconds() : 0);

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
      if (effNeedConfirm) {
        pendingValue = next;
      } else {
        setValue(next);
      }
      return;
    }

    const combined = combine(date);
    if (effNeedConfirm) {
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
    if (effNeedConfirm) {
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

  // ============================================================================
  // range 选择逻辑（双面板 + rangeInputFocus 状态机，对齐 Semi handleRangeSelected）
  // ============================================================================
  function startOfMonthD(d: Date): Date {
    return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  // range 比较单位：monthRange 按月，其余按日。
  function normUnit(d: Date): Date {
    return isMonth ? startOfMonthD(d) : startOfDay(d);
  }
  function isSameUnit(a: Date | null | undefined, b: Date | null | undefined): boolean {
    if (!a || !b) return false;
    return isMonth
      ? a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
      : isSameDay(a, b);
  }
  function resetRangeSelection() {
    hoverDay = null;
    offsetPreviewStart = null;
    offsetPreviewEnd = null;
  }

  // range 区间可视端点：offset 预览优先；否则 pending 起点 + hover 预览终点，再否则面板生效值。
  const visRangeStart = $derived<Date | null>(
    offsetSelect && offsetPreviewStart
      ? offsetPreviewStart
      : (pendingRange[0] ?? panelRangeStart),
  );
  const visRangeEnd = $derived<Date | null>(
    offsetSelect && offsetPreviewEnd
      ? offsetPreviewEnd
      : pendingRange[0] !== null && pendingRange[1] === null && hoverDay
        ? hoverDay
        : (pendingRange[1] ?? panelRangeEnd),
  );
  const rangeSpan = $derived.by<[number, number] | null>(() => {
    const a = visRangeStart;
    const b = visRangeEnd;
    if (!a || !b) return null;
    const ta = normUnit(a).getTime();
    const tb = normUnit(b).getTime();
    return ta <= tb ? [ta, tb] : [tb, ta];
  });
  function inRange(date: Date): boolean {
    if (!rangeSpan) return false;
    const t = normUnit(date).getTime();
    return t > rangeSpan[0] && t < rangeSpan[1];
  }
  function isEdge(date: Date): boolean {
    return isSameUnit(date, visRangeStart) || isSameUnit(date, visRangeEnd);
  }

  // maxRange：选定起始后离 pending 起点超过 maxRange-1 天的日期禁用。
  function exceedsMaxRange(date: Date): boolean {
    if (isMonth) return false;
    if (maxRange == null || maxRange <= 0) return false;
    if (pendingRange[0] === null || pendingRange[1] !== null) return false;
    return Math.abs(daysBetween(pendingRange[0], date)) > maxRange - 1;
  }
  function isRangeCellDisabled(date: Date): boolean {
    return (disabledDate?.(date) ?? false) || exceedsMaxRange(date);
  }

  // 合并 day 与某端已有时分秒（dateTimeRange 保时间，dateRange 归零，monthRange 归月 1 号）。
  function combineRangeDay(day: Date, base: Date | null): Date {
    if (isMonth) return startOfMonthD(day);
    if (!isDateTime) return startOfDay(day);
    const next = startOfDay(day);
    if (base) next.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
    return next;
  }

  // 点击日期（range）：对齐 Semi handleRangeSelected，由 rangeInputFocus 决定落 start/end。
  function selectRangeDate(date: Date) {
    if (isRangeCellDisabled(date)) return;
    const day = isMonth ? startOfMonthD(date) : startOfDay(date);

    // 单击范围选择（周选择）：一步算出起止提交。
    if (offsetSelect && startDateOffset && endDateOffset) {
      const s = startOfDay(startDateOffset(date));
      const en = startOfDay(endDateOffset(date));
      const [loDay, hiDay] = s.getTime() <= en.getTime() ? [s, en] : [en, s];
      const lo = combineRangeDay(loDay, isDateTime ? pendingRange[0] : null);
      const hi = combineRangeDay(hiDay, isDateTime ? pendingRange[1] : null);
      resetRangeSelection();
      if (effNeedConfirm) {
        pendingRange = [lo, hi];
      } else {
        setRangeValue([lo, hi]);
        setOpen(false);
      }
      return;
    }

    let start = pendingRange[0];
    let end = pendingRange[1];

    if (rangeInputFocus === 'rangeEnd') {
      end = combineRangeDay(day, pendingRange[1]);
      activeEnd = 'end';
      // 新 end 早于旧 start → reset start（对齐 Semi）。
      if (start && normUnit(end).getTime() < normUnit(start).getTime()) {
        start = null;
      }
    } else {
      // 'rangeStart' 或 false（打开后未点输入框直接选日）。
      start = combineRangeDay(day, pendingRange[0]);
      activeEnd = 'start';
      if (end && normUnit(end).getTime() < normUnit(start).getTime()) {
        end = null;
      }
    }
    pendingRange = [start, end];

    // 焦点流转（对齐 Semi）：设完一端切另一端，但已手动 focus 过另一端则不强切（允许只改一端）。
    if (rangeInputFocus === 'rangeEnd') {
      if (!rangeStartFocused || !start) rangeInputFocus = 'rangeStart';
    } else {
      if (!rangeEndFocused || !end) rangeInputFocus = 'rangeEnd';
    }

    // 完成判定：两端都有值 → 提交（非 needConfirm 关面板）。
    const complete = start !== null && end !== null;
    if (complete) {
      if (!effNeedConfirm) {
        setRangeValue([start, end]);
        // 双端完成后关闭：仅当两端都是本轮选定（避免只改一端时误关）。
        if (!rangeStartFocused && !rangeEndFocused) setOpen(false);
      }
    } else if (!effNeedConfirm) {
      // 单端已选、另一端仍空：即时回写（Semi 完成即 notify，未完成也保留部分）。
      setRangeValue([start, end]);
    }
  }

  function onRangeCellHover(date: Date) {
    if (offsetSelect && startDateOffset && endDateOffset) {
      if (isRangeCellDisabled(date)) return;
      offsetPreviewStart = startOfDay(startDateOffset(date));
      offsetPreviewEnd = startOfDay(endDateOffset(date));
      return;
    }
    // 有起点、无终点时 hover 预览终点。
    if (pendingRange[0] !== null && pendingRange[1] === null && !isRangeCellDisabled(date)) {
      hoverDay = isMonth ? startOfMonthD(date) : startOfDay(date);
    }
  }

  // 点起止输入框切换 rangeInputFocus（阶段 3 双输入框驱动）。
  function focusRangeInput(which: 'rangeStart' | 'rangeEnd') {
    rangeInputFocus = which;
    if (which === 'rangeStart') { rangeStartFocused = true; activeEnd = 'start'; }
    else { rangeEndFocused = true; activeEnd = 'end'; }
    if (!isOpen) setOpen(true);
  }

  // range 头部翻月（对齐 Semi handleSwitchMonthOrYear + syncSwitchMonth + 防同月）。
  function rangePrev() {
    const delta = isMonth ? -12 : -1;
    setCursor(addMonths(cursor, delta));
  }
  function rangeNext() {
    const delta = isMonth ? 12 : 1;
    setCursor(addMonths(cursor, delta));
  }

  // range 时间列：作用于 activeEnd（对齐 RangePicker）。
  const rangeActiveDate = $derived<Date | null>(
    activeEnd === 'start' ? pendingRange[0] : pendingRange[1],
  );
  const rangeActiveHour = $derived(rangeActiveDate ? rangeActiveDate.getHours() : 0);
  const rangeActiveMinute = $derived(rangeActiveDate ? rangeActiveDate.getMinutes() : 0);
  const rangeActiveSecond = $derived(rangeActiveDate ? rangeActiveDate.getSeconds() : 0);
  const rangeDisabledTimeCfg = $derived(
    isDateTime && disabledTime ? disabledTime(rangeActiveDate ?? today) : undefined,
  );
  const rangeDisabledHourSet = $derived(new Set(rangeDisabledTimeCfg?.disabledHours?.() ?? []));
  const rangeDisabledMinuteSet = $derived(new Set(rangeDisabledTimeCfg?.disabledMinutes?.(rangeActiveHour) ?? []));
  const rangeDisabledSecondSet = $derived(new Set(rangeDisabledTimeCfg?.disabledSeconds?.(rangeActiveHour, rangeActiveMinute) ?? []));

  function commitRangeTime(h: number, m: number, s: number) {
    const baseSrc = rangeActiveDate ?? startOfDay(today);
    const base = new Date(baseSrc);
    base.setHours(h, m, s, 0);
    const nextPair: RangeValue =
      activeEnd === 'start' ? [base, pendingRange[1]] : [pendingRange[0], base];
    pendingRange = nextPair;
    if (!effNeedConfirm) setRangeValue(nextPair);
  }
  function pickRangeHour(h: number) { if (!rangeDisabledHourSet.has(h)) commitRangeTime(h, rangeActiveMinute, rangeActiveSecond); }
  function pickRangeMinute(m: number) { if (!rangeDisabledMinuteSet.has(m)) commitRangeTime(rangeActiveHour, m, rangeActiveSecond); }
  function pickRangeSecond(s: number) { if (!rangeDisabledSecondSet.has(s)) commitRangeTime(rangeActiveHour, rangeActiveMinute, s); }

  // ============================================================================
  // 时间列数据构造（ScrollItemData）：复用 core time.ts 的 buildXxxOptions + applyHideDisabled，
  // 走 ScrollList+ScrollItem（对齐 Semi Combobox）。DatePicker 时间列仅 24h，无 ampm 列。
  // 选中态单位后缀 transform（对齐 Semi `value + locale.hour`）。
  // ============================================================================
  function makeTimeList(
    opts: import('@chenzy-design/core').TimeOption[],
    suffix: string,
  ): ScrollItemData[] {
    return opts.map((o) => ({
      value: o.value,
      text: pad2(o.value),
      disabled: o.disabled,
      transform: (_v: unknown, t: string) => t + suffix,
    }));
  }
  // 单选（date/dateTime）三列。
  const hourListSingle = $derived(
    makeTimeList(
      applyHideDisabled(
        buildHourOptions(1, false, 'am', disabledTimeCfg?.disabledHours),
        hideDisabledOptions,
      ),
      loc().t('TimePicker.hour'),
    ),
  );
  const minuteListSingle = $derived(
    makeTimeList(
      applyHideDisabled(
        buildMinuteOptions(1, selectedHour, disabledTimeCfg?.disabledMinutes),
        hideDisabledOptions,
      ),
      loc().t('TimePicker.minute'),
    ),
  );
  const secondListSingle = $derived(
    makeTimeList(
      applyHideDisabled(
        buildSecondOptions(1, selectedHour, selectedMinute, disabledTimeCfg?.disabledSeconds),
        hideDisabledOptions,
      ),
      loc().t('TimePicker.second'),
    ),
  );
  // 列表中值 v 对应的 selectedIndex（-1 时回退 0，避免 ScrollItem 越界）。
  function timeIndexOf(list: ScrollItemData[], v: number): number {
    const i = list.findIndex((it) => it.value === v);
    return i < 0 ? 0 : i;
  }
  // 单选列 onSelect：按列写入。
  function onSelectHourSingle(p: ScrollItemSelectPayload) { pickHour(p.value as number); }
  function onSelectMinuteSingle(p: ScrollItemSelectPayload) { pickMinute(p.value as number); }
  function onSelectSecondSingle(p: ScrollItemSelectPayload) { pickSecond(p.value as number); }

  // range（dateTimeRange）：起止两组，作用于该端（先切 activeEnd 再写）。
  function rangeEndDate(end: 'start' | 'end'): Date | null {
    return end === 'start' ? pendingRange[0] : pendingRange[1];
  }
  // 某端的 disabledTime 配置（联动该端已选时分）。
  function rangeDisabledCfg(end: 'start' | 'end') {
    const d = rangeEndDate(end);
    return isDateTime && disabledTime ? disabledTime(d ?? today) : undefined;
  }
  function rangeHourList(end: 'start' | 'end'): ScrollItemData[] {
    return makeTimeList(
      applyHideDisabled(
        buildHourOptions(1, false, 'am', rangeDisabledCfg(end)?.disabledHours),
        hideDisabledOptions,
      ),
      loc().t('TimePicker.hour'),
    );
  }
  function rangeMinuteList(end: 'start' | 'end'): ScrollItemData[] {
    const d = rangeEndDate(end);
    return makeTimeList(
      applyHideDisabled(
        buildMinuteOptions(1, d ? d.getHours() : 0, rangeDisabledCfg(end)?.disabledMinutes),
        hideDisabledOptions,
      ),
      loc().t('TimePicker.minute'),
    );
  }
  function rangeSecondList(end: 'start' | 'end'): ScrollItemData[] {
    const d = rangeEndDate(end);
    return makeTimeList(
      applyHideDisabled(
        buildSecondOptions(1, d ? d.getHours() : 0, d ? d.getMinutes() : 0, rangeDisabledCfg(end)?.disabledSeconds),
        hideDisabledOptions,
      ),
      loc().t('TimePicker.second'),
    );
  }
  // range 列 onSelect：先切 activeEnd 再写该端。
  function onSelectRangeHour(end: 'start' | 'end') {
    return (p: ScrollItemSelectPayload) => { activeEnd = end; pickRangeHour(p.value as number); };
  }
  function onSelectRangeMinute(end: 'start' | 'end') {
    return (p: ScrollItemSelectPayload) => { activeEnd = end; pickRangeMinute(p.value as number); };
  }
  function onSelectRangeSecond(end: 'start' | 'end') {
    return (p: ScrollItemSelectPayload) => { activeEnd = end; pickRangeSecond(p.value as number); };
  }

  // --- presets：点击快捷项直接选中 (惰性 value 即时求值)。range/单选分派。 ---
  function selectPreset(preset: Preset, e?: MouseEvent) {
    // 对齐 Semi onPresetClick(item, e)。
    onPresetClick?.(preset, e);
    const raw = typeof preset.value === 'function' ? preset.value() : preset.value;
    if (isRange) {
      if (!Array.isArray(raw)) return;
      const s = normOneRange(raw[0]);
      const en = normOneRange(raw[1]);
      if (!s || !en) return;
      const [lo, hi] = s.getTime() <= en.getTime() ? [s, en] : [en, s];
      resetRangeSelection();
      if (effNeedConfirm) {
        pendingRange = [lo, hi];
      } else {
        setRangeValue([lo, hi]);
        setOpen(false);
      }
      return;
    }
    const date = raw as Date;
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
    if (isRange) {
      onConfirm?.({ value: pendingRange[0] === null && pendingRange[1] === null ? null : pendingRange });
      setRangeValue(pendingRange);
      setOpen(false);
      return;
    }
    const val = effNeedConfirm ? pendingValue : current;
    onConfirm?.({ value: val });
    if (effNeedConfirm && pendingValue !== null) {
      setValue(pendingValue);
    }
    setOpen(false);
  }

  function cancelConfirm() {
    // 对齐 Semi onCancel 无参。
    onCancel?.();
    if (isRange) {
      pendingRange = [currentRange[0], currentRange[1]];
    } else {
      pendingValue = current;
    }
    setOpen(false);
  }

  // 时间列滚动定位由 ScrollItem 自行按 selectedIndex 处理（复用 ScrollList，对齐 Semi Combobox），
  // 无需组件层命令式 scrollIntoView。

  function clear(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (isRange) {
      setRangeValue([null, null]);
      pendingRange = [null, null];
      rangeInputFocus = 'rangeStart';
      rangeStartFocused = false;
      rangeEndFocused = false;
      resetRangeSelection();
    } else {
      const emptyVal = multiple ? [] : null;
      setValue(emptyVal);
    }
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
      // 关闭面板复位年月滚轮展开态（红线 #2）。
      yamOpen = false;
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
      if (highlight) {
        if (isRange) selectRangeDate(highlight);
        else selectDate(highlight);
      }
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
    if (next) {
      setHighlight(next);
      // range 选择中：方向键移动即刷新 hover 预览终点。
      if (isRange && pendingRange[0] !== null && pendingRange[1] === null && !isRangeCellDisabled(next)) {
        hoverDay = isMonth ? startOfMonthD(next) : startOfDay(next);
      }
    }
  }

  // --- useDismiss (红线 #3): 绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  // 浮层 + 日期网格容器引用 (focus trap / 进场落焦，红线 #3 命令式 + cleanup)
  let panelEl = $state<HTMLDivElement | null>(null);
  let gridEl = $state<HTMLDivElement | null>(null);
  let triggerEl = $state<HTMLButtonElement | HTMLInputElement | null>(null);

  // insetLabel 提供 insetLabelId 时，把内嵌标签纳入 combobox 的 aria-labelledby，
  // 使屏幕阅读器把内嵌标签朗读为触发器可访问名的一部分（仅 insetLabel 存在时生效）。
  const hasInsetLabel = $derived(insetLabel !== undefined);
  // aria-labelledby 来源（对齐 Semi withField）：外部 ariaLabelledby(Form label id) 优先；
  // 否则 insetLabel 提供 insetLabelId 时把内嵌标签纳入可访问名。inset 场景两者为同一 id。
  const triggerLabelledby = $derived(
    ariaLabelledby ?? (hasInsetLabel && insetLabelId ? insetLabelId : undefined),
  );
  // aria-labelledby 存在时不再重复设 aria-label（避免可访问名冗余）。
  const triggerAriaLabel = $derived(triggerLabelledby ? undefined : ariaLabel);

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
      const target = e.target as Node;
      // panel portal 出 root 子树，需一并排除，否则面板内点击被误判为外部点击。
      if (rootEl && !rootEl.contains(target) && !panelEl?.contains(target)) {
        onClickOutSide?.(e);
      }
    }
    if (onClickOutSide) {
      document.addEventListener('click', handleDocClick, true);
    }
    // panel portal 出 root 子树后列入 extraTargets，否则面板内点击被判为外部点击而误关。
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [panelEl],
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

  // 触发器与浮层间距：spacing（number）优先，未传回退默认 4（近似原
  // calc(100% + extra-tight) 的紧邻视觉）；再叠加 dropdownMargin（number 直接加，
  // 对象取 y ?? 0；x 方向本 action 不单独支持，忽略）。
  const resolvedOffset = $derived.by(() => {
    const base = spacing ?? 4;
    if (typeof dropdownMargin === 'number') return base + dropdownMargin;
    if (dropdownMargin && typeof dropdownMargin === 'object') return base + (dropdownMargin.y ?? 0);
    return base;
  });

  const cls = $derived(
    [
      'cd-date-picker',
      `cd-date-picker--${size}`,
      `cd-date-picker--${validateStatus}`,
      disabled && 'cd-date-picker--disabled',
      isOpen && 'cd-date-picker--open',
      insetInput && 'cd-date-picker--inset-input',
      position && `cd-date-picker--${position}`,
      borderless && 'cd-date-picker--borderless',
      density === 'compact' && 'cd-date-picker--compact',
      !motion && 'cd-date-picker--no-motion',
      className,
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

<div class={cls} style={style || undefined} bind:this={rootEl} aria-invalid={validateStatus === 'error' || undefined} data-position={position}>
  <div class="cd-date-picker__control" class:cd-date-picker__control--inset-label={hasInsetLabel}>
    {#if hasInsetLabel}
      <span class="cd-date-picker__inset-label" id={insetLabelId}>
        {#if typeof insetLabel === 'string'}
          {insetLabel}
        {:else if insetLabel}
          {@render insetLabel()}
        {/if}
      </span>
    {/if}
    {#if triggerRender}
      {@render triggerRender({ value: isRange ? currentRange : current, placeholder: placeholder ?? loc().t('DatePicker.placeholder') })}
    {:else if isRange}
      <!-- range 触发器：起止双输入框 + 分隔节点（对齐 Semi dateInput range 分支）。 -->
      <div
        class="cd-date-picker__range-input"
        class:cd-date-picker__range-input--start-active={isOpen && rangeInputFocus === 'rangeStart'}
        class:cd-date-picker__range-input--end-active={isOpen && rangeInputFocus === 'rangeEnd'}
      >
        <input
          type="text"
          class="cd-date-picker__range-field cd-date-picker__range-field--start"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={dialogId}
          aria-label={triggerAriaLabel ?? loc().t('DatePicker.startPlaceholder')}
          placeholder={startPlaceholder ?? loc().t('DatePicker.startPlaceholder')}
          value={startText}
          readonly
          {disabled}
          bind:this={triggerEl as HTMLInputElement}
          onclick={() => focusRangeInput('rangeStart')}
          onfocus={(e) => { focusRangeInput('rangeStart'); onFocus?.(e); }}
          onkeydown={onTriggerKeydown}
          onblur={onBlur}
        />
        <span class="cd-date-picker__range-sep" aria-hidden="true">
          {#if rangeSeparatorNode}
            {#if typeof rangeSeparatorNode === 'string'}{rangeSeparatorNode}{:else}{@render rangeSeparatorNode()}{/if}
          {:else}
            {rangeSeparator}
          {/if}
        </span>
        <input
          type="text"
          class="cd-date-picker__range-field cd-date-picker__range-field--end"
          aria-label={loc().t('DatePicker.endPlaceholder')}
          placeholder={endPlaceholder ?? loc().t('DatePicker.endPlaceholder')}
          value={endText}
          readonly
          {disabled}
          onclick={() => focusRangeInput('rangeEnd')}
          onfocus={() => focusRangeInput('rangeEnd')}
          onkeydown={onTriggerKeydown}
        />
      </div>
    {:else if editable}
      <input
        type="text"
        class="cd-date-picker__trigger cd-date-picker__input"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
        aria-label={triggerAriaLabel}
        aria-labelledby={triggerLabelledby}
        aria-describedby={ariaDescribedby}
        aria-errormessage={ariaErrormessage}
        aria-required={ariaRequired || undefined}
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
        aria-label={triggerAriaLabel}
        aria-labelledby={triggerLabelledby}
        aria-describedby={ariaDescribedby}
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
          <IconClear aria-hidden="true" />
        {/if}
      </button>
    {/if}

    <span class="cd-date-picker__icon" aria-hidden="true">
      {#if isDateTime}
        <IconCalendarClock aria-hidden="true" />
      {:else}
        <IconCalendar aria-hidden="true" />
      {/if}
    </span>
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
              <!-- preset：small primary Button（对齐 Semi quickControl.tsx:86）。 -->
              <Button
                size="small"
                type="primary"
                class="cd-date-picker__preset"
                onclick={(e) => selectPreset(preset, e)}
              >
                {preset.label}
              </Button>
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
            {#if isRange}
              <!-- ================= range 双面板 ================= -->
              <div class="cd-date-picker__panels">
                {#each [{ cur: cursor, header: rangeLeftHeaderText, rows: leftRows, months: leftMonthCells, side: 'left', gid: gridId }, { cur: rightCursor, header: rangeRightHeaderText, rows: rightRows, months: rightMonthCells, side: 'right', gid: rangeRightGridId }] as panel (panel.side)}
                  <div class="cd-date-picker__month">
                    <div class="cd-date-picker__header">
                      {#if panel.side === 'left'}
                        <button type="button" class="cd-date-picker__nav" aria-label={isMonth ? loc().t('DatePicker.prevYear') : loc().t('DatePicker.prevMonth')} onclick={rangePrev}>
                          {#if isMonth}<IconDoubleChevronLeft size="small" aria-hidden="true" />{:else}<IconChevronLeft size="small" aria-hidden="true" />{/if}
                        </button>
                      {:else}
                        <span class="cd-date-picker__nav cd-date-picker__nav--ghost" aria-hidden="true"></span>
                      {/if}
                      <span class="cd-date-picker__title">{panel.header}</span>
                      {#if panel.side === 'right'}
                        <button type="button" class="cd-date-picker__nav" aria-label={isMonth ? loc().t('DatePicker.nextYear') : loc().t('DatePicker.nextMonth')} onclick={rangeNext}>
                          {#if isMonth}<IconDoubleChevronRight size="small" aria-hidden="true" />{:else}<IconChevronRight size="small" aria-hidden="true" />{/if}
                        </button>
                      {:else}
                        <span class="cd-date-picker__nav cd-date-picker__nav--ghost" aria-hidden="true"></span>
                      {/if}
                    </div>
                    {#if isMonth}
                      <div class="cd-date-picker__grid cd-date-picker__grid--month" role="grid" aria-label={panel.header}>
                        {#each panel.months as cell (cell.month)}
                          {@const edge = isEdge(cell.date)}
                          {@const within = inRange(cell.date)}
                          {@const isCurrentMonth = today.getFullYear() === cell.date.getFullYear() && today.getMonth() === cell.month}
                          {@const isDisabled = isRangeCellDisabled(cell.date)}
                          <button
                            type="button"
                            class="cd-date-picker__cell cd-date-picker__cell--block"
                            class:cd-date-picker__cell--edge={edge}
                            class:cd-date-picker__cell--in-range={within}
                            class:cd-date-picker__cell--today={isCurrentMonth}
                            role="gridcell"
                            aria-selected={edge}
                            aria-disabled={isDisabled || undefined}
                            disabled={isDisabled}
                            onclick={() => selectRangeDate(cell.date)}
                            onpointerenter={() => onRangeCellHover(cell.date)}
                          >
                            {cell.label}
                          </button>
                        {/each}
                      </div>
                    {:else}
                      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                      <div class="cd-date-picker__grid" role="grid" tabindex="0" aria-label={panel.header} onkeydown={onGridKeydown}>
                        <div class="cd-date-picker__row cd-date-picker__row--head" role="row">
                          {#each weekdayNames as name, i (i)}
                            <span class="cd-date-picker__weekday" role="columnheader" aria-label={weekdayLongNames[i]}>{name}</span>
                          {/each}
                        </div>
                        {#each panel.rows as row, wi (wi)}
                          <div class="cd-date-picker__row" role="row">
                            {#each row as cell (cell.date.getTime())}
                              {@const edge = isEdge(cell.date)}
                              {@const within = inRange(cell.date)}
                              {@const isTodayCell = isSameDay(cell.date, today)}
                              {@const isHighlight = isSameDay(cell.date, highlight)}
                              {@const isDisabled = isRangeCellDisabled(cell.date)}
                              <button
                                type="button"
                                id={rangeCellId(panel.gid, cell.date)}
                                class="cd-date-picker__cell"
                                class:cd-date-picker__cell--muted={!cell.inMonth}
                                class:cd-date-picker__cell--edge={edge}
                                class:cd-date-picker__cell--in-range={within}
                                class:cd-date-picker__cell--today={isTodayCell}
                                class:cd-date-picker__cell--highlight={isHighlight}
                                role="gridcell"
                                aria-selected={edge}
                                aria-disabled={isDisabled || undefined}
                                disabled={isDisabled}
                                tabindex={-1}
                                onclick={() => selectRangeDate(cell.date)}
                                onpointerenter={() => onRangeCellHover(cell.date)}
                              >
                                {cell.date.getDate()}
                              </button>
                            {/each}
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/each}

                {#if isDateTime && !disabledTimePicker}
                  <!-- range 起止两组时间列复用 ScrollList+ScrollItem（对齐 Semi Combobox），作用于 activeEnd。 -->
                  <div class="cd-date-picker__times">
                    {#each ['start', 'end'] as const as end (end)}
                      {@const isActive = activeEnd === end}
                      {@const endDate = end === 'start' ? pendingRange[0] : pendingRange[1]}
                      {@const hh = endDate ? endDate.getHours() : 0}
                      {@const mm = endDate ? endDate.getMinutes() : 0}
                      {@const ss = endDate ? endDate.getSeconds() : 0}
                      {@const hL = rangeHourList(end)}
                      {@const mL = rangeMinuteList(end)}
                      {@const sL = rangeSecondList(end)}
                      <div class="cd-date-picker__time" class:cd-date-picker__time--active={isActive} role="group" aria-label={end === 'start' ? loc().t('DatePicker.startPlaceholder') : loc().t('DatePicker.endPlaceholder')}>
                        <ScrollList>
                          <ScrollItem
                            mode="normal"
                            class="cd-date-picker__panel-list-hour"
                            list={hL}
                            selectedIndex={timeIndexOf(hL, hh)}
                            type="hour"
                            onSelect={onSelectRangeHour(end)}
                            ariaLabel={loc().t('TimePicker.hour')}
                          />
                          <ScrollItem
                            mode="normal"
                            class="cd-date-picker__panel-list-minute"
                            list={mL}
                            selectedIndex={timeIndexOf(mL, mm)}
                            type="minute"
                            onSelect={onSelectRangeMinute(end)}
                            ariaLabel={loc().t('TimePicker.minute')}
                          />
                          {#if showSecond}
                            <ScrollItem
                              mode="normal"
                              class="cd-date-picker__panel-list-second"
                              list={sL}
                              selectedIndex={timeIndexOf(sL, ss)}
                              type="second"
                              onSelect={onSelectRangeSecond(end)}
                              ariaLabel={loc().t('TimePicker.second')}
                            />
                          {/if}
                        </ScrollList>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {:else}
            <div class="cd-date-picker__calendar">
              <div class="cd-date-picker__header">
                {#if isDayPanel}
                  <!-- 翻年双箭头（对齐 Semi Navigation prevYear «）：date/dateTime 面板一键翻年 -->
                  <button
                    type="button"
                    class="cd-date-picker__nav"
                    aria-label={prevYearLabel}
                    onclick={prevYear}
                  >
                    <IconDoubleChevronLeft size="small" aria-hidden="true" />
                  </button>
                {/if}
                <button
                  type="button"
                  class="cd-date-picker__nav"
                  aria-label={prevLabel}
                  onclick={onPrev}
                >
                  {#if navIsYearJump}
                    <IconDoubleChevronLeft size="small" aria-hidden="true" />
                  {:else}
                    <IconChevronLeft size="small" aria-hidden="true" />
                  {/if}
                </button>
                {#if yamEnabled}
                  <button
                    type="button"
                    class="cd-date-picker__title cd-date-picker__title--button"
                    aria-label={loc().t('DatePicker.switchYearMonth')}
                    aria-expanded={yamOpen}
                    onclick={toggleYam}
                  >
                    {headerText}
                  </button>
                {:else}
                  <span class="cd-date-picker__title">{headerText}</span>
                {/if}
                <button
                  type="button"
                  class="cd-date-picker__nav"
                  aria-label={nextLabel}
                  onclick={onNext}
                >
                  {#if navIsYearJump}
                    <IconDoubleChevronRight size="small" aria-hidden="true" />
                  {:else}
                    <IconChevronRight size="small" aria-hidden="true" />
                  {/if}
                </button>
                {#if isDayPanel}
                  <!-- 翻年双箭头（对齐 Semi Navigation nextYear »）：date/dateTime 面板一键翻年 -->
                  <button
                    type="button"
                    class="cd-date-picker__nav"
                    aria-label={nextYearLabel}
                    onclick={nextYear}
                  >
                    <IconDoubleChevronRight size="small" aria-hidden="true" />
                  </button>
                {/if}
              </div>

              {#if yamOpen && yamEnabled}
                <!-- 年月滚轮快速跳转面板 (PANEL_YAM)：ScrollList 容器 + 年/月两 wheel 列（对齐 Semi），
                     选中即跳转 cursor（不写 value）；yearCyclic/monthCyclic 控制循环滚动。 -->
                <div class="cd-date-picker__yam" role="group" aria-label={loc().t('DatePicker.switchYearMonth')}>
                  <ScrollList>
                    <ScrollItem
                      mode="wheel"
                      list={yamYearItems}
                      type="year"
                      cycled={yamYearCyclic}
                      selectedIndex={yamYearIndex}
                      onSelect={onYamSelect}
                      ariaLabel={loc().t('DatePicker.yearColumnLabel')}
                    />
                    <ScrollItem
                      mode="wheel"
                      list={yamMonthItems}
                      type="month"
                      cycled={yamMonthCyclic}
                      selectedIndex={yamMonthIndex}
                      onSelect={onYamSelect}
                      ariaLabel={loc().t('DatePicker.monthColumnLabel')}
                    />
                  </ScrollList>
                  <button type="button" class="cd-date-picker__yam-back" onclick={backToMain}>
                    {loc().t('DatePicker.backToDate')}
                  </button>
                </div>
              {:else if isMonth}
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
              <!-- 单选时间列复用 ScrollList+ScrollItem（对齐 Semi Combobox），列内 mode=normal 点击选中。 -->
              <div class="cd-date-picker__time">
                <ScrollList>
                  <ScrollItem
                    mode="normal"
                    class="cd-date-picker__panel-list-hour"
                    list={hourListSingle}
                    selectedIndex={timeIndexOf(hourListSingle, selectedHour)}
                    type="hour"
                    onSelect={onSelectHourSingle}
                    ariaLabel={loc().t('TimePicker.hour')}
                  />
                  <ScrollItem
                    mode="normal"
                    class="cd-date-picker__panel-list-minute"
                    list={minuteListSingle}
                    selectedIndex={timeIndexOf(minuteListSingle, selectedMinute)}
                    type="minute"
                    onSelect={onSelectMinuteSingle}
                    ariaLabel={loc().t('TimePicker.minute')}
                  />
                  {#if showSecond}
                    <ScrollItem
                      mode="normal"
                      class="cd-date-picker__panel-list-second"
                      list={secondListSingle}
                      selectedIndex={timeIndexOf(secondListSingle, selectedSecond)}
                      type="second"
                      onSelect={onSelectSecondSingle}
                      ariaLabel={loc().t('TimePicker.second')}
                    />
                  {/if}
                </ScrollList>
              </div>
            {/if}
            {/if}
          </div>

          <div class="cd-date-picker__footer">
            {#if !isRange}
              <!-- today：borderless Button（对齐 Semi footer 复用 Button）。 -->
              <Button theme="borderless" class="cd-date-picker__today" onclick={selectToday}>
                {loc().t('DatePicker.today')}
              </Button>
            {/if}
            {#if isDateTime || effNeedConfirm}
              {#if isRange || effNeedConfirm}
                <!-- 取消：borderless（对齐 Semi footer.tsx:21）。 -->
                <Button theme="borderless" class="cd-date-picker__cancel" onclick={cancelConfirm}>
                  {loc().t('DatePicker.cancel') ?? '取消'}
                </Button>
              {/if}
              <!-- 确认：solid（对齐 Semi footer.tsx:24）。 -->
              <Button theme="solid" class="cd-date-picker__ok" onclick={confirm}>
                {loc().t('TimePicker.confirm')}
              </Button>
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
              <!-- preset：small primary Button（对齐 Semi quickControl.tsx:86）。 -->
              <Button
                size="small"
                type="primary"
                class="cd-date-picker__preset"
                onclick={(e) => selectPreset(preset, e)}
              >
                {preset.label}
              </Button>
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
    font-size: var(--cd-font-size-regular);
  }
  .cd-date-picker__control {
    position: relative;
    inline-size: 100%;
  }
  /* insetLabel：内嵌标签浮入触发器左侧，与触发器同处一个边框内。 */
  .cd-date-picker__control--inset-label {
    display: flex;
    align-items: center;
    background: var(--cd-color-input-default-bg-default);
    border: 1px solid var(--cd-color-input-default-border-default);
    border-radius: var(--cd-radius-input-wrapper);
  }
  .cd-date-picker__control--inset-label .cd-date-picker__trigger {
    border: none;
    background: transparent;
  }
  .cd-date-picker__inset-label {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    padding-inline-start: var(--cd-spacing-input-paddingleft);
    color: var(--cd-color-text-2);
    user-select: none;
    white-space: nowrap;
  }
  .cd-date-picker__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    block-size: var(--cd-height-input-default);
    padding-inline-start: var(--cd-spacing-input-paddingleft);
    padding-inline-end: calc(var(--cd-spacing-input-paddingleft) + 1.25rem);
    background: var(--cd-color-input-default-bg-default);
    color: var(--cd-color-input-default-text-default);
    border: 1px solid var(--cd-color-input-default-border-default);
    border-radius: var(--cd-radius-input-wrapper);
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
    border-color: var(--cd-color-input-default-border-focus);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker--open .cd-date-picker__trigger {
    border-color: var(--cd-color-input-default-border-focus);
  }
  .cd-date-picker--warning .cd-date-picker__trigger {
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-date-picker--error .cd-date-picker__trigger {
    border-color: var(--cd-color-input-danger-border-focus);
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
  /* compact 密度：Semi 精确 28/24 双层（$width-datepicker_day_compact / _main_compact），非 32*0.85 近似 */
  .cd-date-picker--compact .cd-date-picker__row {
    grid-template-columns: repeat(7, var(--cd-width-date-picker-day-compact));
  }
  .cd-date-picker--compact .cd-date-picker__cell {
    inline-size: var(--cd-width-date-picker-day-main-compact);
    block-size: var(--cd-width-date-picker-day-main-compact);
    font-size: var(--cd-font-size-small);
  }
  .cd-date-picker--compact .cd-date-picker__weekday {
    inline-size: var(--cd-width-date-picker-day-compact);
    block-size: var(--cd-width-date-picker-day-main-compact);
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
    color: var(--cd-color-input-placeholder-text-default);
  }
  .cd-date-picker__prefix {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  /* format 可输入模式：原生 input 复用 trigger 外观 */
  .cd-date-picker__input::placeholder {
    color: var(--cd-color-input-placeholder-text-default);
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
    inset-inline-end: var(--cd-spacing-input-paddingleft);
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
    background: var(--cd-color-input-default-bg-default);
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
    /* 定位（position/inset/transform）由 use:floating action 接管；此处仅保留视觉样式。 */
    z-index: var(--cd-z-date-picker-panel, 1030);
    padding: var(--cd-spacing-base-tight);
    background: var(--cd-color-date-picker-panel-bg-default);
    border-radius: var(--cd-radius-date-picker-panel);
    box-shadow: var(--cd-shadow-date-picker-panel);
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
    background: var(--cd-color-date-picker-date-bg-hover);
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
  /* --- 时间列复用 ScrollList+ScrollItem（对齐 Semi Combobox）：解除等分、设列宽 + 面板高 +
     重算居中留白（参照 TimePicker CSS 注释）。列都在同一 svelte scope 内（未 portal），故直接用
     scoped 后代选择器即可，无需 :global 裸类。 --- */
  .cd-date-picker__time :global(.cd-scrolllist-item) {
    flex: none;
    inline-size: var(--cd-width-date-picker-panel-list);
  }
  .cd-date-picker__time :global(.cd-scrolllist-body) {
    block-size: var(--cd-height-date-picker-panel-list-body);
  }
  /* 居中留白按面板高重算：(body - item) * 0.5（对齐 TimePicker，ScrollList 默认按 300px 视窗算，
     此处面板收窄需覆盖 :before 与 padding-bottom，否则选中项垂直不居中）。 */
  .cd-date-picker__time :global(.cd-scrolllist-item > ul::before) {
    block-size: calc((var(--cd-height-date-picker-panel-list-body) - var(--cd-height-scroll-list-item)) * 0.5);
  }
  .cd-date-picker__time :global(.cd-scrolllist-item > ul) {
    padding-block-end: calc((var(--cd-height-date-picker-panel-list-body) - var(--cd-height-scroll-list-item)) * 0.5);
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
    color: var(--cd-color-date-picker-day-text-active);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-date-picker__nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: var(--cd-width-date-picker-day-main);
    block-size: var(--cd-width-date-picker-day-main);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-date-picker-nav-icon-text-default);
    border-radius: var(--cd-radius-date-picker-day-main);
    cursor: pointer;
  }
  .cd-date-picker__nav:hover {
    background: var(--cd-color-date-picker-date-bg-hover);
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
  /* 日期格双层（对齐 Semi）：行网格列宽 = 外框 36px（$width-datepicker_day），
     日期格内容 = 32px（$width-datepicker_day_main）居中，(36-32)/2=2px 天然间距，无需 gap。 */
  .cd-date-picker__row {
    display: grid;
    grid-template-columns: repeat(7, var(--cd-width-date-picker-day));
    gap: 0;
  }
  /* month/year 面板：3 列大格 (仍用 grid 容器) */
  .cd-date-picker__grid--month,
  .cd-date-picker__grid--year {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--cd-spacing-extra-tight);
    inline-size: calc(var(--cd-width-date-picker-day) * 7);
  }
  .cd-date-picker__cell--block {
    inline-size: auto;
    place-self: stretch;
    padding-inline: var(--cd-spacing-tight);
    block-size: calc(var(--cd-width-date-picker-day-main) * 1.4);
  }
  .cd-date-picker__weekday {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-width-date-picker-day);
    block-size: var(--cd-width-date-picker-day-main);
    color: var(--cd-color-date-picker-day-text-default);
    font-size: var(--cd-font-size-small);
  }
  .cd-date-picker__cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    place-self: center;
    inline-size: var(--cd-width-date-picker-day-main);
    block-size: var(--cd-width-date-picker-day-main);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-date-picker-date-text-default);
    border-radius: var(--cd-radius-date-picker-day-main);
    font: inherit;
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-date-picker__cell:hover {
    background: var(--cd-color-date-picker-date-bg-hover);
  }
  .cd-date-picker__cell:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-date-picker__cell--muted {
    color: var(--cd-color-date-picker-date-muted-text-default);
  }
  .cd-date-picker__cell--today {
    border-block-end: 2px solid var(--cd-color-date-picker-date-selected-bg-default);
  }
  .cd-date-picker__cell--highlight {
    background: var(--cd-color-date-picker-date-bg-hover);
  }
  .cd-date-picker__cell--selected,
  .cd-date-picker__cell--selected:hover {
    background: var(--cd-color-date-picker-date-selected-bg-default);
    color: var(--cd-color-date-picker-date-selected-text-default);
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
    background: var(--cd-color-date-picker-footer-bg-default); /* 对齐 Semi footer 背景 fill-0 */
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
    padding-inline: var(--cd-spacing-input-paddingleft);
    background: var(--cd-color-date-picker-range-input-bg-default);
    color: var(--cd-color-input-default-text-default);
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
    color: var(--cd-color-input-placeholder-text-default);
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
  /* 头部标题可点（进年月滚轮）时的按钮样式 */
  .cd-date-picker__title--button {
    padding-inline: var(--cd-spacing-date-picker-yam-header-padding-x);
    padding-block: var(--cd-spacing-date-picker-yam-header-padding-y);
    border: none;
    background: transparent;
    color: var(--cd-color-date-picker-nav-month-icon-text-default);
    border-radius: var(--cd-width-date-picker-yam-header-border-radius);
    font: inherit;
    font-weight: var(--cd-font-weight-medium);
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-date-picker__title--button:hover {
    background: var(--cd-color-date-picker-date-bg-hover);
  }
  .cd-date-picker__title--button:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* 年月滚轮面板 (PANEL_YAM)：年 + 月两列 ScrollList，消费 yam token */
  .cd-date-picker__yam {
    display: flex;
    flex-direction: column;
    inline-size: var(--cd-width-date-picker-yam-showing-min);
    max-inline-size: 100%;
    min-block-size: var(--cd-height-date-picker-yam-showing-min);
    padding: var(--cd-spacing-date-picker-scrolllist-body-padding);
  }
  .cd-date-picker__yam :global(.cd-scrolllist) {
    block-size: var(--cd-height-date-picker-panel-yam-scrolllist);
    box-shadow: none;
  }
  .cd-date-picker__yam :global(.cd-scrolllist-body) {
    block-size: var(--cd-height-date-picker-panel-yam-scrolllist);
    padding: 0;
  }
  .cd-date-picker__yam :global(.cd-scrolllist-item-wheel) {
    min-inline-size: var(--cd-width-date-picker-panel-yam-scrolllist-li-min);
  }
  .cd-date-picker__yam-back {
    margin-block-start: auto;
    padding: var(--cd-spacing-date-picker-scrolllist-header-padding);
    min-block-size: var(--cd-height-date-picker-timepicker-header-min);
    border: none;
    border-block-start: var(--cd-width-date-picker-border) solid var(--cd-color-date-picker-border-bg-default);
    background: transparent;
    color: var(--cd-color-date-picker-quick-button-text-default);
    font: inherit;
    cursor: pointer;
  }
  .cd-date-picker__yam-back:hover {
    text-decoration: underline;
  }
  .cd-date-picker__yam-back:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }

  /* ============================ range 触发器双输入框 ============================ */
  .cd-date-picker__range-input {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    block-size: var(--cd-height-input-default);
    padding-inline: var(--cd-spacing-input-paddingleft);
    background: var(--cd-color-input-default-bg-default);
    color: var(--cd-color-input-default-text-default);
    border: 1px solid var(--cd-color-input-default-border-default);
    border-radius: var(--cd-radius-input-wrapper);
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-date-picker--small .cd-date-picker__range-input {
    block-size: var(--cd-height-input-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-date-picker--large .cd-date-picker__range-input {
    block-size: var(--cd-height-input-large);
    font-size: var(--cd-font-size-header-6);
  }
  .cd-date-picker--open .cd-date-picker__range-input {
    border-color: var(--cd-color-input-default-border-focus);
  }
  .cd-date-picker--warning .cd-date-picker__range-input {
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-date-picker--error .cd-date-picker__range-input {
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-date-picker--disabled .cd-date-picker__range-input {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-date-picker__range-field {
    flex: 1 1 0;
    min-inline-size: 0;
    inline-size: 100%;
    block-size: 100%;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: center;
    cursor: pointer;
    outline: none;
  }
  .cd-date-picker__range-field::placeholder {
    color: var(--cd-color-input-placeholder-text-default);
  }
  .cd-date-picker__range-field:disabled {
    cursor: not-allowed;
  }
  /* 激活端下划线提示（对齐 Semi range 输入焦点态） */
  .cd-date-picker__range-input--start-active .cd-date-picker__range-field--start,
  .cd-date-picker__range-input--end-active .cd-date-picker__range-field--end {
    box-shadow: inset 0 -2px 0 0 var(--cd-color-date-picker-range-input-border-active);
  }
  .cd-date-picker__range-sep {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }

  /* ============================ range 双面板 ============================ */
  .cd-date-picker__panels {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-base);
  }
  .cd-date-picker__month {
    flex: 0 0 auto;
  }
  .cd-date-picker__nav--ghost {
    background: transparent;
    cursor: default;
    pointer-events: none;
  }
  .cd-date-picker__nav--ghost:hover {
    background: transparent;
  }
  /* range 区间内：浅底连续条（对齐 Semi primary-light 区间底色） */
  .cd-date-picker__cell--in-range {
    background: var(--cd-color-date-picker-date-in-hover-bg-default);
    border-radius: 0;
  }
  /* range 端点：实心高亮 */
  .cd-date-picker__cell--edge,
  .cd-date-picker__cell--edge:hover {
    background: var(--cd-color-date-picker-date-selected-bg-default);
    color: var(--cd-color-date-picker-date-selected-text-default);
    border-radius: var(--cd-radius-date-picker-day-main);
  }

  /* ============================ range 时间列 ============================ */
  .cd-date-picker__times {
    display: flex;
    margin-inline-start: var(--cd-spacing-tight);
    padding-inline-start: var(--cd-spacing-tight);
    border-inline-start: 1px solid var(--cd-color-date-picker-border-bg-default);
    gap: var(--cd-spacing-tight);
  }
  .cd-date-picker__time--active {
    background: var(--cd-color-date-picker-date-in-hover-bg-default);
    border-radius: var(--cd-radius-date-picker-day-main);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-date-picker__trigger,
    .cd-date-picker__range-input,
    .cd-date-picker__clear,
    .cd-date-picker__cell,
    .cd-date-picker__preset,
    .cd-date-picker__inset-field,
    .cd-date-picker__title--button {
      transition: none;
    }
  }
</style>
