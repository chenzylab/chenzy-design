<!--
  TimePicker — 严格对齐 Semi Design（semi-ui/timePicker/{TimePicker,Combobox,TimeInput}.tsx）。
  单选 type='time'：HH:mm:ss 三列滚动选择（+ 12h 制 AM/PM 列）。受控/非受控。
  type='timeRange'：左右两个 Combobox（ScrollList）并排选起止两端，值 [start, end]。
  时间列复用本库 ScrollList/ScrollItem（mode='normal'，选择走 onSelect，非自造 roving）。
  触发器复用本库 Input（可键入时间串，镜像 Semi TimeInput：<Input hideSuffix suffix={IconClock}>）。
  value/defaultValue 支持 Date | string（如 '12:30:45'），字符串经 core parseTimeString 解析。
  format 字符串：经 core parseFormatSpec 决定显示列与 12h（showSecond = 含 ss）；未显式传时按
    use12Hours 分派（'a h:mm:ss' / 'HH:mm:ss'，对齐 Semi getDefaultFormatIfNeed）。
  列项/禁用集生成 + 格式解析/序列化走 @chenzy-design/core 纯函数（红线 #2）。

  文件分层对齐 Semi（见 semi-doc-alignment-sop.md「文件目录结构对齐」）：
    · 本文件 = Semi semi-ui/timePicker/TimePicker.tsx（视图装配：触发器 + 浮层 + 事件接线）
    · time-picker-foundation.svelte.ts = Semi semi-foundation/timePicker/foundation.ts（值模型/open/时区）
    · time-input-foundation.ts = Semi inputFoundation.ts；combobox-foundation.svelte.ts = ComboxFoundation.ts
    · constants.ts = Semi constants.ts（默认 format/分隔符/方位真源，勿散写字面量）
-->
<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import { CONFIG_CONTEXT_KEY, type ConfigContextValue } from '../config-provider/index.js';
  import {
    useId,
    useDismiss,
    meridiemOf,
    formatTime,
    localeFormat,
    utcToZonedTime,
    isValidTimeZone,
  } from '@chenzy-design/core';
  import type { Placement } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Combobox from './Combobox.svelte';
  import TimeInput from './TimeInput.svelte';
  import { strings } from './constants.js';
  import {
    createTimePickerState,
    toDate,
    type TimeInputValue,
  } from './time-picker-foundation.svelte.js';

  type Size = 'small' | 'default' | 'large';
  type ValidateStatus = 'default' | 'warning' | 'error';

  interface Props {
    /** 单选时 Date|string；范围时 [start, end]（各自 Date|string）。 */
    value?: TimeInputValue | [TimeInputValue, TimeInputValue] | null;
    defaultValue?: TimeInputValue | [TimeInputValue, TimeInputValue] | null;
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
    /**
     * 格式串：决定显示列与 12h（showSecond = 含 ss），并作为展示/字符串值序列化格式。对齐 Semi format。
     * 未显式传时按 use12Hours 分派默认值（对齐 Semi getDefaultFormatIfNeed）：
     * use12Hours 为 true → 'a h:mm:ss'（DEFAULT_FORMAT_A），否则 'HH:mm:ss'（DEFAULT_FORMAT）。
     */
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
    /** 面板顶部自定义内容；range 模式传数组时按面板取 [0]/[1]。对齐 Semi panelHeader。 */
    panelHeader?: string | Snippet | Array<string | Snippet | undefined>;
    /** 面板底部自定义内容；range 模式传数组时按面板取 [0]/[1]。对齐 Semi panelFooter。 */
    panelFooter?: string | Snippet | Array<string | Snippet | undefined>;
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
    /**
     * 范围模式禁用函数（对齐 Semi disabledTime）。**仅 type='timeRange' 生效**。
     * 第一参 `dates` 是当前已选时间数组（长度 0/1/2，对齐 Semi 传 dates 而非单面板值），
     * 右面板据此可实现「禁用早于开始时间的选项」这类联动；panelType 区分左右面板。
     * 单选模式请直接用顶层 disabledHours/disabledMinutes/disabledSeconds。
     */
    disabledTime?: (dates: Date[], panelType?: 'left' | 'right') => { disabledHours?: () => number[]; disabledMinutes?: (h: number) => number[]; disabledSeconds?: (h: number, m: number) => number[] } | undefined;
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
    format,
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
    position = strings.DEFAULT_POSITION[strings.DEFAULT_TYPE] ?? 'bottomLeft',
    rangeSeparator = strings.DEFAULT_RANGE_SEPARATOR,
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

  const loc = useLocale();
  const baseId = useId('cd-time-picker-panel');

  // --- 有效时区（对齐 Semi 值层时区转换）：自身 timeZone 优先，未传回退 ConfigProvider ---
  // 必须声明在 createTimePickerState 之前——foundation 的 props getter 在初始化期就会读它，
  // 放到后面会 ReferenceError: Cannot access 'effectiveTimeZone' before initialization。
  const configCtx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  const configTimeZone = $derived(configCtx?.current.timeZone);
  const effectiveTimeZone = $derived<string | number | undefined>(timeZone ?? configTimeZone);

  // --- foundation 分层（对齐 Semi semi-foundation/timePicker/foundation.ts）---
  // 值模型 / open 受控 / format 分派 / 时区往返全在 time-picker-foundation.svelte.ts，
  // 本文件只留视图装配（触发器 + 浮层 + 事件接线）。
  const st = createTimePickerState(() => ({
    type,
    value,
    defaultValue,
    open,
    defaultOpen,
    format,
    use12Hours,
    disabled,
    effectiveTimeZone,
    disabledTime,
    onChange,
    onOpenChange,
  }));

  const isRange = $derived(st.isRange);
  const effFormat = $derived(st.format);
  const effUse12Hours = $derived(st.use12Hours);
  const currentPair = $derived(st.currentPair);
  const current = $derived(st.current);
  const isOpen = $derived(st.isOpen);

  const setOpen = (next: boolean) => st.setOpen(next);
  const toggleOpen = () => st.toggleOpen();
  const wallDateOf = (i: 0 | 1) => st.wallDateOf(i);
  const disabledRulesFor = (i: 0 | 1) => st.disabledRulesFor(i);

  $effect(() => {
    st.markOpened();
  });

  // Combobox 时间列变化（抛新时间戳）→ commit 到对应编辑端（保留该端日期部分）。
  function onComboboxChange(panelIndex: 0 | 1, timeStampValue: number) {
    const t = new Date(timeStampValue);
    st.commit(panelIndex, t.getHours(), t.getMinutes(), t.getSeconds());
    invalid = false; // 面板选择是有效操作，清 invalid（对齐 Semi）
  }

  /**
   * 有效 date-fns locale（对齐 Semi timePicker/index.tsx：LocaleConsumer 把 bundle 里的
   * dateFnsLocale 自动注入组件）——prop 优先，未传回退当前语言包自带的。
   * 缺了它，`a` token 恒渲染成英文 am/pm，与面板列的「上午/下午」不一致。
   */
  const effDateFnsLocale = $derived(dateFnsLocale ?? loc().component('dateFnsLocale'));

  function displayOne(d: Date): string {
    // 对齐 Semi：timeZone 有效时经 utcToZonedTime 转目标时区墙上时间再展示，否则原样（本地）。
    const shown = isValidTimeZone(effectiveTimeZone)
      ? utcToZonedTime(d, effectiveTimeZone as string | number)
      : d;
    // 有 date-fns locale 就走 core localeFormat（date-fns format + locale，本地化 AM/PM 等，
    // 对齐 Semi formatToString）；否则退回纯函数 formatTime（英文 am/pm）。
    if (effDateFnsLocale) {
      // date-fns token 小写（HH:mm:ss / a h:mm:ss 等；本库 format 已是 date-fns 兼容 token）。
      return localeFormat(shown, effFormat, effDateFnsLocale as import('date-fns').Locale);
    }
    return formatTime(
      { hour: shown.getHours(), minute: shown.getMinutes(), second: shown.getSeconds() },
      effFormat,
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
      st.emit([null, null]);
      inputDraft = null;
      invalid = false;
      return;
    }
    if (isRange) {
      const parts = text.split(rangeSeparator.trim() === '' ? '~' : rangeSeparator.trim());
      const s = parts[0] ? toDate(parts[0].trim()) : null;
      const e = parts[1] ? toDate(parts[1].trim()) : null;
      if (s || e) {
        st.emit([s, e]);
        invalid = false;
      } else {
        invalid = true; // 两端都解析失败
      }
    } else {
      const d = toDate(text);
      if (d) {
        st.emit([d, currentPair[1]]);
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
    st.emit([null, null]);
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

  // range 两端 header 的默认文案（对齐 Semi defaultHeaderMap = { 0: locale.begin, 1: locale.end }）。
  const beginHeader = $derived(loc().t('TimePicker.rangeStart'));
  const endHeader = $derived(loc().t('TimePicker.rangeEnd'));

  /** 数组形态按面板取值，非数组原样返回（单选场景数组无意义，取 [0] 兜底）。 */
  function pickPanelSlot(
    v: string | Snippet | Array<string | Snippet | undefined> | undefined,
    index: 0 | 1,
  ): string | Snippet | undefined {
    return Array.isArray(v) ? v[index] : v;
  }

  // createPanelProps —— 对齐 Semi createPanelProps：range 时 panels[index] 优先，
  // 否则 panelHeader 无→begin/end 默认、panelHeader 是数组→[index]、否则 panelHeader。
  function panelHeaderOf(index: 0 | 1): string | Snippet | undefined {
    if (!isRange) return pickPanelSlot(panelHeader, 0);
    const fromPanels = panels?.[index];
    if (fromPanels != null) return fromPanels;
    if (panelHeader == null) return index === 0 ? beginHeader : endHeader;
    return pickPanelSlot(panelHeader, index);
  }
  function panelFooterOf(index: 0 | 1): string | Snippet | undefined {
    if (!isRange) return pickPanelSlot(panelFooter, 0);
    const fromPanels = panels?.[index];
    if (fromPanels != null) return fromPanels;
    return pickPanelSlot(panelFooter, index);
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

  {#if st.hasOpened && rootEl}
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
              format={effFormat}
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
          format={effFormat}
          use12Hours={effUse12Hours}
          isAM={meridiemOf(wallDateOf(0)?.getHours() ?? 0) === 'am'}
          {hourStep}
          {minuteStep}
          {secondStep}
          disabledHours={rules?.disabledHours ?? disabledHours}
          disabledMinutes={(h) => (rules?.disabledMinutes ?? disabledMinutes)?.(h ?? 0) ?? []}
          disabledSeconds={(h, m) => (rules?.disabledSeconds ?? disabledSeconds)?.(h ?? 0, m ?? 0) ?? []}
          {hideDisabledOptions}
          panelHeader={panelHeaderOf(0)}
          panelFooter={panelFooterOf(0)}
          scrollItemProps={scrollItemProps ?? {}}
          onChange={(payload) => onComboboxChange(0, payload.timeStampValue)}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  /* 根节点对齐 Semi timePicker.scss `.semi-timepicker { display: inline-block }`——
     **不设宽度**，由内部 Input 的自然宽度收缩定宽（Semi 实测 204px）。
     曾误加 `inline-size: 100%` 致触发器撑满容器（实测 913px vs Semi 204px）：
     Input 自身是 width:100%，只有外层 shrink-to-fit 才能收住它，勿再加宽度。 */
  .cd-time-picker {
    position: relative;
    display: inline-block;
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
