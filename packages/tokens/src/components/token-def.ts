/**
 * Component token 定义形态。为支持 DSM（可视化主题编辑）需要的结构化元数据，
 * token 值可以是裸字符串（存量形态，兼容），也可以是带元数据的 TokenDef 对象。
 *
 * build.ts 用 `tokenValue()` 归一化取 CSS 值；DSM manifest 用完整元数据。
 * 见 specs/00-foundation/dsm.spec.md §4。
 */

export type TokenCategory =
  | 'color'
  | 'font'
  | 'height'
  | 'width'
  | 'spacing'
  | 'radius'
  | 'animation'
  | 'other';

export interface TokenDef {
  /** CSS 值：'var(--cd-color-primary)' | '6px' | 'transparent' 等。 */
  value: string;
  /** 分类（DSM 分 tab）；缺省时由 build 按名/值推断。 */
  category?: TokenCategory;
  /** 中文名（DSM UI 显示）；缺省时由名分词推断。 */
  label?: string;
  /** 用途说明（DSM UI 显示）。 */
  usage?: string;
  /** 是否 DSM 可编辑；默认 true。纯派生量可设 false。 */
  editable?: boolean;
}

/** 一组组件 token：值为裸字符串或 TokenDef。 */
export type TokenGroup = Record<string, string | TokenDef>;

/** 取 token 的 CSS 值（归一化裸字符串 / TokenDef）。 */
export function tokenValue(v: string | TokenDef): string {
  return typeof v === 'string' ? v : v.value;
}

/** 取 token 的元数据（裸字符串归一为仅含 value）。 */
export function tokenMeta(v: string | TokenDef): TokenDef {
  return typeof v === 'string' ? { value: v } : v;
}
