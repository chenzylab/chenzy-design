/** 照搬 Semi semi-foundation/datePicker/_utils/getMonthTable。 */
import { startOfMonth, lastDayOfMonth, getDaysInMonth, format } from 'date-fns';
import type { WeekStartNumber } from './getDayOfWeek.js';

export type MonthDayInfo = {
  dayNumber: number | string;
  dayNumberFull?: string;
  fullDate: string;
};

export interface MonthInfo {
  weeks: MonthDayInfo[][];
  monthText: string;
  month?: Date;
}

function formatFullDate(
  year: number | string = '',
  month: number | string = '',
  day: number | string = '',
): string {
  const monthFull = typeof month === 'number' && month < 10 ? `0${month}` : month.toString();
  const dayNumberFull = typeof day === 'number' && day < 10 ? `0${day}` : day.toString();
  return `${String(year)}-${monthFull}-${dayNumberFull}`;
}

function getWeeks(date: Date, weekStartsOn: WeekStartNumber = 0): MonthDayInfo[][] {
  // 首/末周补位用的空日格。
  const weekDayNotInMonth: MonthDayInfo = { dayNumber: '', dayNumberFull: '', fullDate: '' };
  const daysInMonth = getDaysInMonth(date);
  const year = format(date, 'yyyy');
  const month = format(date, 'MM');
  const lastday = lastDayOfMonth(date);
  const firstDay = startOfMonth(date);
  // 当月首日是本行第几列（date-fns 'e' token 受 weekStartsOn 影响）。
  const firstDayInWeek = Number(format(firstDay, 'e', { weekStartsOn }));

  const weeks: MonthDayInfo[][] = [];
  let week: MonthDayInfo[] = [];
  // 首行前补空日格使首日落到正确列。
  for (let s = 1; s < firstDayInWeek; s++) {
    week.push(weekDayNotInMonth);
  }

  for (let d = 0; d < daysInMonth; d++) {
    const dayNumber = d + 1;
    const dayNumberFull = dayNumber < 10 ? `0${dayNumber}` : dayNumber.toString();
    const fullDate = formatFullDate(year, month, dayNumber);

    week.push({ dayNumber, dayNumberFull, fullDate });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    } else if (fullDate === format(lastday, 'yyyy-MM-dd')) {
      // 末周单独成行。
      weeks.push(week);
      week = [];
    }
  }
  return weeks;
}

const getMonthTable = (month: Date, weekStartsOn: WeekStartNumber): MonthInfo => {
  const weeks = getWeeks(month, weekStartsOn);
  const monthText = format(month, 'yyyy-MM');
  return { monthText, weeks, month };
};

export default getMonthTable;

export { formatFullDate };
