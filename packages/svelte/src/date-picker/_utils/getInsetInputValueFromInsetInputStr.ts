/** 照搬 Semi semi-foundation/datePicker/_utils/getInsetInputValueFromInsetInputStr。 */
import type { PickerType } from '../constants.js';

export interface InsetInputValue {
  monthLeft: { dateInput: string; timeInput: string };
  monthRight: { dateInput: string; timeInput: string };
}

/**
 * 从 insetInputStr 字符串解析出 insetInputValue 对象（照搬 Semi）。
 * '2022-02-01' => { monthLeft: { dateInput: '2022-02-01' } }
 * '2022-02-01 00:00:00 ~ 2022-02-15 00:00:00' => 两端各含 date/time。
 */
export default function getInsetInputValueFromInsetInputStr(options: {
  inputValue: string;
  rangeSeparator: string;
  type: PickerType;
}): InsetInputValue {
  const timeSeparator = ' ';
  const { inputValue = '', rangeSeparator, type } = options;
  let leftDateInput: string, leftTimeInput: string, rightDateInput: string, rightTimeInput: string;
  const insetInputValue: InsetInputValue = {
    monthLeft: { dateInput: '', timeInput: '' },
    monthRight: { dateInput: '', timeInput: '' },
  };

  switch (type) {
    case 'date':
    case 'month':
    case 'monthRange':
      insetInputValue.monthLeft.dateInput = inputValue;
      break;
    case 'dateRange':
      [leftDateInput = '', rightDateInput = ''] = inputValue.split(rangeSeparator);
      insetInputValue.monthLeft.dateInput = leftDateInput;
      insetInputValue.monthRight.dateInput = rightDateInput;
      break;
    case 'dateTime':
      [leftDateInput = '', leftTimeInput = ''] = inputValue.split(timeSeparator);
      insetInputValue.monthLeft.dateInput = leftDateInput;
      insetInputValue.monthLeft.timeInput = leftTimeInput;
      break;
    case 'dateTimeRange': {
      const [leftInput = '', rightInput = ''] = inputValue.split(rangeSeparator);
      [leftDateInput = '', leftTimeInput = ''] = leftInput.split(timeSeparator);
      [rightDateInput = '', rightTimeInput = ''] = rightInput.split(timeSeparator);
      insetInputValue.monthLeft.dateInput = leftDateInput;
      insetInputValue.monthLeft.timeInput = leftTimeInput;
      insetInputValue.monthRight.dateInput = rightDateInput;
      insetInputValue.monthRight.timeInput = rightTimeInput;
      break;
    }
    default:
      break;
  }
  return insetInputValue;
}
