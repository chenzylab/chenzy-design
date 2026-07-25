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
  import YearAndMonth from './YearAndMonth.svelte';
  import { cssClasses, numbers, strings, type PickerType, type PickerSize } from './constants.js';
  import {
    createDatePickerState,
    type RangeValue,
    type DatePickerFoundationProps,
    type ValidateStatus,
  } from './date-picker-foundation.svelte.js';
  import type { WeekStartNumber } from './_utils/getDayOfWeek.js';

  interface Props {
    type?: PickerType;
    value?: Date | Date[] | RangeValue | null;
    defaultValue?: Date | Date[] | RangeValue | null;
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
    onChange?: (value: Date | Date[] | RangeValue | null, dateString: string) => void;
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

  // 受控显示：单值 → selected Set（fullDate 字符串，对齐 Semi）。MonthsGrid 自管面板游标。
  const selectedSet = $derived.by(() => {
    const s = new Set<string>();
    if (!st.isRange && st.currentSingle instanceof Date) {
      s.add(dateFnsFormat(st.currentSingle, 'yyyy-MM-dd'));
    }
    return s;
  });
  // range 反解：currentRange（墙上时间）→ rangeStart/End 字符串（yyyy-MM-dd(HH:mm:ss)）传 MonthsGrid。
  const rangeToken = $derived(st.isDateTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd');
  const rangeStartStr = $derived(
    st.isRange && st.currentRange[0] ? dateFnsFormat(st.currentRange[0]!, rangeToken) : '',
  );
  const rangeEndStr = $derived(
    st.isRange && st.currentRange[1] ? dateFnsFormat(st.currentRange[1]!, rangeToken) : '',
  );
  // 面板初始定位月：选中值 / range 起点 / defaultPickerValue / 今天。
  const panelPickerValue = $derived(
    (st.currentSingle instanceof Date ? st.currentSingle : null) ?? st.currentRange[0] ?? defaultPickerValue,
  );

  // range 焦点端（双 Input 联动占位；单 Input 阶段用本地流转，对齐 Semi rangeInputFocus）。
  let rangeInputFocus = $state<'rangeStart' | 'rangeEnd' | false>(false);

  // 触发器展示文案（foundation formattedValue）。
  const triggerText = $derived(st.formattedValue);
  const phText = $derived(placeholder ?? loc().t(`DatePicker.placeholder`));

  function openPanel() {
    if (disabled) return;
    st.setOpen(true);
  }

  // MonthsGrid 选中回调（Date[] 墙上时间域）→ 联动值模型 foundation。
  function handleSelectedChange(dates: Date[]) {
    if (st.isRange) {
      // range：dates=[start(,end)]；完整两端才关闭面板。
      const pair: [Date | null, Date | null] = [dates[0] ?? null, dates[1] ?? null];
      st.handleRangeSelectedChange(pair);
      if (pair[0] && pair[1]) st.setOpen(false);
    } else {
      st.handleSelectedChange(dates[0] ?? null);
      st.setOpen(false);
    }
  }

  function handleClear() {
    if (st.isRange) st.handleRangeSelectedChange([null, null]);
    else st.handleSelectedChange(null);
  }

  // ===== year/month/monthRange：面板走 YearAndMonth 滚轮（对齐 Semi typeIsYearOrMonth）=====
  const typeIsYearOrMonth = $derived(st.isMonth || st.isYear);
  // currentYear/Month 从 value 反解（{left,right}，对齐 Semi renderYearMonthPanel）。
  const ymYear = $derived.by(() => {
    const y = { left: 0, right: 0 };
    if (st.currentSingle instanceof Date) y.left = st.currentSingle.getFullYear();
    if (type === 'monthRange') {
      if (st.currentRange[0]) y.left = st.currentRange[0]!.getFullYear();
      if (st.currentRange[1]) y.right = st.currentRange[1]!.getFullYear();
    }
    return y;
  });
  const ymMonth = $derived.by(() => {
    const m = { left: 0, right: 0 };
    if (st.currentSingle instanceof Date) m.left = st.currentSingle.getMonth() + 1;
    if (type === 'monthRange') {
      if (st.currentRange[0]) m.left = st.currentRange[0]!.getMonth() + 1;
      if (st.currentRange[1]) m.right = st.currentRange[1]!.getMonth() + 1;
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
      <div
        class={typeIsYearOrMonth ? `${PREFIX} ${PREFIX}-yam` : PREFIX}
        {...{ 'x-type': type }}
      >
        <div class={`${PREFIX}-container`}>
          <div>
            {#if typeIsYearOrMonth}
              <YearAndMonth
                {type}
                currentYear={ymYear}
                currentMonth={ymMonth}
                noBackBtn
                monthCycled
                localeCode={loc().code}
                onSelect={handleYMSelectedChange}
                {...(disabledDateWrap ? { disabledDate: disabledDateWrap } : {})}
              />
            {:else}
              <MonthsGrid
                {type}
                selected={selectedSet}
                rangeStart={rangeStartStr}
                rangeEnd={rangeEndStr}
                {rangeInputFocus}
                setRangeInputFocus={(f) => (rangeInputFocus = f)}
                {weekStartsOn}
                onSelectedChange={handleSelectedChange}
                {...monthsGridRest}
              />
            {/if}
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
