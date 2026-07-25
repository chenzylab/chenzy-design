<!--
  DateInput —— 对齐 Semi datePicker/dateInput.tsx。
  单选：复用本库 <Input>（suffix=日历图标，dateTime 用 CalendarClock）。
  range：对齐 Semi renderRangeInput —— .range-input(flex) > wrapper-start(Input) + separator + wrapper-end(Input) + suffix，
    焦点端 wrapper 加 -active 高亮（滑块）；value 为 `start${rangeSeparator}end` 串，按 separator 拆分回显。
-->
<script lang="ts">
  import Input from '../input/Input.svelte';
  import { IconCalendar, IconCalendarClock } from '@chenzy-design/icons';
  import { cssClasses, type PickerType, type PickerSize } from './constants.js';
  import type { ValidateStatus } from './date-picker-foundation.svelte.js';
  import type { RangeInputFocus } from './month-foundation.svelte.js';

  interface Props {
    type: PickerType;
    /** 展示文案（foundation formattedValue / 输入中的 inputValue）。range 时为 `start${sep}end` 串。 */
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    showClear?: boolean;
    inputReadOnly?: boolean;
    validateStatus?: ValidateStatus;
    size?: PickerSize;
    prefix?: import('svelte').Snippet | string;
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
  }

  let {
    type,
    value = '',
    placeholder,
    disabled = false,
    showClear = false,
    inputReadOnly = false,
    validateStatus,
    size = 'default',
    prefix,
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
  const rangePlaceholder = $derived(placeholder ?? '');

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
  });
</script>

{#if isRange}
  <!-- range 触发器（对齐 Semi renderRangeInput）：双 wrapper + separator，焦点端 -active 高亮。 -->
  <div class={`${prefixCls}-range-input`} class:cd-datepicker-range-input-disabled={disabled}>
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
        placeholder={rangePlaceholder}
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
    >{rangeSeparator}</span>
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
        placeholder={rangePlaceholder}
        value={rangeEnd}
        onChange={(v: string, e: Event) => onRangeChange?.(rangeStart, v, e)}
        onfocus={(e: FocusEvent) => onRangeFocus?.(e, 'rangeEnd')}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === 'Tab') onRangeEndTab?.(e);
        }}
        {...(onEnterPress !== undefined ? { onEnterPress } : {})}
      />
    </div>
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
    border: var(--cd-width-focus-border, 2px) solid transparent;
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
  :global(.cd-datepicker-range-input-wrapper .cd-input-wrapper:hover),
  :global(.cd-datepicker-range-input-wrapper .cd-input-wrapper:active) {
    background-color: transparent;
  }
  /* 分隔符：有值时 -active 文字加深（对齐 Semi `-separator-active { text-0 }`）。 */
  :global(.cd-datepicker-range-input-separator) {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  :global(.cd-datepicker-range-input-separator-active) {
    color: var(--cd-color-text-0);
  }
  /* suffix 图标 */
  :global(.cd-datepicker-range-input-suffix) {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0 8px;
    color: var(--cd-color-text-2);
  }
  /* hover 整体（对齐 Semi `&-input:hover` bg fill-1 via wrapper）。 */
  :global(.cd-datepicker-range-input-disabled) {
    cursor: not-allowed;
    color: var(--cd-color-disabled-text);
  }
</style>
