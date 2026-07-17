/**
 * ColorPicker ColorValue 三态互转（framework-agnostic），严格对齐 Semi Design
 * semi-foundation/colorPicker（interface + utils/convert）。
 *
 * 与 color.ts 的 Hsv（s/v 归一 0-1）不同：此处 HsvaColor 的 s/v 为 0-100 百分比、
 * h 为 0-360、a 为 0-1，忠实镜像 Semi 的 HsvaColor 语义，避免选色器内部反复换算失真。
 *
 * ColorValue = { hsva, rgba, hex } 三态同源，任一态变更经此层同步另两态。
 */

export interface HsvaColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-1
}

export interface RgbaColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

export type ColorValue = {
  hsva: HsvaColor;
  rgba: RgbaColor;
  hex: string;
};

/** 面板内输入区可切换的颜色格式（对齐 Semi defaultFormat）。 */
export type ColorValueFormat = 'hex' | 'rgba' | 'hsva';

function round(n: number, digits = 0): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function toHex2(n: number): string {
  const hex = Math.round(n).toString(16);
  return hex.length < 2 ? '0' + hex : hex;
}

/** hex → RgbaColor（对齐 Semi hexToRgba，支持 #rgb/#rgba/#rrggbb/#rrggbbaa）。 */
export function hexToRgba(hex: string): RgbaColor {
  let h = hex[0] === '#' ? hex.substring(1) : hex;
  if (h.length === 3 || h.length === 4) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const hexToPercent = (str: string): number => {
    const decimal = parseInt(str, 16);
    return isNaN(decimal) ? 1 : decimal / 255;
  };
  return {
    r: parseInt(h.substring(0, 2), 16) || 0,
    g: parseInt(h.substring(2, 4), 16) || 0,
    b: parseInt(h.substring(4, 6), 16) || 0,
    a: h.length >= 8 ? round(hexToPercent(h.substring(6, 8)), 2) : 1,
  };
}

/** RgbaColor → hex（对齐 Semi rgbaToHex：a===1 省略 alpha 段，小写）。 */
export function rgbaToHex({ r, g, b, a }: RgbaColor): string {
  const base = '#' + toHex2(r) + toHex2(g) + toHex2(b);
  if (a === undefined || a === 1) return base;
  const alphaHex = toHex2(Math.round(a * 255));
  return base + alphaHex;
}

/** RgbaColor → HsvaColor（对齐 Semi rgbaToHsva，s/v 0-100）。 */
export function rgbaToHsva({ r, g, b, a }: RgbaColor): HsvaColor {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = round(h * 60);
    if (h < 0) h += 360;
  }
  return {
    h,
    s: max ? round((delta / max) * 100) : 0,
    v: round((max / 255) * 100),
    a,
  };
}

/** HsvaColor → RgbaColor（对齐 Semi hsvaToRgba）。 */
export function hsvaToRgba({ h, s, v, a }: HsvaColor): RgbaColor {
  const hh = (h / 360) * 6;
  const ss = s / 100;
  const vv = v / 100;
  const hi = Math.floor(hh);
  const b = vv * (1 - ss);
  const c = vv * (1 - (hh - hi) * ss);
  const d = vv * (1 - (1 - hh + hi) * ss);
  const mod = hi % 6;
  return {
    r: round([vv, c, b, b, d, vv][mod]! * 255),
    g: round([d, vv, vv, c, b, b][mod]! * 255),
    b: round([b, b, d, vv, vv, c][mod]! * 255),
    a: round(a, 2),
  };
}

/** HsvaColor → hex。 */
export function hsvaToHex(hsva: HsvaColor): string {
  return rgbaToHex(hsvaToRgba(hsva));
}

/** hex → HsvaColor。 */
export function hexToHsva(hex: string): HsvaColor {
  return rgbaToHsva(hexToRgba(hex));
}

/** 从任一颜色态构造完整 ColorValue 三态（对齐 Semi foundation.handleChange 分支）。 */
export function colorValueFromHsva(hsva: HsvaColor): ColorValue {
  return { hsva, rgba: hsvaToRgba(hsva), hex: hsvaToHex(hsva) };
}

export function colorValueFromRgba(rgba: RgbaColor): ColorValue {
  return { rgba, hsva: rgbaToHsva(rgba), hex: rgbaToHex(rgba) };
}

export function colorValueFromHex(hex: string): ColorValue {
  return { hex, hsva: hexToHsva(hex), rgba: hexToRgba(hex) };
}

/** Semi 品牌绿默认 ColorValue（对齐 Semi defaultProps.defaultValue）。 */
export const DEFAULT_COLOR_VALUE: ColorValue = {
  hsva: { h: 176, s: 71, v: 77, a: 1 },
  rgba: { r: 57, g: 197, b: 187, a: 1 },
  hex: '#39c5bb',
};

/**
 * 输入框显示串（对齐 Semi DataPartFoundation.getInputValue）：
 * hex → hex.slice(0,7)；rgba → "r,g,b"；hsva → "h,s,v"（均不含 alpha）。
 */
export function colorValueToInputString(value: ColorValue, format: ColorValueFormat): string {
  if (format === 'rgba') {
    const { r, g, b } = value.rgba;
    return `${r},${g},${b}`;
  }
  if (format === 'hsva') {
    const { h, s, v } = value.hsva;
    return `${h},${s},${v}`;
  }
  return value.hex.slice(0, 7);
}

/**
 * 解析输入框串为对应格式的颜色态（对齐 Semi getValueByInputValue + split）。
 * 成功返回 {color, format}，失败返回 null（不改值）。
 */
export function parseColorInput(
  input: string,
  format: ColorValueFormat,
): { color: HsvaColor | RgbaColor | string; format: ColorValueFormat } | null {
  if (format === 'hex') {
    let v = input.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-fA-F]{6,8}$/.test(v)) return { color: v, format: 'hex' };
    return null;
  }
  const nums = (input.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  if (nums.length < 3) return null;
  const [c0, c1, c2] = nums as [number, number, number];
  if (format === 'rgba') {
    return {
      color: {
        r: Math.min(255, Math.max(0, c0)),
        g: Math.min(255, Math.max(0, c1)),
        b: Math.min(255, Math.max(0, c2)),
        a: 1,
      },
      format: 'rgba',
    };
  }
  // hsva
  return {
    color: {
      h: ((c0 % 360) + 360) % 360,
      s: Math.min(100, Math.max(0, c1)),
      v: Math.min(100, Math.max(0, c2)),
      a: 1,
    },
    format: 'hsva',
  };
}
