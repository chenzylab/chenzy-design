// 组件名 → 设计变量(token)组件前缀的解析。
// token-manifest.json 里的 component 字段是变量名剥掉 category 前缀后的组件段，
// 与组件小写名/目录名并不总是一致（如 date-picker→date、overflow-list→overflow、
// virtual-list→virtual）。这里用「数据里真实存在的前缀集合」做匹配，避免硬编码漂移。
import manifest from '@chenzy-design/tokens/token-manifest.json';

const KNOWN_PREFIXES = new Set(
  (manifest as { tokens: { component: string | null }[] }).tokens
    .map((t) => t.component)
    .filter((c): c is string => !!c),
);

/**
 * 解析组件的 token 前缀。
 * @param lowerName 组件小写名（如 'datepicker'）
 * @param dir       该组件对应的 demo 目录名（如 'date-picker'），可选
 * @returns 命中数据集的前缀，未命中返回 ''（表示无专属设计变量）
 */
export function resolveTokenPrefix(lowerName: string, dir?: string): string {
  const candidates = [
    lowerName.replace(/-/g, ''),
    dir ? dir.replace(/-/g, '') : '',
    // 多词组件常以首段命名 token（date-picker→date、overflow-list→overflow）
    dir ? dir.split('-')[0] : '',
    lowerName.split('-')[0],
  ].filter(Boolean);

  for (const c of candidates) {
    if (KNOWN_PREFIXES.has(c)) return c;
  }
  return '';
}
