import { describe, expect, it } from 'vitest';
import { defineTheme } from '../src/config.js';
import { generateCss, validateConfig } from '../src/build.js';

describe('defineTheme', () => {
  it('原样透传配置对象', () => {
    const cfg = { alias: { 'color-primary': '#0066ff' }, dark: { 'color-bg-0': '#111' } };
    expect(defineTheme(cfg)).toBe(cfg);
  });
});

describe('generateCss', () => {
  it('产出 :root 与 [data-theme="dark"] 两段，值正确', () => {
    const css = generateCss({
      alias: { 'color-primary': '#0066ff' },
      dark: { 'color-bg-0': '#16161a' },
    });
    expect(css).toContain(':root {');
    expect(css).toContain('--cd-color-primary: #0066ff;');
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain('--cd-color-bg-0: #16161a;');
    // dark 段在 :root 段之后
    expect(css.indexOf(':root')).toBeLessThan(css.indexOf('[data-theme="dark"]'));
  });

  it('无 dark 时不产出暗色段', () => {
    const css = generateCss({ alias: { 'color-primary': '#0066ff' } });
    expect(css).toContain(':root {');
    expect(css).not.toContain('[data-theme="dark"]');
  });

  it('空配置只含头注释，不产出任何选择器', () => {
    const css = generateCss({});
    expect(css).not.toContain(':root {');
    expect(css).not.toContain('[data-theme="dark"]');
  });
});

describe('validateConfig', () => {
  it('合法 alias key 无 error / warning', () => {
    const r = validateConfig({ alias: { 'color-primary': '#0066ff' } });
    expect(r.errors).toHaveLength(0);
    expect(r.warnings).toHaveLength(0);
  });

  it('合法 dark key 通过校验', () => {
    const r = validateConfig({ dark: { 'color-bg-0': '#16161a' } });
    expect(r.errors).toHaveLength(0);
  });

  it('拼错的 key 报 unknown error', () => {
    const r = validateConfig({ alias: { 'color-primry': '#0066ff' } });
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toMatchObject({ key: 'color-primry', section: 'alias', kind: 'unknown' });
  });

  it('dark 段拼错的 key 也报错并标注 section', () => {
    const r = validateConfig({ dark: { 'nope-token': '#000' } });
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]?.section).toBe('dark');
  });
});
