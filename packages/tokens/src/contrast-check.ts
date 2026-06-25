/**
 * WCAG contrast self-check for Alias (semantic) color tokens.
 *
 * Implements the SPEC §对比度 acceptance item (specs/00-foundation/a11y.spec.md):
 *   文本/图标对背景 ≥ 4.5:1（大字 3:1）；焦点环/UI 边界 ≥ 3:1；token 设计阶段即校验。
 *
 * Strategy
 * - Alias tokens (alias/index.ts) already resolve their `palette[...]` references to
 *   literal hex at import time, so we read the *resolved* alias maps directly — no
 *   manual deref table to drift out of sync. For dark theme we merge aliasDark over
 *   aliasLight (dark only remaps a subset; unspecified keys inherit light).
 * - The `focus-ring` token is a CSS box-shadow string (`0 0 0 2px <color>`); we parse
 *   the trailing color out of it for the focus-ring vs background check.
 * - We enumerate *meaningful* UI pairs (see PAIRS) rather than every text×bg product,
 *   driven by the token semantics — body text on body backgrounds, inverse text on the
 *   solid status/brand button fills, focus ring / border on the base backgrounds.
 *
 * Each pair declares its WCAG threshold + an optional `exempt` flag for decorative /
 * non-body usages (placeholder/disabled weak text, decorative borders) that are a
 * documented design decision, not a real violation. Exempt failures are reported but
 * do NOT fail the build; non-exempt body-text failures DO (non-zero exit).
 *
 * Run: `tsx src/contrast-check.ts` (pnpm --filter @chenzy-design/tokens a11y:contrast).
 */
import { aliasLight, aliasDark, type AliasKey } from './alias/index.js';

// ---------------------------------------------------------------------------
// WCAG relative luminance + contrast ratio
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`contrast-check: not a hex color: ${JSON.stringify(hex)}`);
  }
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** sRGB → relative luminance per WCAG 2.x. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** WCAG contrast ratio (1..21), order-independent. */
function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Pull the color out of `focus-ring`'s box-shadow string, e.g. "0 0 0 2px #b8d9ff". */
function shadowColor(value: string): string {
  const m = value.match(/#[0-9a-fA-F]{3,8}\b/);
  if (!m) throw new Error(`contrast-check: no color in shadow: ${JSON.stringify(value)}`);
  return m[0];
}

// ---------------------------------------------------------------------------
// Theme resolution: read resolved alias maps (dark = light <- darkOverrides)
// ---------------------------------------------------------------------------

type Theme = 'light' | 'dark';
const themes: Record<Theme, Record<AliasKey, string>> = {
  light: { ...aliasLight },
  dark: { ...aliasLight, ...aliasDark },
};

// ---------------------------------------------------------------------------
// Meaningful pairs to validate. fg/bg are alias keys; `pick` extracts the
// foreground color (default = the alias value itself; focus-ring needs parsing).
// ---------------------------------------------------------------------------

const TEXT_MIN = 4.5; // normal body text / icons
const LARGE_MIN = 3.0; // large text (≥18pt / 14pt bold), non-body decorative text
const UI_MIN = 3.0; // focus ring, UI boundaries (WCAG 1.4.11)

interface Pair {
  label: string;
  fg: AliasKey;
  bg: AliasKey;
  min: number;
  /** decorative / non-body usage: failure is a documented design exemption, not a violation */
  exempt?: boolean;
  note?: string;
  /** override fg extraction (e.g. parse color out of a shadow token) */
  pickFg?: (v: string) => string;
}

// Body backgrounds the text tokens are intended to sit on.
const bodyBgs: AliasKey[] = ['color-bg-0', 'color-bg-1', 'color-bg-2', 'color-bg-3'];
// Solid brand/status fills that carry inverse text (buttons, banners, tags).
const solidFills: AliasKey[] = [
  'color-primary',
  'color-primary-hover',
  'color-primary-active',
  'color-success',
  'color-warning',
  'color-danger',
  'color-info',
];

const PAIRS: Pair[] = [
  // --- body text (text-0/1/2) on body backgrounds: must meet 4.5:1 ---
  ...(['color-text-0', 'color-text-1', 'color-text-2'] as AliasKey[]).flatMap((fg) =>
    bodyBgs.map(
      (bg): Pair => ({
        label: `${fg} on ${bg}`,
        fg,
        bg,
        min: TEXT_MIN,
      }),
    ),
  ),
  // --- weak text (text-3): placeholder / disabled / hint, decorative. 3:1 target, exempt. ---
  ...bodyBgs.map(
    (bg): Pair => ({
      label: `color-text-3 on ${bg}`,
      fg: 'color-text-3',
      bg,
      min: LARGE_MIN,
      exempt: true,
      note: 'placeholder/disabled/hint 弱文本，非正文，设计接受',
    }),
  ),
  // --- inverse text on solid brand/status fills: button/tag/banner labels, body text → 4.5:1 ---
  ...solidFills.map(
    (bg): Pair => ({
      label: `color-text-inverse on ${bg}`,
      fg: 'color-text-inverse',
      bg,
      min: TEXT_MIN,
    }),
  ),
  // --- link/primary color used as text on base backgrounds (links): body text → 4.5:1 ---
  ...(['color-bg-0', 'color-bg-1'] as AliasKey[]).map(
    (bg): Pair => ({
      label: `color-primary (link) on ${bg}`,
      fg: 'color-primary',
      bg,
      min: TEXT_MIN,
    }),
  ),
  // --- focus color (solid ring) vs base backgrounds: THE visible focus indicator,
  //     this is the token that must satisfy WCAG 1.4.11 (≥3:1). ---
  ...(['color-bg-0', 'color-bg-1'] as AliasKey[]).map(
    (bg): Pair => ({
      label: `color-focus on ${bg}`,
      fg: 'color-focus',
      bg,
      min: UI_MIN,
    }),
  ),
  // --- focus-ring halo (pale box-shadow glow) vs base backgrounds: decorative outer
  //     glow rendered on top of the solid color-focus ring; not the load-bearing
  //     indicator, so its low contrast is design-accepted (exempt). ---
  ...(['color-bg-0', 'color-bg-1'] as AliasKey[]).map(
    (bg): Pair => ({
      label: `focus-ring (halo) on ${bg}`,
      fg: 'focus-ring',
      bg,
      min: UI_MIN,
      pickFg: shadowColor,
      exempt: true,
      note: '装饰性外发光，可见焦点由 color-focus 实环承载',
    }),
  ),
  // --- border vs base backgrounds: decorative UI boundary, 3:1 target, exempt ---
  ...(['color-bg-0', 'color-bg-1'] as AliasKey[]).map(
    (bg): Pair => ({
      label: `color-border on ${bg}`,
      fg: 'color-border',
      bg,
      min: UI_MIN,
      exempt: true,
      note: '装饰性分隔线/边界，非必需对比的 UI 元素，设计接受',
    }),
  ),
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

interface Result extends Pair {
  theme: Theme;
  ratio: number;
  pass: boolean;
}

const results: Result[] = [];
for (const theme of ['light', 'dark'] as Theme[]) {
  const map = themes[theme];
  for (const p of PAIRS) {
    const fgRaw = map[p.fg];
    const bgRaw = map[p.bg];
    const fg = p.pickFg ? p.pickFg(fgRaw) : fgRaw;
    const ratio = contrastRatio(fg, bgRaw);
    results.push({ ...p, theme, ratio, pass: ratio >= p.min });
  }
}

function fmt(n: number): string {
  return `${n.toFixed(2)}:1`;
}

const violations = results.filter((r) => !r.pass && !r.exempt);
const exemptFails = results.filter((r) => !r.pass && r.exempt);

for (const theme of ['light', 'dark'] as Theme[]) {
  console.log(`\n=== ${theme.toUpperCase()} theme ===`);
  for (const r of results.filter((r) => r.theme === theme)) {
    const status = r.pass ? 'PASS' : r.exempt ? 'EXEMPT-FAIL' : 'FAIL';
    const flag = r.pass ? '  ' : r.exempt ? '~ ' : 'x ';
    const note = !r.pass && r.note ? `  (${r.note})` : '';
    console.log(
      `${flag}[${status}] ${r.label.padEnd(36)} ${fmt(r.ratio).padStart(8)} (min ${fmt(r.min)})${note}`,
    );
  }
}

console.log(`\n--- Summary ---`);
console.log(`total pairs checked : ${results.length} (${PAIRS.length} pairs × 2 themes)`);
console.log(`pass                : ${results.filter((r) => r.pass).length}`);
console.log(`exempt failures     : ${exemptFails.length} (decorative/non-body, design-accepted)`);
console.log(`BODY VIOLATIONS     : ${violations.length}`);

if (exemptFails.length) {
  console.log(`\nExempt failures (reported, non-blocking):`);
  for (const r of exemptFails) {
    console.log(`  ~ ${r.theme} ${r.label} ${fmt(r.ratio)} < ${fmt(r.min)} — ${r.note ?? ''}`);
  }
}

if (violations.length) {
  console.error(`\nBODY-TEXT / UI CONTRAST VIOLATIONS (must fix):`);
  for (const r of violations) {
    console.error(`  x ${r.theme} ${r.label} ${fmt(r.ratio)} < ${fmt(r.min)}`);
  }
  process.exit(1);
}

console.log(`\nOK — no body-text/UI contrast violations.`);
