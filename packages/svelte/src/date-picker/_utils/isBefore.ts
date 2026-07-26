/** 照搬 Semi semi-foundation/datePicker/_utils/isBefore。 */
import { isBefore as dateFnsIsBefore, parseISO } from 'date-fns';
import isString from './isString.js';

export default function isBefore(date: Date | string, dateToCompare: Date | string): boolean {
  const dayOne = isString(date) ? parseISO(date) : date;
  const dayTwo = isString(dateToCompare) ? parseISO(dateToCompare) : dateToCompare;
  return dateFnsIsBefore(dayOne, dayTwo);
}
