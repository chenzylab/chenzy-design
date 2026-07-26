/** 照搬 Semi semi-foundation/datePicker/_utils/isSameDay。 */
import { isSameDay as dateFnsIsSameDay, parseISO } from 'date-fns';
import isString from './isString.js';

export default function isSameDay(date: string | Date, dateToCompare: string | Date): boolean {
  const dayOne = isString(date) ? parseISO(date) : date;
  const dayTwo = isString(dateToCompare) ? parseISO(dateToCompare) : dateToCompare;
  return dateFnsIsSameDay(dayOne, dayTwo);
}
