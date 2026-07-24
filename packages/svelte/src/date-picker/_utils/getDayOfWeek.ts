/**
 * 照搬 Semi semi-foundation/datePicker/_utils/getDayOfWeek。
 * @param weekStartsOn 一周首日索引（0-周日、1-周一…）。返回按首日轮转后的星期缩写 key 数组。
 */
export type WeekStartNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const getDayOfWeek = ({ weekStartsOn = 0 }: { weekStartsOn: WeekStartNumber }): string[] => {
  const weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let index = 0; index < weekStartsOn; index++) {
    weekDay.push(weekDay.shift() as string);
  }
  return weekDay;
};

export default getDayOfWeek;
