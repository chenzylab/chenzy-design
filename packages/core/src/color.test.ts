import { describe, expect, it } from 'vitest';
import {
  parseHex,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  hsvToHsl,
  hslToHsv,
  rgbToHsl,
  hslToRgb,
  hexToHsv,
  hsvToHex,
  formatColor,
  parseColor,
  clamp01,
  type Hsv,
} from './color.js';

describe('clamp01', () => {
  it('clamps to [0,1]', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.5)).toBe(0.5);
  });
});

describe('parseHex', () => {
  it('parses 6-digit hex', () => {
    expect(parseHex('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('parses without #', () => {
    expect(parseHex('00ff00')).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  });
  it('expands 3-digit hex', () => {
    expect(parseHex('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('expands 4-digit hex with alpha', () => {
    expect(parseHex('#f008')?.a).toBeCloseTo(0x88 / 255, 5);
  });
  it('parses 8-digit hex alpha', () => {
    expect(parseHex('#0000ff80')?.a).toBeCloseTo(0x80 / 255, 5);
  });
  it('returns null on garbage', () => {
    expect(parseHex('nope')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('formats uppercase by default', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#FF0000');
  });
  it('lowercase option', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0, a: 1 }, { uppercase: false })).toBe('#ff0000');
  });
  it('appends alpha when a<1', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0, a: 0.5 })).toBe('#00000080');
  });
  it('omits alpha when alpha:false', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0, a: 0.5 }, { alpha: false })).toBe('#000000');
  });
});

describe('rgb <-> hsv', () => {
  it('red round-trips', () => {
    const hsv = rgbToHsv({ r: 255, g: 0, b: 0, a: 1 });
    expect(hsv.h).toBeCloseTo(0, 5);
    expect(hsv.s).toBeCloseTo(1, 5);
    expect(hsv.v).toBeCloseTo(1, 5);
    expect(hsvToRgb(hsv)).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
  it('green hue is 120', () => {
    expect(rgbToHsv({ r: 0, g: 255, b: 0, a: 1 }).h).toBeCloseTo(120, 5);
  });
  it('blue hue is 240', () => {
    expect(rgbToHsv({ r: 0, g: 0, b: 255, a: 1 }).h).toBeCloseTo(240, 5);
  });
  it('white has s=0 v=1', () => {
    const hsv = rgbToHsv({ r: 255, g: 255, b: 255, a: 1 });
    expect(hsv.s).toBe(0);
    expect(hsv.v).toBeCloseTo(1, 5);
  });
  it('arbitrary color round-trips within rounding', () => {
    const orig = { r: 123, g: 45, b: 200, a: 0.7 };
    const back = hsvToRgb(rgbToHsv(orig));
    expect(back.r).toBeCloseTo(123, 0);
    expect(back.g).toBeCloseTo(45, 0);
    expect(back.b).toBeCloseTo(200, 0);
    expect(back.a).toBeCloseTo(0.7, 5);
  });
});

describe('hsv <-> hsl', () => {
  it('red hsv -> hsl', () => {
    const hsl = hsvToHsl({ h: 0, s: 1, v: 1, a: 1 });
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBeCloseTo(1, 5);
    expect(hsl.l).toBeCloseTo(0.5, 5);
  });
  it('round-trips', () => {
    const hsv: Hsv = { h: 210, s: 0.6, v: 0.8, a: 0.5 };
    const back = hslToHsv(hsvToHsl(hsv));
    expect(back.h).toBeCloseTo(hsv.h, 5);
    expect(back.s).toBeCloseTo(hsv.s, 5);
    expect(back.v).toBeCloseTo(hsv.v, 5);
    expect(back.a).toBeCloseTo(hsv.a, 5);
  });
});

describe('rgb <-> hsl bridges', () => {
  it('rgbToHsl red', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0, a: 1 });
    expect(hsl.l).toBeCloseTo(0.5, 5);
  });
  it('hslToRgb round-trip', () => {
    const back = hslToRgb(rgbToHsl({ r: 12, g: 200, b: 99, a: 1 }));
    expect(back.r).toBeCloseTo(12, 0);
    expect(back.g).toBeCloseTo(200, 0);
    expect(back.b).toBeCloseTo(99, 0);
  });
});

describe('hex <-> hsv helpers', () => {
  it('hexToHsv invalid -> black', () => {
    expect(hexToHsv('zzz')).toEqual({ h: 0, s: 0, v: 0, a: 1 });
  });
  it('hsvToHex red', () => {
    expect(hsvToHex({ h: 0, s: 1, v: 1, a: 1 })).toBe('#FF0000');
  });
});

describe('formatColor', () => {
  const red: Hsv = { h: 0, s: 1, v: 1, a: 1 };
  const semiRed: Hsv = { h: 0, s: 1, v: 1, a: 0.5 };
  it('hex', () => {
    expect(formatColor(red, 'hex')).toBe('#FF0000');
  });
  it('rgb', () => {
    expect(formatColor(red, 'rgb')).toBe('rgb(255, 0, 0)');
  });
  it('rgba when alpha<1', () => {
    expect(formatColor(semiRed, 'rgb')).toBe('rgba(255, 0, 0, 0.5)');
  });
  it('hsv', () => {
    expect(formatColor(red, 'hsv')).toBe('hsv(0, 100%, 100%)');
  });
  it('hsl', () => {
    expect(formatColor(red, 'hsl')).toBe('hsl(0, 100%, 50%)');
  });
  it('hsla when alpha<1', () => {
    expect(formatColor(semiRed, 'hsl')).toBe('hsla(0, 100%, 50%, 0.5)');
  });
});

describe('parseColor', () => {
  it('parses rgb()', () => {
    const hsv = parseColor('rgb(255, 0, 0)', 'rgb');
    expect(hsv).not.toBeNull();
    expect(hsvToHex(hsv!)).toBe('#FF0000');
  });
  it('parses rgba()', () => {
    const hsv = parseColor('rgba(0, 0, 0, 0.5)', 'rgb');
    expect(hsv?.a).toBeCloseTo(0.5, 5);
  });
  it('parses hsl()', () => {
    const hsv = parseColor('hsl(120, 100%, 50%)', 'hsl');
    expect(hsvToHex(hsv!)).toBe('#00FF00');
  });
  it('parses hsv()', () => {
    const hsv = parseColor('hsv(240, 100%, 100%)', 'hsv');
    expect(hsvToHex(hsv!)).toBe('#0000FF');
  });
  it('parses hex in hex mode', () => {
    expect(hsvToHex(parseColor('#00ff00', 'hex')!)).toBe('#00FF00');
  });
  it('falls back to hex when non-hex mode gets a hex string', () => {
    const hsv = parseColor('#0000ff', 'rgb');
    expect(hsvToHex(hsv!)).toBe('#0000FF');
  });
  it('returns null on garbage', () => {
    expect(parseColor('nope', 'hex')).toBeNull();
    expect(parseColor('rgb(1, 2)', 'rgb')).toBeNull();
  });
});
