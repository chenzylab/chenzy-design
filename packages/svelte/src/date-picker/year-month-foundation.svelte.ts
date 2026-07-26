/**
 * YearAndMonth foundation —— 完整照搬 Semi yearAndMonthFoundation.ts（含 monthRange 双面板
 * left/right + autoSelectMonth disabled 逻辑，方法名对齐 Semi）。不做功能缩水。
 *
 * currentYear/currentMonth 为 {left,right} 结构；years/months 为滚轮列表数据。
 * 视图 YearAndMonth.svelte 通过 createYearMonthState 消费，选中经 onSelect 回主装配。
 */
import { setMonth, setYear, set } from 'date-fns';
import { strings } from './constants.js';
import getYears from './_utils/getYears.js';
import getYearAndMonth from './_utils/getYearAndMonth.js';

export type PanelType = 'left' | 'right';
export type LR = { left: number; right: number };
export interface YearItem { value: number; year: number; disabled?: boolean }
export interface MonthItem { value: number; month: number; disabled?: boolean }

export interface YearMonthFoundationProps {
  type: string;
  currentYear: LR;
  currentMonth: LR;
  startYear?: number;
  endYear?: number;
  disabledDate?: (date: Date) => boolean;
  onSelect?: (obj: { currentYear: LR; currentMonth: LR }) => void;
  onBackToMain?: () => void;
}

const LEFT = strings.PANEL_TYPE_LEFT; // 'left'
const RIGHT = strings.PANEL_TYPE_RIGHT; // 'right'

export function createYearMonthState(getProps: () => YearMonthFoundationProps) {
  const p = getProps;

  // years/months 静态列表（years 受 startYear/endYear，months 固定 1..12）。
  const years = $derived<YearItem[]>(
    getYears(p().startYear, p().endYear).map((year) => ({ value: year, year })),
  );
  const months = $derived<MonthItem[]>(
    Array.from({ length: 12 }, (_v, idx) => ({ value: idx + 1, month: idx + 1 })),
  );

  // currentYear/currentMonth：受控 props 经 getYearAndMonth 归一（对齐 Semi getDerivedStateFromProps）。
  // 内部选择用 $state 覆盖，props 变化时重置。
  const normalized = $derived(getYearAndMonth(p().currentYear, p().currentMonth));
  let innerYear = $state<LR | null>(null);
  let innerMonth = $state<LR | null>(null);
  const currentYear = $derived<LR>(innerYear ?? normalized.year);
  const currentMonth = $derived<LR>(innerMonth ?? normalized.month);

  function copyLR(v: LR): LR {
    return { left: v.left, right: v.right };
  }

  function notify(year: LR, month: LR) {
    p().onSelect?.({ currentYear: year, currentMonth: month });
  }

  /** selectYear —— 照搬 Semi。含 monthRange 保证 right 时间 >= left。 */
  function selectYear(item: YearItem, panelType: PanelType = LEFT) {
    const type = p().type;
    const year = copyLR(currentYear);
    year[panelType] = item.value;

    if (type === 'monthRange') {
      const isSameYearIllegalDate =
        year[LEFT] === year[RIGHT] && currentMonth[LEFT] > currentMonth[RIGHT];
      if ((panelType === LEFT && item.value > year[RIGHT]) || (panelType === LEFT && isSameYearIllegalDate)) {
        year[RIGHT] = item.value + 1;
      } else if (panelType === RIGHT && isSameYearIllegalDate) {
        year[LEFT] = item.value - 1;
      }
    }

    innerYear = year;
    autoSelectMonth(item, panelType, year);
    notify(year, currentMonth);
  }

  /** selectMonth —— 照搬 Semi。含 monthRange 保证 right >= left。 */
  function selectMonth(item: MonthItem, panelType: PanelType = LEFT) {
    const type = p().type;
    const month = copyLR(currentMonth);
    month[panelType] = item.month;

    if (
      type === 'monthRange' &&
      panelType === LEFT &&
      currentYear[LEFT] === currentYear[RIGHT] &&
      item.month > month[RIGHT]
    ) {
      month[RIGHT] = item.month;
    }

    innerMonth = month;
    notify(currentYear, month);
  }

  /** autoSelectMonth —— 照搬 Semi：选年后若当前月被禁用，自动选一个未禁用月。 */
  function autoSelectMonth(item: YearItem, panelType: PanelType, year: LR) {
    const disabledDate = p().disabledDate;
    if (!disabledDate) return;
    const oppositeType: PanelType = panelType === LEFT ? RIGHT : LEFT;

    const currentDate = setYear(Date.now(), item.year);
    const isCurrentMonthDisabled = disabledDate(setMonth(currentDate, currentMonth[panelType] - 1));
    const isOppositeMonthDisabled = disabledDate(
      setMonth(setYear(Date.now(), year[oppositeType]), currentMonth[oppositeType] - 1),
    );

    if (!isCurrentMonthDisabled && !isOppositeMonthDisabled) return;

    let finalYear = year;
    let finalMonth = copyLR(currentMonth);
    if (isCurrentMonthDisabled) {
      const currentIndex = months.findIndex(({ month }) => month === currentMonth[panelType]);
      let validMonth: MonthItem | undefined = months
        .slice(currentIndex)
        .find(({ month }) => !disabledDate(setMonth(currentDate, month - 1)));
      if (!validMonth) {
        validMonth = months
          .slice(0, currentIndex)
          .find(({ month }) => !disabledDate(setMonth(currentDate, month - 1)));
      }
      if (validMonth && !isOppositeMonthDisabled) {
        finalMonth[panelType] = validMonth.month;
      } else if (validMonth && isOppositeMonthDisabled) {
        finalYear = { left: item.year, right: item.year };
        finalMonth = { left: validMonth.month, right: validMonth.month };
      }
    } else if (!isCurrentMonthDisabled && isOppositeMonthDisabled) {
      finalYear = { left: item.year, right: item.year };
      finalMonth = { left: currentMonth[panelType], right: currentMonth[panelType] };
    }
    innerYear = finalYear;
    innerMonth = finalMonth;
    notify(finalYear, finalMonth);
  }

  function backToMain() {
    p().onBackToMain?.();
  }

  /** 年列表构建（含 disabled：整年 12 月皆禁用，或 right 面板年 < left 面板年）。 */
  function yearList(panelType: PanelType): YearItem[] {
    const disabledDate = p().disabledDate;
    const cm = currentMonth[panelType];
    const currentDate = setMonth(Date.now(), cm - 1);
    const needDisabled = (year: number) =>
      panelType === RIGHT && currentYear[LEFT] ? currentYear[LEFT] > year : false;
    return years.map(({ value, year }) => {
      const isAllMonthDisabled = disabledDate
        ? months.every(({ month }) => disabledDate(set(currentDate, { year, month: month - 1 })))
        : false;
      return { value, year, disabled: isAllMonthDisabled || needDisabled(year) };
    });
  }

  /** 月列表构建（含 disabled：该年该月被 disabledDate 禁用）。 */
  function monthList(panelType: PanelType): MonthItem[] {
    const disabledDate = p().disabledDate;
    const year = currentYear[panelType];
    return months.map(({ value, month }) => ({
      value,
      month,
      disabled: disabledDate ? disabledDate(set(Date.now(), { year, month: month - 1 })) : false,
    }));
  }

  return {
    get years() { return years; },
    get months() { return months; },
    get currentYear() { return currentYear; },
    get currentMonth() { return currentMonth; },
    selectYear,
    selectMonth,
    backToMain,
    yearList,
    monthList,
  };
}
