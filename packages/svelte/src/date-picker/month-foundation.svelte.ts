/**
 * Month foundation（月表派生 + 单日状态计算）—— 对齐 Semi monthFoundation.ts + month.tsx 的
 * getSingleDayStatus/getDateRangeStatus/getOffsetDateStatus。
 *
 * Semi 把日状态计算放在 month.tsx 视图类；本库归入 foundation 逻辑层（纯计算），
 * 视图 Month.svelte 调用。方法名对齐 Semi。
 */
import { format } from 'date-fns';
import getMonthTable, { type MonthInfo, type MonthDayInfo } from './_utils/getMonthTable.js';
import getDayOfWeek, { type WeekStartNumber } from './_utils/getDayOfWeek.js';
import isAfter from './_utils/isAfter.js';
import isBefore from './_utils/isBefore.js';
import isBetween from './_utils/isBetween.js';
import isSameDay from './_utils/isSameDay.js';

export type RangeInputFocus = 'rangeStart' | 'rangeEnd' | false;

/** getDayStatus 输入项（对齐 Semi month.tsx getDayStatus 的 options）。 */
export interface DayStatusOptions {
  fullDate: string;
  todayText: string;
  selected: Set<string>;
  disabledDate?: ((day: Date, options?: { rangeStart: string; rangeEnd: string; rangeInputFocus: RangeInputFocus }) => boolean) | undefined;
  rangeStart: string;
  rangeEnd: string;
  hoverDay: string;
  offsetRangeStart: string;
  offsetRangeEnd: string;
  rangeInputFocus: RangeInputFocus;
  focusRecords?: { rangeStart: boolean; rangeEnd: boolean } | undefined;
}

/**
 * 完整日状态（对齐 Semi getDayStatus 返回；键名不可改，会传给 renderFullDate）。
 * 字段显式含 undefined，适配 exactOptionalPropertyTypes（三段合成时字段可能为 undefined）。
 */
export interface DayStatus {
  isToday?: boolean | undefined;
  isSelected?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isHoverDay?: boolean | undefined;
  isSelectedStart?: boolean | undefined;
  isSelectedEnd?: boolean | undefined;
  isInRange?: boolean | undefined;
  isHover?: boolean | undefined;
  isSelectedStartAfterHover?: boolean | undefined;
  isSelectedEndBeforeHover?: boolean | undefined;
  isHoverDayInRange?: boolean | undefined;
  isHoverDayInStartSelection?: boolean | undefined;
  isHoverDayInEndSelection?: boolean | undefined;
  isHoverDayAroundOneSelected?: boolean | undefined;
  isOffsetRangeStart?: boolean | undefined;
  isOffsetRangeEnd?: boolean | undefined;
  isHoverInOffsetRange?: boolean | undefined;
  isHoverDayOffset?: boolean | undefined;
  isInOffsetRange?: boolean | undefined;
}

/** getSingleDayStatus —— 对齐 Semi month.tsx。 */
function getSingleDayStatus(o: DayStatusOptions): Pick<DayStatus, 'isToday' | 'isSelected' | 'isDisabled'> {
  const { fullDate, todayText, selected, disabledDate, rangeStart, rangeEnd, rangeInputFocus, focusRecords } = o;
  const disabledOptions = { rangeStart, rangeEnd, rangeInputFocus };
  const isToday = fullDate === todayText;
  const isSelected = selected.has(fullDate);

  let isDisabled = disabledDate ? disabledDate(new Date(fullDate), disabledOptions) : false;
  if (!isDisabled && rangeInputFocus === 'rangeStart' && rangeEnd && focusRecords && focusRecords.rangeEnd) {
    // dateRangeTime 格式 'yyyy-MM-dd HH:mm:ss'，取日期段比较。
    isDisabled = isAfter(fullDate, (rangeEnd.trim().split(/\s+/)[0] ?? ''));
  }
  if (!isDisabled && rangeInputFocus === 'rangeEnd' && rangeStart && focusRecords && focusRecords.rangeStart) {
    isDisabled = isBefore(fullDate, (rangeStart.trim().split(/\s+/)[0] ?? ''));
  }
  return { isToday, isSelected, isDisabled };
}

/** getDateRangeStatus —— 对齐 Semi month.tsx。 */
function getDateRangeStatus(o: DayStatusOptions): Partial<DayStatus> {
  const { rangeStart, rangeEnd, fullDate, hoverDay, offsetRangeStart, offsetRangeEnd, rangeInputFocus } = o;

  const _isDateRangeAnySelected = Boolean(rangeStart || rangeEnd);
  const _isDateRangeSelected = Boolean(rangeStart && rangeEnd);
  const _isOffsetDateRangeAnyExist = offsetRangeStart || offsetRangeEnd;
  if (!_isDateRangeAnySelected) return {};

  const _isHoverDay = isSameDay(hoverDay, fullDate);

  let _isHoverAfterStart: boolean | undefined;
  let _isHoverBeforeEnd: boolean | undefined;
  let isSelectedStart: boolean | undefined;
  let isSelectedEnd: boolean | undefined;
  let isHoverDayAroundOneSelected: boolean | undefined;
  if (rangeStart) {
    isSelectedStart = isSameDay(fullDate, rangeStart);
    if (rangeInputFocus === 'rangeEnd') _isHoverAfterStart = isBetween(fullDate, { start: rangeStart, end: hoverDay });
  }
  if (rangeEnd) {
    isSelectedEnd = isSameDay(fullDate, rangeEnd);
    if (rangeInputFocus === 'rangeStart') _isHoverBeforeEnd = isBetween(fullDate, { start: hoverDay, end: rangeEnd });
  }
  if (!_isDateRangeSelected && _isDateRangeAnySelected) isHoverDayAroundOneSelected = _isHoverDay;

  let isHover: boolean | undefined;
  if (!_isOffsetDateRangeAnyExist) isHover = _isHoverAfterStart || _isHoverBeforeEnd || _isHoverDay;

  let isInRange: boolean | undefined;
  let isSelectedStartAfterHover: boolean | undefined;
  let isSelectedEndBeforeHover: boolean | undefined;
  let isHoverDayInStartSelection: boolean | undefined;
  let isHoverDayInEndSelection: boolean | undefined;
  let isHoverDayInRange: boolean | undefined;
  if (_isDateRangeSelected) {
    isInRange = isBetween(fullDate, { start: rangeStart, end: rangeEnd });
    if (!_isOffsetDateRangeAnyExist) {
      isSelectedStartAfterHover = Boolean(isSelectedStart && isAfter(rangeStart, hoverDay));
      isSelectedEndBeforeHover = Boolean(isSelectedEnd && isBefore(rangeEnd, hoverDay));
      isHoverDayInStartSelection = _isHoverDay && rangeInputFocus === 'rangeStart';
      isHoverDayInEndSelection = _isHoverDay && rangeInputFocus === 'rangeEnd';
      isHoverDayInRange = _isHoverDay && isBetween(hoverDay, { start: rangeStart, end: rangeEnd });
    }
  }

  return {
    isHoverDay: _isHoverDay,
    isSelectedStart,
    isSelectedEnd,
    isInRange,
    isHover,
    isSelectedStartAfterHover,
    isSelectedEndBeforeHover,
    isHoverDayInRange,
    isHoverDayInStartSelection,
    isHoverDayInEndSelection,
    isHoverDayAroundOneSelected,
  };
}

/** getOffsetDateStatus —— 对齐 Semi month.tsx。 */
function getOffsetDateStatus(o: DayStatusOptions): Partial<DayStatus> {
  const { offsetRangeStart, offsetRangeEnd, rangeStart, rangeEnd, fullDate, hoverDay } = o;
  const _isOffsetDateRangeNull = !(offsetRangeStart || offsetRangeEnd);
  if (_isOffsetDateRangeNull) return {};

  const _isInRange = isBetween(fullDate, { start: rangeStart, end: rangeEnd });
  const _isHoverDay = isSameDay(hoverDay, fullDate);
  const _isSelectedStart = Boolean(rangeStart && isSameDay(fullDate, rangeStart));
  const _isSelectedEnd = Boolean(rangeEnd && isSameDay(fullDate, rangeEnd));
  const _isDateRangeSelected = Boolean(rangeStart && rangeEnd);

  const isOffsetRangeStart = isSameDay(fullDate, offsetRangeStart);
  const isOffsetRangeEnd = isSameDay(fullDate, offsetRangeEnd);
  const isHoverDayOffset = _isHoverDay;

  let isHoverInOffsetRange: boolean | undefined;
  let isInOffsetRange: boolean | undefined;
  if (_isDateRangeSelected) isHoverInOffsetRange = _isInRange && _isHoverDay;

  const _isOffsetDateRangeSelected = Boolean(offsetRangeStart && offsetRangeEnd);
  if (_isOffsetDateRangeSelected) {
    isInOffsetRange =
      _isSelectedStart || isBetween(fullDate, { start: offsetRangeStart, end: offsetRangeEnd }) || _isSelectedEnd;
  }

  return { isOffsetRangeStart, isOffsetRangeEnd, isHoverInOffsetRange, isHoverDayOffset, isInOffsetRange };
}

/** getDayStatus —— 对齐 Semi month.tsx：合成三段状态。 */
export function getDayStatus(o: DayStatusOptions): DayStatus {
  const single = getSingleDayStatus(o);
  const range = getDateRangeStatus({ ...o, ...single });
  const offset = getOffsetDateStatus({ ...o, ...single, ...range });
  return { ...single, ...range, ...offset };
}

/** todayText —— 对齐 Semi monthFoundation._getToday（yyyy-MM-dd）。 */
export function getTodayText(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * createMonthState —— 月表 rune 工厂。读 getProps() 的 month/weekStartsOn 派生 weeks/weekdays，
 * 对齐 Semi monthFoundation.getMonthTable/updateWeekDays。
 */
export interface MonthFoundationProps {
  month: Date;
  weekStartsOn: WeekStartNumber;
}

export function createMonthState(getProps: () => MonthFoundationProps) {
  const p = getProps;
  const monthTable = $derived<MonthInfo>(getMonthTable(p().month, p().weekStartsOn));
  const weeks = $derived<MonthDayInfo[][]>(monthTable.weeks);
  const weekdays = $derived<string[]>(getDayOfWeek({ weekStartsOn: p().weekStartsOn }));
  const weeksRowNum = $derived<number>(weeks.length);

  return {
    get weeks() { return weeks; },
    get weekdays() { return weekdays; },
    get weeksRowNum() { return weeksRowNum; },
    get monthText() { return monthTable.monthText; },
  };
}

export type { MonthDayInfo, MonthInfo };
