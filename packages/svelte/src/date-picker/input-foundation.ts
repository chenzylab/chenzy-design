/**
 * DateInput（inset）foundation —— 照搬 Semi datePicker/inputFoundation.ts 的 inset 部分（方法名对齐）。
 * 纯逻辑（无 rune state），故 .ts。视图 InsetInput.svelte 消费。
 *
 * insetInputValue 数据模型：{ monthLeft:{dateInput,timeInput}, monthRight:{dateInput,timeInput} }。
 * 数据流：inset 输入框改值 → handleInsetInputChange（set valuePath + 拼串 + 解析回 value + 补时间）→
 * notifyInsetInputChange。反向：getInsetInputValue（由 value / inputValue 反解 insetInputValue）。
 */
import { format as dateFnsFormat, addMonths } from 'date-fns';
import getInsetInputValueFromInsetInputStr, {
  type InsetInputValue,
} from './_utils/getInsetInputValueFromInsetInputStr.js';
import getInsetInputFormatToken from './_utils/getInsetInputFormatToken.js';
import isValidDate from './_utils/isValidDate.js';
import { formatToken, type PickerType } from './constants.js';

export type { InsetInputValue };

export interface InputFoundationProps {
  type: PickerType;
  format?: string;
  rangeSeparator: string;
  defaultPickerValue?: Date | Date[];
}

export interface InsetInputChangeArgs {
  value: string;
  valuePath: string;
  insetInputValue: InsetInputValue;
}

const emptyInsetInputValue = (): InsetInputValue => ({
  monthLeft: { dateInput: '', timeInput: '' },
  monthRight: { dateInput: '', timeInput: '' },
});

/** 深拷贝 insetInputValue（避免 mutation）。 */
function copyInset(v: InsetInputValue): InsetInputValue {
  return {
    monthLeft: { ...v.monthLeft },
    monthRight: { ...v.monthRight },
  };
}

/** 按 valuePath（如 'monthLeft.dateInput'）写入值。 */
function setByPath(v: InsetInputValue, path: string, value: string): InsetInputValue {
  const next = copyInset(v);
  const [panel, field] = path.split('.') as ['monthLeft' | 'monthRight', 'dateInput' | 'timeInput'];
  next[panel][field] = value;
  return next;
}

export function createInputFoundation(getProps: () => InputFoundationProps) {
  const p = getProps;

  function concatInsetDateAndTime({ date, time }: { date: string; time: string }): string {
    return `${date} ${time}`;
  }
  function concatInsetDateRange({ rangeStart, rangeEnd }: { rangeStart: string; rangeEnd: string }): string {
    return `${rangeStart}${p().rangeSeparator}${rangeEnd}`;
  }

  /** concatInsetInputValue —— 照搬 Semi：insetInputValue 对象 → 日期串。 */
  function concatInsetInputValue({ insetInputValue }: { insetInputValue: InsetInputValue }): string {
    const type = p().type;
    let inputValue = '';
    switch (type) {
      case 'date':
      case 'month':
      case 'monthRange':
        inputValue = insetInputValue.monthLeft.dateInput;
        break;
      case 'dateRange':
        inputValue = concatInsetDateRange({
          rangeStart: insetInputValue.monthLeft.dateInput,
          rangeEnd: insetInputValue.monthRight.dateInput,
        });
        break;
      case 'dateTime':
        inputValue = concatInsetDateAndTime({
          date: insetInputValue.monthLeft.dateInput,
          time: insetInputValue.monthLeft.timeInput,
        });
        break;
      case 'dateTimeRange': {
        const rangeStart = concatInsetDateAndTime({
          date: insetInputValue.monthLeft.dateInput,
          time: insetInputValue.monthLeft.timeInput,
        });
        const rangeEnd = concatInsetDateAndTime({
          date: insetInputValue.monthRight.dateInput,
          time: insetInputValue.monthRight.timeInput,
        });
        inputValue = concatInsetDateRange({ rangeStart, rangeEnd });
        break;
      }
      default:
        break;
    }
    return inputValue;
  }

  /** _autoFillTimeToInsetInputValue —— 照搬 Semi：dateTime(Range) 输完日期且无时间时补默认时间。 */
  function _autoFillTimeToInsetInputValue(options: {
    insetInputValue: InsetInputValue;
    valuePath: string;
  }): InsetInputValue {
    const { valuePath, insetInputValue } = options;
    const type = p().type;
    const format = getInsetInputFormatToken({ type, format: p().format });
    const next = copyInset(insetInputValue);
    const dpv = p().defaultPickerValue;
    const nowDate = (Array.isArray(dpv) ? dpv[0] : dpv) ?? new Date();
    const nextDate = (Array.isArray(dpv) ? dpv[1] : undefined) ?? addMonths(nowDate, 1);

    if (type.includes('Time')) {
      const dateFormatToken = format.split(' ')[0] ?? formatToken.FORMAT_FULL_DATE;
      const timeFormatToken = format.split(' ')[1] ?? formatToken.FORMAT_TIME_PICKER;
      if (valuePath === 'monthLeft.dateInput') {
        const s = next.monthLeft.dateInput;
        if (!next.monthLeft.timeInput && s.length === dateFormatToken.length && isValidDate(new Date(s))) {
          next.monthLeft.timeInput = dateFnsFormat(nowDate, timeFormatToken);
        }
      } else if (valuePath === 'monthRight.dateInput') {
        const s = next.monthRight.dateInput;
        if (!next.monthRight.timeInput && s.length === dateFormatToken.length && isValidDate(new Date(s))) {
          next.monthRight.timeInput = dateFnsFormat(nextDate, timeFormatToken);
        }
      }
    }
    return next;
  }

  /**
   * handleInsetInputChange —— 照搬 Semi：某 inset 输入框改值 → 写 valuePath → 拼串 → 解析回 →
   * 补时间 → 返回 { insetInputValue, insetInputStr }。
   */
  function handleInsetInputChange(args: InsetInputChangeArgs): {
    insetInputValue: InsetInputValue;
    insetInputStr: string;
  } {
    const { value, valuePath, insetInputValue } = args;
    const type = p().type;
    const rangeSeparator = p().rangeSeparator;
    const newInsetInputValue = setByPath(insetInputValue, valuePath, value);
    const insetInputStr = concatInsetInputValue({ insetInputValue: newInsetInputValue });
    const parsed = getInsetInputValueFromInsetInputStr({ inputValue: insetInputStr, type, rangeSeparator });
    const filled = _autoFillTimeToInsetInputValue({ insetInputValue: parsed, valuePath });
    const finalStr = concatInsetInputValue({ insetInputValue: filled });
    return { insetInputValue: filled, insetInputStr: finalStr };
  }

  /** getInsetInputValue —— 照搬 Semi：由 value（Date[]）或已有 insetInputValue 反解出 insetInputValue。 */
  function getInsetInputValue({
    value,
    insetInputValue,
  }: {
    value: Array<Date | null>;
    insetInputValue?: InsetInputValue | null;
  }): InsetInputValue {
    const type = p().type;
    const rangeSeparator = p().rangeSeparator;
    let inputValueStr: string;
    if (insetInputValue) {
      inputValueStr = concatInsetInputValue({ insetInputValue });
    } else {
      const insetFormat = getInsetInputFormatToken({ type, format: p().format });
      inputValueStr = value
        .filter(Boolean)
        .map((d) => dateFnsFormat(d as Date, insetFormat))
        .join(rangeSeparator);
    }
    return getInsetInputValueFromInsetInputStr({ inputValue: inputValueStr, type, rangeSeparator });
  }

  /** getInsetInputPlaceholder —— 照搬 Semi：date/time 占位符。 */
  function getInsetInputPlaceholder(): { datePlaceholder: string; timePlaceholder: string } {
    const type = p().type;
    const rangeSeparator = p().rangeSeparator;
    const insetInputFormat = getInsetInputFormatToken({ type, format: p().format });
    let datePlaceholder = '';
    let timePlaceholder = '';
    switch (type) {
      case 'date':
      case 'month':
      case 'dateRange':
        datePlaceholder = insetInputFormat;
        break;
      case 'dateTime':
      case 'dateTimeRange':
        [datePlaceholder = '', timePlaceholder = ''] = insetInputFormat.split(' ');
        break;
      case 'monthRange':
        datePlaceholder = insetInputFormat + rangeSeparator + insetInputFormat;
        break;
      default:
        break;
    }
    return { datePlaceholder, timePlaceholder };
  }

  return {
    concatInsetInputValue,
    getInsetInputValue,
    handleInsetInputChange,
    getInsetInputPlaceholder,
    emptyInsetInputValue,
  };
}
