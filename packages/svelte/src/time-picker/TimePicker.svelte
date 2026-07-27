<!--
  TimePicker — 严格对齐 Semi Design（semi-ui/timePicker/{TimePicker,Combobox,TimeInput}.tsx）。
  单选 type='time'：HH:mm:ss 三列滚动选择（+ 12h 制 AM/PM 列）。受控/非受控。
  type='timeRange'：左右两个 Combobox（ScrollList）并排选起止两端，值 [start, end]。
  时间列复用本库 ScrollList/ScrollItem（mode='normal'，选择走 onSelect，非自造 roving）。
  触发器复用本库 Input（可键入时间串，镜像 Semi TimeInput：<Input hideSuffix suffix={IconClock}>）。
  value/defaultValue 支持 Date | string（如 '12:30:45'），字符串经 core parseTimeString 解析。
  format 字符串（默认 'HH:mm:ss'）：经 core parseFormatSpec 决定显示列与 12h（showSecond = 含 ss）；
    显示经 core formatTime 序列化，否则走 Intl.DateTimeFormat（不手拼时间串）。
  列项/禁用集生成 + 格式解析/序列化走 @chenzy-design/core 纯函数（红线 #2）。
-->
<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import { CONFIG_CONTEXT_KEY, type ConfigContextValue } from '../config-provider/index.js';
  import {
    useId,
    useDismiss,
    meridiemOf,
    parseFormatSpec,
    formatTime,
    localeFormat,
    parseTimeString,
    utcToZonedTime,
    zonedTimeToUtc,
    isValidTimeZone,
  } from '@chenzy-design/core';
  import type { Placement } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Combobox from './Combobox.svelte';
  import TimeInput from './TimeInput.svelte';

  type Size = 'small' | 'default' | 'large';
  type ValidateStatus = 'default' | 'warning' | 'error';

  /** 单选入参：Date 或时间字符串（如 '12:30:45'）。 */
  type TimeInput = Date | string | null;

  interface Props {
    /** 单选时 Date|string；范围时 [start, end]（各自 Date|string）。 */
    value?: TimeInput | [TimeInput, TimeInput] | null;
    defaultValue?: TimeInput | [TimeInput, TimeInput] | null;
    /** 'time' 单选（默认）/ 'timeRange' 范围选择。对齐 Semi type。 */
    type?: 'time' | 'timeRange';
    open?: boolean;
    defaultOpen?: boolean;
    placeholder?: string;
    size?: Size;
    /** 校验态（对齐 Semi validateStatus，仅影响展示样式）。 */
    validateStatus?: ValidateStatus;
    disabled?: boolean;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    use12Hours?: boolean;
    /** 格式串（默认 'HH:mm:ss'）：决定显示列与 12h（showSecond = 含 ss），并作为展示/字符串值序列化格式。对齐 Semi format。 */
    format?: string;
    /** 时区（数字偏移 / 'GMT±HH:mm' / IANA）：仅作用于无 format 时的 Intl 显示层；自身优先，未传回退 ConfigProvider。对齐 Semi timeZone。 */
    timeZone?: string | number;
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
    hideDisabledOptions?: boolean;
    /** locale 代码（Intl 本地化用）。对齐 Semi localeCode 语义。 */
    locale?: string;
    /** date-fns locale（对齐 Semi dateFnsLocale）：驱动时间串格式化的本地化（如 AM/PM 文案）。 */
    dateFnsLocale?: import('date-fns').Locale;
    /** 单选回调 Date|null；范围回调 [Date|null, Date|null]。 */
    onChange?: (v: (Date | null) | [Date | null, Date | null]) => void;
    onOpenChange?: (open: boolean) => void;
    /** 浮层溢出自动调整（默认 true）。对齐 Semi autoAdjustOverflow。 */
    autoAdjustOverflow?: boolean;
    /** 挂载时自动聚焦触发器。对齐 Semi autoFocus。 */
    autoFocus?: boolean;
    /** 自定义清除按钮图标。对齐 Semi clearIcon。 */
    clearIcon?: Snippet;
    /** 是否显示清除按钮（默认 true）。对齐 Semi showClear。 */
    showClear?: boolean;
    /** 清除按钮 aria/title 文案（默认 'clear'）。对齐 Semi clearText。 */
    clearText?: string;
    /** 浮层 className。对齐 Semi popupClassName。 */
    popupClassName?: string;
    /** 浮层溢出冗余。对齐 Semi dropdownMargin。 */
    dropdownMargin?: number | { x?: number; y?: number };
    /** 浮层内联样式。对齐 Semi popupStyle。 */
    popupStyle?: string | Record<string, string>;
    /** 打开面板时自动聚焦（默认 false）。对齐 Semi focusOnOpen。 */
    focusOnOpen?: boolean;
    /** 浮层挂载容器。对齐 Semi getPopupContainer。 */
    getPopupContainer?: () => HTMLElement;
    /** 面板展开动画（默认 true）。对齐 Semi motion。 */
    motion?: boolean;
    /** 面板顶部自定义内容。对齐 Semi panelHeader。 */
    panelHeader?: string | Snippet;
    /** 面板底部自定义内容。对齐 Semi panelFooter。 */
    panelFooter?: string | Snippet;
    /** range 模式下按面板（0=start,1=end）分别指定 header/footer（对齐 Semi panels，优先级高于 panelHeader/Footer）。 */
    panels?: Array<string | Snippet | undefined>;
    /** 浮层弹出位置（默认 'bottomLeft'）。对齐 Semi position。 */
    position?: string;
    /** 范围模式分隔符（默认 ' ~ '）。对齐 Semi rangeSeparator（DEFAULT_RANGE_SEPARATOR）。 */
    rangeSeparator?: string;
    /** 滚动列 item 属性透传。对齐 Semi scrollItemProps。 */
    scrollItemProps?: Record<string, unknown>;
    /** 阻止浮层点击事件冒泡（默认 true）。对齐 Semi stopPropagation。 */
    stopPropagation?: boolean;
    /** 浮层 z-index（默认 1030，对齐 Semi popoverNumbers.DEFAULT_Z_INDEX）。 */
    zIndex?: number;
    /** 触发器失焦。对齐 Semi onBlur。 */
    onBlur?: (e: FocusEvent) => void;
    /** 触发器聚焦。对齐 Semi onFocus。 */
    onFocus?: (e: FocusEvent) => void;
    /** onChange 参数 dateFirst 模式（默认 true）。对齐 Semi onChangeWithDateFirst。 */
    onChangeWithDateFirst?: boolean;
    /** 范围模式禁用函数。对齐 Semi disabledTime。 */
    disabledTime?: (date: Date | null, panelType?: 'left' | 'right') => { disabledHours?: () => number[]; disabledMinutes?: (h: number) => number[]; disabledSeconds?: (h: number, m: number) => number[] } | undefined;
    /** 输入框样式（透传到 Input）。对齐 Semi inputStyle。 */
    inputStyle?: string | Record<string, string>;
    /** 输入框 readonly（仅允许通过面板选择，不可键入）。对齐 Semi inputReadOnly。 */
    inputReadOnly?: boolean;
    /** 内嵌标签（透传给 Input）。对齐 Semi insetLabel。 */
    insetLabel?: Snippet | string;
    /** 内嵌标签容器 id（透传给 Input）。对齐 Semi insetLabelId。 */
    insetLabelId?: string;
    /** 完全自定义触发器渲染（替换默认 Input + 图标区域）。对齐 Semi triggerRender。 */
    triggerRender?: Snippet<[{ value: Date | null; placeholder: string; open: boolean; disabled: boolean }]>;
    /** 无边框模式。对齐 Semi borderless。 */
    borderless?: boolean;
    /** focus 时阻止滚动（传给 focus({ preventScroll }) 调用）。对齐 Semi preventScroll。 */
    preventScroll?: boolean;
    /** 根节点类名。对齐 Semi className。 */
    class?: string;
    /** 根节点内联样式。对齐 Semi style。 */
    style?: string;
    /** 根节点 id。对齐 Semi id。 */
    id?: string;
    /** 无障碍：关联标签元素 id。对齐 Semi aria-labelledby。 */
    ariaLabelledby?: string;
    /** 无障碍：关联描述元素 id。对齐 Semi aria-describedby。 */
    ariaDescribedby?: string;
    /** 无障碍：关联错误信息 id。对齐 Semi aria-errormessage。 */
    ariaErrormessage?: string;
    /** 无障碍：校验失败态。对齐 Semi aria-invalid。 */
    ariaInvalid?: boolean;
    /** 无障碍：必填态。对齐 Semi aria-required。 */
    ariaRequired?: boolean;
  }

  let {
    value,
    defaultValue = null,
    type = 'time',
    open,
    defaultOpen = false,
    placeholder,
    size = 'default',
    validateStatus = 'default',
    disabled = false,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    use12Hours = false,
    format = 'HH:mm:ss',
    timeZone,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    hideDisabledOptions = false,
    locale = 'zh-CN',
    dateFnsLocale,
    onChange,
    onOpenChange,
    autoAdjustOverflow = true,
    autoFocus = false,
    clearIcon,
    showClear = true,
    clearText = 'clear',
    popupClassName,
    dropdownMargin,
    popupStyle,
    focusOnOpen = false,
    getPopupContainer,
    motion = true,
    panelHeader,
    panelFooter,
    panels,
    position = 'bottomLeft',
    rangeSeparator = ' ~ ',
    scrollItemProps,
    stopPropagation = true,
    zIndex = 1030,
    onBlur,
    onFocus,
    onChangeWithDateFirst = true,
    disabledTime,
    inputStyle,
    inputReadOnly = false,
    insetLabel,
    insetLabelId,
    triggerRender,
    borderless = false,
    preventScroll = false,
    class: className,
    style,
    id,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaInvalid,
    ariaRequired,
  }: Props = $props();

  const isRange = $derived(type === 'timeRange');

  // --- format 串解析（红线 #2 经 core 纯函数）：决定列与 12h（对齐 Semi showSecond = 含 ss）---
  const formatSpec = $derived(parseFormatSpec(format));
  const effShowSecond = $derived(formatSpec.showSecond);
  const effUse12Hours = $derived(use12Hours || formatSpec.use12Hours);

  // --- 字符串/Date 入参归一化为 Date|null（字符串经 core parseTimeString）---
  function toDate(input: TimeInput): Date | null {
    if (input == null) return null;
    if (input instanceof Date) return input;
    const parts = parseTimeString(input);
    if (!parts) return null;
    const d = new Date();
    d.setHours(parts.hour, parts.minute, parts.second, 0);
    return d;
  }

  const loc = useLocale();
  const baseId = useId('cd-time-picker-panel');

  // --- 受控 value（红线 #1）：不无条件回写 value，仅 onChange ---
  // 内部统一用 [start, end] 元组表示（单选只用 [0]），避免双分支。
  type Pair = [Date | null, Date | null];

  function toPair(input: Props['value']): Pair {
    if (Array.isArray(input)) return [toDate(input[0] ?? null), toDate(input[1] ?? null)];
    return [toDate((input ?? null) as TimeInput), null];
  }

  const isValueControlled = $derived(value !== undefined);
  // 仅捕获初始 defaultValue（非受控初值）；用函数包裹避免 state_referenced_locally。
  function getInitialPair(): Pair {
    return toPair(defaultValue);
  }
  let innerValue = $state<Pair>(getInitialPair());
  const currentPair = $derived<Pair>(isValueControlled ? toPair(value) : innerValue);
  const current = $derived<Date | null>(currentPair[0]);

  function emit(next: Pair) {
    if (!isValueControlled) innerValue = next;
    onChange?.(isRange ? next : next[0]);
  }

  // --- 受控 open（红线 #1）：不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(open !== undefined);
  function getInitialOpen(): boolean {
    return defaultOpen;
  }
  let innerOpen = $state(getInitialOpen());
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

  // 面板首次打开后常驻 DOM，关闭仅 CSS 隐藏（对齐 Semi Popover 惰性挂载）。
  let hasOpened = $state(getInitialOpen());
  $effect(() => {
    if (isOpen) hasOpened = true;
  });

  // --- 单个编辑端（0=start,1=end）的 h/m/s 派生 + disabledTime 接线（对齐 Semi Combobox）---
  // panelIndex：单选恒 0；范围左列 0 / 右列 1。
  function dateOf(panelIndex: 0 | 1): Date | null {
    return currentPair[panelIndex];
  }

  // 墙上时间视图（对齐 Semi）：Combobox 时间列/isAM 展示的时分秒须是目标时区墙上时间，
  // 与触发器 displayOne 一致。存储层 UTC → utcToZonedTime → 墙上时间；无 timeZone 时原样。
  function wallDateOf(panelIndex: 0 | 1): Date | null {
    const d = currentPair[panelIndex];
    if (!d) return null;
    return isValidTimeZone(effectiveTimeZone)
      ? utcToZonedTime(d, effectiveTimeZone as string | number)
      : d;
  }

  function disabledRulesFor(panelIndex: 0 | 1) {
    if (!disabledTime) return undefined;
    return disabledTime(dateOf(panelIndex), panelIndex === 0 ? 'left' : 'right');
  }

  // 合成 Date：基于当前编辑端或今天，写入 h/m/s（对齐 onChangeWithDateFirst 保留日期部分）。
  // 时区语义（对齐 Semi）：存储/抛出层始终是 UTC 时刻；用户在墙上时间(displayOne 用 utcToZonedTime)选择，
  // 故 setHours 须作用在墙上时间 base 上，再 zonedTimeToUtc 转回 UTC 存储——保证读写往返自洽。
  function commit(panelIndex: 0 | 1, h: number, m: number, s: number) {
    const src = dateOf(panelIndex);
    const tz = effectiveTimeZone;
    if (isValidTimeZone(tz)) {
      // 墙上时间 base（src 为 UTC → 转墙上时间；无 src 用当前墙上时间）
      const base = src ? utcToZonedTime(src, tz as string | number) : utcToZonedTime(new Date(), tz as string | number);
      base.setHours(h, m, s, 0);
      const next: Pair = [...currentPair];
      next[panelIndex] = zonedTimeToUtc(base, tz as string | number);
      emit(next);
      return;
    }
    const base = src ? new Date(src) : new Date();
    base.setHours(h, m, s, 0);
    const next: Pair = [...currentPair];
    next[panelIndex] = base;
    emit(next);
  }

  // Combobox 时间列变化（抛新时间戳）→ commit 到对应编辑端（保留该端日期部分）。
  function onComboboxChange(panelIndex: 0 | 1, timeStampValue: number) {
    const t = new Date(timeStampValue);
    commit(panelIndex, t.getHours(), t.getMinutes(), t.getSeconds());
    invalid = false; // 面板选择是有效操作，清 invalid（对齐 Semi）
  }

  // --- Intl / core formatTime 展示（对齐 Semi 值层时区转换）---
  const configCtx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  const configTimeZone = $derived(configCtx?.current.timeZone);
  const effectiveTimeZone = $derived<string | number | undefined>(timeZone ?? configTimeZone);

  function displayOne(d: Date): string {
    // 对齐 Semi：timeZone 有效时经 utcToZonedTime 转目标时区墙上时间再展示，否则原样（本地）。
    const shown = isValidTimeZone(effectiveTimeZone)
      ? utcToZonedTime(d, effectiveTimeZone as string | number)
      : d;
    // dateFnsLocale 存在时走 core localeFormat（date-fns format + locale，本地化 AM/PM 等，对齐 Semi formatToString）；
    // 否则走本库 core formatTime 纯函数（默认路径，不引入 date-fns locale 依赖）。
    if (dateFnsLocale) {
      // date-fns token 小写（HH:mm:ss / hh:mm:ss a 等；本库 format 已是 date-fns 兼容 token）。
      return localeFormat(shown, format, dateFnsLocale);
    }
    return formatTime(
      { hour: shown.getHours(), minute: shown.getMinutes(), second: shown.getSeconds() },
      format,
    );
  }

  const placeholderText = $derived(placeholder ?? loc().t('TimePicker.placeholder'));

  const displayText = $derived.by(() => {
    if (isRange) {
      const [s, e] = currentPair;
      if (!s && !e) return '';
      return `${s ? displayOne(s) : ''}${rangeSeparator}${e ? displayOne(e) : ''}`;
    }
    return current ? displayOne(current) : '';
  });

  const hasValue = $derived(isRange ? currentPair[0] !== null || currentPair[1] !== null : current !== null);

  // --- 触发器可键入：解析输入串回写（镜像 Semi inputFoundation.handleInputChange/handleBlur）---
  // 输入过程只做本地展示，Enter/Blur 时解析并提交（单选整串 → 时间；范围按 rangeSeparator 拆两端）。
  let inputDraft = $state<string | null>(null);
  const inputValue = $derived(inputDraft ?? displayText);
  // invalid 校验态（对齐 Semi foundation invalid）：手输非法/无法解析时置 true，触发器显示 error 样式。
  let invalid = $state(false);

  function parseAndCommit(raw: string) {
    if (inputReadOnly) return;
    const text = raw.trim();
    if (text === '') {
      emit([null, null]);
      inputDraft = null;
      invalid = false;
      return;
    }
    if (isRange) {
      const parts = text.split(rangeSeparator.trim() === '' ? '~' : rangeSeparator.trim());
      const s = parts[0] ? toDate(parts[0].trim()) : null;
      const e = parts[1] ? toDate(parts[1].trim()) : null;
      if (s || e) {
        emit([s, e]);
        invalid = false;
      } else {
        invalid = true; // 两端都解析失败
      }
    } else {
      const d = toDate(text);
      if (d) {
        emit([d, currentPair[1]]);
        invalid = false;
      } else {
        invalid = true; // 解析失败：标记 invalid，回落展示但给 error 反馈（对齐 Semi）
      }
    }
    inputDraft = null;
  }

  function onInputChange(v: string) {
    inputDraft = v;
  }
  function onInputBlur(e: FocusEvent) {
    if (inputDraft !== null) parseAndCommit(inputDraft);
    onBlur?.(e);
  }
  function onInputKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter') {
      if (inputDraft !== null) parseAndCommit(inputDraft);
      setOpen(true);
    } else if (e.key === 'ArrowDown') {
      if (!isOpen) setOpen(true);
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setOpen(false);
      }
    }
  }

  function clear() {
    if (disabled) return;
    inputDraft = null;
    emit([null, null]);
  }

  // 时间列面板（h/m/s/ampm 滚轮）已拆分为 Combobox（复用，对齐 Semi）；此处仅保留触发器/浮层/值模型。

  // --- useDismiss（红线 #3）：绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  let triggerComp = $state<{ focus: () => void; blur: () => void } | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [panelEl],
    });
  });

  // position → use:floating 的 Placement。
  const POSITION_TO_PLACEMENT: Record<string, Placement> = {
    bottomLeft: 'bottomStart',
    bottomRight: 'bottomEnd',
    bottom: 'bottom',
    topLeft: 'topStart',
    topRight: 'topEnd',
    top: 'top',
  };
  const panelPlacement = $derived<Placement>(POSITION_TO_PLACEMENT[position] ?? 'bottomStart');

  // autoFocus: 挂载时自动聚焦触发器
  $effect(() => {
    if (autoFocus && triggerComp) triggerComp.focus();
  });

  // focusOnOpen: 打开面板时聚焦触发器
  $effect(() => {
    if (isOpen && focusOnOpen && triggerComp) triggerComp.focus();
  });

  /** 命令式聚焦触发器（对齐 Semi focus()）。 */
  export function focus(): void {
    triggerComp?.focus();
  }

  /** 命令式移除焦点（对齐 Semi blur()）。 */
  export function blur(): void {
    triggerComp?.blur();
  }

  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  const inputStyleStr = $derived.by<string | undefined>(() => {
    if (!inputStyle) return undefined;
    if (typeof inputStyle === 'string') return inputStyle;
    return Object.entries(inputStyle).map(([k, v]) => `${k}:${v}`).join(';');
  });

  // 只在定义时透传给 Input 的可选属性（exactOptionalPropertyTypes：不显式赋 undefined）。
  const inputOptionalProps = $derived({
    ...(inputStyleStr !== undefined ? { inputStyle: inputStyleStr } : {}),
    ...(insetLabel !== undefined ? { insetLabel } : {}),
    ...(insetLabelId !== undefined ? { insetLabelId } : {}),
    ...(clearIcon !== undefined ? { clearIcon } : {}),
    ...(id !== undefined ? { id } : {}),
    ...(ariaLabelledby !== undefined ? { ariaLabelledby } : {}),
    ...(ariaDescribedby !== undefined ? { ariaDescribedby } : {}),
    ...(ariaErrormessage !== undefined ? { ariaErrormessage } : {}),
    ...(ariaRequired !== undefined ? { ariaRequired } : {}),
    // onFocus 不在此：由 TimeInput 经 foundation.handleFocus → 回调独立 onFocus prop（避免双重绑定）。
  });

  const popupStyleStr = $derived.by(() => {
    const zPart = `z-index:${zIndex}`;
    if (!popupStyle) return zPart;
    const base = typeof popupStyle === 'string'
      ? popupStyle
      : Object.entries(popupStyle).map(([k, v]) => `${k}:${v}`).join(';');
    return `${zPart};${base}`;
  });

  const cls = $derived(
    [
      'cd-time-picker',
      `cd-time-picker--${size}`,
      validateStatus !== 'default' && `cd-time-picker--${validateStatus}`,
      disabled && 'cd-time-picker--disabled',
      isOpen && 'cd-time-picker--open',
      isRange && 'cd-time-picker-range',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const panelCls = $derived(
    [
      'cd-time-picker-panel',
      isRange && 'cd-time-picker-range-panel',
      !motion && 'cd-time-picker-panel--no-motion',
      popupClassName,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 单列的 header 文案（范围：begin/end；单选：panelHeader 或空）。
  const beginHeader = $derived(panelHeader ?? loc().t('TimePicker.rangeStart'));
  const endHeader = $derived(loc().t('TimePicker.rangeEnd'));

  // createPanelProps —— 对齐 Semi createPanelProps：range 时 panels[index] 优先，
  // 否则 panelHeader 无→begin/end 默认、panelHeader 是数组→[index]、否则 panelHeader。
  function panelHeaderOf(index: 0 | 1): string | Snippet | undefined {
    if (!isRange) return panelHeader;
    const fromPanels = panels?.[index];
    if (fromPanels != null) return fromPanels;
    if (panelHeader == null) return index === 0 ? beginHeader : endHeader;
    return Array.isArray(panelHeader) ? panelHeader[index] : panelHeader;
  }
  function panelFooterOf(index: 0 | 1): string | Snippet | undefined {
    if (!isRange) return panelFooter;
    const fromPanels = panels?.[index];
    if (fromPanels != null) return fromPanels;
    return Array.isArray(panelFooter) ? panelFooter[index] : panelFooter;
  }
</script>

<div
  class={cls}
  {style}
  {id}
  bind:this={rootEl}
  aria-invalid={ariaInvalid ?? (validateStatus === 'error' || undefined)}
  data-position={position}
>
  {#if triggerRender}
    <!-- 自定义触发器：完全替换默认 Input + 图标区域（需父层 value=Date 等数据，故留在 TimePicker 层，不进 TimeInput）。 -->
    <div
      class="cd-time-picker__control"
      onclick={toggleOpen}
      onkeydown={onInputKeydown}
      role="button"
      tabindex={disabled ? -1 : 0}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      {@render triggerRender({ value: current, placeholder: placeholderText, open: isOpen, disabled })}
    </div>
  {:else}
    <!-- 默认触发器：拆分为 TimeInput（对齐 Semi timePicker/TimeInput.tsx，消费 inputFoundation 光标恢复）。 -->
    <TimeInput
      bind:this={triggerComp}
      value={inputValue}
      placeholder={placeholderText}
      {size}
      {disabled}
      {borderless}
      {validateStatus}
      {invalid}
      {showClear}
      readonly={inputReadOnly}
      ariaControls={baseId}
      expanded={isOpen}
      {inputOptionalProps}
      onChange={onInputChange}
      onClear={clear}
      onFocus={onFocus}
      onBlur={onInputBlur}
      onKeydown={onInputKeydown}
      onClick={toggleOpen}
    />
  {/if}

  {#if hasOpened && rootEl}
    <!-- 首次打开后常驻 DOM，关闭态 hidden。定位由 use:floating 接管（portal 到 body + 避让 + 跟随滚动）。 -->
    <div
      bind:this={panelEl}
      class={panelCls}
      style={popupStyleStr}
      id={baseId}
      role="dialog"
      aria-label={loc().t('TimePicker.triggerLabel')}
      tabindex="-1"
      hidden={!isOpen || undefined}
      onclick={(e) => stopPropagation && e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && setOpen(false)}
      use:floating={{ trigger: rootEl, placement: panelPlacement, autoAdjust: autoAdjustOverflow, offset: 4, getContainer: getPopupContainer, open: isOpen }}
    >
      {#if isRange}
        <!-- range：左右两个 Combobox 并排（复用拆分后的时间列面板，对齐 Semi RANGE_PANEL_LISTS）。 -->
        <div class="cd-time-picker-lists">
          {#each [0, 1] as const as pIdx (pIdx)}
            {@const rules = disabledRulesFor(pIdx)}
            <Combobox
              timeStampValue={wallDateOf(pIdx)?.getTime() ?? null}
              {format}
              use12Hours={effUse12Hours}
              isAM={meridiemOf(wallDateOf(pIdx)?.getHours() ?? 0) === 'am'}
              {hourStep}
              {minuteStep}
              {secondStep}
              disabledHours={rules?.disabledHours ?? disabledHours}
              disabledMinutes={(h) => (rules?.disabledMinutes ?? disabledMinutes)?.(h ?? 0) ?? []}
              disabledSeconds={(h, m) => (rules?.disabledSeconds ?? disabledSeconds)?.(h ?? 0, m ?? 0) ?? []}
              {hideDisabledOptions}
              panelHeader={panelHeaderOf(pIdx)}
              panelFooter={panelFooterOf(pIdx)}
              scrollItemProps={scrollItemProps ?? {}}
              onChange={(payload) => onComboboxChange(pIdx, payload.timeStampValue)}
            />
          {/each}
        </div>
      {:else}
        {@const rules = disabledRulesFor(0)}
        <!-- 单选：单个 Combobox（复用拆分后的时间列面板，对齐 Semi Combobox）。 -->
        <Combobox
          timeStampValue={wallDateOf(0)?.getTime() ?? null}
          {format}
          use12Hours={effUse12Hours}
          isAM={meridiemOf(wallDateOf(0)?.getHours() ?? 0) === 'am'}
          {hourStep}
          {minuteStep}
          {secondStep}
          disabledHours={rules?.disabledHours ?? disabledHours}
          disabledMinutes={(h) => (rules?.disabledMinutes ?? disabledMinutes)?.(h ?? 0) ?? []}
          disabledSeconds={(h, m) => (rules?.disabledSeconds ?? disabledSeconds)?.(h ?? 0, m ?? 0) ?? []}
          {hideDisabledOptions}
          {panelHeader}
          {panelFooter}
          scrollItemProps={scrollItemProps ?? {}}
          onChange={(payload) => onComboboxChange(0, payload.timeStampValue)}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .cd-time-picker {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-font-size-regular);
  }

  /* --- 面板容器（对齐 Semi timePicker.scss：range 面板走 timePicker 专属 shadow/border/radius，
     单选面板走 scrollList 自身样式；此处面板外壳只做 z-index 与动画）--- */
  /* z-index 由 zIndex prop 经 popupStyle 内联注入（对齐 Semi popoverNumbers.DEFAULT_Z_INDEX=1030）。 */
  .cd-time-picker-panel:focus-visible {
    outline: none;
  }
  .cd-time-picker-panel--no-motion {
    transition: none;
  }

  /* --- 面板列视图（TimePicker 独立面板专属，对齐 Semi timePicker.scss `.semi-timepicker-panel ...`）---
     锚点 `.cd-time-picker-panel` = Combobox 在 TimePicker 场景传入的默认 prefixCls（ScrollList 根 class）；
     DatePicker dateTime 的 tpk 层传不同 prefixCls，不吃这套 64px，改由 MonthsGrid 的 width:100%+flex:1 均分。
     面板 portal 到 body，故列类用裸 :global（无祖先前缀，仅 TimePicker 渲染时注入，不污染 DatePicker tpk）。 */

  /* 列 flex: none（镜像 Semi `.semi-timepicker-panel .semi-scrolllist-item { flex: none }`），
     解除 ScrollList 默认 `flex: 1 1 0%` 等分，让下面列宽 width 生效。 */
  :global(.cd-time-picker-panel .cd-scrolllist-item) {
    flex: none;
  }
  /* 列宽（镜像 Semi `.semi-timepicker-panel-list-{hour,minute,second,ampm} { width: 64px/72px }`）。 */
  :global(.cd-time-picker-panel-list-hour) {
    inline-size: var(--cd-width-time-picker-panel-list-hour);
  }
  :global(.cd-time-picker-panel-list-minute) {
    inline-size: var(--cd-width-time-picker-panel-list-minute);
  }
  :global(.cd-time-picker-panel-list-second) {
    inline-size: var(--cd-width-time-picker-panel-list-second);
  }
  :global(.cd-time-picker-panel-list-ampm) {
    inline-size: var(--cd-width-time-picker-panel-list-ampm);
  }
  /* 面板 body 高度对齐 Semi $height-timePicker_panel_body（252px）。 */
  :global(.cd-time-picker-panel .cd-scrolllist-body) {
    block-size: var(--cd-height-time-picker-panel-body);
  }
  /* 列居中留白按 Semi 公式 (panel_body - item) * 0.5 重算（面板收窄到 252px，替代 ScrollList 默认 300px 视窗高）。 */
  :global(.cd-time-picker-panel .cd-scrolllist-item > ul::before) {
    block-size: calc((var(--cd-height-time-picker-panel-body) - var(--cd-height-scroll-list-item)) * 0.5);
  }
  :global(.cd-time-picker-panel .cd-scrolllist-item > ul) {
    padding-block-end: calc((var(--cd-height-time-picker-panel-body) - var(--cd-height-scroll-list-item)) * 0.5);
  }

  /* --- range 双列并排（对齐 Semi timePicker.scss `-range-panel .lists`）--- */
  .cd-time-picker-lists {
    display: flex;
    box-shadow: var(--cd-shadow-time-picker-range-panel);
    border: var(--cd-width-time-picker-range-panel-border) solid var(--cd-color-time-picker-range-panel-border);
    border-radius: var(--cd-radius-time-picker-range-panel);
  }
  .cd-time-picker-lists :global(.cd-scrolllist:first-of-type) {
    border-radius: var(--cd-radius-time-picker-range-panel) 0 0 var(--cd-radius-time-picker-range-panel);
  }
  .cd-time-picker-lists :global(.cd-scrolllist:last-of-type) {
    border-radius: 0 var(--cd-radius-time-picker-range-panel) var(--cd-radius-time-picker-range-panel) 0;
  }
  .cd-time-picker-lists :global(.cd-scrolllist) {
    box-shadow: none;
  }
  /* 双列中间分割线（左列 body 右侧描边）。 */
  .cd-time-picker-lists :global(.cd-scrolllist:not(:last-child) .cd-scrolllist-body) {
    border-inline-end: var(--cd-width-time-picker-range-panel-scrolllist-body-border) solid var(--cd-color-time-picker-range-picker-panel-split-border);
  }
  /* range 面板里 body 与 header 的 padding 覆盖为 0（镜像 Semi timePicker.scss L111-115
     `.semi-scrolllist { .semi-scrolllist-body, .semi-scrolllist-header { padding: 0 } }`）。
     ScrollList 默认 body 有 `padding: 0 16px`，在双列 range 布局里会把列内容与面板边缘/
     中间分割线推开 16px 空隙、视觉不紧凑——此处按 Semi 归零。之前只覆盖了 header 漏了 body。 */
  .cd-time-picker-lists :global(.cd-scrolllist-body),
  .cd-time-picker-lists :global(.cd-scrolllist-header) {
    padding: var(--cd-spacing-time-picker-range-panel-scrolllist-header-body-padding);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-time-picker-panel {
      transition: none;
    }
  }
</style>
