/**
 * 语义层必须**引用**色板，不能把色值抄死。
 *
 * 背景（2026-07-31 双侧实测）：
 *   Semi  `--semi-color-primary: rgba(var(--semi-blue-5), 1)` → 覆盖色板，primary 跟随；
 *   本库改前 `--cd-color-primary: #0064fa`                    → 覆盖色板，primary 纹丝不动。
 * 即主题定制在语义层是断的。这组用例把「引用关系」钉死，防止有人手滑改回字面值。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { aliasLight, aliasDark } from './index.js';
import { palette, paletteDark, ref, resolveRef } from '../global/color.js';
import { tokenValue } from '../components/token-def.js';

/** Semi 里语义色是「指向色板」的那些键（其余是半透明合成/渐变，本就不是纯色板色）。 */
const MUST_BE_REF = [
  'color-primary',
  'color-primary-hover',
  'color-primary-active',
  'color-secondary',
  'color-tertiary',
  'color-info',
  'color-success',
  'color-warning',
  'color-danger',
  'color-link',
  'color-text-0',
] as const;

describe('ref()：语义层指向色板而非抄值', () => {
  it('构建出的 CSS 值是 var(--cd-color-*)，不是字面色值', () => {
    for (const key of MUST_BE_REF) {
      const css = tokenValue(aliasLight[key]);
      expect(css, `${key} 应引用色板`).toMatch(/^var\(--cd-color-[a-z0-9-]+\)$/);
    }
  });

  it('ref() 的 value 解析到 light 色板、dark 下解析到 dark 色板', () => {
    const r = ref('blue-5');
    expect(r.css).toBe('var(--cd-color-blue-5)');
    expect(resolveRef(r, false)).toBe(palette['blue-5']);
    expect(resolveRef(r, true)).toBe(paletteDark['blue-5']);
    // 两个主题的 blue-5 确实不同，否则这条用例是空转
    expect(palette['blue-5']).not.toBe(paletteDark['blue-5']);
  });

  it('aliasDark 里指向色板的条目同样是 ref（dark 靠色板整体反转生效）', () => {
    for (const key of ['color-primary', 'color-tertiary', 'color-text-0'] as const) {
      const v = aliasDark[key];
      if (v === undefined) continue;
      expect(tokenValue(v), `dark ${key} 应引用色板`).toMatch(/^var\(--cd-color-/);
    }
  });
});

describe('产物 CSS：语义色与色板的引用链完整', () => {
  const css = readFileSync(resolve(import.meta.dirname, '../../dist/tokens.css'), 'utf8');

  it(':root 里 primary 指向 blue-5，且 blue-5 有具体值', () => {
    expect(css).toMatch(/--cd-color-primary:\s*var\(--cd-color-blue-5\);/);
    expect(css).toMatch(/--cd-color-blue-5:\s*#0064fa;/);
  });

  it('dark 块重定义色板，语义色因此自动跟随（无需逐条覆盖）', () => {
    const darkBlock = css.slice(css.indexOf("[data-theme='dark']"));
    expect(darkBlock).toMatch(/--cd-color-blue-5:\s*#54a9ff;/);
    expect(darkBlock).toMatch(/--cd-color-primary:\s*var\(--cd-color-blue-5\);/);
  });
});
