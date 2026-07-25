<!--
  InsetInput —— 面板内输入框（对齐 Semi datePicker/dateInput.tsx renderInputInset + insetInput.tsx）。
  div.-inset-input-wrapper[x-type] > InsetDateInput(monthLeft.date) + InsetTimeInput(monthLeft.time，dateTime 才显示)
    + [range: separator + InsetDateInput(monthRight.date) + InsetTimeInput(monthRight.time)]。
  复用本库 Input（对齐 Semi InsetDateInput/InsetTimeInput 各 <Input>）。
  逻辑走 input-foundation：改值 → handleInsetInputChange → 反解 value 经 onInsetChange 回主组件提交。
-->
<script lang="ts">
  import Input from '../input/Input.svelte';
  import { cssClasses, type PickerType } from './constants.js';
  import { createInputFoundation, type InsetInputValue } from './input-foundation.js';

  interface Props {
    type: PickerType;
    /** 当前值（用于反解 insetInputValue 显示）。 */
    value?: Array<Date | null>;
    format?: string | undefined;
    rangeSeparator?: string;
    density?: 'default' | 'compact';
    defaultPickerValue?: Date | Date[];
    /** inset 输入变化 → 拼串后回主组件解析提交（对齐 Semi onInsetInputChange）。 */
    onInsetChange?: (insetInputStr: string, insetInputValue: InsetInputValue) => void;
    onDateFocus?: (e: FocusEvent, rangeType: 'rangeStart' | 'rangeEnd') => void;
    onTimeFocus?: (e: FocusEvent) => void;
  }

  let {
    type,
    value = [],
    format,
    rangeSeparator = ' ~ ',
    density = 'default',
    defaultPickerValue,
    onInsetChange,
    onDateFocus,
    onTimeFocus,
  }: Props = $props();

  const PREFIX = cssClasses.PREFIX;

  const f = createInputFoundation(() => ({
    type,
    ...(format !== undefined ? { format } : {}),
    rangeSeparator,
    ...(defaultPickerValue !== undefined ? { defaultPickerValue } : {}),
  }));

  // 本地 insetInputValue：受控由 value 反解，编辑时用本地态。
  let localInset = $state<InsetInputValue | null>(null);
  const insetInputValue = $derived<InsetInputValue>(
    localInset ?? f.getInsetInputValue({ value }),
  );

  const placeholders = $derived(f.getInsetInputPlaceholder());
  const isRange = $derived(/range/i.test(type));
  const isTimeType = $derived(type.includes('Time'));

  function onFieldChange(valuePath: string, v: string) {
    const res = f.handleInsetInputChange({ value: v, valuePath, insetInputValue });
    localInset = res.insetInputValue;
    onInsetChange?.(res.insetInputStr, res.insetInputValue);
  }
</script>

<div class={`${PREFIX}-inset-input-wrapper`} {...{ 'x-type': type }}>
  <!-- monthLeft date -->
  <Input
    value={insetInputValue.monthLeft.dateInput}
    placeholder={placeholders.datePlaceholder}
    onChange={(v) => onFieldChange('monthLeft.dateInput', v)}
    onfocus={(e: FocusEvent) => onDateFocus?.(e, 'rangeStart')}
  />
  <!-- monthLeft time（dateTime 才渲染，无日期时禁用） -->
  {#if isTimeType}
    <Input
      value={insetInputValue.monthLeft.timeInput}
      placeholder={placeholders.timePlaceholder}
      disabled={!insetInputValue.monthLeft.dateInput}
      onChange={(v) => onFieldChange('monthLeft.timeInput', v)}
      onfocus={(e: FocusEvent) => onTimeFocus?.(e)}
    />
  {/if}

  {#if isRange}
    <div class={`${PREFIX}-inset-input-separator`}>{density === 'compact' ? '' : '-'}</div>
    <!-- monthRight date -->
    <Input
      value={insetInputValue.monthRight.dateInput}
      placeholder={placeholders.datePlaceholder}
      onChange={(v) => onFieldChange('monthRight.dateInput', v)}
      onfocus={(e: FocusEvent) => onDateFocus?.(e, 'rangeEnd')}
    />
    {#if isTimeType}
      <Input
        value={insetInputValue.monthRight.timeInput}
        placeholder={placeholders.timePlaceholder}
        disabled={!insetInputValue.monthRight.dateInput}
        onChange={(v) => onFieldChange('monthRight.timeInput', v)}
        onfocus={(e: FocusEvent) => onTimeFocus?.(e)}
      />
    {/if}
  {/if}
</div>
