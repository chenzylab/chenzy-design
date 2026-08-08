import { describe, expect, it } from 'vitest';
import {
  hexToRgba,
  rgbaToHex,
  rgbaToHsva,
  hsvaToRgba,
  hexToHsva,
  hsvaToHex,
  colorValueFromHex,
  colorValueFromRgba,
  colorValueFromHsva,
  colorValueToInputString,
  parseColorInput,
  colorStringToValue,
  parseHue,
  rgbaStringToRgba,
  hsvaStringToHsva,
  hsvaToHslString,
  hsvaToHslaString,
  hsvaToRgbaString,
  DEFAULT_COLOR_VALUE,
} from './color-value.js';

describe('ColorValue: hex <-> rgba', () => {
  it('hexToRgba 6-digit', () => {
    expect(hexToRgba('#39c5bb')).toEqual({ r: 57, g: 197, b: 187, a: 1 });
  });
  it('hexToRgba 8-digit alpha', () => {
    const r = hexToRgba('#39c5bb80');
    expect(r.r).toBe(57);
    expect(r.a).toBeCloseTo(0.5, 1);
  });
  it('hexToRgba 3-digit expands', () => {
    expect(hexToRgba('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });
  it('rgbaToHex a===1 omits alpha, lowercase', () => {
    expect(rgbaToHex({ r: 57, g: 197, b: 187, a: 1 })).toBe('#39c5bb');
  });
  it('rgbaToHex a<1 appends alpha', () => {
    expect(rgbaToHex({ r: 0, g: 0, b: 0, a: 0.5 })).toBe('#00000080');
  });
});

describe('ColorValue: Semi hsva (s/v 0-100) round-trips', () => {
  it('hexToHsva #39c5bb matches Semi default hsva', () => {
    expect(hexToHsva('#39c5bb')).toEqual({ h: 176, s: 71, v: 77, a: 1 });
  });
  it('white', () => {
    expect(rgbaToHsva({ r: 255, g: 255, b: 255, a: 1 })).toEqual({ h: 0, s: 0, v: 100, a: 1 });
  });
  it('red hue 0, s/v 100', () => {
    expect(rgbaToHsva({ r: 255, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 100, v: 100, a: 1 });
  });
  it('green hue 120', () => {
    expect(rgbaToHsva({ r: 0, g: 255, b: 0, a: 1 }).h).toBe(120);
  });
  it('hsva -> rgba round-trip', () => {
    const rgba = hsvaToRgba({ h: 176, s: 71, v: 77, a: 1 });
    expect(rgba.r).toBe(57);
    expect(rgba.g).toBeGreaterThanOrEqual(196);
    expect(rgba.b).toBeGreaterThanOrEqual(186);
  });
  it('hsva -> hex (Semi 品牌绿，含 ±1 byte 舍入)', () => {
    // hsvaToHex = rgbaToHex(hsvaToRgba)；#39c5bb 往返因 round 得 #39c4bb（g 少 1，Semi 同）。
    const hex = hsvaToHex({ h: 176, s: 71, v: 77, a: 1 });
    expect(hex).toMatch(/^#39c[45]bb$/);
  });
});

describe('ColorValue: three-state constructors', () => {
  it('fromHex fills all three states', () => {
    const cv = colorValueFromHex('#39c5bb');
    expect(cv.hex).toBe('#39c5bb');
    expect(cv.rgba).toEqual({ r: 57, g: 197, b: 187, a: 1 });
    expect(cv.hsva).toEqual({ h: 176, s: 71, v: 77, a: 1 });
  });
  it('fromRgba fills hex + hsva', () => {
    const cv = colorValueFromRgba({ r: 255, g: 0, b: 0, a: 1 });
    expect(cv.hex).toBe('#ff0000');
    expect(cv.hsva.h).toBe(0);
  });
  it('fromHsva fills rgba + hex', () => {
    const cv = colorValueFromHsva({ h: 0, s: 100, v: 100, a: 1 });
    expect(cv.rgba).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(cv.hex).toBe('#ff0000');
  });
  it('DEFAULT is Semi brand green', () => {
    expect(DEFAULT_COLOR_VALUE.hex).toBe('#39c5bb');
    expect(DEFAULT_COLOR_VALUE.hsva).toEqual({ h: 176, s: 71, v: 77, a: 1 });
  });
});

describe('ColorValue: input string (Semi getInputValue)', () => {
  const cv = colorValueFromHex('#39c5bbff');
  it('hex slices to 7 chars', () => {
    expect(colorValueToInputString(cv, 'hex')).toBe('#39c5bb');
  });
  it('rgba is r,g,b', () => {
    expect(colorValueToInputString(cv, 'rgba')).toBe('57,197,187');
  });
  it('hsva is h,s,v', () => {
    expect(colorValueToInputString(cv, 'hsva')).toBe('176,71,77');
  });
});

describe('ColorValue: parseColorInput', () => {
  it('parses hex without #', () => {
    expect(parseColorInput('39c5bb', 'hex')).toEqual({ color: '#39c5bb', format: 'hex' });
  });
  it('rejects short hex', () => {
    expect(parseColorInput('#abc', 'hex')).toBeNull();
  });
  it('parses rgba', () => {
    expect(parseColorInput('57,197,187', 'rgba')).toEqual({
      color: { r: 57, g: 197, b: 187, a: 1 },
      format: 'rgba',
    });
  });
  it('parses hsva', () => {
    expect(parseColorInput('176,71,77', 'hsva')).toEqual({
      color: { h: 176, s: 71, v: 77, a: 1 },
      format: 'hsva',
    });
  });
  it('returns null when too few numbers', () => {
    expect(parseColorInput('57,197', 'rgba')).toBeNull();
  });
});

describe('ColorValue: colorStringToValue（对齐 Semi 静态方法，逐值与 Semi convert 实测一致）', () => {
  it('hex 串', () => {
    expect(colorStringToValue('#39c5bb')).toEqual({
      hsva: { h: 176, s: 71, v: 77, a: 1 },
      rgba: { r: 57, g: 197, b: 187, a: 1 },
      hex: '#39c5bb',
    });
  });
  it('rgb 串（Semi 文档同款 rgb(57,197,187)）', () => {
    expect(colorStringToValue('rgb(57,197,187)')).toEqual({
      hsva: { h: 176, s: 71, v: 77, a: 1 },
      rgba: { r: 57, g: 197, b: 187, a: 1 },
      hex: '#39c5bb',
    });
  });
  it('rgba 串带 alpha', () => {
    expect(colorStringToValue('rgba(57,197,187,0.5)')).toEqual({
      hsva: { h: 176, s: 71, v: 77, a: 0.5 },
      rgba: { r: 57, g: 197, b: 187, a: 0.5 },
      hex: '#39c5bb80',
    });
  });
  it('hsv 串（Semi 文档同款 hsv(176,71,77)）', () => {
    expect(colorStringToValue('hsv(176,71,77)')).toEqual({
      hsva: { h: 176, s: 71, v: 77, a: 1 },
      rgba: { r: 57, g: 196, b: 187, a: 1 },
      hex: '#39c4bb',
    });
  });
  it('hsva 串带 alpha', () => {
    expect(colorStringToValue('hsva(176,71,77,0.4)').hex).toBe('#39c4bb66');
  });
  it('非法串抛错（对齐 Semi，避免静默拿到黑色）', () => {
    expect(() => colorStringToValue('not-a-color')).toThrow();
  });
});

describe('ColorValue: 颜色串解析工具（对齐 Semi convert）', () => {
  it('parseHue 支持 turn 单位', () => {
    expect(parseHue('0.5', 'turn')).toBe(180);
  });
  it('parseHue 缺省 deg', () => {
    expect(parseHue('176')).toBe(176);
  });
  it('rgbaStringToRgba 百分比通道', () => {
    expect(rgbaStringToRgba('rgba(10%,20%,30%,50%)')).toEqual({
      r: 25.5,
      g: 51,
      b: 76.5,
      a: 0.5,
    });
  });
  it('rgbaStringToRgba 无法匹配回落黑色（对齐 Semi）', () => {
    expect(rgbaStringToRgba('nope')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
  it('hsvaStringToHsva 支持角度单位', () => {
    expect(hsvaStringToHsva('hsv(0.5turn,50,50)')).toEqual({ h: 180, s: 50, v: 50, a: 1 });
  });
  it('hsvaStringToHsva 无法匹配回落全 0（对齐 Semi）', () => {
    expect(hsvaStringToHsva('nope')).toEqual({ h: 0, s: 0, v: 0, a: 1 });
  });
});

describe('ColorValue: hsla / 展示串（对齐 Semi hsvaToHsl*）', () => {
  it('hsvaToHslString 用于色板底色', () => {
    expect(hsvaToHslString({ h: 176, s: 100, v: 100, a: 1 })).toBe('hsl(176, 100%, 50%)');
  });
  it('hsvaToHslaString 保留 alpha', () => {
    expect(hsvaToHslaString({ h: 176, s: 71, v: 77, a: 0.4 })).toBe('hsla(176, 55%, 50%, 0.4)');
  });
  it('hsvaToRgbaString 用于 alpha 把手色', () => {
    expect(hsvaToRgbaString({ h: 176, s: 71, v: 77, a: 0.4 })).toBe('rgba(57, 196, 187, 0.4)');
  });
});
