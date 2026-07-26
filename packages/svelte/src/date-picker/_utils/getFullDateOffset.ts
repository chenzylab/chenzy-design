/** 照搬 Semi semi-foundation/datePicker/_utils/getFullDateOffset。周选择等 offset 场景用。 */
import { format } from 'date-fns';
import { formatToken } from '../constants.js';

const getFullDateOffset = (fn: ((d: Date) => Date) | undefined, date: string | Date): string => {
  if (!date) return '';
  const getDate = new Date(date);
  const offsetDate = typeof fn === 'function' ? fn(getDate) : getDate;
  return format(new Date(offsetDate), formatToken.FORMAT_FULL_DATE);
};

export default getFullDateOffset;
