/** 照搬 Semi semi-foundation/datePicker/_utils/isAfter。 */
import { isAfter as dateFnsIsAfter, parseISO } from 'date-fns';
import isString from './isString.js';

export default function isAfter(date: string | Date, dateToCompare: string | Date): boolean {
  const dayOne = isString(date) ? parseISO(date) : date;
  const dayTwo = isString(dateToCompare) ? parseISO(dateToCompare) : dateToCompare;
  return dateFnsIsAfter(dayOne, dayTwo);
}
