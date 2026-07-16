/**
 * 输入文本按分隔符拆分（对齐 Semi semi-foundation/tagInput/utils/getSplitedArray）。
 * 纯函数，便于单测。
 * - separator 为 string：直接 String.split。
 * - separator 为 string[]：以首个为临时分隔符，把其余全部替换为它后再一次性拆分。
 */
export function getSplitedArray(
  originString: string,
  separators: string | string[],
): string[] {
  if (typeof separators === 'string') {
    return originString.split(separators);
  }
  if (Array.isArray(separators)) {
    const [tempChar, ...rest] = separators; // 首个作临时分隔符
    if (tempChar === undefined) return [originString];
    let joined = originString;
    for (const sep of rest) {
      joined = joined.split(sep).join(tempChar);
    }
    return joined.split(tempChar);
  }
  return [originString];
}
