/** 照搬 Semi semi-foundation/datePicker/_utils/getYears。默认 [今年-100, 今年+100]。 */
const getYears = (startYear?: number, endYear?: number): number[] => {
  const currentYear = new Date().getFullYear();
  let start = typeof startYear === 'number' ? startYear : currentYear - 100;
  let end = typeof endYear === 'number' ? endYear : currentYear + 100;
  if (end < start) {
    [start, end] = [end, start];
  }
  return Array.from({ length: end - start + 1 }, (_v, i) => start + i);
};

export default getYears;
