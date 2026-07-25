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
  import QuickControl from './QuickControl.svelte';
  import InsetInput from './InsetInput.svelte';
  import getInsetInputFormatToken from './_utils/getInsetInputFormatToken.js';
  import { parse as dateFnsParse } from 'date-fns';
  import { cssClasses, numbers, strings, type PickerType, type PickerSize } from './constants.js';
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
    /** 快捷选择预设（对齐 Semi presets）。 */
    presets?: PresetsType;
    /** 预设位置（对齐 Semi presetPosition，默认 bottom）。 */
    presetPosition?: 'left' | 'right' | 'top' | 'bottom';
    onPresetClick?: (preset: PresetType, e: MouseEvent) => void;
    /** 面板内嵌输入框（对齐 Semi insetInput）：触发器只读，面板顶部输入。 */
    insetInput?: boolean;
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
    presets = [],
    presetPosition = 'bottom',
    onPresetClick,
    insetInput = false,
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
  // range 触发器展示串（`start${sep}end`，与 DateInput split 用同一 separator）。
  const rangeSep = strings.DEFAULT_SEPARATOR_RANGE;
  const rangeTriggerValue = $derived(
    st.isRange ? `${rangeStartStr}${rangeSep}${rangeEndStr}` : '',
  );
  // range 端聚焦（对齐 Semi handleRangeInputFocus）：更新 rangeInputFocus + 打开面板。
  function handleRangeFocus(_e: Event, rangeType: 'rangeStart' | 'rangeEnd') {
    if (disabled) return;
    rangeInputFocus = rangeType;
    st.setOpen(true);
  }
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
      st.handleRangeSelectedChange([start, end]);
      if (start && end) st.setOpen(false);
    } else if (start) {
      st.handleSelectedChange(start);
      st.setOpen(false);
    }
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
          <!-- preset left（对齐 Semi，monthRange 暂不支持 preset） -->
          {#if presetPosition === 'left' && presets.length && type !== 'monthRange'}
            <QuickControl {type} {presets} presetPosition="left" onPresetClick={handlePresetClick} />
          {/if}
          <div>
            <!-- insetInput：面板内输入框（对齐 Semi renderDateInput，面板顶部） -->
            {#if insetInput}
              <InsetInput
                {type}
                value={insetValue}
                {format}
                rangeSeparator={strings.DEFAULT_SEPARATOR_RANGE}
                onInsetChange={onInsetChange}
              />
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
            <!-- preset bottom -->
            {#if presetPosition === 'bottom' && presets.length && type !== 'monthRange'}
              <QuickControl {type} {presets} presetPosition="bottom" onPresetClick={handlePresetClick} />
            {/if}
          </div>
          <!-- preset right -->
          {#if presetPosition === 'right' && presets.length && type !== 'monthRange'}
            <QuickControl {type} {presets} presetPosition="right" onPresetClick={handlePresetClick} />
          {/if}
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
        value={st.isRange ? rangeTriggerValue : triggerText}
        placeholder={phText}
        {disabled}
        {showClear}
        {inputReadOnly}
        {size}
        onClear={handleClear}
        rangeSeparator={rangeSep}
        {rangeInputFocus}
        onRangeFocus={handleRangeFocus}
        {...dateInputRest}
      />
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
  /* 触发器 wrapper（combobox） */
  :global(.cd-datepicker-input) {
    display: inline-block;
    inline-size: 100%;
  }
</style>
