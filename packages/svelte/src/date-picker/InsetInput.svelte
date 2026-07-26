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

<style>
  /* InsetInput 面板内输入框 —— 对齐 Semi datePicker.scss `&-inset-input`（856-894）。
     class 为动态字符串，用 :global 打洞。token：wrapper column-gap=8、padding=12 16 0、
     宽度 date 284/range 568/month 165/monthRange 331；separator 高 32、padding 0 4、color text-3。 */
  :global(.cd-datepicker-inset-input-wrapper) {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    box-sizing: border-box;
    column-gap: var(--cd-spacing-tight, 8px);
    padding: 12px 16px;
    padding-bottom: 0;
    width: 284px;
  }
  :global(.cd-datepicker-inset-input-wrapper[x-type='dateRange']),
  :global(.cd-datepicker-inset-input-wrapper[x-type='dateTimeRange']) {
    width: 568px;
  }
  :global(.cd-datepicker-inset-input-wrapper[x-type='month']) {
    width: 165px;
  }
  :global(.cd-datepicker-inset-input-wrapper[x-type='monthRange']) {
    width: 331px;
  }
  /* 内嵌 Input 均分撑满（对齐 Semi `.semi-input-wrapper { flex: 1 }`）。 */
  :global(.cd-datepicker-inset-input-wrapper .cd-input-wrapper) {
    flex: 1;
    flex-shrink: 0;
  }
  /* 分隔符（对齐 Semi `&-separator`：高 32、padding 0 4、text-3）。 */
  :global(.cd-datepicker-inset-input-separator) {
    flex-grow: 0;
    flex-shrink: 0;
    height: 32px;
    line-height: 32px;
    padding: 0 4px;
    color: var(--cd-color-text-3);
  }
</style>
