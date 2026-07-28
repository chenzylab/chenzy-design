/**
 * MonthsGrid foundation —— 照搬 Semi monthsGridFoundation.ts（range 状态机中枢，DatePicker 交互大脑）。
 * rune 化：createMonthsGridState(getProps) 内 $state 持有 selected/rangeStart/End/hoverDay/
 * monthLeft/Right/rangeInputFocus；Semi 的 _adapter.notify* → 直接回调 props.onSelectedChange。
 *
 * 本文件第一阶段：state + 单选(handleDateSelected) + 导航 + 面板切换。range(handleRangeSelected)
 * 与 dateTime 时间合并逐步补入。方法名逐一对齐 Semi，不缩水。
 */
import { addMonths, addYears, differenceInCalendarMonths } from 'date-fns';
import { formatFullDate } from './_utils/getMonthTable.js';
import isValidDate from './_utils/isValidDate.js';
import isBefore from './_utils/isBefore.js';
import isSameDay from './_utils/isSameDay.js';
import getFullDateOffset from './_utils/getFullDateOffset.js';
import { getDefaultFormatTokenByType, strings } from './constants.js';
import type { MonthDayInfo } from './month-foundation.svelte.js';

export type PanelType = 'left' | 'right';
export type PickerType = string;
export type YearMonthChangeType = 'prevMonth' | 'nextMonth' | 'prevYear' | 'nextYear';

/** 单面板状态（对齐 Semi MonthInfo：pickerDate 面板游标 / showDate 展示日 / 视图开关）。 */
export interface PanelDetail {
  pickerDate: Date;
  showDate: Date;
  isTimePickerOpen: boolean;
  isYearPickerOpen: boolean;
}

export interface MonthsGridFoundationProps {
  type: PickerType;
  /** 面板初始定位日期（对齐 Semi ValueType）：数组时 [0] 定位左面板、[1] 定位右面板。 */
  defaultPickerValue?: Date | Date[] | undefined;
  weekStartsOn?: number | undefined;
  disabledDate?: ((date: Date, options?: unknown) => boolean) | undefined;
  /** 禁用时间（对齐 Semi disabledTime）：返回时间列 disabledHours/Minutes/Seconds。 */
  disabledTime?:
    | ((date: Date | Date[] | null, panelType?: PanelType) => {
        disabledHours?: () => number[];
        disabledMinutes?: (hour: number) => number[];
        disabledSeconds?: (hour: number, minute: number) => number[];
      } | undefined)
    | undefined;
  format?: string | undefined;
  multiple?: boolean | undefined;
  max?: number | undefined;
  syncSwitchMonth?: boolean | undefined;
  autoSwitchDate?: boolean | undefined;
  /** 周选择偏移（对齐 Semi startDateOffset/endDateOffset）。 */
  startDateOffset?: ((date: Date) => Date) | undefined;
  endDateOffset?: ((date: Date) => Date) | undefined;
  /** range 当前聚焦端（外部双 Input 联动，对齐 Semi rangeInputFocus）。 */
  rangeInputFocus?: 'rangeStart' | 'rangeEnd' | false | undefined;
  /** 设置 range 聚焦端（对齐 Semi setRangeInputFocus）。 */
  setRangeInputFocus?: ((focus: 'rangeStart' | 'rangeEnd') => void) | undefined;
  /** 另一面板是否已打开（range 焦点流转判定，对齐 Semi isAnotherPanelHasOpened）。 */
  isAnotherPanelHasOpened?: ((focus: 'rangeStart' | 'rangeEnd') => boolean) | undefined;
  /** 选中变化回调（Semi notifySelectedChange，抛 Date[]）。 */
  onSelectedChange?: ((dates: Date[], options?: { needCheckFocusRecord?: boolean }) => void) | undefined;
  onMaxLimit?: (() => void) | undefined;
  /** 面板月/年切换回调（对齐 Semi notifyPanelChange）：翻月/翻年后抛新面板游标日期。 */
  onPanelChange?: ((date: Date) => void) | undefined;
}

const LEFT = strings.PANEL_TYPE_LEFT; // 'left'
const RIGHT = strings.PANEL_TYPE_RIGHT; // 'right'

const dateCalcFns: Record<YearMonthChangeType, (d: Date, step: number) => Date> = {
  prevMonth: (d, step) => addMonths(d, -step),
  nextMonth: (d, step) => addMonths(d, step),
  prevYear: (d, step) => addYears(d, -step),
  nextYear: (d, step) => addYears(d, step),
};

export function createMonthsGridState(getProps: () => MonthsGridFoundationProps) {
  const p = getProps;

  function initPanel(base: Date): PanelDetail {
    return { pickerDate: base, showDate: base, isTimePickerOpen: false, isYearPickerOpen: false };
  }

  // 面板初始定位日期（照搬 Semi getDefaultPickerDate）：数组时 [0]→左面板、[1]→右面板；
  // 右面板缺省（非数组 / [1] 非法）则回退 addMonths(左, 1)。
  const { initBase, initBaseRight } = (() => {
    const dpv = p().defaultPickerValue;
    const now = Array.isArray(dpv) ? dpv[0] : dpv;
    const next = Array.isArray(dpv) ? dpv[1] : undefined;
    const nowDate = now && isValidDate(now) ? now : new Date();
    const nextDate = next && isValidDate(next) ? next : addMonths(nowDate, 1);
    return { initBase: nowDate, initBaseRight: nextDate };
  })();

  // ===== state（对齐 Semi getStates）=====
  // 注意：$state(new Set) 的 .add/.delete mutation 不触发响应式（Svelte5 已知），故整体重赋值。
  let selected = $state(new Set<string>());
  let rangeStart = $state<string>('');
  let rangeEnd = $state<string>('');
  let hoverDay = $state<string>('');
  let offsetRangeStart = $state<string>('');
  let offsetRangeEnd = $state<string>('');
  // rangeInputFocus 由外部 props 驱动（对齐 Semi：它是 prop 非 foundation state）。
  const monthLeft = $state<PanelDetail>(initPanel(initBase));
  const monthRight = $state<PanelDetail>(initPanel(initBaseRight));

  function isRangeType(type?: PickerType): boolean {
    const realType = type ?? p().type;
    return typeof realType === 'string' && /range/i.test(realType);
  }

  function _getPanelDetail(panelType: PanelType): PanelDetail {
    return panelType === RIGHT ? monthRight : monthLeft;
  }

  function _updatePanelDetail(panelType: PanelType, patch: Partial<PanelDetail>): void {
    const target = panelType === RIGHT ? monthRight : monthLeft;
    Object.assign(target, patch);
  }

  // ===== 格式化辅助（对齐 Semi getValidDateFormat/getValidTimeFormat）=====
  function getValidDateFormat(): string {
    return p().format || getDefaultFormatTokenByType(p().type) || strings.FORMAT_FULL_DATE;
  }
  function getValidTimeFormat(): string {
    const fmt = p().format || strings.FORMAT_TIME_PICKER;
    const tokens: string[] = [];
    if (fmt.includes('h') || fmt.includes('H')) tokens.push('HH');
    if (fmt.includes('m')) tokens.push('mm');
    if (fmt.includes('s')) tokens.push('ss');
    return tokens.join(':');
  }

  function notifySelectedChange(dates: Date[], options?: { needCheckFocusRecord?: boolean }): void {
    p().onSelectedChange?.(dates, options);
  }

  // ===== 单选（对齐 Semi handleDateSelected）=====
  function handleShowDateAndTime(panelType: PanelType, pickerDate: Date, showDate?: Date): void {
    _updatePanelDetail(panelType, { showDate: showDate ?? pickerDate, pickerDate });
  }

  function fullDateToDate(fullDate: string): Date {
    // fullDate=yyyy-MM-dd → 本地墙上时间 Date（对齐 Semi compatibleParse FORMAT_FULL_DATE）。
    const [y, m, d] = fullDate.split('-').map(Number);
    return new Date(y!, (m ?? 1) - 1, d ?? 1);
  }

  function handleDateSelected(day: MonthDayInfo, panelType: PanelType): void {
    const multiple = !!p().multiple;
    const max = p().max;
    const newSelected = new Set<string>(multiple ? [...selected] : []);
    const fullDate = day.fullDate;
    const time = _getPanelDetail(panelType).pickerDate;

    if (!multiple) {
      newSelected.add(fullDate);
    } else if (newSelected.has(fullDate)) {
      newSelected.delete(fullDate);
    } else if (max && newSelected.size === max) {
      p().onMaxLimit?.();
    } else {
      newSelected.add(fullDate);
    }

    // 单选 dateTime：合并选中日 + 面板 pickerDate 的时间；否则纯日期。
    const isDateTime = p().type === 'dateTime';
    const newDates = [...newSelected].map((ds) =>
      isDateTime ? mergeDateAndTime(fullDateToDate(ds), time) : fullDateToDate(ds),
    );

    handleShowDateAndTime(panelType, time);
    // 整体重赋值触发响应式（$state Set mutation 不响应）。
    selected = newSelected;
    notifySelectedChange(newDates);
  }

  /** _mergeDateAndTime —— 合并日期部分与时间部分（对齐 Semi）。 */
  function mergeDateAndTime(date: Date, time: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds(),
    );
  }

  /**
   * handleTimeChange —— 对齐 Semi monthsGridFoundation.handleTimeChange（dateTime 单面板路径）。
   * 时间列变化 → 合并到面板 showDate 的年月日 + 新时分秒 → 更新面板 + 通知。
   * dateTimeRange 双面板时间联动留后续（依赖 range value 反解到面板）。
   */
  function handleTimeChange(newTime: { timeStampValue: number }, panelType: PanelType = LEFT): void {
    const panel = _getPanelDetail(panelType);
    const showDate = panel.showDate;
    const timeDate = new Date(newTime.timeStampValue);
    const fullValidDate = new Date(
      showDate.getFullYear(),
      showDate.getMonth(),
      showDate.getDate(),
      timeDate.getHours(),
      timeDate.getMinutes(),
      timeDate.getSeconds(),
      timeDate.getMilliseconds(),
    );
    const type = p().type;
    if (type === 'dateTimeRange') {
      handleShowDateAndTime(panelType, fullValidDate);
      _updateTimeInDateRange(panelType, fullValidDate);
    } else if (type === 'dateTime') {
      const fullDate = formatFullDate(
        fullValidDate.getFullYear(),
        fullValidDate.getMonth() + 1,
        fullValidDate.getDate(),
      );
      // 先更新面板 pickerDate=fullValidDate（handleDateSelected 用 pickerDate 作时间源），再选中该日。
      handleShowDateAndTime(panelType, fullValidDate);
      handleDateSelected({ fullDate, dayNumber: fullValidDate.getDate() }, panelType);
    }
  }

  /**
   * _updateTimeInDateRange —— 照搬 Semi：dateTimeRange 两端都已选时，更新对应端的时间部分，
   * 若因此导致 start>end 则 swap，通知新的 [start,end]。
   */
  function _updateTimeInDateRange(panelType: PanelType, timeDate: Date): void {
    let rs = rangeStart;
    let re = rangeEnd;
    if (!rs || !re) return;
    let startDate = fullDateToDate2(rs);
    let endDate = fullDateToDate2(re);
    // 合并对应端日期 + 新时间。
    const mergeSameDay = (src: Date, t: Date) =>
      new Date(
        src.getFullYear(),
        src.getMonth(),
        src.getDate(),
        t.getHours(),
        t.getMinutes(),
        t.getSeconds(),
        t.getMilliseconds(),
      );
    if (panelType === RIGHT) {
      endDate = mergeSameDay(endDate, timeDate);
      re = fmtDateTime(endDate);
      if (_isNeedSwap(rs, re)) {
        [rs, re] = [re, rs];
        [startDate, endDate] = [endDate, startDate];
      }
      rangeEnd = re;
      rangeStart = rs;
    } else {
      startDate = mergeSameDay(startDate, timeDate);
      rs = fmtDateTime(startDate);
      if (_isNeedSwap(rs, re)) {
        [rs, re] = [re, rs];
        [startDate, endDate] = [endDate, startDate];
      }
      rangeStart = rs;
      rangeEnd = re;
    }
    notifySelectedChange([startDate, endDate]);
  }

  /** dateTimeRange 的 rangeStart/End 含时间段（yyyy-MM-dd HH:mm:ss），解析成 Date。 */
  function fullDateToDate2(s: string): Date {
    const [datePart, timePart] = s.trim().split(/\s+/);
    const base = fullDateToDate(datePart ?? s);
    if (timePart) {
      const [h, m, sec] = timePart.split(':').map(Number);
      base.setHours(h ?? 0, m ?? 0, sec ?? 0, 0);
    }
    return base;
  }
  function fmtDateTime(d: Date): string {
    const p2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${formatFullDate(d.getFullYear(), d.getMonth() + 1, d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
  }

  /**
   * calcDisabledTime —— 照搬 Semi monthsGridFoundation.calcDisabledTime。
   * dateTime：以面板 showDate 为 cbDate；dateTimeRange：以 [rangeStart(,rangeEnd)] 为 cbDates。
   * 返回 disabledTime(cbDate, panelType) 的结果（时间列 disabledHours/Minutes/Seconds），无则 undefined。
   */
  function calcDisabledTime(panelType: PanelType):
    | {
        disabledHours?: () => number[];
        disabledMinutes?: (hour: number) => number[];
        disabledSeconds?: (hour: number, minute: number) => number[];
      }
    | undefined {
    const disabledTime = p().disabledTime;
    const type = p().type;
    if (typeof disabledTime === 'function' && (type === 'dateTime' || type === 'dateTimeRange')) {
      const selected: Array<string | Date> = [];
      if (type === 'dateTimeRange') {
        if (rangeStart) selected.push(rangeStart);
        if (rangeStart && rangeEnd) selected.push(rangeEnd);
      } else {
        const showDate = _getPanelDetail(panelType).showDate;
        if (showDate) selected.push(showDate);
      }
      const selectedDates = selected.map((s) => (s instanceof Date ? s : fullDateToDate(s.trim().split(/\s+/)[0] ?? s)));
      const cbDates = type === 'dateTimeRange' ? selectedDates : (selectedDates[0] ?? null);
      return disabledTime(cbDates, panelType);
    }
    return undefined;
  }

  // ===== 悬停预览（对齐 Semi handleDayHover）=====
  function handleDayHover(day: { fullDate: string } = { fullDate: '' }): void {
    const fullDate = day.fullDate;
    hoverDay = fullDate;
    const { startDateOffset, endDateOffset, type } = p();
    if ((startDateOffset || endDateOffset) && type === 'dateRange') {
      offsetRangeStart = getFullDateOffset(startDateOffset, fullDate);
      offsetRangeEnd = getFullDateOffset(endDateOffset, fullDate);
    }
  }

  // ===== range 状态机（对齐 Semi handleRangeSelected / _isNeedSwap）=====
  function _isNeedSwap(rs: string, re: string): boolean {
    return !!rs && !!re && isBefore(re, rs);
  }

  function handleRangeSelected(day: MonthDayInfo): void {
    let rs = rangeStart;
    let re = rangeEnd;
    const { startDateOffset, endDateOffset, type } = p();
    const focus = p().rangeInputFocus;
    const fullDate = day.fullDate;
    let rangeStartReset = false;
    let rangeEndReset = false;

    const isDateRangeAndHasOffset = (startDateOffset || endDateOffset) && type === 'dateRange';
    if (isDateRangeAndHasOffset) {
      rs = getFullDateOffset(startDateOffset, fullDate);
      re = getFullDateOffset(endDateOffset, fullDate);
    } else if (focus === 'rangeEnd') {
      re = fullDate;
      // dateTime range：rangeStart 含时间段，比较仅取日期段。
      if (rs && re && isBefore(re, rs.trim().split(/\s+/)[0] ?? '')) {
        rs = '';
        rangeStartReset = true;
      }
    } else if (focus === 'rangeStart' || !focus) {
      rs = fullDate;
      if (rs && re && isBefore(re.trim().split(/\s+/)[0] ?? '', rs)) {
        re = '';
        rangeEndReset = true;
      }
    }

    // 焦点流转（对齐 Semi）。
    if (isRangeType(type)) {
      if (isDateRangeAndHasOffset) {
        rangeStart = rs;
        rangeEnd = re;
      } else if (focus === 'rangeEnd') {
        rangeEnd = re;
        if (rangeStartReset) rangeStart = rs;
        if (!p().isAnotherPanelHasOpened?.('rangeEnd') || !rs) {
          p().setRangeInputFocus?.('rangeStart');
        }
      } else if (focus === 'rangeStart' || !focus) {
        rangeStart = rs;
        if (rangeEndReset) rangeEnd = re;
        if (!p().isAnotherPanelHasOpened?.('rangeStart') || !re) {
          p().setRangeInputFocus?.('rangeEnd');
        }
      }
    }

    // 完成才通知（对齐 Semi：rangeStart||rangeEnd）。
    if (rs || re) {
      let start = rs ? fullDateToDate(rs.trim().split(/\s+/)[0] ?? rs) : null;
      let end = re ? fullDateToDate(re.trim().split(/\s+/)[0] ?? re) : null;

      // dateTimeRange：合并两面板时间。
      if (type === 'dateTimeRange') {
        const startTime = monthLeft.pickerDate;
        const endTime = monthRight.pickerDate;
        const s = rs && start ? mergeDateAndTime(start, startTime) : null;
        const e = re && end ? mergeDateAndTime(end, endTime) : null;
        if (s && e && isSameDay(start!, end!) && isBefore(e, s)) {
          start = s;
          end = s;
        } else {
          start = s;
          end = e;
        }
      }

      const needCheckFocusRecord = !(type === 'dateRange' && isDateRangeAndHasOffset);
      notifySelectedChange([start as Date, end as Date].filter(Boolean) as Date[], { needCheckFocusRecord });
    }
  }

  // ===== 导航（对齐 Semi handleSwitchMonthOrYear / handleYearOrMonthChange）=====
  function getTargetChangeDate(panelType: PanelType, switchType: YearMonthChangeType): Date {
    const currentDate = _getPanelDetail(panelType).pickerDate;
    return dateCalcFns[switchType](currentDate, 1);
  }

  function handleSyncChangeMonths(panelType: PanelType, target: Date): void {
    // 防两面板同月（对齐 Semi）：右面板选后 left 同月则 left-1；左面板选后 right 同月则 right+1。
    if (panelType === RIGHT && differenceInCalendarMonths(target, monthLeft.pickerDate) === 0) {
      handleYearOrMonthChange('prevMonth', LEFT, 1, true);
    } else if (panelType === LEFT && differenceInCalendarMonths(monthRight.pickerDate, target) === 0) {
      handleYearOrMonthChange('nextMonth', RIGHT, 1, true);
    }
  }

  function handleYearOrMonthChange(
    switchType: YearMonthChangeType,
    panelType: PanelType = LEFT,
    step = 1,
    _notSeparateInRange = false,
  ): void {
    const panelDetail = _getPanelDetail(panelType);
    const targetMonth = dateCalcFns[switchType](panelDetail.pickerDate, step);
    _updatePanelDetail(panelType, { pickerDate: targetMonth });
    // 翻月/翻年后通知外部（对齐 Semi notifyPanelChange）。
    p().onPanelChange?.(targetMonth);
  }

  /**
   * syncPanelToBase —— 将双面板游标重定位到 base 月（left=base、right=base+1）。
   * 用于手动输入回车提交后让面板跳到输入值的月份（对齐 Semi：value 外部变化时面板重定位）。
   * 仅重设 pickerDate/showDate，不动视图开关状态。
   */
  function syncPanelToBase(base: Date): void {
    if (!isValidDate(base)) return;
    _updatePanelDetail(LEFT, { pickerDate: base, showDate: base });
    const right = addMonths(base, 1);
    _updatePanelDetail(RIGHT, { pickerDate: right, showDate: right });
  }

  /**
   * syncPanelsFromRangeValue —— 照搬 Semi `_initDateRangePickerFromValue`：
   * 用 range 两端的**各自** Date 去初始化对应面板的 pickerDate。
   *
   * pickerDate 不只是「面板停在哪个月」，dateTimeRange 下它还是**该端的时间源**
   * （notifySelectedChange 里 startTime=monthLeft.pickerDate、endTime=monthRight.pickerDate）。
   * 此前只同步了 rangeStart/rangeEnd 两个日期串、从不写 pickerDate，导致：
   *   · 右面板时间显示的是左端的时间（两端时间不同时右边显示错的）
   *   · 改右端时间会用左端的分秒去合成，把起始时间也带偏
   */
  function syncPanelsFromRangeValue(values: Array<Date | null>): void {
    const left = values[0];
    const right = values[1];
    if (left && isValidDate(left)) {
      _updatePanelDetail(LEFT, { pickerDate: left, showDate: left });
    }
    if (right && isValidDate(right)) {
      _updatePanelDetail(RIGHT, { pickerDate: right, showDate: right });
    }
  }

  function handleSwitchMonthOrYear(switchType: YearMonthChangeType, panelType: PanelType): void {
    const rangeType = isRangeType();
    const syncSwitchMonth = !!p().syncSwitchMonth;
    if (rangeType && syncSwitchMonth) {
      handleYearOrMonthChange(switchType, LEFT, 1, true);
      handleYearOrMonthChange(switchType, RIGHT, 1, true);
    } else {
      handleYearOrMonthChange(switchType, panelType);
      if (rangeType) {
        const target = getTargetChangeDate(panelType, switchType);
        handleSyncChangeMonths(panelType, target);
      }
    }
  }

  function prevMonth(panelType: PanelType = LEFT) { handleSwitchMonthOrYear('prevMonth', panelType); }
  function nextMonth(panelType: PanelType = LEFT) { handleSwitchMonthOrYear('nextMonth', panelType); }
  function prevYear(panelType: PanelType = LEFT) { handleSwitchMonthOrYear('prevYear', panelType); }
  function nextYear(panelType: PanelType = LEFT) { handleSwitchMonthOrYear('nextYear', panelType); }

  // ===== 面板视图切换（对齐 Semi showYearPicker/showTimePicker/showDatePanel）=====
  function showYearPicker(panelType: PanelType = LEFT) {
    _updatePanelDetail(panelType, { isTimePickerOpen: false, isYearPickerOpen: true });
  }
  function showTimePicker(panelType: PanelType = LEFT) {
    _updatePanelDetail(panelType, { isTimePickerOpen: true, isYearPickerOpen: false });
  }
  function showDatePanel(panelType: PanelType = LEFT) {
    _updatePanelDetail(panelType, { isTimePickerOpen: false, isYearPickerOpen: false });
  }

  /** toYearMonth —— yam 面板选年月后跳转面板游标（对齐 Semi）。 */
  function toYearMonth(panelType: PanelType, target: Date) {
    _updatePanelDetail(panelType, { pickerDate: target });
  }

  // ===== 点击分派（对齐 Semi handleDayClick）=====
  function handleDayClick(day: MonthDayInfo, panelType: PanelType = LEFT): void {
    const type = p().type;
    if (type === 'date' || type === 'dateTime') {
      handleDateSelected(day, panelType);
    } else if (type === 'dateRange' || type === 'dateTimeRange') {
      handleRangeSelected(day);
    }
  }

  return {
    // state getters
    get selected() { return selected; },
    get rangeStart() { return rangeStart; },
    get rangeEnd() { return rangeEnd; },
    get hoverDay() { return hoverDay; },
    get offsetRangeStart() { return offsetRangeStart; },
    get offsetRangeEnd() { return offsetRangeEnd; },
    get rangeInputFocus() { return p().rangeInputFocus ?? false; },
    get monthLeft() { return monthLeft; },
    get monthRight() { return monthRight; },
    // methods (对齐 Semi 方法名)
    isRangeType,
    getValidDateFormat,
    getValidTimeFormat,
    handleDayClick,
    handleDateSelected,
    handleRangeSelected,
    handleTimeChange,
    calcDisabledTime,
    handleDayHover,
    handleShowDateAndTime,
    prevMonth,
    nextMonth,
    prevYear,
    nextYear,
    showYearPicker,
    showTimePicker,
    showDatePanel,
    syncPanelToBase,
    syncPanelsFromRangeValue,
    toYearMonth,
  };
}
