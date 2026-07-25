<!--
  DatePickerNext —— 从零重写的主装配（里程碑3：基本 date 单面板）。
  对齐 Semi datePicker.tsx：外层 div.PREFIX > Popover(trigger=custom, content=面板) > combobox wrapper > DateInput。
  面板：div.PREFIX[x-type] > div.-container > div > (Navigation + Month)。
  值模型走 date-picker-foundation（parseWithTimezone/disposeCallbackArgs/_notifyChange）。
  range/dateTime/yam/tpk/footer/inset/preset 留后续里程碑（此处只装 date 单面板）。
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { format as dateFnsFormat } from 'date-fns';
  import { useLocale } from '../locale-provider/index.js';
  import { CONFIG_CONTEXT_KEY, type ConfigContextValue } from '../config-provider/context.js';
  import Popover from '../popover/Popover.svelte';
  import DateInput from './DateInput.svelte';
  import MonthsGrid from './MonthsGrid.svelte';
  import { cssClasses, numbers, strings, type PickerType, type PickerSize } from './constants.js';
  import {
    createDatePickerState,
    type DatePickerFoundationProps,
    type ValidateStatus,
  } from './date-picker-foundation.svelte.js';
  import type { WeekStartNumber } from './_utils/getDayOfWeek.js';

  interface Props {
    type?: PickerType;
    value?: Date | Date[] | null;
    defaultValue?: Date | Date[] | null;
    defaultPickerValue?: Date;
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    placeholder?: string;
    format?: string;
    showClear?: boolean;
    inputReadOnly?: boolean;
    validateStatus?: ValidateStatus;
    size?: PickerSize;
    weekStartsOn?: WeekStartNumber;
    disabledDate?: (date: Date) => boolean;
    timeZone?: string | number;
    onChange?: (value: Date | Date[] | null, dateString: string) => void;
    onChangeWithDateFirst?: boolean;
    onOpenChange?: (open: boolean) => void;
  }

  let {
    type = 'date',
    value,
    defaultValue,
    defaultPickerValue,
    open,
    defaultOpen = false,
    disabled = false,
    placeholder,
    format,
    showClear = false,
    inputReadOnly = true,
    validateStatus,
    size = 'default',
    weekStartsOn = numbers.WEEK_START_ON as WeekStartNumber,
    disabledDate,
    timeZone,
    onChange,
    onChangeWithDateFirst = false,
    onOpenChange,
  }: Props = $props();

  const loc = useLocale();
  const PREFIX = cssClasses.PREFIX;

  // ConfigProvider timeZone 注入（自身 timeZone 优先，对齐 Semi index.tsx）。
  const configCtx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  const configTimeZone = $derived(configCtx?.current.timeZone);

  // foundation：值模型/格式化/open（rune 工厂，getProps 回调跨文件响应式）。
  const fProps: DatePickerFoundationProps = {
    get type() { return type; },
    get value() { return value; },
    get defaultValue() { return defaultValue; },
    get open() { return open; },
    get defaultOpen() { return defaultOpen; },
    multiple: false,
    get format() { return format; },
    get locale() { return loc().code; },
    rangeSeparator: strings.DEFAULT_SEPARATOR_RANGE,
    get timeZone() { return timeZone; },
    get configTimeZone() { return configTimeZone; },
    showSecond: true,
    // date 单值：foundation onChange 抛 Date|null，直接透传（RangeValue 分支此里程碑不涉及）。
    get onChange() { return onChange as DatePickerFoundationProps['onChange']; },
    get onChangeWithDateFirst() { return onChangeWithDateFirst; },
    get onOpenChange() { return onOpenChange; },
  };
  const st = createDatePickerState(() => fProps);

  // 受控显示：选中值 → selected Set（fullDate 字符串，对齐 Semi）。MonthsGrid 自管面板游标。
  const selectedSet = $derived.by(() => {
    const s = new Set<string>();
    if (st.currentSingle instanceof Date) s.add(dateFnsFormat(st.currentSingle, 'yyyy-MM-dd'));
    return s;
  });
  // 面板初始定位月：选中值 / defaultPickerValue / 今天。
  const panelPickerValue = $derived(
    (st.currentSingle instanceof Date ? st.currentSingle : null) ?? defaultPickerValue,
  );

  // 触发器展示文案（foundation formattedValue）。
  const triggerText = $derived(st.formattedValue);
  const phText = $derived(placeholder ?? loc().t(`DatePicker.placeholder`));

  function openPanel() {
    if (disabled) return;
    st.setOpen(true);
  }

  // MonthsGrid 选中回调（Date[] 墙上时间域）→ 联动值模型 foundation。date 单选取 dates[0]。
  function handleSelectedChange(dates: Date[]) {
    st.handleSelectedChange(dates[0] ?? null);
    st.setOpen(false);
  }

  function handleClear() {
    st.handleSelectedChange(null);
  }

  const disabledDateWrap = $derived(
    disabledDate ? (date: Date) => disabledDate!(date) : undefined,
  );
  const monthsGridRest = $derived({
    ...(disabledDateWrap ? { disabledDate: disabledDateWrap } : {}),
    ...(panelPickerValue ? { defaultPickerValue: panelPickerValue } : {}),
  });
  const dateInputRest = $derived(validateStatus !== undefined ? { validateStatus } : {});
</script>

<div class={PREFIX}>
  <Popover
    trigger="custom"
    visible={st.isOpen}
    position="bottomLeft"
    spacing={numbers.SPACING}
    onVisibleChange={(v) => st.setOpen(v)}
  >
    {#snippet content()}
      <div class={PREFIX} {...{ 'x-type': type }}>
        <div class={`${PREFIX}-container`}>
          <div>
            <MonthsGrid
              {type}
              selected={selectedSet}
              {weekStartsOn}
              onSelectedChange={handleSelectedChange}
              {...monthsGridRest}
            />
          </div>
        </div>
      </div>
    {/snippet}

    <!-- 触发器：combobox wrapper（对齐 Semi renderInner，Semi 亦 eslint-disable role-has-required-aria-props：
         combobox 语义靠 Input，aria-controls 不强挂）。点击打开面板。 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_role_has_required_aria_props -->
    <div
      class={`${PREFIX}-input`}
      role="combobox"
      aria-label={triggerText ? 'Change date' : 'Choose date'}
      aria-expanded={st.isOpen}
      aria-disabled={disabled || undefined}
      tabindex="-1"
      onclick={openPanel}
    >
      <DateInput
        {type}
        value={triggerText}
        placeholder={phText}
        {disabled}
        {showClear}
        {inputReadOnly}
        {size}
        onClear={handleClear}
        {...dateInputRest}
      />
    </div>
  </Popover>
</div>
