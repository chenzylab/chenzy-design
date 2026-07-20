/**
 * Input 字符长度工具 —— 对齐 Semi Design（semi-foundation/input/util/truncateValue）。
 *
 * 当组件提供自定义 `getValueLength`（如按 grapheme/emoji 计数）时，原生 maxlength
 * 属性（按 UTF-16 code unit 计）不再适用，需在 JS 层按 getValueLength 截断超长输入。
 */

/**
 * 按 getValueLength 计的可见长度将 value 截断到 maxLength。
 *
 * 用二分查找定位「使 getValueLength(prefix) ≤ maxLength」的最长前缀，
 * 从而在 emoji/组合字符场景下正确截断（不会切断代理对/ZWJ 序列的中途——
 * 因为切片以 UTF-16 索引推进，但 getValueLength 以 grapheme 计，二分收敛到
 * 恰好容纳 maxLength 个可见字符的边界）。对齐 Semi truncateValue。
 *
 * 未提供 getValueLength 时退化为按 UTF-16 length 截断（value.slice(0, maxLength)）。
 */
export function truncateValueByLength(options: {
  value: string;
  maxLength: number;
  getValueLength?: (value: string) => number;
}): string {
  const { value, maxLength, getValueLength } = options;
  if (typeof getValueLength === 'function') {
    let left = 0;
    let right = value.length;
    while (left < right) {
      const mid = left + Math.floor((right - left) / 2);
      const currentValue = value.slice(0, mid + 1);
      if (getValueLength(currentValue) > maxLength) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    return value.slice(0, left);
  }
  return value.slice(0, maxLength);
}

/**
 * minLength + getValueLength 时，换算出应下发给原生 `minlength` 属性的值，
 * 使浏览器原生的「至少 N 字符」校验按可见长度（而非 UTF-16 length）触发。
 * 对齐 Semi handleVisibleMinLength：newMinLength = value.length + (minLength - valueLength)。
 *
 * 返回应设置到原生 minlength 的数值；未提供 getValueLength 或不满足条件时返回 minLength 原值。
 */
export function computeVisibleMinLength(options: {
  value: string;
  minLength: number;
  getValueLength?: (value: string) => number;
}): number {
  const { value, minLength, getValueLength } = options;
  if (typeof getValueLength === 'function' && typeof value === 'string' && minLength >= 0) {
    const valueLength = getValueLength(value);
    if (valueLength < minLength) {
      // 补上「UTF-16 长度 - 可见长度」的差，让原生校验的阈值落在可见长度维度。
      return value.length + (minLength - valueLength);
    }
  }
  return minLength;
}
