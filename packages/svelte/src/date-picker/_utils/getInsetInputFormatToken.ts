/** 照搬 Semi semi-foundation/datePicker/_utils/getInsetInputFormatToken。 */
import { getDefaultFormatTokenByType, type PickerType } from '../constants.js';

/**
 * 获取 insetInput 输入框的 format（placeholder）。照搬 Semi。
 * 'yyyy-MM-dd HH:mm:ss' => 'yyyy-MM-dd HH:mm:ss'；非法 format 回退默认 token。
 */
export default function getInsetInputFormatToken(options: { format?: string | undefined; type: PickerType }): string {
  const { format = '', type } = options;
  const dateReg = /([yMd]{0,4}[^a-z\s]*[yMd]{0,4}[^a-z\s]*[yMd]{0,4})/i;
  const dateTimeReg = /([yMd]{0,4}[^a-z\s]*[yMd]{0,4}[^a-z\s]*[yMd]{0,4}) (H{0,2}[^a-z\s]*m{0,2}[^a-z\s]*s{0,2})/i;
  const defaultToken = getDefaultFormatTokenByType(type) ?? 'yyyy-MM-dd';
  let insetInputFormat: string;

  switch (type) {
    case 'dateTime':
    case 'dateTimeRange': {
      const dateTimeResult = dateTimeReg.exec(format);
      insetInputFormat =
        dateTimeResult && dateTimeResult[1] && dateTimeResult[2]
          ? `${dateTimeResult[1]} ${dateTimeResult[2]}`
          : defaultToken;
      break;
    }
    case 'date':
    case 'month':
    case 'monthRange':
    case 'dateRange':
    default: {
      const dateResult = dateReg.exec(format);
      insetInputFormat = (dateResult && dateResult[1]) || defaultToken;
      break;
    }
  }

  return insetInputFormat;
}
