/**
 * createProgress helpers — framework-agnostic progress math, colour & a11y.
 * Pure functions only: percent clamping, circle SVG geometry (Semi single-ring
 * dashoffset model), segmented-stroke colour resolution (generateColor, mirrors
 * semi-foundation/progress/generates.ts) and progressbar aria props. No DOM,
 * no framework deps. Strictly aligned to Semi Design Progress.
 */

export type ProgressType = 'line' | 'circle';
export type ProgressDirection = 'horizontal' | 'vertical';
export type ProgressSize = 'default' | 'small' | 'large';
export type StrokeLinecap = 'round' | 'square';

/** A segment of the segmented-stroke colour array. */
export interface StrokeSet {
  percent: number;
  color: string;
}
export type StrokeArr = StrokeSet[];

/** Clamp any input to 0..100 (values outside the range snap to the bound). */
export function clampPercent(percent: number): number {
  if (percent > 100) return 100;
  if (percent < 0) return 0;
  return percent;
}

export interface CirclePathInput {
  /** diameter in px */
  width: number;
  /** stroke width in px */
  strokeWidth: number;
  /** percent 0..100 */
  percent: number;
}

export interface CirclePathProps {
  radius: number;
  /** center coordinate (width/2) */
  center: number;
  /** full stroke length of the ring */
  circumference: number;
  /** dasharray for both track and fill: `${c} ${c}` */
  strokeDasharray: string;
  /** dashoffset for the filled ring (maps percent → arc length) */
  strokeDashoffset: number;
}

/**
 * Compute SVG geometry for the circle ring, mirroring Semi:
 *   radius = (width - strokeWidth) / 2
 *   circumference = radius * 2π
 *   dashoffset = (1 - percent/100) * circumference
 * The visual −90° start rotation is applied via CSS on the inner ring.
 */
export function getCirclePathProps(input: CirclePathInput): CirclePathProps {
  const { width, strokeWidth } = input;
  const percent = clampPercent(input.percent);
  const center = width / 2;
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = (1 - percent / 100) * circumference;
  return {
    radius,
    center,
    circumference,
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset,
  };
}

// ————————————————————————————————————————————————————————————————
// Segmented-stroke colour resolution — direct port of Semi's generates.ts.
// `stroke` may be a plain colour string (returned as-is) or an ordered array
// of {percent, color}; generateColor picks/blends the colour for the current
// percent. With `gradient=true`, colours between two anchors are interpolated.
// ————————————————————————————————————————————————————————————————

const STROKE_DEFAULT = 'var(--cd-color-success)';

interface GenerateInput {
  startColor: string;
  endColor: string;
  size: number;
}

/** Resolve the stroke colour for the current percent (Semi-aligned). */
export function generateColor(
  s: StrokeArr,
  percent: number,
  gradient: boolean,
): string | undefined {
  try {
    const color = generate(s, percent, gradient);
    if (color !== undefined && color !== '') return color as string;
  } catch {
    return undefined;
  }
  return undefined;
}

function generate(
  s: StrokeArr,
  percent: number,
  gradient: boolean,
): string | undefined {
  s.sort((a, b) => a.percent - b.percent);
  if (s[0]!.percent > percent) {
    return STROKE_DEFAULT;
  }
  const endS = s[s.length - 1]!;
  if (endS.percent < percent) {
    return formatToHex(endS.color);
  }
  for (const [index, item] of s.entries()) {
    if (item.percent === percent) {
      return formatToHex(item.color);
    }
    if (percent > item.percent) continue;
    // index-1 恒有效：s[0].percent <= percent（上方早返回保证），故进入此分支时 index >= 1。
    const oldItem = s[index - 1]!;
    if (!gradient) {
      return formatToHex(oldItem.color);
    }
    return generateGradients(
      {
        startColor: formatToHex(oldItem.color) as string,
        endColor: formatToHex(item.color) as string,
        size: item.percent - oldItem.percent - 1,
      },
      percent - oldItem.percent - 1,
    ) as string;
  }
  return undefined;
}

function generateGradients(
  g: GenerateInput,
  index: number | undefined,
): string[] | string {
  const { startColor, endColor, size } = g;
  const sA = startColor.split('');
  const eA = endColor.split('');
  const rC = [parseInt(`${sA[1]}${sA[2]}`, 16), parseInt(`${eA[1]}${eA[2]}`, 16)];
  const gC = [parseInt(`${sA[3]}${sA[4]}`, 16), parseInt(`${eA[3]}${eA[4]}`, 16)];
  const bC = [parseInt(`${sA[5]}${sA[6]}`, 16), parseInt(`${eA[5]}${eA[6]}`, 16)];
  const aC = [parseInt(`${sA[7]}${sA[8]}`, 16), parseInt(`${eA[7]}${eA[8]}`, 16)];
  const rStep = (rC[0]! - rC[1]!) / (size + 1);
  const gStep = (gC[0]! - gC[1]!) / (size + 1);
  const bStep = (bC[0]! - bC[1]!) / (size + 1);
  const aStep = (aC[0]! - aC[1]!) / (size + 1);
  function tHex(i: number) {
    const rS = Math.round(rC[0]! - rStep * (i + 1)).toString(16);
    const gS = Math.round(gC[0]! - gStep * (i + 1)).toString(16);
    const bS = Math.round(bC[0]! - bStep * (i + 1)).toString(16);
    const h = `${padTwo(rS)}${padTwo(gS)}${padTwo(bS)}`;
    const t = Math.floor(aStep * (i + 1) + aC[1]!).toString(16);
    return toHex.Hex(`#${h}`, t);
  }
  function padTwo(str: string) {
    if (str.length === 1) return `0${str}`;
    if (str.length === 0) return '00';
    return str;
  }
  if (typeof index === 'undefined') {
    const gradientColorArr = [startColor];
    for (let i = 0; i < size; i += 1) {
      gradientColorArr.push(tHex(i));
    }
    return gradientColorArr;
  }
  return tHex(index);
}

/** Resolve any supported colour type (Hex/Hsl(a)/Rgb(a)/Semi tokens) to hex. */
function formatToHex(color: string): string | undefined {
  color = color.trim().toLowerCase();
  if (REG_S.hex.test(color)) {
    return toHex.Hex(color, undefined);
  }
  if (REG_S.hslA.test(color)) {
    return toHex.Hex(toHex.HslA(color), undefined);
  }
  if (REG_S.rgbA.test(color)) {
    return toHex.Hex(toHex.RgbA(color), undefined);
  }
  if (REG_S.semiDesignTokens.test(color)) {
    if (DESIGN_TOKENS.ALONG.indexOf(color) !== -1) {
      return toHex.DesignToken(color);
    }
    if (DESIGN_TOKENS.SEQUENCE.indexOf(color) !== -1) {
      return toHex.DesignToken(`${color}-5`);
    }
    return toHex.DesignToken(`${color}`);
  }
  return undefined;
}

const toHex = {
  Hex(color: string, transparency: string | undefined): string {
    color = color.replace('#', '');
    if (color.length === 8) return `#${color}`;
    if (color.length === 6) return `#${color}${transparency || 'ff'}`;
    if (color.length === 3) {
      color = color
        .split('')
        .map((c) => c + c)
        .join('');
    }
    return `#${color}${transparency || 'ff'}`;
  },
  DesignToken(color: string): string | undefined {
    // Only resolvable in the browser after the real DOM exists.
    if (typeof window === 'undefined') return undefined;
    const variable = getComputedStyle(document.body).getPropertyValue(`--cd-${color}`);
    if (variable === '') return undefined;
    const rgba = `rgba(${variable}, 1)`;
    return toHex.RgbA(rgba);
  },
  HslA(color: string): string {
    const hsla = REG_S.hslA.exec(color) as RegExpExecArray;
    const h = parseInt(hsla[2]!);
    const s = parseInt(hsla[3]!) / 100;
    const l = parseInt(hsla[4]!) / 100;
    const a = hsla[5];
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r: number = 0;
    let g: number = 0;
    let b: number = 0;
    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }
    const rS = Math.round((r + m) * 255).toString(16);
    const gS = Math.round((g + m) * 255).toString(16);
    const bS = Math.round((b + m) * 255).toString(16);
    return toHex.utils.pAL(rS, gS, bS, a);
  },
  RgbA(color: string): string {
    const rgba = REG_S.rgbA.exec(color) as RegExpExecArray;
    const r = parseInt(rgba[2]!, 10).toString(16);
    const g = parseInt(rgba[3]!, 10).toString(16);
    const b = parseInt(rgba[4]!, 10).toString(16);
    const a = rgba[5];
    return toHex.utils.pAL(r, g, b, a);
  },
  utils: {
    pAL(r: string, g: string, b: string, a: string | undefined): string {
      if (r.length === 1) r = '0' + r;
      if (g.length === 1) g = '0' + g;
      if (b.length === 1) b = '0' + b;
      if (typeof a !== 'undefined') {
        let aHex = Math.round(parseInt(a) * 255).toString(16);
        if (aHex.length === 1) aHex = '0' + aHex;
        return '#' + r + g + b + aHex;
      }
      return '#' + r + g + b;
    },
  },
};

const REG_S = {
  hex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
  hslA: /(hsl)a?\(\s*?(\d+),?\s*?(\d+)%,?\s*?(\d+)%,?\s*?\/?(\s*?[\d.]+)?\s*?\)/,
  rgbA: /(rgb)a?\(\s*?(\d+),?\s*?(\d+),?\s*?(\d+),?\s*?\/?(\s*?[\d.]+)?\s*?\)/,
  semiDesignTokens: /(\w+)?-?(\w+)-?(\d)?/,
};

const DESIGN_TOKENS = {
  ALONG: ['black', 'white'],
  SEQUENCE: [
    'amber',
    'blue',
    'cyan',
    'green',
    'grey',
    'indigo',
    'light-blue',
    'light-green',
    'lime',
    'orange',
    'pink',
    'purple',
    'red',
    'teal',
    'violet',
    'yellow',
  ],
};

// ————————————————————————————————————————————————————————————————
// a11y — progressbar role + aria props (Semi-aligned).
// ————————————————————————————————————————————————————————————————

export interface RootAriaInput {
  percent: number;
  label?: string;
  labelledBy?: string;
  valueText?: string;
}

export interface RootAriaProps {
  role: 'progressbar';
  'aria-valuemin': 0;
  'aria-valuemax': 100;
  'aria-valuenow': number;
  'aria-valuetext'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** Build progressbar aria props. `aria-valuenow` always reflects the clamped percent. */
export function getRootAriaProps(input: RootAriaInput): RootAriaProps {
  const props: RootAriaProps = {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': clampPercent(input.percent),
  };
  if (input.valueText) props['aria-valuetext'] = input.valueText;
  if (input.label) props['aria-label'] = input.label;
  if (input.labelledBy) props['aria-labelledby'] = input.labelledBy;
  return props;
}
