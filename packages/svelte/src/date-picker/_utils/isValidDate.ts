/** 照搬 Semi semi-foundation/datePicker/_utils/isValidDate。 */
export default function isValidDate(date: unknown): date is Date {
  return (
    !!date &&
    Object.prototype.toString.call(date) === '[object Date]' &&
    !Number.isNaN((date as Date).getTime())
  );
}
