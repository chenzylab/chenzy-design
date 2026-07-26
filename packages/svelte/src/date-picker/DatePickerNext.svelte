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
  import Footer from './Footer.svelte';
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
    /** 多选（仅 type=date，对齐 Semi multiple）：value/onChange 为 Date[]，点日期 toggle。 */
    multiple?: boolean;
    /** 多选上限（对齐 Semi max）：到上限再点触发 onMaxLimit，不再增选。 */
    max?: number;
    /** 多选到上限时回调（对齐 Semi onMaxSelect）。 */
    onMaxLimit?: () => void;
    /** 快捷选择预设（对齐 Semi presets）。 */
    presets?: PresetsType;
    /** 预设位置（对齐 Semi presetPosition，默认 bottom）。 */
    presetPosition?: 'left' | 'right' | 'top' | 'bottom';
    onPresetClick?: (preset: PresetType, e: MouseEvent) => void;
    /** 面板内嵌输入框（对齐 Semi insetInput）：触发器只读，面板顶部输入。 */
    insetInput?: boolean;
    /** 需确认（对齐 Semi needConfirm，仅 dateTime/dateTimeRange）：选择先暂存，点确认才提交。 */
    needConfirm?: boolean;
    /** 点确认回调（对齐 Semi onConfirm）。 */
    onConfirm?: (value: Date | Date[] | RangeValue | null, dateString: string) => void;
    /** 点取消回调（对齐 Semi onCancel）。 */
    onCancel?: (value: Date | Date[] | RangeValue | null, dateString: string) => void;
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
    inputReadOnly = false,
    validateStatus,
    size = 'default',
    weekStartsOn = numbers.WEEK_START_ON as WeekStartNumber,
    disabledDate,
    timeZone,
    multiple = false,
    max,
    onMaxLimit,
    presets = [],
    presetPosition = 'bottom',
    onPresetClick,
    insetInput = false,
    needConfirm = false,
    onConfirm,
    onCancel,
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
    get multiple() { return multiple; },
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

  // 受控显示：单值/多选 → selected Set（fullDate 字符串，对齐 Semi）。MonthsGrid 自管面板游标。
  const selectedSet = $derived.by(() => {
    const s = new Set<string>();
    if (st.isRange) return s;
    if (multiple && Array.isArray(st.current)) {
      for (const d of st.current) if (d instanceof Date) s.add(dateFnsFormat(d, 'yyyy-MM-dd'));
    } else if (st.currentSingle instanceof Date) {
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
  // rangeEnd 框按 Tab（对齐 Semi handleRangeEndTabPress → setRangeInputFocus(false)）：
  // 清焦点端，让 Tab 自然移焦出触发器（不阻止默认，不强制关面板，严格对齐 Semi）。
  function handleRangeEndTab(_e: KeyboardEvent) {
    rangeInputFocus = false;
  }

  // 手动输入态（对齐 Semi inputValue）：正在编辑时 inputValue 非 null，展示以它为准；
  // 提交/关闭后回 null，展示回落 formattedValue/rangeTriggerValue。inset 时强制只读（对齐 Semi）。
  const effectiveReadOnly = $derived(inputReadOnly || insetInput);
  let inputValue = $state<string | null>(null);
  // MonthsGrid 引用（手输提交后命令面板跳到输入值的月份）。
  let monthsGridRef = $state<{ syncPanelTo: (base: Date) => void } | undefined>();

  // 提交手输并让面板跳到解析值的月份（对齐 Semi：value 变化时面板重定位）。
  function commitInput(v: string) {
    const parsed = st.parseInput(v);
    st.handleInputComplete(v);
    if (parsed.length && parsed[0]) monthsGridRef?.syncPanelTo(parsed[0]);
  }

  // 单值手动输入变化（对齐 Semi handleChange → 更新 inputValue）。
  function handleInputChange(v: string) {
    inputValue = v;
  }
  // range 手动输入变化（对齐 Semi handleRangeInputChange → 拼 `start${sep}end` 更新 inputValue）。
  function handleRangeInputChange(rangeStart: string, rangeEnd: string) {
    inputValue = `${rangeStart}${rangeSep}${rangeEnd}`;
  }
  // 回车提交（对齐 Semi handleRangeInputEnterPress/notifyEnter → handleInputComplete）。
  function handleEnterPress() {
    if (inputValue !== null) {
      commitInput(inputValue);
      inputValue = null;
    }
  }

  // 面板关闭：提交未决输入并清编辑态（对齐 Semi 关闭时 handleInputComplete，展示回落 formattedValue）。
  // 仅在 open 由 true→false 的转换时提交（否则面板常闭时每次输入都会被误清空）。
  let prevOpen = st.isOpen;
  $effect(() => {
    const nowOpen = st.isOpen;
    if (prevOpen && !nowOpen && inputValue !== null) {
      const pending = inputValue;
      inputValue = null;
      commitInput(pending);
    }
    prevOpen = nowOpen;
  });
  // 面板初始定位月：选中值 / range 起点 / defaultPickerValue / 今天。
  const panelPickerValue = $derived(
    (st.currentSingle instanceof Date ? st.currentSingle : null) ?? st.currentRange[0] ?? defaultPickerValue,
  );

  // range 焦点端（双 Input 联动占位；单 Input 阶段用本地流转，对齐 Semi rangeInputFocus）。
  let rangeInputFocus = $state<'rangeStart' | 'rangeEnd' | false>(false);

  // 触发器展示文案（foundation formattedValue）。
  const triggerText = $derived(st.formattedValue);
  const phText = $derived(placeholder ?? loc().t(`DatePicker.placeholder`));
  // 触发器展示值：编辑中用 inputValue，否则 range 用双端串、单值用 formattedValue。
  const triggerDisplay = $derived(
    inputValue !== null ? inputValue : st.isRange ? rangeTriggerValue : triggerText,
  );

  function openPanel() {
    if (disabled) return;
    st.setOpen(true);
  }

  // needConfirm（对齐 Semi）：进入面板时快照原值，cancel 时恢复；confirm 才 notifyConfirm。
  // 仅 dateTime/dateTimeRange 生效（Semi 语义）。
  const effectiveNeedConfirm = $derived(needConfirm && (type === 'dateTime' || type === 'dateTimeRange'));
  let valueSnapshot = $state<Date | Date[] | RangeValue | null>(null);
  $effect(() => {
    // 面板打开瞬间快照当前值（供 cancel 恢复）。
    if (st.isOpen && effectiveNeedConfirm && valueSnapshot === null) {
      valueSnapshot = st.current;
    }
    if (!st.isOpen) valueSnapshot = null;
  });

  // MonthsGrid 选中回调（Date[] 墙上时间域）→ 联动值模型 foundation。
  function handleSelectedChange(dates: Date[]) {
    if (st.isRange) {
      // range：dates=[start(,end)]；完整两端才关闭面板（needConfirm 时不自动关，等确认）。
      const pair: [Date | null, Date | null] = [dates[0] ?? null, dates[1] ?? null];
      st.handleRangeSelectedChange(pair);
      if (pair[0] && pair[1] && !effectiveNeedConfirm) st.setOpen(false);
    } else if (multiple) {
      // 多选：dates=当前全部选中日；抛数组、不关面板（继续 toggle，对齐 Semi）。
      st.handleSelectedChange(dates);
    } else {
      st.handleSelectedChange(dates[0] ?? null);
      if (!effectiveNeedConfirm) st.setOpen(false);
    }
  }

  // Footer 确认（对齐 Semi handleConfirm）：关面板 + notifyConfirm（当前值即已提交的暂存值）。
  function handleConfirm() {
    st.setOpen(false);
    const { notifyValue, notifyDate } = st.disposeCallbackArgs(st.current);
    onConfirm?.(notifyDate as Date | Date[] | RangeValue | null, notifyValue as string);
  }
  // Footer 取消（对齐 Semi handleCancel）：恢复快照原值 + 关面板 + notifyCancel。
  function handleCancel() {
    const snap = valueSnapshot;
    if (st.isRange) {
      const pair = Array.isArray(snap) ? snap : [null, null];
      st.handleRangeSelectedChange([pair[0] ?? null, pair[1] ?? null] as RangeValue);
    } else {
      st.handleSelectedChange((snap as Date | null) ?? null);
    }
    st.setOpen(false);
    const { notifyValue, notifyDate } = st.disposeCallbackArgs(snap ?? null);
    onCancel?.(notifyDate as Date | Date[] | RangeValue | null, notifyValue as string);
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
                bind:this={monthsGridRef}
                {type}
                selected={selectedSet}
                rangeStart={rangeStartStr}
                rangeEnd={rangeEndStr}
                {rangeInputFocus}
                setRangeInputFocus={(f) => (rangeInputFocus = f)}
                {weekStartsOn}
                {multiple}
                {...(max !== undefined ? { max } : {})}
                {...(onMaxLimit ? { onMaxLimit } : {})}
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
        <!-- needConfirm 确认栏（对齐 Semi footer.tsx）：range 未完整时禁用确认。 -->
        {#if effectiveNeedConfirm}
          <Footer
            disabledConfirm={st.isRange && !(st.currentRange[0] && st.currentRange[1])}
            onConfirmClick={handleConfirm}
            onCancelClick={handleCancel}
          />
        {/if}
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
        value={triggerDisplay}
        placeholder={phText}
        {disabled}
        {showClear}
        inputReadOnly={effectiveReadOnly}
        {size}
        onClear={handleClear}
        onChange={handleInputChange}
        onEnterPress={handleEnterPress}
        rangeSeparator={rangeSep}
        {rangeInputFocus}
        onRangeFocus={handleRangeFocus}
        onRangeChange={handleRangeInputChange}
        onRangeEndTab={handleRangeEndTab}
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
