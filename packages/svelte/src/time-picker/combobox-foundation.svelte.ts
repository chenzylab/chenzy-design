/**
 * Combobox foundation —— 照搬 Semi timePicker/ComboxFoundation.ts（方法名逐一对齐，无缩水）。
 * 时间列面板逻辑：formatOption / generateOptions / initData(show*+options) / disabledHours(use12Hours 调整) /
 * getDisplayDateFromTimeStamp / getValidFormat。rune 化：createComboboxState(getProps) 暴露派生。
 *
 * 与 DatePicker foundation 同规则：逻辑在 .svelte.ts（对应 Semi *Foundation.ts），视图在 Combobox.svelte。
 */
import isValidDate from '../date-picker/_utils/isValidDate.js';

const DEFAULT_FORMAT = 'HH:mm:ss';
const DEFAULT_FORMAT_A = 'h:mm:ss a';

/** formatOption —— 照搬 Semi：选项数字 → { value(补零字符串), disabled }。 */
export const formatOption = (
  option: number,
  disabledOptions: number[] | undefined,
): { value: string; disabled: boolean } => {
  let value = `${option}`;
  if (option < 10) value = `0${option}`;
  let disabled = false;
  if (disabledOptions && disabledOptions.indexOf(option) >= 0) disabled = true;
  return { value, disabled };
};

/** generateOptions —— 照搬 Semi：按 length/step 生成，hideDisabledOptions 时剔除禁用项。 */
function generateOptions(
  length: number,
  disabledOptions: number[] | undefined,
  hideDisabledOptions: boolean,
  step = 1,
): number[] {
  const arr: number[] = [];
  for (let value = 0; value < length; value += step) {
    if (!disabledOptions || disabledOptions.indexOf(value) < 0 || !hideDisabledOptions) {
      arr.push(value);
    }
  }
  return arr;
}

export interface ComboboxFoundationProps {
  timeStampValue?: number | Date | null | undefined;
  format?: string | undefined;
  use12Hours?: boolean | undefined;
  isAM?: boolean | undefined;
  hourStep?: number | undefined;
  minuteStep?: number | undefined;
  secondStep?: number | undefined;
  disabledHours?: (() => number[]) | undefined;
  disabledMinutes?: ((hour: number | null) => number[]) | undefined;
  disabledSeconds?: ((hour: number | null, minute: number | null) => number[]) | undefined;
  hideDisabledOptions?: boolean | undefined;
}

export function createComboboxState(getProps: () => ComboboxFoundationProps) {
  const p = getProps;

  function isAM(): boolean {
    return !!p().isAM;
  }

  /** createDateDefault —— 照搬 Semi：00:00:00 的今天。 */
  function createDateDefault(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /** getDisplayDateFromTimeStamp —— 照搬 Semi：时间戳 → Date，无效则默认 00:00:00。 */
  function getDisplayDateFromTimeStamp(timeStamp: number | Date | null | undefined): Date {
    let date: Date | undefined;
    if (timeStamp != null) date = new Date(timeStamp);
    if (timeStamp == null || !date || !isValidDate(date)) return createDateDefault();
    return date;
  }

  function getDefaultFormatIfNeed(): string {
    const fmt = p().format;
    if (fmt != null) return fmt;
    return p().use12Hours ? DEFAULT_FORMAT_A : DEFAULT_FORMAT;
  }

  /** getValidFormat —— 照搬 Semi。 */
  function getValidFormat(): string {
    let f = getDefaultFormatIfNeed();
    f = typeof f === 'string' ? f : DEFAULT_FORMAT;
    return f;
  }

  /** disabledHours —— 照搬 Semi：use12Hours 时把禁用小时映射到 12 小时制。 */
  function disabledHours(): number[] {
    const use12Hours = p().use12Hours;
    let disabledOptions = p().disabledHours ? p().disabledHours!() : [];
    if (use12Hours && Array.isArray(disabledOptions)) {
      if (isAM()) {
        disabledOptions = disabledOptions.filter((h) => h < 12).map((h) => (h === 0 ? 12 : h));
      } else {
        disabledOptions = disabledOptions.map((h) => (h === 12 ? 12 : h - 12));
      }
    }
    return disabledOptions;
  }

  // ===== 派生（对齐 Semi initData 返回的 show*/options）=====
  const format = $derived(getValidFormat());
  const dateTime = $derived<Date>(getDisplayDateFromTimeStamp(p().timeStampValue));

  const disabledHourOptions = $derived<number[]>(disabledHours());
  const disabledMinuteOptions = $derived<number[]>(
    p().disabledMinutes ? p().disabledMinutes!(dateTime.getHours()) : [],
  );
  const disabledSecondOptions = $derived<number[]>(
    p().disabledSeconds ? p().disabledSeconds!(dateTime.getHours(), dateTime.getMinutes()) : [],
  );

  const hourOptions = $derived<number[]>(
    generateOptions(24, disabledHourOptions, !!p().hideDisabledOptions, p().hourStep ?? 1),
  );
  const minuteOptions = $derived<number[]>(
    generateOptions(60, disabledMinuteOptions, !!p().hideDisabledOptions, p().minuteStep ?? 1),
  );
  const secondOptions = $derived<number[]>(
    generateOptions(60, disabledSecondOptions, !!p().hideDisabledOptions, p().secondStep ?? 1),
  );

  const showHour = $derived(Boolean(format.match(/HH|hh|H|h/g)));
  const showMinute = $derived(Boolean(format.match(/mm/g)));
  const showSecond = $derived(Boolean(format.match(/ss/g)));

  return {
    get format() { return format; },
    get dateTime() { return dateTime; },
    get showHour() { return showHour; },
    get showMinute() { return showMinute; },
    get showSecond() { return showSecond; },
    get hourOptions() { return hourOptions; },
    get minuteOptions() { return minuteOptions; },
    get secondOptions() { return secondOptions; },
    get disabledHourOptions() { return disabledHourOptions; },
    get disabledMinuteOptions() { return disabledMinuteOptions; },
    get disabledSecondOptions() { return disabledSecondOptions; },
    isAM,
    disabledHours,
    getDisplayDateFromTimeStamp,
    getValidFormat,
  };
}
