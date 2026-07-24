/** 照搬 Semi semi-foundation/utils/isString。 */
export default function isString(value: unknown): value is string {
  return typeof value === 'string';
}
