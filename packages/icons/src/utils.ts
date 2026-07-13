/**
 * AI 多彩图标运行时工具 —— 移植自 Semi @douyinfe/semi-icons `src/utils.ts`。
 * getUuidShort 生成短随机 id（避免多实例 linearGradient id 冲突）；
 * getFillColor 把 fill（string | string[] | undefined）展开为 num 个 stop 色，
 * 缺省时回退 Semi 默认多彩渐变色。运行时用 Math.random 生成 id 与 Semi 一致。
 */

interface GetUuidShortOptions {
  prefix?: string;
  length?: number;
}

export function getUuidShort(options: GetUuidShortOptions = {}): string {
  const { prefix = '', length = 7 } = options;
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ';
  const total = characters.length;
  let randomId = '';
  for (let i = 0; i < length; i++) {
    // 运行时随机（浏览器组件，非构建脚本）——与 Semi 一致，用于渐变 id 去重。
    const random = Math.floor(Math.random() * total);
    randomId += characters.charAt(random);
  }
  return prefix ? `${prefix}-${randomId}` : randomId;
}

export function getFillColor(fill: string | string[] | undefined, num: number): string[] {
  if (typeof fill === 'string') {
    return new Array(num).fill(fill);
  } else if (Array.isArray(fill)) {
    const fillLength = fill.length;
    let result: string[] = fill;
    if (fillLength < num) {
      let i = 0;
      result = [];
      while (i < num) {
        result.push(fill[i % fillLength]!);
        i++;
      }
      return result;
    } else if (fillLength > num) {
      result = fill.slice(0, num);
    }
    if (num === 4) {
      return result.reverse();
    }
    return result;
  }
  if (num === 2) {
    return ['rgba(166,71,255)', 'currentColor'];
  }
  return [
    'rgba(233,69,255)',
    'rgba(166,71,255)',
    'rgba(107,97,255)',
    'rgba(46,140,255)',
  ];
}
