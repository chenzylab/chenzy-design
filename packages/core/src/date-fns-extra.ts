/**
 * 时区转换工具 —— 照搬 Semi semi-foundation/utils/date-fns-extra.ts（方法名、逻辑一致）。
 * 底层用 date-fns-tz 的 utcToZonedTime/zonedTimeToUtc；数字/GMT± 偏移经 toIANA 映射成 IANA 标识，
 * 具名 IANA（含夏令时）原样透传。
 */
import {
  toDate,
  format as dateFnsFormat,
  utcToZonedTime as dateFnsUtcToZonedTime,
  zonedTimeToUtc as dateFnsZonedTimeToUtc,
  type OptionsWithTZ,
} from 'date-fns-tz';
import {
  parse as dateFnsParse,
  format as dateFnsBaseFormat,
  parseISO as dateFnsParseISO,
  isValid as dateFnsIsValid,
  type Locale,
} from 'date-fns';

/**
 * Need to be IANA logo without daylight saving time
 */
export const IANAOffsetMap: Array<[number, string[]]> = [
  [-11, ['Pacific/Midway']],
  [-10, ['Pacific/Honolulu']],
  [-9.5, ['Pacific/Marquesas']],
  [-9, ['Pacific/Gambier']],
  [-8, ['Pacific/Pitcairn']],
  [-7, ['America/Phoenix']],
  [-6, ['America/Tegucigalpa']],
  [-5, ['America/Bogota']],
  [-4, ['America/Puerto_Rico']],
  [-3.5, ['America/St_Johns']], // No alternative daylight saving time zone
  [-3, ['America/Montevideo']],
  [-2, ['Atlantic/South_Georgia']],
  [-1, ['Atlantic/Cape_Verde']],
  [0, ['Africa/Accra']],
  [1, ['Africa/Bangui']],
  [2, ['Africa/Cairo']],
  [3, ['Asia/Bahrain', 'Indian/Antananarivo']],
  [3.5, ['Asia/Tehran']], // No alternative daylight saving time zone
  [4, ['Asia/Dubai', 'Asia/Muscat']],
  [4.5, ['Asia/Kabul']],
  [5, ['Asia/Samarkand', 'Asia/Karachi']],
  [5.5, ['Asia/Kolkata']],
  [5.75, ['Asia/Kathmandu']],
  [6, ['Asia/Dhaka']],
  [6.5, ['Asia/Rangoon', 'Asia/Rangoon']],
  [7, ['Asia/Jakarta', 'Asia/Phnom_Penh', 'Asia/Bangkok']],
  [8, ['Asia/Shanghai', 'Asia/Singapore']],
  [8.75, ['Australia/Eucla']],
  [9, ['Asia/Tokyo', 'Asia/Seoul', 'Asia/Pyongyang']],
  [9.5, ['Australia/Darwin']],
  [10, ['Pacific/Guam']],
  [10.5, ['Australia/Adelaide']], // No alternative daylight saving time zone
  [11, ['Pacific/Guadalcanal']],
  [12, ['Pacific/Funafuti']],
  [13, ['Pacific/Enderbury']],
  [13.75, ['Pacific/Chatham']], // No alternative daylight saving time zone
  [14, ['Pacific/Kiritimati']],
];

/**
 * Etc/GMT* no DST
 * @see https://data.iana.org/time-zones/tzdb/etcetera
 */
const IANAEtcGMTOffsetMap: Record<string, string> = {
  '0': 'Etc/GMT',
  '1': 'Etc/GMT-1',
  '2': 'Etc/GMT-2',
  '3': 'Etc/GMT-3',
  '4': 'Etc/GMT-4',
  '5': 'Etc/GMT-5',
  '6': 'Etc/GMT-6',
  '7': 'Etc/GMT-7',
  '8': 'Etc/GMT-8',
  '9': 'Etc/GMT-9',
  '10': 'Etc/GMT-10',
  '11': 'Etc/GMT-11',
  '12': 'Etc/GMT-12',
  '13': 'Etc/GMT-13',
  '14': 'Etc/GMT-14',
  '-1': 'Etc/GMT+1',
  '-2': 'Etc/GMT+2',
  '-3': 'Etc/GMT+3',
  '-4': 'Etc/GMT+4',
  '-5': 'Etc/GMT+5',
  '-6': 'Etc/GMT+6',
  '-7': 'Etc/GMT+7',
  '-8': 'Etc/GMT+8',
  '-9': 'Etc/GMT+9',
  '-10': 'Etc/GMT+10',
  '-11': 'Etc/GMT+11',
  '-12': 'Etc/GMT+12',
};

const GMTStringReg = /([-+]{1})(\d{2}):(\d{2})/;

/**
 *
 * @param {string|number} tz
 * @returns {number|undefined}
 */
export const toIANA = (tz: string | number): string | number | undefined => {
  let matches: RegExpMatchArray | null;
  if (typeof tz === 'string') {
    matches = tz.match(GMTStringReg);
    if (!matches) {
      return tz;
    }

    const symbol = parseInt(matches[1]! + 1, 10); // => -1 or 1
    const hourOffset = parseInt(matches[2]!, 10);
    const minuteOffset = parseInt(matches[3]!, 10);
    tz = symbol * (hourOffset + minuteOffset / 60);
  }

  if (typeof tz === 'number') {
    // if tz can be transformed to a Etc/GMT* and browser supports it
    if (tz in IANAEtcGMTOffsetMap) {
      const etcGMTtimeZone = IANAEtcGMTOffsetMap[tz]!;
      if (isValidTimezoneIANAString(etcGMTtimeZone)) {
        return etcGMTtimeZone;
      }
    }
    const found = IANAOffsetMap.find((item) => item[0] === tz);
    return found && found[1][0];
  }
};

const validIANATimezoneCache: Record<string, boolean> = {};
/**
 * @see https://github.com/marnusw/date-fns-tz/blob/a92e0ad017d101a0c50e39a63ef5d322b4d849f6/src/_lib/tzParseTimezone/index.js#L137
 */
export function isValidTimezoneIANAString(timeZoneString: string): boolean {
  if (validIANATimezoneCache[timeZoneString]) return true;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: timeZoneString });
    validIANATimezoneCache[timeZoneString] = true;
    return true;
  } catch {
    return false;
  }
}

/**
 *
 * @param {string | number | Date} date
 * @param {string} formatToken
 * @param {object} [options]
 * @param {string} [options.timeZone]
 * @returns {Date}
 */
/* istanbul ignore next */
const parse = (date: string | number | Date, formatToken: string, options?: OptionsWithTZ): Date => {
  if (typeof date === 'string') {
    // date-fns parse 的 options 类型（ParseOptions）与 date-fns-tz 的 OptionsWithTZ 交集足够；断言以复用同一 options。
    date = dateFnsParse(date, formatToken, new Date(), options as Parameters<typeof dateFnsParse>[3]);
  }
  if (options && options.timeZone != null && options.timeZone !== '') {
    const timeZone = toIANA(options.timeZone);
    options = { ...options, timeZone: timeZone as string };
  }

  return toDate(date, options);
};

/* istanbul ignore next */
const format = (date: number | Date, formatToken: string, options?: OptionsWithTZ): string => {
  if (options && options.timeZone != null && options.timeZone !== '') {
    const timeZone = toIANA(options.timeZone);
    options = { ...options, timeZone: timeZone as string };

    date = dateFnsUtcToZonedTime(date, timeZone as string, options);
  }

  return dateFnsFormat(date, formatToken, options);
};

/**
 * Returns a Date which will format as the local time of any time zone from a specific UTC time
 *
 * @example
 * ```javascript
 * import { utcToZonedTime } from 'date-fns-tz'
 * const { isoDate, timeZone } = fetchInitialValues() // 2014-06-25T10:00:00.000Z, America/New_York
 * const date = utcToZonedTime(isoDate, timeZone) // In June 10am UTC is 6am in New York (-04:00)
 * renderDatePicker(date) // 2014-06-25 06:00:00 (in the system time zone)
 * renderTimeZoneSelect(timeZone) // America/New_York
 * ```
 *
 * @see https://github.com/marnusw/date-fns-tz#utctozonedtime
 */
const utcToZonedTime = (
  date: string | number | Date,
  timeZone: string | number,
  options?: OptionsWithTZ,
): Date => dateFnsUtcToZonedTime(date, toIANA(timeZone) as string, options);

/**
 * Given a date and any time zone, returns a Date with the equivalent UTC time
 *
 * @example
 * ```
 * import { zonedTimeToUtc } from 'date-fns-tz'
 * const date = getDatePickerValue() // e.g. 2014-06-25 10:00:00 (picked in any time zone)
 * const timeZone = getTimeZoneValue() // e.g. America/Los_Angeles
 * const utcDate = zonedTimeToUtc(date, timeZone) // In June 10am in Los Angeles is 5pm UTC
 * postToServer(utcDate.toISOString(), timeZone) // post 2014-06-25T17:00:00.000Z, America/Los_Angeles
 * ```
 *
 * @see https://github.com/marnusw/date-fns-tz#zonedtimetoutc
 */
const zonedTimeToUtc = (
  date: string | number | Date,
  timeZone: string | number,
  options?: OptionsWithTZ,
): Date => dateFnsZonedTimeToUtc(date, toIANA(timeZone) as string, options);

/**
 * return current system hour offset based on utc:
 *
 * ```
 * 8 => "GMT+08:00"
 * -9.5 => "GMT-09:30"
 * -8 => "GMT-08:00"
 * ```
 */
const getCurrentTimeZone = (): number => new Date().getTimezoneOffset() / 60;

/**
 * isValidTimeZone —— 对齐 Semi 各 foundation 的 isValidTimeZone（timePicker/datePicker 各自定义、逻辑一致）。
 * 本库统一到 core 一份（避免跨组件重复），timeZone 为非空 string/number 即视为有效。
 */
export function isValidTimeZone(timeZone?: string | number): boolean {
  return ['string', 'number'].includes(typeof timeZone) && timeZone !== '';
}

/**
 * localeFormat —— 对齐 Semi foundation.localeFormat：date-fns format 按 token 序列化 Date（本地字段），
 * 可选 dateFnsLocale 本地化月份/星期名。DatePicker foundation 消费此基元。
 */
const localeFormat = (date: Date, token: string, dateFnsLocale?: Locale): string =>
  dateFnsBaseFormat(date, token, dateFnsLocale ? { locale: dateFnsLocale } : undefined);

/**
 * compatibleParse —— 照搬 Semi datePicker/_utils/parser.ts：把输入串解析为 Date。
 * 三级兜底：date-fns parse(formatToken) → parseISO → new Date(Date.parse)；
 * 4 位以上年份视为无效（防 date-fns 把 '20210' 之类解析成异常年）。
 */
const compatibleParse = (
  value: string,
  formatToken?: string,
  baseDate?: Date,
  locale?: Locale,
): Date | null => {
  let result: Date | null = null;
  if (value) {
    if (formatToken) {
      const base = baseDate ?? new Date();
      result = dateFnsParse(value, formatToken, base, locale ? { locale } : undefined);
    }
    if (!result || !dateFnsIsValid(result)) {
      result = dateFnsParseISO(value);
    }
    if (!dateFnsIsValid(result)) {
      result = new Date(Date.parse(value));
    }
    const yearInvalid = dateFnsIsValid(result) && String(result.getFullYear()).length > 4;
    if (!dateFnsIsValid(result) || yearInvalid) {
      result = null;
    }
  }
  return result;
};

/**
 * isValueParseValid —— 照搬 Semi parser.ts：value 能否被 date-fns parse(formatToken) 解析为有效日期。
 */
const isValueParseValid = (options: {
  value: string;
  formatToken: string;
  baseDate?: Date;
  locale?: Locale;
}): boolean => {
  const { value, locale, formatToken } = options;
  const baseDate = options.baseDate ?? new Date();
  const result = dateFnsParse(value, formatToken, baseDate, locale ? { locale } : undefined);
  return dateFnsIsValid(result);
};

export {
  format,
  parse,
  utcToZonedTime,
  zonedTimeToUtc,
  getCurrentTimeZone,
  localeFormat,
  compatibleParse,
  isValueParseValid,
};
