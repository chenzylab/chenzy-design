<!--
  DateInput —— 对齐 Semi datePicker/dateInput.tsx（单输入分支；range/inset 留后续里程碑）。
  触发器复用本库 <Input>（对齐 Semi 复用 Input）：suffix=日历图标（dateTime 用 CalendarClock）、
  value=展示文案、showClear、onChange/onEnterPress/onClear 透传。
-->
<script lang="ts">
  import Input from '../input/Input.svelte';
  import { IconCalendar, IconCalendarClock } from '@chenzy-design/icons';
  import { cssClasses, type PickerType, type PickerSize } from './constants.js';
  import type { ValidateStatus } from './date-picker-foundation.svelte.js';

  interface Props {
    type: PickerType;
    /** 展示文案（foundation formattedValue / 输入中的 inputValue）。 */
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
  }: Props = $props();

  const prefixCls = cssClasses.PREFIX;
  // dateTime 系用 CalendarClock，其余用 Calendar（对齐 Semi suffix 选择）。
  const isTimeType = $derived(type.includes('Time'));
  // 只读态 class（对齐 Semi -input-readonly）。
  const inputCls = $derived(inputReadOnly ? `${prefixCls}-input-readonly` : '');

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
