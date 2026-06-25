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
 * Pairs marked `exempt` are surfaces where the combination is decorative or
 * not used as body text (e.g. secondary text on high-elevation fills); they
 * are still reported (EXEMPT-FAIL) but never break the build.
 */
import { palette } from './global/color.js';
import { aliasLight, aliasDark, type AliasKey } from './alias/index.js';

const AA_NORMAL = 4.5;

/** Resolve an alias token to a concrete hex for a given theme (dark inherits light). */
function resolve(token: AliasKey, theme: 'light' | 'dark'): string {
  const v = theme === 'dark' ? (aliasDark[token] ?? aliasLight[token]) : aliasLight[token];
  return v as string;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

type Pair = {
  theme: 'light' | 'dark';
  label: string;
  fg: AliasKey;
  bg: AliasKey;
  /** decorative / non-body surface: reported but never fails the build */
  exempt?: boolean;
};

/**
 * Body-level token pairs that render real text. Secondary text (text-2) is
 * audited only against the surfaces it actually sits on (bg-0 base canvas and
 * bg-1 low fill); the higher elevation fills (bg-2/bg-3) are exempt because
 * secondary text is not placed on them as body copy, and no secondary grey can
 * clear AA there without colliding with text-1.
 */
const PAIRS: Pair[] = [
  // --- light: secondary text on surfaces ---
  { theme: 'light', label: 'text-2 on bg-0', fg: 'color-text-2', bg: 'color-bg-0' },
  { theme: 'light', label: 'text-2 on bg-1', fg: 'color-text-2', bg: 'color-bg-1' },
  { theme: 'light', label: 'text-2 on bg-2', fg: 'color-text-2', bg: 'color-bg-2', exempt: true },
  { theme: 'light', label: 'text-2 on bg-3', fg: 'color-text-2', bg: 'color-bg-3', exempt: true },
  // --- light: solid status buttons (white inverse text) ---
  { theme: 'light', label: 'text-inverse on success', fg: 'color-text-inverse', bg: 'color-success' },
  { theme: 'light', label: 'text-inverse on danger', fg: 'color-text-inverse', bg: 'color-danger' },
  // warning uses dark on-warning text (white cannot reach AA on yellow)
  { theme: 'light', label: 'text-on-warning on warning', fg: 'color-text-on-warning', bg: 'color-warning' },
  // --- dark: solid primary/status buttons (dark inverse text) ---
  { theme: 'dark', label: 'text-inverse on primary', fg: 'color-text-inverse', bg: 'color-primary' },
  { theme: 'dark', label: 'text-inverse on primary-hover', fg: 'color-text-inverse', bg: 'color-primary-hover' },
  { theme: 'dark', label: 'text-inverse on primary-active', fg: 'color-text-inverse', bg: 'color-primary-active' },
  { theme: 'dark', label: 'text-inverse on info', fg: 'color-text-inverse', bg: 'color-info' },
  { theme: 'dark', label: 'text-inverse on success', fg: 'color-text-inverse', bg: 'color-success' },
  { theme: 'dark', label: 'text-inverse on danger', fg: 'color-text-inverse', bg: 'color-danger' },
  { theme: 'dark', label: 'text-on-warning on warning', fg: 'color-text-on-warning', bg: 'color-warning' },
  // --- dark: primary as link/foreground on surfaces ---
  { theme: 'dark', label: 'primary link on bg-0', fg: 'color-primary', bg: 'color-bg-0' },
  { theme: 'dark', label: 'primary link on bg-1', fg: 'color-primary', bg: 'color-bg-1' },

  // --- component consumption: solid status fills (Switch / Tag / Badge) ---
  // These mirror the foreground/background each component actually renders for
  // its solid status variants (the bright fills used in the default/light
  // theme). White (inverse) text is AA on the primary/success/danger fills, but
  // NOT on the bright yellow warning fill — warning must consume the dark
  // `color-text-on-warning`. If a component regresses warning back to white
  // text, the warning pair below will FAIL the build.
  { theme: 'light', label: 'solid primary fill text', fg: 'color-text-inverse', bg: 'color-primary' },
  { theme: 'light', label: 'solid success fill text', fg: 'color-text-inverse', bg: 'color-success' },
  { theme: 'light', label: 'solid danger fill text', fg: 'color-text-inverse', bg: 'color-danger' },
  { theme: 'light', label: 'solid warning fill text', fg: 'color-text-on-warning', bg: 'color-warning' },
  // dark theme: solid status fills use brighter tints (success→green-5,
  // danger→red-4, primary→blue-4) so dark inverse text clears AA; warning fill
  // is not re-toned, so the dark-text rule must still hold there.
  { theme: 'dark', label: 'solid success fill text', fg: 'color-text-inverse', bg: 'color-success' },
  { theme: 'dark', label: 'solid danger fill text', fg: 'color-text-inverse', bg: 'color-danger' },
  { theme: 'dark', label: 'solid warning fill text', fg: 'color-text-on-warning', bg: 'color-warning' },
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
