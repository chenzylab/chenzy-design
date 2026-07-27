<!--
  DateInput —— 对齐 Semi datePicker/dateInput.tsx。
  单选：复用本库 <Input>（suffix=日历图标，dateTime 用 CalendarClock）。
  range：对齐 Semi renderRangeInput —— .range-input(flex) > wrapper-start(Input) + separator + wrapper-end(Input) + suffix，
    焦点端 wrapper 加 -active 高亮（滑块）；value 为 `start${rangeSeparator}end` 串，按 separator 拆分回显。
-->
<script lang="ts">
  import Input from '../input/Input.svelte';
  import { IconCalendar, IconCalendarClock, IconClear } from '@chenzy-design/icons';
  import { cssClasses, type PickerType, type PickerSize } from './constants.js';
  import type { ValidateStatus } from './date-picker-foundation.svelte.js';
  import type { RangeInputFocus } from './month-foundation.svelte.js';

  interface Props {
    type: PickerType;
    /** 展示文案（foundation formattedValue / 输入中的 inputValue）。range 时为 `start${sep}end` 串。 */
    value?: string;
    placeholder?: string;
    /** range 起始输入框占位（对齐 Semi placeholder 数组第 1 项）。 */
    startPlaceholder?: string;
    /** range 结束输入框占位（对齐 Semi placeholder 数组第 2 项）。 */
    endPlaceholder?: string;
    disabled?: boolean;
    showClear?: boolean;
    inputReadOnly?: boolean;
    validateStatus?: ValidateStatus;
    size?: PickerSize;
    prefix?: import('svelte').Snippet | string;
    /** 无边框（对齐 Semi borderless，透传 Input）。 */
    borderless?: boolean;
    /** 内嵌标签（对齐 Semi insetLabel，透传 Input）。 */
    insetLabel?: import('svelte').Snippet | string;
    /** 自定义清除图标（对齐 Semi clearIcon，透传 Input）。 */
    clearIcon?: import('svelte').Snippet;
    /** 输入框样式（对齐 Semi inputStyle，透传 Input style）。 */
    inputStyle?: string;
    /** 内嵌标签 id（对齐 Semi insetLabelId，透传 Input）。 */
    insetLabelId?: string;
    /** range 分隔符自定义节点（对齐 Semi rangeSeparatorNode，优先于 rangeSeparator 字符串）。 */
    rangeSeparatorNode?: import('svelte').Snippet | string;
    onChange?: (value: string, e: Event) => void;
    onEnterPress?: (e: KeyboardEvent) => void;
    onClear?: (e: MouseEvent) => void;
    onfocus?: (e: FocusEvent) => void;
    onblur?: (e: FocusEvent) => void;
    // range only（对齐 Semi renderRangeInput）
    rangeSeparator?: string;
    rangeInputFocus?: RangeInputFocus;
    /** 点击/聚焦某端触发（对齐 Semi handleRangeInputFocus）。 */
    onRangeFocus?: (e: Event, rangeType: 'rangeStart' | 'rangeEnd') => void;
    /** range 端值变化（回传完整 [start, end]，对齐 Semi handleRangeInputChange）。 */
    onRangeChange?: (rangeStart: string, rangeEnd: string, e: Event) => void;
    /** rangeEnd 框按 Tab（对齐 Semi handleRangeInputEndKeyPress → setRangeInputFocus(false)）。 */
    onRangeEndTab?: (e: KeyboardEvent) => void;
    /** range 清除按钮点击（对齐 Semi handleRangeInputClear）。 */
    onRangeClear?: (e: MouseEvent) => void;
  }

  let {
    type,
    value = '',
    placeholder,
    startPlaceholder,
    endPlaceholder,
    disabled = false,
    showClear = false,
    inputReadOnly = false,
    validateStatus,
    size = 'default',
    prefix,
    borderless = false,
    insetLabel,
    clearIcon,
    inputStyle,
    insetLabelId,
    rangeSeparatorNode,
    onChange,
    onEnterPress,
    onClear,
    onfocus,
    onblur,
    rangeSeparator = ' ~ ',
    rangeInputFocus = false,
    onRangeFocus,
    onRangeChange,
    onRangeEndTab,
    onRangeClear,
  }: Props = $props();

  const prefixCls = cssClasses.PREFIX;
  // dateTime 系用 CalendarClock，其余用 Calendar（对齐 Semi suffix 选择）。
  const isTimeType = $derived(type.includes('Time'));
  const isRange = $derived(type.includes('Range'));
  // 只读态 class（对齐 Semi -input-readonly）。
  const inputCls = $derived(inputReadOnly ? `${prefixCls}-input-readonly` : '');

  // range：拆分 value → [start, end]（对齐 Semi `text.split(rangeSeparator)`）。
  const rangeParts = $derived(isRange ? value.split(rangeSeparator) : []);
  const rangeStart = $derived(rangeParts[0] ?? '');
  const rangeEnd = $derived(rangeParts[1] ?? '');
  // range 子 Input 尺寸（对齐 Semi：large→default，其余→small）。
  const rangeSize = $derived<PickerSize>(size === 'large' ? 'default' : 'small');
  const rangeStartPlaceholder = $derived(startPlaceholder ?? placeholder ?? '');
  const rangeEndPlaceholder = $derived(endPlaceholder ?? placeholder ?? '');

  // 只透传已定义的可选项，兼容 Input 的 exactOptionalPropertyTypes（不塞 undefined）。
  const inputRest = $derived({
    ...(placeholder !== undefined ? { placeholder } : {}),
    ...(validateStatus !== undefined ? { validateStatus } : {}),
    ...(prefix !== undefined ? { prefix } : {}),
    ...(onChange !== undefined ? { onChange } : {}),
    ...(onEnterPress !== undefined ? { onEnterPress } : {}),
    ...(onClear !== undefined ? { onClear } : {}),
    ...(onfocus !== undefined ? { onfocus } : {}),
    ...(onblur !== undefined ? { onblur } : {}),
    ...(borderless ? { borderless } : {}),
    ...(insetLabel !== undefined ? { insetLabel } : {}),
    ...(clearIcon !== undefined ? { clearIcon } : {}),
    ...(inputStyle !== undefined ? { style: inputStyle } : {}),
    ...(insetLabelId !== undefined ? { insetLabelId } : {}),
  });
</script>

{#if isRange}
  <!-- range 触发器（对齐 Semi renderRangeInput）：[prefix] + 双 wrapper + separator + [clearbtn] + suffix。 -->
  <div
    class={`${prefixCls}-range-input`}
    class:cd-datepicker-range-input-disabled={disabled}
    class:cd-datepicker-range-input-error={validateStatus === 'error'}
    class:cd-datepicker-range-input-warning={validateStatus === 'warning'}
  >
    <!-- prefix / insetLabel（对齐 Semi renderRangePrefix） -->
    {#if prefix !== undefined || insetLabel !== undefined}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class={`${prefixCls}-range-input-prefix`}
        onclick={(e) => !disabled && !rangeInputFocus && onRangeFocus?.(e, 'rangeStart')}
      >{#if typeof prefix === 'function'}{@render prefix()}{:else if prefix !== undefined}{prefix}{:else if typeof insetLabel === 'function'}{@render insetLabel()}{:else}{insetLabel}{/if}</div>
    {/if}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class={`${inputCls} ${prefixCls}-range-input-wrapper-start ${prefixCls}-range-input-wrapper`}
      class:cd-datepicker-range-input-wrapper-active={rangeInputFocus === 'rangeStart' && !disabled}
      onclick={(e) => !disabled && onRangeFocus?.(e, 'rangeStart')}
    >
      <Input
        borderless
        size={rangeSize}
        {disabled}
        readonly={inputReadOnly}
        placeholder={rangeStartPlaceholder}
        value={rangeStart}
        onChange={(v: string, e: Event) => onRangeChange?.(v, rangeEnd, e)}
        onfocus={(e: FocusEvent) => onRangeFocus?.(e, 'rangeStart')}
        {...(onEnterPress !== undefined ? { onEnterPress } : {})}
      />
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span
      class={`${prefixCls}-range-input-separator`}
      class:cd-datepicker-range-input-separator-active={(rangeStart || rangeEnd) && !disabled}
      onclick={(e) => !disabled && onRangeFocus?.(e, 'rangeStart')}
    >{#if typeof rangeSeparatorNode === 'function'}{@render rangeSeparatorNode()}{:else}{rangeSeparatorNode ?? rangeSeparator}{/if}</span>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class={`${inputCls} ${prefixCls}-range-input-wrapper-end ${prefixCls}-range-input-wrapper`}
      class:cd-datepicker-range-input-wrapper-active={rangeInputFocus === 'rangeEnd' && !disabled}
      onclick={(e) => !disabled && onRangeFocus?.(e, 'rangeEnd')}
    >
      <Input
        borderless
        size={rangeSize}
        {disabled}
        readonly={inputReadOnly}
        placeholder={rangeEndPlaceholder}
        value={rangeEnd}
        onChange={(v: string, e: Event) => onRangeChange?.(rangeStart, v, e)}
        onfocus={(e: FocusEvent) => onRangeFocus?.(e, 'rangeEnd')}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === 'Tab') onRangeEndTab?.(e);
        }}
        {...(onEnterPress !== undefined ? { onEnterPress } : {})}
      />
    </div>
    <!-- range 清除按钮（对齐 Semi renderRangeClearBtn）：有值 + showClear + 非禁用时显示。 -->
    {#if (rangeStart || rangeEnd) && showClear && !disabled}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        role="button"
        tabindex="0"
        aria-label="Clear range input value"
        class={`${prefixCls}-range-input-clearbtn`}
        onmousedown={(e: MouseEvent) => onRangeClear?.(e)}
        onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onRangeClear?.(e as unknown as MouseEvent); }}
      >{#if clearIcon}{@render clearIcon()}{:else}<IconClear aria-hidden="true" />{/if}</div>
    {/if}
    <div class={`${prefixCls}-range-input-suffix`}>
      {#if isTimeType}<IconCalendarClock aria-hidden="true" />{:else}<IconCalendar aria-hidden="true" />{/if}
    </div>
  </div>
{:else}
  <Input
    class={inputCls}
    {value}
    {disabled}
    {showClear}
    {size}
    readonly={inputReadOnly}
    hideSuffix={showClear}
    {...inputRest}
  >
    {#snippet suffix()}
      {#if isTimeType}<IconCalendarClock aria-hidden="true" />{:else}<IconCalendar aria-hidden="true" />{/if}
    {/snippet}
  </Input>
{/if}

<style>
  /* range 触发器 —— 对齐 Semi datePicker.scss `&-range`（896-1075 核心视觉）。
     class 为动态字符串，用 :global 打洞。token：radius small、height 32、bg fill-0、
     text-2、触发器 border 0 transparent、wrapper paddingX 8、active border focus-border + bg fill-1。 */
  :global(.cd-datepicker-range-input) {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    border-radius: var(--cd-radius-small, 3px);
    height: 32px;
    color: var(--cd-color-text-2);
    background-color: var(--cd-color-fill-0);
    border: 0 solid transparent;
  }
  /* start/end wrapper：撑满、透明底、paddingX 8、聚焦端 -active 高亮（滑块效果）。 */
  :global(.cd-datepicker-range-input-wrapper) {
    box-sizing: border-box;
    background-color: transparent;
    padding: 0 8px;
    height: 100%;
    display: flex;
    align-items: center;
    flex: 1;
    /* 实测 Semi range wrapper 是 1px solid transparent（聚焦时换主色），非 focus-border 2px。 */
    border: 1px solid transparent;
    border-radius: var(--cd-radius-small, 3px);
  }
  :global(.cd-datepicker-range-input-wrapper:hover) {
    background-color: var(--cd-color-fill-1);
  }
  :global(.cd-datepicker-range-input-wrapper-start) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  :global(.cd-datepicker-range-input-wrapper-end) {
    border-radius: 0;
  }
  /* 聚焦端 wrapper：focus 边框 + fill-1 底（对齐 Semi -active）。 */
  :global(.cd-datepicker-range-input-wrapper-active) {
    border-color: var(--cd-color-focus-border, var(--cd-color-primary));
    background-color: var(--cd-color-fill-1);
  }
  /* 内嵌 Input 透明无边框（对齐 Semi `.semi-input-wrapper { bg transparent; border none }`）。 */
  :global(.cd-datepicker-range-input-wrapper .cd-input-wrapper) {
    background-color: transparent;
    border: none;
    height: fit-content;
  }
  /* 内层 input 尺寸对齐 Semi 实测：padding 2px 4px、高 22（本库 small 默认 0 12px 会矮 5.5px 且左右过宽）。 */
  :global(.cd-datepicker-range-input-wrapper .cd-input) {
    padding: 2px 4px;
  }
  /* 内层 Input 的 hover / active / focus 态一律压平：这三态只画在外层 -wrapper（照搬 Semi
     datePicker.scss `.semi-input-wrapper { &:active/&:hover:not(#neverExistElement) }`）。
     `#neverExistElement` 是 Semi 原样写法——一个永不存在的 id 选择器，纯粹用来抬特异性
     (+1,0,0) 压过 Input 自带的 hover/focus 规则，比堆一串 :not(.class) 干净。
     本库 Input 的聚焦态是 :focus-within（Semi 是 -focus 类），故多压一条。 */
  :global(.cd-datepicker-range-input-wrapper .cd-input-wrapper:hover:not(#neverExistElement)),
  :global(.cd-datepicker-range-input-wrapper .cd-input-wrapper:active:not(#neverExistElement)),
  :global(.cd-datepicker-range-input-wrapper .cd-input-wrapper:focus-within:not(#neverExistElement)) {
    background-color: transparent;
    border: none;
    box-shadow: none;
  }
  /* 分隔符：有值时 -active 文字加深（对齐 Semi `-separator-active { text-0 }`）。 */
  :global(.cd-datepicker-range-input-separator) {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    /* 实测 Semi separator 高 20px（跟随 line-height），非撑满 wrapper。 */
    height: var(--cd-line-height-normal, 20px);
  }
  :global(.cd-datepicker-range-input-separator-active) {
    color: var(--cd-color-text-0);
  }
  /* suffix 图标 */
  :global(.cd-datepicker-range-input-suffix) {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    /* 实测 Semi suffix padding: 0 12px 0 8px（右侧留白更大）。 */
    padding: 0 12px 0 8px;
    color: var(--cd-color-text-2);
  }
  /* hover 整体（对齐 Semi `&-input:hover` bg fill-1 via wrapper）。 */
  :global(.cd-datepicker-range-input-disabled) {
    cursor: not-allowed;
    color: var(--cd-color-disabled-text);
  }
  /* range prefix / insetLabel（对齐 Semi -range-input-prefix）。 */
  :global(.cd-datepicker-range-input-prefix) {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0 8px;
    color: var(--cd-color-text-2);
  }
  /* range 清除按钮（对齐 Semi -range-input-clearbtn）：flex center + text-2，hover 加深。 */
  :global(.cd-datepicker-range-input-clearbtn) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0 8px;
    cursor: pointer;
    white-space: nowrap;
    color: var(--cd-color-text-2);
  }
  :global(.cd-datepicker-range-input-clearbtn:hover) {
    color: var(--cd-color-text-0);
  }
  /* range 校验态（对齐 Semi -range-input-error/-warning）：容器边框 + 浅底。 */
  :global(.cd-datepicker-range-input-error) {
    border: 1px solid var(--cd-color-danger);
    background-color: var(--cd-color-danger-light-default);
  }
  :global(.cd-datepicker-range-input-warning) {
    border: 1px solid var(--cd-color-warning);
    background-color: var(--cd-color-warning-light-default);
  }
</style>
