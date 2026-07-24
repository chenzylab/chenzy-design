/** 照搬 Semi semi-foundation/datePicker/_utils/isBetween。 */
import { isWithinInterval, parseISO, isEqual, isBefore } from 'date-fns';
import isString from './isString.js';

/**
 * is the date between start and end?(not including start and end)
 *   - if start > end, return false
 */
export default function isBetween(
  day: string | Date,
  { start, end }: { start: string | Date; end: string | Date },
): boolean {
  const d = isString(day) ? parseISO(day) : day;
  const s = isString(start) ? parseISO(start) : start;
  const e = isString(end) ? parseISO(end) : end;
  return isBefore(s, e) && isWithinInterval(d, { start: s, end: e }) && !isEqual(d, s) && !isEqual(d, e);
}
