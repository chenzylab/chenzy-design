/**
 * hast properties → 原生 HTML 属性归一化。
 *
 * hast（`@types/hast`）的 properties 采用 DOM property 命名：
 * - `className: string[]` → `class: "a b"`
 * - camelCase 属性（`colSpan`/`rowSpan`/`htmlFor`/`ariaLabel`…）→ 对应 HTML attribute（kebab / 特例）
 * - 布尔属性值 `true` → 保留裸属性，`false` → 省略
 * - 数组值（非 className）→ 空格连接
 * - 其余原样透传
 *
 * 仅处理渲染原生标签时需要的常见映射；自定义 Svelte 组件分支不走此函数（透传原始 properties）。
 */
import type { Properties } from 'hast';

/** DOM property 名 → HTML attribute 名的特例映射（其余按 camelCase→kebab 规则）。 */
const NAME_MAP: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv',
  acceptCharset: 'accept-charset',
  colSpan: 'colspan',
  rowSpan: 'rowspan',
  tabIndex: 'tabindex',
  crossOrigin: 'crossorigin',
  autoComplete: 'autocomplete',
  readOnly: 'readonly',
  maxLength: 'maxlength',
  minLength: 'minlength',
};

function toAttrName(key: string): string {
  const mapped = NAME_MAP[key];
  if (mapped !== undefined) return mapped;
  // aria-* / data-* 已是连字符形式；ariaLabel 之类 camelCase → kebab
  const fifth = key[4];
  if (fifth !== undefined && key.startsWith('aria') && fifth === fifth.toUpperCase()) {
    return 'aria-' + key.slice(4).toLowerCase();
  }
  if (fifth !== undefined && key.startsWith('data') && fifth === fifth.toUpperCase()) {
    return 'data-' + key.slice(4).toLowerCase();
  }
  return key;
}

export function hastPropsToAttrs(
  properties: Properties | undefined,
): Record<string, string | number | boolean | undefined> {
  const out: Record<string, string | number | boolean | undefined> = {};
  if (!properties) return out;

  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined || value === null || value === false) continue;
    const name = toAttrName(key);

    if (Array.isArray(value)) {
      // className 与其它空格分隔 token 列表
      out[name] = value.join(' ');
    } else if (value === true) {
      // 布尔属性：裸属性
      out[name] = '';
    } else {
      out[name] = value as string | number;
    }
  }
  return out;
}
