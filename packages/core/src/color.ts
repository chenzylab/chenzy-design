/**
 * 颜色空间转换纯函数（framework-agnostic）。
 * 红线 #2：转换为纯函数，渲染层只做格式化派生。
 * 角度 h: 0-360；s/v/l/a: 0-1；r/g/b: 0-255。
 */

export interface Rgb {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

export interface Hsv {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
  a: number; // 0-1
}

export interface Hsl {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
  a: number; // 0-1
}

export type ColorFormat = 'hex' | 'rgb' | 'hsv' | 'hsl';

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function clampByte(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

/** 解析 hex 字符串（#rgb / #rgba / #rrggbb / #rrggbbaa，带不带 # 均可）。失败返回 null。 */
export function parseHex(input: string): Rgb | null {
  let h = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h) || /^[0-9a-fA-F]{4}$/.test(h)) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  if (/^[0-9a-fA-F]{8}$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: parseInt(h.slice(6, 8), 16) / 255,
    };
  }
  return null;
}

function toHex2(n: number): string {
  return clampByte(n).toString(16).padStart(2, '0');
}

export interface RgbToHexOptions {
  /** 输出是否包含 alpha 段（仅在 a<1 时）。默认 true。 */
  alpha?: boolean;
  /** 输出大写。默认 true。 */
  uppercase?: boolean;
}

/** RGB → hex 字符串。 */
export function rgbToHex(rgb: Rgb, options: RgbToHexOptions = {}): string {
  const { alpha = true, uppercase = true } = options;
  let out = `#${toHex2(rgb.r)}${toHex2(rgb.g)}${toHex2(rgb.b)}`;
  if (alpha && rgb.a < 1) out += toHex2(rgb.a * 255);
  return uppercase ? out.toUpperCase() : out.toLowerCase();
}

/** RGB → HSV。 */
export function rgbToHsv(rgb: Rgb): Hsv {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const delta = maxC - minC;
  let h = 0;
  if (delta !== 0) {
    if (maxC === r) h = ((g - b) / delta) % 6;
    else if (maxC === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = maxC === 0 ? 0 : delta / maxC;
  const v = maxC;
  return { h, s, v, a: rgb.a };
}

/** HSV → RGB。 */
export function hsvToRgb({ h, s, v, a }: Hsv): Rgb {
  const hh = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = v - c;
  let rgb: [number, number, number];
  if (hh < 60) rgb = [c, x, 0];
  else if (hh < 120) rgb = [x, c, 0];
  else if (hh < 180) rgb = [0, c, x];
  else if (hh < 240) rgb = [0, x, c];
  else if (hh < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const [r, g, b] = rgb;
  return {
    r: clampByte((r + m) * 255),
    g: clampByte((g + m) * 255),
    b: clampByte((b + m) * 255),
    a,
  };
}

/** HSV → HSL（同一色相，转换 s/l）。 */
export function hsvToHsl({ h, s, v, a }: Hsv): Hsl {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l, a };
}

/** HSL → HSV。 */
export function hslToHsv({ h, s, l, a }: Hsl): Hsv {
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return { h, s: sv, v, a };
}

/** RGB → HSL（经 HSV 桥接）。 */
export function rgbToHsl(rgb: Rgb): Hsl {
  return hsvToHsl(rgbToHsv(rgb));
}

/** HSL → RGB（经 HSV 桥接）。 */
export function hslToRgb(hsl: Hsl): Rgb {
  return hsvToRgb(hslToHsv(hsl));
}

/** hex → HSV。失败返回黑色不透明。 */
export function hexToHsv(hex: string): Hsv {
  const rgb = parseHex(hex);
  if (!rgb) return { h: 0, s: 0, v: 0, a: 1 };
  return rgbToHsv(rgb);
}

/** HSV → hex。 */
export function hsvToHex(hsv: Hsv, options?: RgbToHexOptions): string {
  return rgbToHex(hsvToRgb(hsv), options);
}

export interface FormatOptions {
  /** 是否输出 alpha 段（hex 末尾 / rgba / hsva / hsla）。默认按 a<1 自动。 */
  alpha?: boolean;
  /** hex 输出大写。默认 true。 */
  uppercase?: boolean;
}

/**
 * 把 HSV 状态格式化为指定 format 的可读字符串（用于输入框显示）。
 * rgb: rgb(r, g, b) / rgba(r, g, b, a)
 * hsv: hsv(h, s%, v%) / hsva(h, s%, v%, a)
 * hsl: hsl(h, s%, l%) / hsla(h, s%, l%, a)
 */
export function formatColor(
  hsv: Hsv,
  format: ColorFormat,
  options: FormatOptions = {},
): string {
  const { uppercase = true } = options;
  const showAlpha = options.alpha ?? hsv.a < 1;
  const round = (n: number) => Math.round(n);
  const roundA = (n: number) => Math.round(n * 100) / 100;
  switch (format) {
    case 'rgb': {
      const { r, g, b, a } = hsvToRgb(hsv);
      return showAlpha
        ? `rgba(${r}, ${g}, ${b}, ${roundA(a)})`
        : `rgb(${r}, ${g}, ${b})`;
    }
    case 'hsv': {
      const h = round(hsv.h);
      const s = round(hsv.s * 100);
      const v = round(hsv.v * 100);
      return showAlpha
        ? `hsva(${h}, ${s}%, ${v}%, ${roundA(hsv.a)})`
        : `hsv(${h}, ${s}%, ${v}%)`;
    }
    case 'hsl': {
      const hsl = hsvToHsl(hsv);
      const h = round(hsl.h);
      const s = round(hsl.s * 100);
      const l = round(hsl.l * 100);
      return showAlpha
        ? `hsla(${h}, ${s}%, ${l}%, ${roundA(hsl.a)})`
        : `hsl(${h}, ${s}%, ${l}%)`;
    }
    case 'hex':
    default:
      return hsvToHex(hsv, { alpha: showAlpha, uppercase });
  }
}

/**
 * 解析任意 format 的输入字符串为 HSV。失败返回 null（不改值）。
 * 兼容 hex / rgb()/rgba() / hsv()/hsva() / hsl()/hsla()，逗号或空格分隔均可。
 */
export function parseColor(input: string, format: ColorFormat): Hsv | null {
  const str = input.trim();
  // hex 始终尝试（最常见）
  if (format === 'hex') {
    const rgb = parseHex(str);
    return rgb ? rgbToHsv(rgb) : null;
  }
  const nums = (str.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  // 数字不足以构成目标格式时，退化尝试把输入当 hex 解析（用户可能粘了 hex）。
  if (nums.length < 3) {
    const rgb = parseHex(str);
    return rgb ? rgbToHsv(rgb) : null;
  }
  const c0 = nums[0]!;
  const c1 = nums[1]!;
  const c2 = nums[2]!;
  const alphaVal = nums.length >= 4 ? clamp01(nums[3]!) : 1;
  if (format === 'rgb') {
    return rgbToHsv({
      r: clampByte(c0),
      g: clampByte(c1),
      b: clampByte(c2),
      a: alphaVal,
    });
  }
  if (format === 'hsv') {
    return {
      h: ((c0 % 360) + 360) % 360,
      s: clamp01(c1 / 100),
      v: clamp01(c2 / 100),
      a: alphaVal,
    };
  }
  // hsl
  return hslToHsv({
    h: ((c0 % 360) + 360) % 360,
    s: clamp01(c1 / 100),
    l: clamp01(c2 / 100),
    a: alphaVal,
  });
}
