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
