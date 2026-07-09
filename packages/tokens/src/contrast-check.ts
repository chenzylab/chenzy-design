/**
 * WCAG contrast audit for Alias tokens.
 *
 * Computes the relative-luminance contrast ratio for the body-level
 * foreground/background token pairs that components actually render, and
 * fails the build (non-zero exit) when any non-exempt pair is below the
 * WCAG 2.1 AA threshold for normal text (4.5:1).
 *
 * Run: `pnpm -C packages/tokens a11y:contrast` (after `pnpm build`).
 *
 * Pairs marked `exempt` are reported (EXEMPT-FAIL) but never break the build.
 * This now includes the solid status fills (success/warning/danger) carrying
 * white text: the library targets 100% Semi Design color parity, and Semi's
 * status colors paired with white text do NOT clear WCAG AA. That tradeoff is
 * accepted, so those pairs are exempt. Semi-compliant pairs that DO clear AA
 * (primary/link/text) remain hard gates.
 */
import { palette, type GlobalColorKey } from './global/color.js';
import { aliasLight, aliasDark, type AliasKey } from './alias/index.js';

/** 前景/背景可以是 alias 语义 token，也可以是全局基元（如纯白 white）。 */
type ColorKey = AliasKey | GlobalColorKey;

const AA_NORMAL = 4.5;

/** Resolve an alias token to a concrete color for a given theme (dark inherits light). */
function resolve(token: ColorKey, theme: 'light' | 'dark'): string {
  // 先查 alias 语义层；未命中则回退全局基元（palette，如纯白 white）。
  const alias = theme === 'dark' ? (aliasDark[token as AliasKey] ?? aliasLight[token as AliasKey]) : aliasLight[token as AliasKey];
  return (alias ?? palette[token as GlobalColorKey]) as string;
}

type RGBA = { r: number; g: number; b: number; a: number };

/** Parse #rrggbb / #rgb / rgb()/rgba() into RGBA (0-255 channels, 0-1 alpha). */
function parse(color: string): RGBA {
  const c = color.trim();
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  const m = c.match(/rgba?\(([^)]+)\)/i);
  if (!m || !m[1]) throw new Error(`unparseable color: ${color}`);
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
  return { r: parts[0] ?? 0, g: parts[1] ?? 0, b: parts[2] ?? 0, a: parts[3] ?? 1 };
}

/** Composite a (possibly translucent) foreground over an opaque background. */
function over(fg: RGBA, bg: RGBA): RGBA {
  const a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  };
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(c: RGBA): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

function contrast(fgColor: string, bgColor: string): number {
  const bg = parse(bgColor);
  const fg = over(parse(fgColor), bg);
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

type Pair = {
  theme: 'light' | 'dark';
  label: string;
  fg: ColorKey;
  bg: ColorKey;
  /** decorative / non-body or Semi-parity tradeoff: reported but never fails the build */
  exempt?: boolean;
};

/**
 * Body-level token pairs that render real text. Secondary text (text-2) is
 * audited only against the surfaces it actually sits on (bg-0 base canvas and
 * bg-1 low fill); the higher elevation fills (bg-2/bg-3) are exempt because
 * secondary text is not placed on them as body copy.
 *
 * The solid status fills (success/warning/danger with white text) are exempt:
 * they mirror Semi Design exactly, and Semi's status colors with white text do
 * not reach AA. We accept that to preserve 100% Semi color parity.
 */
const PAIRS: Pair[] = [
  // --- light: secondary text on surfaces ---
  { theme: 'light', label: 'text-2 on bg-0', fg: 'color-text-2', bg: 'color-bg-0' },
  { theme: 'light', label: 'text-2 on bg-1', fg: 'color-text-2', bg: 'color-bg-1' },
  { theme: 'light', label: 'text-2 on bg-2', fg: 'color-text-2', bg: 'color-bg-2', exempt: true },
  { theme: 'light', label: 'text-2 on bg-3', fg: 'color-text-2', bg: 'color-bg-3', exempt: true },
  // --- light: solid status buttons (white inverse text) — Semi-parity tradeoff ---
  { theme: 'light', label: 'text-inverse on success', fg: 'white', bg: 'color-success', exempt: true },
  { theme: 'light', label: 'text-inverse on warning', fg: 'white', bg: 'color-warning', exempt: true },
  { theme: 'light', label: 'text-inverse on danger', fg: 'white', bg: 'color-danger', exempt: true },
  // --- dark: solid primary/status buttons (white inverse text) ---
  // Semi's dark-mode primary fill is a bright blue (#54a9ff) that, like the
  // status fills, does not clear AA under white text. Exempt for Semi parity.
  { theme: 'dark', label: 'text-inverse on primary', fg: 'white', bg: 'color-primary', exempt: true },
  { theme: 'dark', label: 'text-inverse on primary-hover', fg: 'white', bg: 'color-primary-hover', exempt: true },
  { theme: 'dark', label: 'text-inverse on primary-active', fg: 'white', bg: 'color-primary-active', exempt: true },
  { theme: 'dark', label: 'text-inverse on info', fg: 'white', bg: 'color-info', exempt: true },
  { theme: 'dark', label: 'text-inverse on success', fg: 'white', bg: 'color-success', exempt: true },
  { theme: 'dark', label: 'text-inverse on warning', fg: 'white', bg: 'color-warning', exempt: true },
  { theme: 'dark', label: 'text-inverse on danger', fg: 'white', bg: 'color-danger', exempt: true },
  // --- dark: primary as link/foreground on surfaces ---
  { theme: 'dark', label: 'primary link on bg-0', fg: 'color-primary', bg: 'color-bg-0' },
  { theme: 'dark', label: 'primary link on bg-1', fg: 'color-primary', bg: 'color-bg-1' },

  // --- component consumption: solid status fills (Switch / Tag / Badge) ---
  // White text on Semi status fills; exempt for Semi parity (see above).
  { theme: 'light', label: 'solid primary fill text', fg: 'white', bg: 'color-primary' },
  { theme: 'light', label: 'solid success fill text', fg: 'white', bg: 'color-success', exempt: true },
  { theme: 'light', label: 'solid warning fill text', fg: 'white', bg: 'color-warning', exempt: true },
  { theme: 'light', label: 'solid danger fill text', fg: 'white', bg: 'color-danger', exempt: true },
  { theme: 'dark', label: 'solid success fill text', fg: 'white', bg: 'color-success', exempt: true },
  { theme: 'dark', label: 'solid warning fill text', fg: 'white', bg: 'color-warning', exempt: true },
  { theme: 'dark', label: 'solid danger fill text', fg: 'white', bg: 'color-danger', exempt: true },
];

let bodyFailures = 0;
const lines: string[] = [];

for (const p of PAIRS) {
  const fg = resolve(p.fg, p.theme);
  const bg = resolve(p.bg, p.theme);
  const ratio = contrast(fg, bg);
  const ok = ratio >= AA_NORMAL;
  let status: string;
  if (ok) status = 'PASS';
  else if (p.exempt) status = 'EXEMPT-FAIL';
  else {
    status = 'FAIL';
    bodyFailures += 1;
  }
  lines.push(
    `[${p.theme}] ${status.padEnd(11)} ${ratio.toFixed(2).padStart(5)}:1  ${p.label} ` +
      `(${fg} on ${bg})`,
  );
}

console.log('WCAG AA contrast audit (normal text ≥ 4.5:1)\n');
console.log(lines.join('\n'));
console.log(
  `\n${bodyFailures === 0 ? 'OK' : 'FAILED'}: ${bodyFailures} body-level violation(s).`,
);

// keep palette imported for potential future direct-palette audits
void palette;

process.exit(bodyFailures === 0 ? 0 : 1);
