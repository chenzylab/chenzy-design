/** 照搬 Semi semi-foundation/datePicker/_utils/getYearAndMonth。left/right 缺省时用当前年月推导。 */
export default function getYearAndMonth(
  year: { left: number; right: number },
  month: { left: number; right: number },
): { year: { left: number; right: number }; month: { left: number; right: number } } {
  const nowYear = new Date().getFullYear();
  const nowMonth = new Date().getMonth();

  const rightMonth = month.right || nowMonth + 2;
  const rightYear = year.right || (rightMonth <= 12 ? nowYear : nowYear + 1);

  return {
    year: { left: year.left || nowYear, right: rightYear },
    month: { left: month.left || nowMonth + 1, right: rightMonth <= 12 ? rightMonth : 1 },
  };
}
