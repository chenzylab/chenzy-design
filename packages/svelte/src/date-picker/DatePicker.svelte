<!--
  DatePicker —— 从零重写并严格对齐 Semi 的主装配。
  对齐 Semi datePicker.tsx：外层 div.PREFIX > Popover(trigger=custom, content=面板) > combobox wrapper > DateInput。
  面板：div.PREFIX[x-type] > div.-container > div > (Navigation + Month)。
  值模型走 date-picker-foundation（parseWithTimezone/disposeCallbackArgs/_notifyChange）。
  range/dateTime/yam/tpk/footer/inset/preset 留后续里程碑（此处只装 date 单面板）。
-->
<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import { format as dateFnsFormat } from 'date-fns';
  import { useLocale, LOCALE_CONTEXT_KEY, type LocaleApi, type LocaleContextValue } from '../locale-provider/index.js';
  import { CONFIG_CONTEXT_KEY, type ConfigContextValue } from '../config-provider/context.js';
  import Popover from '../popover/Popover.svelte';
  import type { Position } from '../tooltip/index.js';
  import DateInput from './DateInput.svelte';
  import MonthsGrid from './MonthsGrid.svelte';
  import YearAndMonth from './YearAndMonth.svelte';
  import QuickControl from './QuickControl.svelte';
  import InsetInput from './InsetInput.svelte';
  import Footer from './Footer.svelte';
  import getInsetInputFormatToken from './_utils/getInsetInputFormatToken.js';
  import { parse as dateFnsParse } from 'date-fns';
  import { cssClasses, numbers, strings, getDefaultFormatTokenByType, type PickerType, type PickerSize } from './constants.js';
  import {
    createDatePickerState,
    type RangeValue,
    type PresetsType,
    type PresetType,
    type BaseValueType,
    type DatePickerFoundationProps,
    type ValidateStatus,
  } from './date-picker-foundation.svelte.js';
  import type { WeekStartNumber } from './_utils/getDayOfWeek.js';
  import type { DayStatus } from './month-foundation.svelte.js';

  interface Props {
    type?: PickerType;
    value?: Date | Date[] | RangeValue | null;
    defaultValue?: Date | Date[] | RangeValue | null;
    /** 面板初始定位日期（对齐 Semi defaultPickerValue）：数组时 [0] 定位左面板、[1] 定位右面板。 */
    defaultPickerValue?: Date | Date[];
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    /** 占位（对齐 Semi placeholder）：string 或 range 的 [start, end]；未传按 type 取 locale 默认。 */
    placeholder?: string | string[];
    format?: string;
    showClear?: boolean;
    inputReadOnly?: boolean;
    validateStatus?: ValidateStatus;
    size?: PickerSize;
    weekStartsOn?: WeekStartNumber;
    /** 禁用日期（对齐 Semi disabledDate）：range 场景第二参 options 提供 rangeStart/rangeEnd/rangeInputFocus 上下文。 */
    disabledDate?: (
      date: Date,
      options?: { rangeStart: string; rangeEnd: string; rangeInputFocus: 'rangeStart' | 'rangeEnd' | false },
    ) => boolean;
    /** 禁用时间（dateTime，对齐 Semi disabledTime）：返回 {disabledHours,disabledMinutes,disabledSeconds}。 */
    disabledTime?: (date: Date | Date[] | null, panelType?: 'left' | 'right') => { disabledHours?: () => number[]; disabledMinutes?: (hour: number) => number[]; disabledSeconds?: (hour: number, minute: number) => number[] } | undefined;
    /** 禁用时间面板整体（对齐 Semi disabledTimePicker）。 */
    disabledTimePicker?: boolean;
    /** 隐藏禁用时间项（对齐 Semi hideDisabledOptions）。 */
    hideDisabledOptions?: boolean;
    /** 紧凑密度（对齐 Semi density）。 */
    density?: 'default' | 'compact';
    /** 双面板同步翻月（range，对齐 Semi syncSwitchMonth）。 */
    syncSwitchMonth?: boolean;
    /** 自定义日期数字渲染（对齐 Semi renderDate）。 */
    renderDate?: import('svelte').Snippet<[number | string, string]>;
    /** 自定义整日格渲染（对齐 Semi renderFullDate）。 */
    renderFullDate?: import('svelte').Snippet<[number | string, string, DayStatus]>;
    /** 周选择起偏移（对齐 Semi startDateOffset）。 */
    startDateOffset?: (date: Date) => Date;
    /** 周选择止偏移（对齐 Semi endDateOffset）。 */
    endDateOffset?: (date: Date) => Date;
    /** 面板月变化回调（对齐 Semi onPanelChange）。 */
    onPanelChange?: (date: Date | Date[], dateString: string | string[]) => void;
    timeZone?: string | number;
    /** 多选（仅 type=date，对齐 Semi multiple）：value/onChange 为 Date[]，点日期 toggle。 */
    multiple?: boolean;
    /** 多选上限（对齐 Semi max）：到上限再点触发 onMaxLimit，不再增选。 */
    max?: number;
    /** 多选到上限时回调（对齐 Semi onMaxSelect）。 */
    onMaxLimit?: () => void;
    /** 快捷选择预设（对齐 Semi presets）。 */
    presets?: PresetsType;
    /** 预设位置（对齐 Semi presetPosition，默认 bottom）。 */
    presetPosition?: 'left' | 'right' | 'top' | 'bottom';
    onPresetClick?: (preset: PresetType, e: MouseEvent) => void;
    /** 面板内嵌输入框（对齐 Semi insetInput）：触发器只读，面板顶部输入。 */
    insetInput?: boolean;
    /** 需确认（对齐 Semi needConfirm，仅 dateTime/dateTimeRange）：选择先暂存，点确认才提交。 */
    needConfirm?: boolean;
    /** 点确认回调（对齐 Semi onConfirm）。 */
    onConfirm?: (value: Date | Date[] | RangeValue | null, dateString: string) => void;
    /** 点取消回调（对齐 Semi onCancel）。 */
    onCancel?: (value: Date | Date[] | RangeValue | null, dateString: string) => void;
    onChange?: (value: Date | Date[] | RangeValue | null, dateString: string) => void;
    onChangeWithDateFirst?: boolean;
    onOpenChange?: (open: boolean) => void;
    // --- 浮层透传（对齐 Semi，传给 Popover）---
    /** 浮层弹出位置（对齐 Semi position，默认 bottomLeft）。 */
    position?: Position;
    /** 浮层 z-index（对齐 Semi zIndex）。 */
    zIndex?: number;
    /** 浮层溢出自动调整（对齐 Semi autoAdjustOverflow）。 */
    autoAdjustOverflow?: boolean;
    /** 浮层挂载容器（对齐 Semi getPopupContainer）。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 面板展开动画（对齐 Semi motion）。 */
    motion?: boolean;
    /** 阻止浮层点击冒泡（对齐 Semi stopPropagation）。 */
    stopPropagation?: boolean;
    /** 面板外点击关闭时回调（对齐 Semi onClickOutSide）。 */
    onClickOutSide?: () => void;
    // --- 触发器透传（对齐 Semi）---
    /** 触发器聚焦（对齐 Semi onFocus）。 */
    onFocus?: (e: FocusEvent) => void;
    /** 触发器失焦（对齐 Semi onBlur）。 */
    onBlur?: (e: FocusEvent) => void;
    // --- 触发器渲染定制（对齐 Semi，透传 DateInput/Input）---
    /** 无边框触发器（对齐 Semi borderless）。 */
    borderless?: boolean;
    /** 触发器内嵌标签（对齐 Semi insetLabel）。 */
    insetLabel?: import('svelte').Snippet | string;
    /** 触发器前缀（对齐 Semi prefix）。 */
    prefix?: import('svelte').Snippet | string;
    /** 自定义清除图标（对齐 Semi clearIcon）。 */
    clearIcon?: import('svelte').Snippet;
    /** 触发器输入框样式（对齐 Semi inputStyle）。 */
    inputStyle?: string;
    /** range 分隔符（对齐 Semi rangeSeparator，默认 ' ~ '）。 */
    rangeSeparator?: string;
    /** 面板顶部自定义内容（对齐 Semi topSlot）。 */
    topSlot?: import('svelte').Snippet;
    /** 面板底部自定义内容（对齐 Semi bottomSlot）。 */
    bottomSlot?: import('svelte').Snippet;
    /** 面板左侧自定义内容（对齐 Semi leftSlot）。 */
    leftSlot?: import('svelte').Snippet;
    /** 面板右侧自定义内容（对齐 Semi rightSlot）。 */
    rightSlot?: import('svelte').Snippet;
    /** 完全自定义触发器渲染（对齐 Semi triggerRender）：替换默认 DateInput，接收当前值/占位/开合/禁用。 */
    triggerRender?: import('svelte').Snippet<[{ value: string; placeholder: string; open: boolean; disabled: boolean }]>;
    // --- 浮层杂项（对齐 Semi）---
    /** 浮层与触发器间距（对齐 Semi spacing）。 */
    spacing?: number;
    /** 浮层 className（对齐 Semi dropdownClassName）。 */
    dropdownClassName?: string;
    /** 浮层内联样式（对齐 Semi dropdownStyle）。 */
    dropdownStyle?: string;
    /** 打开面板时阻止滚动（对齐 Semi preventScroll）。 */
    preventScroll?: boolean;
    /** 挂载时自动聚焦触发器（对齐 Semi autoFocus）。 */
    autoFocus?: boolean;
    /** 清除回调（对齐 Semi onClear）：点清除按钮时触发。 */
    onClear?: (e: MouseEvent) => void;
    /** 根节点内联样式（对齐 Semi style）。 */
    style?: string;
    /** 根节点类名（对齐 Semi className，本库命名用 class）。 */
    class?: string;
    /** range 选完起点自动切到止点框（对齐 Semi autoSwitchDate，默认 true）。 */
    autoSwitchDate?: boolean;
    /** 浮层溢出冗余边距（对齐 Semi dropdownMargin）。 */
    dropdownMargin?: number | { marginLeft?: number; marginTop?: number; marginRight?: number; marginBottom?: number };
    /** 触发器内嵌标签 id（对齐 Semi insetLabelId，透传 Input）。 */
    insetLabelId?: string;
    /** range 分隔符自定义节点（对齐 Semi rangeSeparatorNode，优先于 rangeSeparator）。 */
    rangeSeparatorNode?: import('svelte').Snippet | string;
    /**
     * 局部覆盖 DatePicker 文案（对齐 Semi locale）：只需给要改的字段，未给的回退 LocaleProvider。
     * 本库语言包是整包 + 点路径 t()，故此处收 DatePicker 那一片（形状同 Semi Locale['DatePicker']）。
     */
    locale?: Partial<import('@chenzy-design/locale').Locale['DatePicker']>;
    /** 覆盖 BCP 47 语言代码（对齐 Semi localeCode）：驱动 Intl 的月份/星期本地化；未传回退 LocaleProvider。 */
    localeCode?: string;
    /** date-fns locale（对齐 Semi dateFnsLocale）：驱动 date-fns 解析/格式化的本地化。 */
    dateFnsLocale?: import('date-fns').Locale;
    /** 时间选择器透传选项（对齐 Semi timePickerOpts）。 */
    timePickerOpts?: Record<string, unknown>;
    /** 年月选择器透传选项（对齐 Semi yearAndMonthOpts）。 */
    yearAndMonthOpts?: Record<string, unknown>;
    /** 年份滚轮开始年（对齐 Semi startYear，默认当前年前 100 年）。 */
    startYear?: number;
    /** 年份滚轮结束年（对齐 Semi endYear，默认当前年后 100 年，需大于开始年）。 */
    endYear?: number;
  }

  let {
    type = 'date',
    value,
    defaultValue,
    defaultPickerValue,
    open: openProp,
    defaultOpen = false,
    disabled = false,
    placeholder,
    format,
    // 默认 true（对齐 Semi：DatePicker 不在 defaultProps 里设它，透传 undefined 给
    // DateInput，由后者 defaultProps 的 showClear:true 兜底；Semi 文档也标默认 true）。
    // 本库 meta/md 早已写 default: true，此前实现却是 false——属「声明未接线」。
    showClear = true,
    inputReadOnly = false,
    validateStatus,
    size = 'default',
    weekStartsOn = numbers.WEEK_START_ON as WeekStartNumber,
    disabledDate,
    disabledTime,
    disabledTimePicker = false,
    hideDisabledOptions = false,
    density = 'default',
    syncSwitchMonth = false,
    renderDate,
    renderFullDate,
    startDateOffset,
    endDateOffset,
    onPanelChange,
    timeZone,
    multiple = false,
    max,
    onMaxLimit,
    presets = [],
    presetPosition = 'bottom',
    onPresetClick,
    insetInput = false,
    needConfirm = false,
    onConfirm,
    onCancel,
    onChange,
    onChangeWithDateFirst = false,
    onOpenChange,
    position,
    zIndex,
    autoAdjustOverflow = true,
    getPopupContainer,
    motion = true,
    stopPropagation = true,
    onClickOutSide,
    onFocus,
    onBlur,
    borderless = false,
    insetLabel,
    prefix,
    clearIcon,
    inputStyle,
    // 默认 ' ~ '（对齐 Semi rangeSeparator 默认值）。原先无默认，靠各子组件自己的
    // 默认值兜底，顶层直接使用时会拿到 undefined。
    rangeSeparator = ' ~ ',
    topSlot,
    bottomSlot,
    leftSlot,
    rightSlot,
    triggerRender,
    spacing,
    dropdownClassName,
    dropdownStyle,
    preventScroll = false,
    autoFocus = false,
    onClear: onClearProp,
    style,
    class: className,
    autoSwitchDate = true,
    dropdownMargin,
    insetLabelId,
    rangeSeparatorNode,
    dateFnsLocale,
    timePickerOpts,
    yearAndMonthOpts,
    startYear,
    endYear,
    locale: localeProp,
    localeCode,
  }: Props = $props();

  const baseLoc = useLocale();
  const PREFIX = cssClasses.PREFIX;

  // locale / localeCode 局部覆盖（对齐 Semi：外部 prop 优先，未传回退 LocaleProvider）。
  // locale 是 DatePicker 那一片（形状同 Semi Locale['DatePicker']），浅合并盖在 provider 之上；
  // t() 与 component('DatePicker') 两条取值口都吃到覆盖，并 setContext 覆盖整棵子树
  //（MonthsGrid/Footer/YearAndMonth 等各自 useLocale 的子组件同样生效）。
  const loc: () => LocaleApi = () => {
    const base = baseLoc();
    if (!localeProp && !localeCode) return base;
    return {
      ...base,
      get code() { return localeCode ?? base.code; },
      component(name) {
        const slice = base.component(name);
        return name === 'DatePicker' && localeProp
          ? ({ ...(slice as object), ...localeProp } as typeof slice)
          : slice;
      },
      t(key: string, params?: Record<string, string | number>) {
        if (localeProp && key.startsWith('DatePicker.')) {
          const path = key.slice('DatePicker.'.length).split('.');
          let cur: unknown = localeProp;
          for (const seg of path) {
            if (cur && typeof cur === 'object' && seg in (cur as Record<string, unknown>)) {
              cur = (cur as Record<string, unknown>)[seg];
            } else {
              cur = undefined;
              break;
            }
          }
          if (typeof cur === 'string') return cur;
        }
        return base.t(key, params);
      },
    } as LocaleApi;
  };

  // 把覆盖后的 LocaleApi 注入子树，让各自 useLocale() 的子组件（MonthsGrid/Footer/YearAndMonth/
  // QuickControl/Month）同样吃到 locale/localeCode 覆盖（对齐 Semi 由 LocaleConsumer 统一注入）。
  const parentLocaleCtx = getContext<LocaleContextValue | undefined>(LOCALE_CONTEXT_KEY);
  setContext<LocaleContextValue>(LOCALE_CONTEXT_KEY, {
    get current() { return loc(); },
    get resolved() { return parentLocaleCtx?.resolved as LocaleContextValue['resolved']; },
    get timeZone() { return parentLocaleCtx?.timeZone; },
    get currency() { return parentLocaleCtx?.currency; },
  });

  // ConfigProvider timeZone 注入（自身 timeZone 优先，对齐 Semi index.tsx）。
  const configCtx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  const configTimeZone = $derived(configCtx?.current.timeZone);

  // foundation：值模型/格式化/open（rune 工厂，getProps 回调跨文件响应式）。
  const fProps: DatePickerFoundationProps = {
    get type() { return type; },
    get value() { return value; },
    get defaultValue() { return defaultValue; },
    get open() { return openProp; },
    get defaultOpen() { return defaultOpen; },
    get multiple() { return multiple; },
    get format() { return format; },
    get locale() { return loc().code; },
    get rangeSeparator() { return rangeSeparator ?? strings.DEFAULT_SEPARATOR_RANGE; },
    get timeZone() { return timeZone; },
    get configTimeZone() { return configTimeZone; },
    showSecond: true,
    get dateFnsLocale() { return dateFnsLocale; },
    // date 单值：foundation onChange 抛 Date|null，直接透传（RangeValue 分支此里程碑不涉及）。
    get onChange() { return onChange as DatePickerFoundationProps['onChange']; },
    get needConfirm() { return needConfirm; },
    get onChangeWithDateFirst() { return onChangeWithDateFirst; },
    get onOpenChange() { return onOpenChange; },
  };
  const st = createDatePickerState(() => fProps);

  // 受控显示：单值/多选 → selected Set（fullDate 字符串，对齐 Semi）。MonthsGrid 自管面板游标。
  const selectedSet = $derived.by(() => {
    const s = new Set<string>();
    if (st.isRange) return s;
    if (multiple && Array.isArray(st.panelValue)) {
      for (const d of st.panelValue) if (d instanceof Date) s.add(dateFnsFormat(d, 'yyyy-MM-dd'));
    } else if (st.panelSingle instanceof Date) {
      s.add(dateFnsFormat(st.panelSingle, 'yyyy-MM-dd'));
    }
    return s;
  });
  // range 反解：currentRange（墙上时间）→ rangeStart/End 字符串传 MonthsGrid。
  // 内部串固定 yyyy-MM-dd(HH:mm:ss)：MonthsGrid/Month 靠它做同日比较与区间判定，不能跟随展示 format。
  const rangeToken = $derived(st.isDateTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd');
  const rangeStartStr = $derived(
    st.isRange && st.panelRange[0] ? dateFnsFormat(st.panelRange[0]!, rangeToken) : '',
  );
  const rangeEndStr = $derived(
    st.isRange && st.panelRange[1] ? dateFnsFormat(st.panelRange[1]!, rangeToken) : '',
  );
  // range 触发器展示串：走 type 的默认 format（对齐 Semi getDefaultFormatTokenByType），
  // 故 monthRange 显示 yyyy-MM 而非内部比较用的 yyyy-MM-dd；用户传 format 时以其为准。
  const displayToken = $derived(format ?? getDefaultFormatTokenByType(type) ?? rangeToken);
  const rangeSep = $derived(rangeSeparator ?? strings.DEFAULT_SEPARATOR_RANGE);
  const rangeStartDisplay = $derived(
    st.isRange && st.currentRange[0] ? dateFnsFormat(st.currentRange[0]!, displayToken) : '',
  );
  const rangeEndDisplay = $derived(
    st.isRange && st.currentRange[1] ? dateFnsFormat(st.currentRange[1]!, displayToken) : '',
  );
  // 两端都为空时必须回空串，**不能返回裸分隔符** —— 对齐 Semi formatText
  // （dateInput.tsx:131 `value && value.length ? formatShowText(value) : ''`）。
  // 双框 range 触发器下裸分隔符看不出来（分隔符本就是独立元素），但 monthRange 走单框，
  // 裸 ' ~ ' 会成为 input 的 value 顶掉 placeholder，触发器只显示一个「~」。
  const rangeTriggerValue = $derived(
    st.isRange && (rangeStartDisplay || rangeEndDisplay)
      ? `${rangeStartDisplay}${rangeSep}${rangeEndDisplay}`
      : '',
  );
  // range 端聚焦（对齐 Semi handleRangeInputFocus）：更新 rangeInputFocus + 打开面板。
  function handleRangeFocus(_e: Event, rangeType: 'rangeStart' | 'rangeEnd') {
    if (disabled) return;
    rangeInputFocus = rangeType;
    // 主动把焦点落到对应端的 input（照搬 Semi adapter.setRangeInputFocus：不只改 state，
    // 还 `inputNode.focus({ preventScroll })`）。漏掉则点 wrapper 空白处只亮 -active，
    // 焦点留在 body，用户无法接着键入日期。
    const inputs = triggerInputs();
    const target = rangeType === 'rangeEnd' ? inputs[1] : inputs[0];
    if (target && document.activeElement !== target) target.focus({ preventScroll });
    st.setOpen(true);
  }
  // rangeEnd 框按 Tab（对齐 Semi handleRangeEndTabPress → setRangeInputFocus(false)）：
  // 清焦点端，让 Tab 自然移焦出触发器（不阻止默认，不强制关面板，严格对齐 Semi）。
  function handleRangeEndTab(_e: KeyboardEvent) {
    rangeInputFocus = false;
  }

  // 手动输入态（对齐 Semi inputValue）：正在编辑时 inputValue 非 null，展示以它为准；
  // 提交/关闭后回 null，展示回落 formattedValue/rangeTriggerValue。inset 时强制只读（对齐 Semi）。
  const effectiveReadOnly = $derived(inputReadOnly || insetInput);
  // insetInput 打开面板后禁用触发器（对齐 Semi handlePanelVisibleChange + inputDisabled =
  // `disabled || insetInput && triggerDisabled`）：触发器 disabled 后光标自然留在面板内嵌输入框，
  // 用户可直接键入日期；关闭时恢复。
  let triggerDisabled = $state(false);
  const effectiveDisabled = $derived(disabled || (insetInput && triggerDisabled));

  // 浮层位置/间距（照搬 Semi index.tsx:53-65）：insetInput 未显式指定 position 时用
  // `leftTopOver`——面板顶端与触发器顶端对齐并**覆盖住触发器**（面板内已有内嵌输入框，
  // 无需再露出触发器）；position 含 'Over' 且未指定 spacing 时用 1px，避免左上角圆角漏边。
  const effectivePosition = $derived<Position>(
    position ?? (insetInput ? (strings.POSITION_INLINE_INPUT as Position) : 'bottomLeft'),
  );
  const effectiveSpacing = $derived(
    spacing ?? (effectivePosition.includes('Over') ? numbers.SPACING_INSET_INPUT : numbers.SPACING),
  );
  let inputValue = $state<string | null>(null);
  // 自增以重挂 InsetInput、丢弃其本地编辑态（对齐 Semi updateInsetInputValue(null)）。
  let insetInputReset = $state(0);
  // MonthsGrid 引用（手输提交后命令面板跳到输入值的月份）。
  let monthsGridRef = $state<{ syncPanelTo: (base: Date) => void } | undefined>();
  // 触发器根元素（autoFocus 挂载聚焦用）。
  let triggerEl = $state<HTMLElement | undefined>();
  // autoFocus（对齐 Semi）：挂载时聚焦触发器内 input（preventScroll 控制是否阻止滚动）。
  $effect(() => {
    if (autoFocus && triggerEl) {
      const inp = triggerEl.querySelector('input');
      inp?.focus({ preventScroll });
    }
  });

  // 提交手输并让面板跳到解析值的月份（对齐 Semi：value 变化时面板重定位）。
  function commitInput(v: string) {
    const parsed = st.parseInput(v);
    st.handleInputComplete(v);
    if (parsed.length && parsed[0]) monthsGridRef?.syncPanelTo(parsed[0]);
  }

  // 单值手动输入变化（对齐 Semi handleChange → 更新 inputValue）。
  function handleInputChange(v: string) {
    inputValue = v;
  }
  // range 手动输入变化（对齐 Semi handleRangeInputChange → 拼 `start${sep}end` 更新 inputValue）。
  function handleRangeInputChange(rangeStart: string, rangeEnd: string) {
    inputValue = `${rangeStart}${rangeSep}${rangeEnd}`;
  }
  // 回车提交（对齐 Semi handleRangeInputEnterPress/notifyEnter → handleInputComplete）。
  function handleEnterPress() {
    if (inputValue !== null) {
      commitInput(inputValue);
      inputValue = null;
    }
  }

  // 面板关闭：提交未决输入并清编辑态（对齐 Semi 关闭时 handleInputComplete，展示回落 formattedValue）。
  // 仅在 open 由 true→false 的转换时提交（否则面板常闭时每次输入都会被误清空）。
  let prevOpen = st.isOpen;
  $effect(() => {
    const nowOpen = st.isOpen;
    if (prevOpen && !nowOpen) {
      if (inputValue !== null) {
        const pending = inputValue;
        inputValue = null;
        commitInput(pending);
      }
      // 关闭面板即清 range 聚焦端（对齐 Semi close → resetInnerSelectedStates → resetFocus）。
      // 漏掉会让触发器起/止框的 -active 高亮在失焦后一直留着。
      if (st.isRange) rangeInputFocus = false;
      // insetInput：关闭时恢复触发器可用（对齐 Semi handlePanelVisibleChange 的 else 分支）。
      triggerDisabled = false;
    }
    // insetInput 打开：聚焦面板内嵌输入框 + 下一帧禁用触发器
    //（照搬 Semi handlePanelVisibleChange：setInsetInputFocus() 后 setTimeout 里 setTriggerDisabled(true)，
    // 延后是为了让聚焦先落定——先禁用会让触发器抢在聚焦前失焦到 body）。
    if (!prevOpen && nowOpen && insetInput) {
      queueMicrotask(() => {
        // 浮层 portal 到 body，故全局查询（同一时刻只会有本组件的面板处于刚打开态）。
        const first = document.querySelector<HTMLInputElement>(
          '.cd-datepicker-inset-input-wrapper input',
        );
        first?.focus({ preventScroll });
        setTimeout(() => {
          triggerDisabled = true;
        }, 0);
      });
    }
    prevOpen = nowOpen;
  });
  // 面板初始定位月：选中值 / range 起点 / defaultPickerValue（可为数组，分别定位左右面板）/ 今天。
  const panelPickerValue = $derived<Date | Date[] | undefined>(
    (st.panelSingle instanceof Date ? st.panelSingle : null) ?? st.panelRange[0] ?? defaultPickerValue,
  );

  // range 焦点端（双 Input 联动占位；单 Input 阶段用本地流转，对齐 Semi rangeInputFocus）。
  let rangeInputFocus = $state<'rangeStart' | 'rangeEnd' | false>(false);

  // 触发器展示文案（foundation formattedValue）。
  const triggerText = $derived(st.formattedValue);
  // 占位按 type 分派（照搬 Semi：locale.placeholder 是 { date, dateTime, *Range: [start, end] }，
  // 经 component('DatePicker') 拿整片后属性访问取值，range 取数组两端）。
  // placeholder prop 支持 string | [start, end]（对齐 Semi），传入时优先。
  const localePh = $derived(loc().component('DatePicker').placeholder);
  const phDefault = $derived(type === 'dateTime' ? localePh.dateTime : localePh.date);
  const phRangeDefault = $derived(
    type === 'monthRange'
      ? localePh.monthRange
      : type === 'dateTimeRange'
        ? localePh.dateTimeRange
        : localePh.dateRange,
  );
  // 单框 placeholder（date/dateTime/month，以及**单框的 monthRange**）。
  // monthRange 走单框（对齐 Semi isRenderMultipleInputs），其 placeholder 规则见
  // dateInput.tsx:459：placeholder 为数组时用 `[0] + rangeSeparator + [1]` 拼成一条，
  // 否则原样使用；未传 placeholder 时回落 locale 的 monthRange 两端拼串。
  const phText = $derived.by(() => {
    if (type === 'monthRange') {
      if (Array.isArray(placeholder)) {
        return `${placeholder[0] ?? ''}${rangeSeparator}${placeholder[1] ?? ''}`;
      }
      if (placeholder !== undefined) return placeholder;
      return `${phRangeDefault[0] ?? ''}${rangeSeparator}${phRangeDefault[1] ?? ''}`;
    }
    return Array.isArray(placeholder) ? (placeholder[0] ?? phDefault) : (placeholder ?? phDefault);
  });
  const phStart = $derived(
    Array.isArray(placeholder) ? (placeholder[0] ?? phRangeDefault[0]) : (placeholder ?? phRangeDefault[0]),
  );
  const phEnd = $derived(
    Array.isArray(placeholder) ? (placeholder[1] ?? phRangeDefault[1]) : (placeholder ?? phRangeDefault[1]),
  );
  // 触发器展示值：编辑中用 inputValue，否则 range 用双端串、单值用 formattedValue。
  const triggerDisplay = $derived(
    inputValue !== null ? inputValue : st.isRange ? rangeTriggerValue : triggerText,
  );

  function openPanel() {
    if (disabled) return;
    st.setOpen(true);
  }

  // ===== 命令式方法（对齐 Semi open/close/focus/blur；本库无静态方法，走 export function + bind:this）=====
  /** 触发器内的原生输入框（range 时按 focusType 取第 1/2 个）。 */
  function triggerInputs(): HTMLInputElement[] {
    return triggerEl ? Array.from(triggerEl.querySelectorAll('input')) : [];
  }

  /** 手动展开面板（对齐 Semi open）。 */
  export function open(): void {
    st.setOpen(true);
  }

  /** 手动关闭面板（对齐 Semi close）。 */
  export function close(): void {
    st.setOpen(false);
  }

  /** 手动聚焦输入框（对齐 Semi focus）：range 时按 focusType 落到起止端，默认 rangeStart。 */
  export function focus(focusType?: 'rangeStart' | 'rangeEnd'): void {
    const inputs = triggerInputs();
    if (st.isRange) {
      const which = focusType ?? 'rangeStart';
      rangeInputFocus = which;
      const target = which === 'rangeEnd' ? inputs[1] : inputs[0];
      target?.focus({ preventScroll });
    } else {
      inputs[0]?.focus({ preventScroll });
    }
  }

  /** 手动失焦输入框（对齐 Semi blur）。 */
  export function blur(): void {
    if (st.isRange) rangeInputFocus = false;
    for (const el of triggerInputs()) el.blur();
  }

  // needConfirm 由 foundation 承载暂存层（对齐 Semi cachedSelectedValue）：
  // 面板选择只写 cached*，value/onChange 不动；confirm 才 commit、cancel/关闭直接丢弃暂存。
  const effectiveNeedConfirm = $derived(st.needConfirm);

  // MonthsGrid 选中回调（Date[] 墙上时间域）→ 联动值模型 foundation。
  function handleSelectedChange(dates: Date[]) {
    if (st.isRange) {
      // range：dates=[start(,end)]；完整两端才关闭面板（needConfirm 时不自动关，等确认）。
      const pair: [Date | null, Date | null] = [dates[0] ?? null, dates[1] ?? null];
      st.handleRangeSelectedChange(pair);
      // autoSwitchDate（对齐 Semi）：选完起点未选止点时自动切焦点到 rangeEnd 框。
      if (autoSwitchDate && pair[0] && !pair[1]) rangeInputFocus = 'rangeEnd';
      // 仅 dateRange 选完两端自动关（对齐 Semi foundation:1019）；dateTimeRange 还要选时间，保持打开。
      if (type === 'dateRange' && pair[0] && pair[1] && !effectiveNeedConfirm) st.setOpen(false);
    } else if (multiple) {
      // 多选：dates=当前全部选中日；抛数组、不关面板（继续 toggle，对齐 Semi）。
      st.handleSelectedChange(dates);
    } else {
      st.handleSelectedChange(dates[0] ?? null);
      // 仅 type=date 选完即关（对齐 Semi foundation:1019 的
      // `type === 'date' && !multiple && closePanel`）；dateTime/month 等还要继续选，保持打开。
      if (type === 'date' && !effectiveNeedConfirm) st.setOpen(false);
    }
  }

  // Footer 确认（对齐 Semi handleConfirm）：提交暂存值（updateValue + onChange）→ 关面板 → notifyConfirm。
  function handleConfirm() {
    const { notifyValue, notifyDate } = st.commitCached();
    st.setOpen(false);
    onConfirm?.(notifyDate as Date | Date[] | RangeValue | null, notifyValue as string);
  }
  // Footer 取消（对齐 Semi handleCancel）：丢弃暂存（value 从未被改过，无需回滚）→ 关面板 → notifyCancel。
  function handleCancel() {
    const cur = st.isRange ? st.currentRange : st.current;
    st.clearCached();
    st.setOpen(false);
    const { notifyValue, notifyDate } = st.disposeCallbackArgs(cur as Date | Date[] | null);
    onCancel?.(notifyDate as Date | Date[] | RangeValue | null, notifyValue as string);
  }

  // 清空 —— 对齐 Semi handleRangeInputClear / handleInputClear（foundation.ts:617-628）：
  // 除写空值外还要 ① 清编辑中的 inputValue（否则触发器仍显示手输残留）
  // ② 清 insetInputValue（updateInsetInputValue(null)）③ 复位 rangeInputFocus
  // （setRangeInputFocus(false)，否则清空后触发器仍留 -active 高亮）。
  function handleClear(e?: MouseEvent) {
    if (st.isRange) st.handleRangeSelectedChange([null, null]);
    else st.handleSelectedChange(null);
    inputValue = null;
    insetInputReset += 1;
    rangeInputFocus = false;
    if (e) onClearProp?.(e);
  }

  // 面板月切换（对齐 Semi notifyPanelChange）：foundation 抛新游标日期 → 格式化 dateString → 通知用户。
  function handlePanelChange(date: Date) {
    const token = st.isDateTime ? 'yyyy-MM-dd HH:mm:ss' : st.isMonth ? 'yyyy-MM' : 'yyyy-MM-dd';
    onPanelChange?.(date, dateFnsFormat(date, token));
  }

  // ===== year/month/monthRange：面板走 YearAndMonth 滚轮（对齐 Semi typeIsYearOrMonth）=====
  const typeIsYearOrMonth = $derived(st.isMonth || st.isYear);
  // currentYear/Month 从 value 反解（{left,right}，对齐 Semi renderYearMonthPanel）。
  const ymYear = $derived.by(() => {
    const y = { left: 0, right: 0 };
    if (st.panelSingle instanceof Date) y.left = st.panelSingle.getFullYear();
    if (type === 'monthRange') {
      if (st.panelRange[0]) y.left = st.panelRange[0]!.getFullYear();
      if (st.panelRange[1]) y.right = st.panelRange[1]!.getFullYear();
    }
    return y;
  });
  const ymMonth = $derived.by(() => {
    const m = { left: 0, right: 0 };
    if (st.panelSingle instanceof Date) m.left = st.panelSingle.getMonth() + 1;
    if (type === 'monthRange') {
      if (st.panelRange[0]) m.left = st.panelRange[0]!.getMonth() + 1;
      if (st.panelRange[1]) m.right = st.panelRange[1]!.getMonth() + 1;
    }
    return m;
  });

  // handleYMSelectedChange —— 对齐 Semi foundation.handleYMSelectedChange。
  function handleYMSelectedChange(obj: {
    currentYear: { left: number; right: number };
    currentMonth: { left: number; right: number };
  }) {
    const { currentYear, currentMonth } = obj;
    if (type === 'monthRange') {
      const left = new Date(currentYear.left, currentMonth.left - 1);
      const right = new Date(currentYear.right, currentMonth.right - 1);
      st.handleRangeSelectedChange([left, right]);
    } else {
      const date = new Date(currentYear.left, currentMonth.left - 1);
      st.handleSelectedChange(date);
    }
  }

  // handlePresetClick —— 对齐 Semi foundation.handlePresetClick：preset start/end（可为函数/string/number/Date）
  // → Date，按 type 选值。single 用 start；range 用 [start,end]。
  function toPresetDate(v: BaseValueType | (() => BaseValueType) | undefined): Date | null {
    const raw = typeof v === 'function' ? v() : v;
    if (raw == null) return null;
    const d = raw instanceof Date ? raw : new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  function handlePresetClick(preset: PresetType, e: MouseEvent) {
    const start = toPresetDate(preset.start);
    const end = toPresetDate(preset.end);
    if (st.isRange) {
      // range 走 needCheckFocusRecord:false（对齐 Semi：preset 一次性给齐两端，
      // 不参与「先点起始再点结束」的焦点记录流转）。
      st.handleRangeSelectedChange([start, end]);
    } else if (start) {
      st.handleSelectedChange(start);
    }
    // **不关面板** —— 对齐 Semi handlePresetClick（foundation.ts:1069-1092）：
    // 它只 handleSelectedChange + notifyPresetsClick，全程不碰 open 状态，
    // 用户点完 preset 还能继续在面板里调时间/改日期。
    onPresetClick?.(preset, e);
  }

  // ===== insetInput：面板内输入框 → 解析成 value 提交（对齐 Semi handleInsetInputChange 链）=====
  // inset 当前 value 数组（供 InsetInput 反解显示）。
  const insetValue = $derived<Array<Date | null>>(
    st.isRange
      ? [st.currentRange[0], st.currentRange[1]]
      : st.currentSingle instanceof Date
        ? [st.currentSingle]
        : [],
  );
  const insetFormat = $derived(getInsetInputFormatToken({ type, format }));

  function parseInsetOne(s: string): Date | null {
    const t = s.trim();
    if (!t) return null;
    const d = dateFnsParse(t, insetFormat, new Date());
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // onInsetChange —— insetInputStr 拼串 → 按 type 解析成 Date(s) → 提交（两端完整才 range 通知）。
  function onInsetChange(insetInputStr: string) {
    if (st.isRange) {
      const [ls = '', rs = ''] = insetInputStr.split(strings.DEFAULT_SEPARATOR_RANGE);
      st.handleRangeSelectedChange([parseInsetOne(ls), parseInsetOne(rs)]);
    } else {
      st.handleSelectedChange(parseInsetOne(insetInputStr));
    }
  }

  const disabledDateWrap = $derived(
    disabledDate
      ? (date: Date, options?: unknown) =>
          disabledDate!(
            date,
            options as { rangeStart: string; rangeEnd: string; rangeInputFocus: 'rangeStart' | 'rangeEnd' | false } | undefined,
          )
      : undefined,
  );
  const monthsGridRest = $derived({
    ...(disabledDateWrap ? { disabledDate: disabledDateWrap } : {}),
    ...(panelPickerValue ? { defaultPickerValue: panelPickerValue } : {}),
    ...(startYear !== undefined ? { startYear } : {}),
    ...(endYear !== undefined ? { endYear } : {}),
  });
  const dateInputRest = $derived({
    ...(validateStatus !== undefined ? { validateStatus } : {}),
    ...(onFocus ? { onfocus: onFocus } : {}),
    ...(onBlur ? { onblur: onBlur } : {}),
    ...(borderless ? { borderless } : {}),
    ...(insetLabel !== undefined ? { insetLabel } : {}),
    ...(prefix !== undefined ? { prefix } : {}),
    ...(clearIcon !== undefined ? { clearIcon } : {}),
    ...(inputStyle !== undefined ? { inputStyle } : {}),
    ...(insetLabelId !== undefined ? { insetLabelId } : {}),
    ...(rangeSeparatorNode !== undefined ? { rangeSeparatorNode } : {}),
  });
</script>

<div class={`${PREFIX}${className ? ` ${className}` : ''}`} {...(style ? { style } : {})}>
  <!-- guardFocus={false}：不陷入焦点（对齐 Semi——datePicker.tsx 的 Popover 未开 trapFocus，
       打开后焦点留在触发器 input，用户可继续键入日期）。本库 Tooltip 的 guardFocus 缺省随
       role=dialog 自动开启，会把焦点抢到面板首个按钮上，与 Semi 不符。 -->
  <Popover
    trigger="custom"
    visible={st.isOpen}
    position={effectivePosition}
    {autoAdjustOverflow}
    {motion}
    {stopPropagation}
    guardFocus={false}
    {...(zIndex !== undefined ? { zIndex } : {})}
    {...(getPopupContainer ? { getPopupContainer } : {})}
    {...(dropdownMargin !== undefined ? { margin: dropdownMargin } : {})}
    spacing={effectiveSpacing}
    onVisibleChange={(v) => {
      // 面板由 open→false（外部点击/Esc 等 Popover 自身关闭）时触发 onClickOutSide（对齐 Semi）。
      if (!v && st.isOpen) onClickOutSide?.();
      st.setOpen(v);
    }}
  >
    {#snippet content()}
      <div
        class={`${typeIsYearOrMonth ? `${PREFIX} ${PREFIX}-panel-yam` : PREFIX}${density === 'compact' ? ` ${PREFIX}-compact` : ''}${dropdownClassName ? ` ${dropdownClassName}` : ''}`}
        {...{ 'x-type': type }}
        {...{ 'x-insetinput': insetInput ? 'true' : 'false' }}
        {...(dropdownStyle ? { style: dropdownStyle } : {})}
      >
        <div class={`${PREFIX}-container`}>
          <!-- leftSlot（对齐 Semi：container 内最左） -->
          {#if leftSlot}<div class={`${PREFIX}-leftSlot`}>{@render leftSlot()}</div>{/if}
          <!-- preset left（对齐 Semi，monthRange 暂不支持 preset） -->
          {#if presetPosition === 'left' && presets.length && type !== 'monthRange'}
            <QuickControl {type} {presets} presetPosition="left" onPresetClick={handlePresetClick} />
          {/if}
          <div>
            <!-- 面板顶部 slot（对齐 Semi topSlot：container 内 div 顶部） -->
            {#if topSlot}<div class={`${PREFIX}-topSlot`}>{@render topSlot()}</div>{/if}
            <!-- insetInput：面板内输入框（对齐 Semi renderDateInput，面板顶部） -->
            {#if insetInput}
              <!-- key 上 insetInputReset：清空时自增以重挂 InsetInput，丢弃其 localInset
                   本地编辑态（对齐 Semi adapter.updateInsetInputValue(null)）。 -->
              {#key insetInputReset}
                <InsetInput
                  {type}
                  value={insetValue}
                  {format}
                  rangeSeparator={strings.DEFAULT_SEPARATOR_RANGE}
                  onInsetChange={onInsetChange}
                />
              {/key}
            {/if}
            <!-- preset top -->
            {#if presetPosition === 'top' && presets.length && type !== 'monthRange'}
              <QuickControl {type} {presets} presetPosition="top" onPresetClick={handlePresetClick} />
            {/if}
            {#if typeIsYearOrMonth}
              <YearAndMonth
                {type}
                currentYear={ymYear}
                currentMonth={ymMonth}
                noBackBtn
                monthCycled
                localeCode={loc().code}
                onSelect={handleYMSelectedChange}
                {...(yearAndMonthOpts ? { scrollItemProps: yearAndMonthOpts } : {})}
                {...(disabledDateWrap ? { disabledDate: disabledDateWrap } : {})}
                {...(startYear !== undefined ? { startYear } : {})}
                {...(endYear !== undefined ? { endYear } : {})}
              />
            {:else}
              <MonthsGrid
                bind:this={monthsGridRef}
                {type}
                selected={selectedSet}
                rangeStart={rangeStartStr}
                rangeEnd={rangeEndStr}
                {rangeInputFocus}
                setRangeInputFocus={(f) => (rangeInputFocus = f)}
                {weekStartsOn}
                {multiple}
                {density}
                {syncSwitchMonth}
                {...(max !== undefined ? { max } : {})}
                {...(onMaxLimit ? { onMaxLimit } : {})}
                {...(disabledTime ? { disabledTime } : {})}
                {...(disabledTimePicker ? { disabledTimePicker } : {})}
                {...(renderDate ? { renderDate } : {})}
                {...(renderFullDate ? { renderFullDate } : {})}
                {...(startDateOffset ? { startDateOffset } : {})}
                {...(endDateOffset ? { endDateOffset } : {})}
                {...(timePickerOpts ? { timePickerOpts } : {})}
                {hideDisabledOptions}
                onSelectedChange={handleSelectedChange}
                {...(onPanelChange ? { onPanelChange: handlePanelChange } : {})}
                {...monthsGridRest}
              />
            {/if}
            <!-- preset bottom -->
            {#if presetPosition === 'bottom' && presets.length && type !== 'monthRange'}
              <QuickControl {type} {presets} presetPosition="bottom" onPresetClick={handlePresetClick} />
            {/if}
            <!-- 面板底部 slot（对齐 Semi bottomSlot：container 内 div 底部） -->
            {#if bottomSlot}<div class={`${PREFIX}-bottomSlot`}>{@render bottomSlot()}</div>{/if}
          </div>
          <!-- preset right -->
          {#if presetPosition === 'right' && presets.length && type !== 'monthRange'}
            <QuickControl {type} {presets} presetPosition="right" onPresetClick={handlePresetClick} />
          {/if}
          <!-- rightSlot（对齐 Semi：container 内最右） -->
          {#if rightSlot}<div class={`${PREFIX}-rightSlot`}>{@render rightSlot()}</div>{/if}
        </div>
        <!-- needConfirm 确认栏（对齐 Semi footer.tsx）：range 未完整时禁用确认。 -->
        {#if effectiveNeedConfirm}
          <Footer
            disabledConfirm={st.isRange && !(st.currentRange[0] && st.currentRange[1])}
            onConfirmClick={handleConfirm}
            onCancelClick={handleCancel}
          />
        {/if}
      </div>
    {/snippet}

    <!-- 触发器：combobox wrapper（对齐 Semi renderInner，Semi 亦 eslint-disable role-has-required-aria-props：
         combobox 语义靠 Input，aria-controls 不强挂）。点击打开面板。 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_role_has_required_aria_props -->
    <div
      bind:this={triggerEl}
      class={`${PREFIX}-input`}
      role="combobox"
      aria-label={triggerText ? 'Change date' : 'Choose date'}
      aria-expanded={st.isOpen}
      aria-disabled={disabled || undefined}
      tabindex="-1"
      onclick={openPanel}
    >
      {#if triggerRender}
        <!-- 完全自定义触发器（对齐 Semi triggerRender）：替换默认 DateInput。 -->
        {@render triggerRender({ value: triggerDisplay, placeholder: phText, open: st.isOpen, disabled })}
      {:else}
      <DateInput
        {type}
        value={triggerDisplay}
        placeholder={phText}
        startPlaceholder={phStart}
        endPlaceholder={phEnd}
        disabled={effectiveDisabled}
        {showClear}
        showClearIgnoreDisabled={insetInput}
        inputReadOnly={effectiveReadOnly}
        {size}
        onClear={handleClear}
        onChange={handleInputChange}
        onEnterPress={handleEnterPress}
        rangeSeparator={rangeSep}
        {rangeInputFocus}
        onRangeFocus={handleRangeFocus}
        onRangeChange={handleRangeInputChange}
        onRangeEndTab={handleRangeEndTab}
        onRangeClear={handleClear}
        {...dateInputRest}
      />
      {/if}
    </div>
  </Popover>
</div>

<style>
  /* 面板容器 —— 对齐 Semi datePicker.scss .datepicker / -container。
     面板视觉外壳（背景/阴影/圆角）由 Popover popup card 承担；此处只做布局。 */
  :global(.cd-datepicker) {
    box-sizing: border-box;
    display: inline-block;
  }
  :global(.cd-datepicker-container) {
    display: flex;
  }
  /* density=compact —— 对齐 Semi datePicker.scss `.semi-datepicker-compact`。
     覆写尺寸变量即可让下游（day / day-main / month 宽 / weeks 高）整体跟随，
     实测 Semi compact：day 28×28 / day-main 24 / font-size 12 / line-height 20 /
     month padding 10 / weekday 行高 28。 */
  :global(.cd-datepicker-compact) {
    --cd-width-date-picker-day: var(--cd-width-date-picker-day-compact, 28px);
    --cd-width-date-picker-day-main: var(--cd-width-date-picker-day-main-compact, 24px);
    --cd-radius-date-picker-day-main: 4px;
    font-size: var(--cd-font-size-small, 12px);
    line-height: 20px;
  }
  /* month 内边距 16→10（Semi $spacing-datepicker_month_compact-padding）。
     本库 month 是 content-box + width=day×7 + 自身 padding，与 Semi「padding 放 weeks/weekday」
     结构不同但等效；此处沿用本库模型只换值，避免把 padding 挪到 weeks 后挤压日格宽度。 */
  /* 照搬 Semi compact（datePicker.scss:1369-1372）：month 自身 `padding: 0` + 固定宽，
     横向内边距交给 weeks/weekday 承担。**不可两层都加**——month 留 10 再给子级各加 10
     会双重内缩，内容宽不足 7 列致星期行折行（日一二三四五 / 六）。 */
  :global(.cd-datepicker-compact .cd-datepicker-month) {
    width: calc(
      var(--cd-width-date-picker-day-compact, 28px) * 7 +
        var(--cd-spacing-date-picker-weeks-compact-padding, 10px) * 2
    );
    padding: 0;
  }
  /* 日期网格顶部留白（Semi $spacing-datepicker_weeks_compact-paddingTop = $spacing-tight - 2 = 6）。 */
  /* 照搬 Semi compact：`padding: 10` 四边，再单独覆盖 padding-top（spacing-tight - 2 = 6）。
     此前只写了 padding-top，横向为 0 → 日格与上方 weekday（paddingX 10）错列。 */
  :global(.cd-datepicker-compact .cd-datepicker-weeks) {
    padding: var(--cd-spacing-date-picker-weeks-compact-padding, 10px);
    padding-top: var(--cd-spacing-date-picker-weeks-compact-padding-top, 6px);
  }
  /* 星期行：照搬 Semi compact 的变量式算高
     `height: $spacing-tight + $width-datepicker_day_compact`（8 + 28 = 36），
     paddingX 10 / paddingBottom $spacing-tight。写死 36 会在 day 尺寸 token 改动时脱节。 */
  :global(.cd-datepicker-compact .cd-datepicker-weekday) {
    box-sizing: border-box;
    height: calc(var(--cd-spacing-tight, 8px) + var(--cd-width-date-picker-day-compact, 28px));
    /* paddingX 10（Semi $spacing-datepicker_weekday_compact-paddingLeft/Right）——
       与下方 weeks 的 padding 10 对齐，星期标题才与日格同列。
       此前注释写了 paddingX 10 但规则漏掉，星期行贴着面板边缘。 */
    padding-left: var(--cd-spacing-date-picker-weeks-compact-padding, 10px);
    padding-right: var(--cd-spacing-date-picker-weeks-compact-padding, 10px);
    padding-bottom: var(--cd-spacing-date-picker-weekday-compact-padding-bottom, 8px);
  }
  /* 日格字号跟随 compact（默认 14 → 12）。 */
  :global(.cd-datepicker-compact .cd-datepicker-day) {
    font-size: var(--cd-font-size-small, 12px);
  }
  /* 星期行项高 28（Semi $lineHeight-datepicker_weekday_item_compact）。 */
  :global(.cd-datepicker-compact .cd-datepicker-weekday-item) {
    line-height: 28px;
  }

  /* tpk/yam 打开时的面板保底尺寸（照搬 Semi `-yam-showing`）：日历被卸载后容器会塌到
     内容宽（实测 180，Semi 284），靠这条撑住；date 类型的最小高比 dateTime 略矮。 */
  :global(.cd-datepicker-yam-showing) {
    min-width: var(--cd-width-date-picker-yam-showing-min, 284px);
    min-height: var(--cd-height-date-picker-yam-showing-min, 378px);
  }
  :global(.cd-datepicker[x-type='date'] .cd-datepicker-yam-showing) {
    min-height: var(--cd-height-date-picker-date-type-yam-showing-min, 325px);
  }

  /* insetInput 下的面板尺寸（照搬 Semi datePicker.scss 77-104 的 `[x-insetinput=true]`）：
     面板顶部多了一行内嵌输入框，故 yam/tpk 覆盖层的保底高与导航栏内边距都另有一套值；
     tpk/yam 走 100%（由 month-grid 的 min-height 撑），不再沿用默认的固定高。 */
  :global(.cd-datepicker[x-insetinput='true'] .cd-datepicker-month-grid-left[x-open-type='year']),
  :global(.cd-datepicker[x-insetinput='true'] .cd-datepicker-month-grid-right[x-open-type='year']) {
    min-height: var(--cd-height-date-picker-month-grid-year-type-inset-input, 317px);
  }
  :global(.cd-datepicker[x-insetinput='true'] .cd-datepicker-month-grid-left[x-open-type='time']),
  :global(.cd-datepicker[x-insetinput='true'] .cd-datepicker-month-grid-right[x-open-type='time']) {
    min-height: var(--cd-height-date-picker-month-grid-time-type-inset-input, 317px);
  }
  :global(.cd-datepicker[x-insetinput='true'] .cd-datepicker-navigation) {
    padding-top: var(--cd-spacing-date-picker-navigation-inset-input-padding-y, 8px);
    padding-bottom: var(--cd-spacing-date-picker-navigation-inset-input-padding-y, 8px);
  }
  :global(.cd-datepicker[x-insetinput='true'] .cd-datepicker-tpk) {
    min-height: 100%;
  }
  :global(.cd-datepicker[x-insetinput='true'][x-type='dateTime'] .cd-datepicker-yam),
  :global(.cd-datepicker[x-insetinput='true'][x-type='dateTimeRange'] .cd-datepicker-yam) {
    height: 100%;
  }

  /* compact 面板的保底宽高（照搬 Semi）：
     · min-width  = `$width-datepicker_month_compact` = day-compact(28)×7 + weeks padding(10)×2 = 216
       —— tpk/yam 是 position:absolute 覆盖层，盖住日历后容器会塌到内容宽（实测 128），靠它撑住；
     · min-height = `$height-datepicker_tpk_compact`(256) + `$height-datepicker_switch_compact`(32)
       —— 否则沿用默认 355，tpk 会按 355-54 撑到 301（Semi 是 256）。 */
  :global(.cd-datepicker-compact .cd-datepicker-month-grid-left),
  :global(.cd-datepicker-compact .cd-datepicker-month-grid-right) {
    min-width: calc(
      var(--cd-width-date-picker-day-compact, 28px) * 7 +
        var(--cd-spacing-date-picker-weeks-compact-padding, 10px) * 2
    );
  }
  /* 撑住 tpk/yam 覆盖层的保底高**只在覆盖层打开时生效**（Semi 把它挂在
     `.semi-datepicker-yam-showing` 上，见 datePicker.scss:1298）。
     此前无条件挂在 month-grid-* 上，纯日期面板也被撑高——内容仅需 248
     却被拉到 288，日期网格与 bottomSlot 之间空出 40px。 */
  :global(.cd-datepicker-compact .cd-datepicker-yam-showing) {
    min-height: calc(
      var(--cd-height-date-picker-tpk-compact, 256px) +
        var(--cd-height-date-picker-switch-compact, 32px)
    );
  }
  /* 切换条与时间面板高度：compact 下 switch 32（默认 54），tpk 相应改 calc(100% - 32)。 */
  :global(.cd-datepicker-compact .cd-datepicker-switch) {
    height: var(--cd-height-date-picker-switch-compact, 32px);
  }
  :global(.cd-datepicker-compact .cd-datepicker-tpk) {
    height: calc(100% - var(--cd-height-date-picker-switch-compact, 32px));
  }

  /* compact 下的内嵌输入（照搬 Semi datePicker.scss `.semi-datepicker-compact .semi-datepicker-inset-input`）：
     间距/宽度/输入高度全部收窄；range 类型宽度翻倍且 paddingTop 归零。 */
  :global(.cd-datepicker-compact .cd-datepicker-inset-input-wrapper) {
    column-gap: var(--cd-spacing-date-picker-inset-input-wrapper-compact-margin, 4px);
    padding: var(--cd-spacing-date-picker-inset-input-wrapper-compact-padding-y, 8px)
      var(--cd-spacing-date-picker-inset-input-wrapper-compact-padding-x, 8px);
    padding-bottom: var(--cd-spacing-date-picker-inset-input-wrapper-compact-padding-bottom, 0);
    width: var(--cd-width-date-picker-inset-input-date-type-wrapper-compact, 216px);
  }
  :global(.cd-datepicker-compact .cd-datepicker-inset-input-wrapper[x-type='dateRange']),
  :global(.cd-datepicker-compact .cd-datepicker-inset-input-wrapper[x-type='dateTimeRange']) {
    width: var(--cd-width-date-picker-inset-input-date-range-type-wrapper-compact, 432px);
    padding-top: 0;
  }
  :global(.cd-datepicker-compact .cd-datepicker-inset-input-wrapper[x-type='month']) {
    width: var(--cd-width-date-picker-inset-input-month-type-wrapper-compact, 195px);
  }
  :global(.cd-datepicker-compact .cd-datepicker-inset-input-wrapper .cd-input-wrapper) {
    box-sizing: border-box;
    height: var(--cd-height-date-picker-inset-input-wrapper-compact, 28px);
  }
  :global(.cd-datepicker-compact .cd-datepicker-inset-input-wrapper .cd-input) {
    font-size: var(--cd-font-size-date-picker-inset-input-compact-font-size, 12px);
    height: var(--cd-height-date-picker-inset-input-compact, 36px);
    line-height: var(--cd-height-date-picker-inset-input-compact, 36px);
    vertical-align: top;
  }

  /* compact 下的 ScrollList（tpk 时间列 / yam 年月列）——照搬 Semi datePicker.scss
     `.semi-datepicker-compact .semi-scrolllist`：小尺寸不显示 header、li 高 32、
     去中间分割线（wheel 模式）。 */
  :global(.cd-datepicker-compact .cd-scrolllist-header) {
    /* 小尺寸空间较小，不显示 scrolllist header（Semi 原样注释）。 */
    display: none;
  }
  :global(.cd-datepicker-compact .cd-scrolllist-list-outer > ul > li) {
    height: var(--cd-height-date-picker-yam-li-compact, 32px);
  }
  :global(.cd-datepicker-compact .cd-scrolllist-item-wheel) {
    /* 去除中间分割线（对齐 Semi）。 */
    border-right: 0;
  }
  /* 面板四向 slot 分割线（对齐 Semi datePicker.scss &-topSlot/-leftSlot/-rightSlot/-bottomSlot）。 */
  :global(.cd-datepicker-topSlot) {
    border-bottom: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }
  :global(.cd-datepicker-bottomSlot) {
    border-top: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }
  :global(.cd-datepicker-leftSlot) {
    border-right: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }
  :global(.cd-datepicker-rightSlot) {
    border-left: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }
  /* 触发器 wrapper（combobox） */
  :global(.cd-datepicker-input) {
    display: inline-block;
    inline-size: 100%;
  }
</style>
